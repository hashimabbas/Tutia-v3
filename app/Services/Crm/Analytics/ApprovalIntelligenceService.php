<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmApprovalDecision;
use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use Illuminate\Support\Collection;

class ApprovalIntelligenceService
{
    public function bottleneckSteps(int $limit = 10): Collection
    {
        $requests = CrmApprovalRequest::whereHas('decisions')
            ->with(['flow', 'decisions.step'])
            ->get();

        $stepMetrics = collect();
        foreach ($requests as $request) {
            foreach ($request->decisions as $decision) {
                if ($decision->step === null || $decision->decided_at === null) {
                    continue;
                }

                $decisionTimeMinutes = $request->requested_at->diffInMinutes($decision->decided_at, true);

                $stepMetrics->push([
                    'flowId' => $request->approval_flow_id,
                    'flowName' => $request->flow?->name,
                    'stepOrder' => $decision->step->step_order,
                    'stepName' => $decision->step->name ?? "Step {$decision->step->step_order}",
                    'approverType' => $decision->step->approver_type,
                    'decisionId' => $decision->id,
                    'decisionTimeMinutes' => $decisionTimeMinutes,
                ]);
            }
        }

        return $stepMetrics
            ->groupBy(fn ($m) => "{$m['flowId']}:{$m['stepOrder']}")
            ->map(fn (Collection $group) => [
                'flowId' => $group->first()['flowId'],
                'flowName' => $group->first()['flowName'],
                'stepOrder' => $group->first()['stepOrder'],
                'stepName' => $group->first()['stepName'],
                'approverType' => $group->first()['approverType'],
                'totalDecisions' => $group->count(),
                'avgDecisionTimeMinutes' => round($group->avg('decisionTimeMinutes')),
                'maxDecisionTimeMinutes' => round($group->max('decisionTimeMinutes')),
            ])
            ->sortByDesc('avgDecisionTimeMinutes')
            ->take($limit)
            ->values();
    }

    public function slowestApprovers(int $limit = 10): Collection
    {
        $decisions = CrmApprovalDecision::whereNotNull('decided_at')
            ->with('user:id,name')
            ->get();

        $decisions->loadMissing('request');

        return $decisions
            ->filter(fn ($d) => $d->request !== null && $d->request->requested_at !== null)
            ->groupBy('user_id')
            ->map(fn (Collection $group) => [
                'userId' => $group->first()->user_id,
                'userName' => $group->first()->user?->name,
                'totalDecisions' => $group->count(),
                'avgDecisionTimeMinutes' => round($group->avg(
                    fn ($d) => $d->request->requested_at->diffInMinutes($d->decided_at, true)
                )),
                'approved' => $group->where('decision', ApprovalStatusCatalog::DECISION_APPROVED)->count(),
                'rejected' => $group->where('decision', ApprovalStatusCatalog::DECISION_REJECTED)->count(),
                'approvalRate' => $group->count() > 0
                    ? round(($group->where('decision', ApprovalStatusCatalog::DECISION_APPROVED)->count() / $group->count()) * 100, 1)
                    : 0,
            ])
            ->sortByDesc('avgDecisionTimeMinutes')
            ->take($limit)
            ->values();
    }

    public function slaRiskFlows(): Collection
    {
        $flows = CrmApprovalFlow::with('requests')
            ->whereNotNull('sla_breach_minutes')
            ->get();

        return $flows
            ->filter(fn (CrmApprovalFlow $f) => $f->requests->isNotEmpty())
            ->map(fn (CrmApprovalFlow $f) => [
                'flowId' => $f->id,
                'flowName' => $f->name,
                'slaBreachMinutes' => $f->sla_breach_minutes,
                'slaWarningMinutes' => $f->sla_warning_minutes,
                'avgResolutionMinutes' => (function () use ($f) {
                    $resolved = $f->requests->filter(fn ($r) => $r->resolution_time_minutes !== null);

                    return $resolved->isNotEmpty() ? round($resolved->avg('resolution_time_minutes')) : null;
                })(),
                'totalCompleted' => $f->requests->whereIn('status', [
                    ApprovalStatusCatalog::REQUEST_APPROVED,
                    ApprovalStatusCatalog::REQUEST_REJECTED,
                ])->count(),
                'pendingCount' => $f->requests->where('status', ApprovalStatusCatalog::REQUEST_PENDING)->count(),
                'breachCount' => $f->requests
                    ->filter(fn ($r) => $r->resolution_time_minutes !== null && $r->resolution_time_minutes > ($f->sla_breach_minutes ?? PHP_INT_MAX))
                    ->count(),
                'riskLevel' => (function () use ($f) {
                    if ($f->requests->where('status', ApprovalStatusCatalog::REQUEST_PENDING)->count() > 0 && $f->sla_breach_minutes === null) {
                        return 'none';
                    }

                    $breachRate = $f->requests->count() > 0
                        ? $f->requests->filter(fn ($r) => $r->resolution_time_minutes !== null && $r->resolution_time_minutes > ($f->sla_breach_minutes ?? PHP_INT_MAX))->count() / $f->requests->count()
                        : 0;

                    if ($breachRate > 0.3) {
                        return 'high';
                    }
                    if ($breachRate > 0.1) {
                        return 'medium';
                    }

                    return 'low';
                })(),
            ])
            ->sortByDesc(fn ($f) => $f['breachCount'])
            ->values();
    }

    public function escalationHotspots(): Collection
    {
        return CrmApprovalFlow::with('requests')
            ->get()
            ->filter(fn (CrmApprovalFlow $f) => $f->requests->isNotEmpty())
            ->map(fn (CrmApprovalFlow $f) => [
                'flowId' => $f->id,
                'flowName' => $f->name,
                'totalRequests' => $f->requests->count(),
                'escalatedCount' => $f->requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count(),
                'escalationRate' => $f->requests->count() > 0
                    ? round(($f->requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count() / $f->requests->count()) * 100, 1)
                    : 0,
                'avgEscalationCount' => (function () use ($f) {
                    $escalated = $f->requests->filter(fn ($r) => $r->escalation_count !== null && $r->escalation_count > 0);

                    return $escalated->isNotEmpty()
                        ? round($escalated->avg('escalation_count'), 1)
                        : null;
                })(),
            ])
            ->sortByDesc('escalationRate')
            ->values();
    }

    public function approvalThroughput(int $days = 30): Collection
    {
        $since = now()->subDays($days)->startOfDay();

        $requests = CrmApprovalRequest::where('created_at', '>=', $since)
            ->get(['created_at', 'status', 'completed_at']);

        $dates = collect();
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayReqs = $requests->filter(fn ($r) => $r->created_at->format('Y-m-d') === $date);
            $dayCompleted = $requests->filter(fn ($r) => $r->completed_at !== null && $r->completed_at->format('Y-m-d') === $date);

            $dates->push([
                'date' => $date,
                'created' => $dayReqs->count(),
                'resolved' => $dayCompleted->count(),
                'pending' => $dayReqs->where('status', ApprovalStatusCatalog::REQUEST_PENDING)->count(),
                'approved' => $dayReqs->where('status', ApprovalStatusCatalog::REQUEST_APPROVED)->count(),
                'rejected' => $dayReqs->where('status', ApprovalStatusCatalog::REQUEST_REJECTED)->count(),
            ]);
        }

        return $dates;
    }
}
