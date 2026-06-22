<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmApprovalDecision;
use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use Illuminate\Support\Collection;

class ApprovalRecommendationService
{
    private const HIGH_ESCALATION_THRESHOLD = 20;

    private const HIGH_BOTTLENECK_RATIO = 2.0;

    private const SLA_RISK_THRESHOLD = 0.8;

    public function recommendations(): Collection
    {
        $recommendations = collect();

        $this->bottleneckSteps($recommendations);
        $this->slaRiskFlows($recommendations);
        $this->escalationHotspots($recommendations);
        $this->singleApproverRisk($recommendations);
        $this->strategyChangeCandidates($recommendations);

        return $recommendations->sortByDesc('priority')->values();
    }

    private function bottleneckSteps(Collection &$recommendations): void
    {
        $requests = CrmApprovalRequest::whereHas('decisions')
            ->with(['flow', 'decisions.step'])
            ->get();

        $flowSteps = collect();
        foreach ($requests as $request) {
            foreach ($request->decisions as $decision) {
                if ($decision->step === null || $decision->decided_at === null) {
                    continue;
                }

                $decisionTime = $request->requested_at->diffInMinutes($decision->decided_at, true);

                $flowSteps->push([
                    'flowId' => $request->approval_flow_id,
                    'flowName' => $request->flow?->name,
                    'stepOrder' => $decision->step->step_order,
                    'stepName' => $decision->step->name ?? "Step {$decision->step->step_order}",
                    'decisionTimeMinutes' => $decisionTime,
                ]);
            }
        }

        $avgByFlow = $flowSteps->groupBy('flowId')->map(fn (Collection $group) => $group->avg('decisionTimeMinutes'));

        $bottlenecks = $flowSteps
            ->groupBy(fn ($s) => "{$s['flowId']}:{$s['stepOrder']}")
            ->map(function (Collection $group) use ($avgByFlow) {
                $avg = $group->avg('decisionTimeMinutes');
                $flowAvg = $avgByFlow->get($group->first()['flowId'], $avg);

                return [
                    'flowId' => $group->first()['flowId'],
                    'flowName' => $group->first()['flowName'],
                    'stepOrder' => $group->first()['stepOrder'],
                    'stepName' => $group->first()['stepName'],
                    'avgTime' => round($avg),
                    'flowAvgTime' => round($flowAvg),
                    'ratio' => $flowAvg > 0 ? round($avg / $flowAvg, 1) : 1,
                    'decisions' => $group->count(),
                ];
            })
            ->filter(fn ($s) => $s['ratio'] >= self::HIGH_BOTTLENECK_RATIO && $s['decisions'] >= 3)
            ->sortByDesc('ratio');

        foreach ($bottlenecks as $b) {
            $recommendations->push([
                'type' => 'bottleneck_step',
                'severity' => 'warning',
                'priority' => 80,
                'message' => "Approval flow \"{$b['flowName']}\": Step {$b['stepOrder']} ({$b['stepName']}) takes {$b['ratio']}x longer than the flow average ({$b['avgTime']}m vs {$b['flowAvgTime']}m). Consider adding a backup approver.",
                'entityId' => $b['flowId'],
                'entityName' => $b['flowName'],
                'entityType' => 'approval_flow',
                'stepOrder' => $b['stepOrder'],
                'stepName' => $b['stepName'],
                'avgTimeMinutes' => $b['avgTime'],
                'flowAvgMinutes' => $b['flowAvgTime'],
                'ratio' => $b['ratio'],
            ]);
        }
    }

    private function slaRiskFlows(Collection &$recommendations): void
    {
        $flows = CrmApprovalFlow::with('requests')
            ->whereNotNull('sla_breach_minutes')
            ->get();

        foreach ($flows as $f) {
            $resolved = $f->requests->filter(fn ($r) => $r->resolution_time_minutes !== null);

            if ($resolved->isEmpty()) {
                continue;
            }

            $avgResolution = $resolved->avg('resolution_time_minutes');
            $ratio = $avgResolution / $f->sla_breach_minutes;

            if ($ratio < self::SLA_RISK_THRESHOLD) {
                continue;
            }

            $breaches = $resolved->filter(fn ($r) => $r->resolution_time_minutes > $f->sla_breach_minutes)->count();

            $severity = $ratio >= 1.0 ? 'critical' : 'warning';
            $priority = $ratio >= 1.0 ? 95 : 75;
            $breachLabel = $ratio >= 1.0 ? 'exceeding' : 'approaching';

            $recommendations->push([
                'type' => 'sla_risk',
                'severity' => $severity,
                'priority' => $priority,
                'message' => "Approval flow \"{$f->name}\" is {$breachLabel} its SLA (avg {$avgResolution}m vs {$f->sla_breach_minutes}m SLA). {$breaches} requests breached. Consider increasing SLA or streamlining the flow.",
                'entityId' => $f->id,
                'entityName' => $f->name,
                'entityType' => 'approval_flow',
                'avgResolutionMinutes' => round($avgResolution),
                'slaBreachMinutes' => $f->sla_breach_minutes,
                'breachCount' => $breaches,
                'ratio' => round($ratio, 2),
            ]);
        }
    }

    private function escalationHotspots(Collection &$recommendations): void
    {
        $flows = CrmApprovalFlow::with('requests')->get();

        foreach ($flows as $f) {
            $total = $f->requests->count();

            if ($total < 5) {
                continue;
            }

            $escalated = $f->requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count();
            $rate = ($escalated / $total) * 100;

            if ($rate < self::HIGH_ESCALATION_THRESHOLD) {
                continue;
            }

            $stepsCount = $f->steps()->count();

            $recommendations->push([
                'type' => 'high_escalation',
                'severity' => 'warning',
                'priority' => 70,
                'message' => "Approval flow \"{$f->name}\" has a {$rate}% escalation rate ({$escalated}/{$total}). The flow has {$stepsCount} approval steps. Consider reducing approvers or switching to first-approver-wins.",
                'entityId' => $f->id,
                'entityName' => $f->name,
                'entityType' => 'approval_flow',
                'escalationRate' => round($rate, 1),
                'escalatedCount' => $escalated,
                'totalRequests' => $total,
                'stepsCount' => $stepsCount,
            ]);
        }
    }

    private function singleApproverRisk(Collection &$recommendations): void
    {
        $flows = CrmApprovalFlow::with(['steps', 'requests.decisions'])->get();

        foreach ($flows as $f) {
            $userSteps = $f->steps->where('approver_type', 'user');

            if ($userSteps->count() < 2) {
                continue;
            }

            $soleApproverSteps = $userSteps->filter(function ($step) use ($f) {
                $sameTypeCount = $f->steps
                    ->where('approver_type', 'user')
                    ->where('approver_id', $step->approver_id)
                    ->count();

                return $sameTypeCount === 1;
            });

            foreach ($soleApproverSteps as $step) {
                $decisions = CrmApprovalDecision::where('approval_step_id', $step->id)->get();

                if ($decisions->isEmpty()) {
                    continue;
                }

                $slowDecisions = $decisions->filter(function ($d) {
                    return $d->decided_at !== null && $d->request->requested_at !== null
                        && $d->request->requested_at->diffInMinutes($d->decided_at, true) > 1440;
                });

                if ($slowDecisions->count() < 3) {
                    continue;
                }

                $recommendations->push([
                    'type' => 'single_approver_risk',
                    'severity' => 'warning',
                    'priority' => 65,
                    'message' => "Approval flow \"{$f->name}\" Step {$step->step_order} has a single approver who has {$slowDecisions->count()} decisions taking >24h. Add a backup approver to reduce bottleneck risk.",
                    'entityId' => $f->id,
                    'entityName' => $f->name,
                    'entityType' => 'approval_flow',
                    'stepOrder' => $step->step_order,
                    'slowDecisions' => $slowDecisions->count(),
                ]);
            }
        }
    }

    private function strategyChangeCandidates(Collection &$recommendations): void
    {
        $flows = CrmApprovalFlow::with('requests')->where('strategy', 'all_must_approve')->get();

        foreach ($flows as $f) {
            $total = $f->requests->count();

            if ($total < 10) {
                continue;
            }

            $escalated = $f->requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count();
            $escalationRate = ($escalated / $total) * 100;

            if ($escalationRate < 15) {
                continue;
            }

            $recommendations->push([
                'type' => 'strategy_change',
                'severity' => 'info',
                'priority' => 50,
                'message' => "Approval flow \"{$f->name}\" uses unanimous approval with a {$escalationRate}% escalation rate. Consider switching to first-approver-wins or majority vote to reduce delays.",
                'entityId' => $f->id,
                'entityName' => $f->name,
                'entityType' => 'approval_flow',
                'currentStrategy' => $f->strategy,
                'escalationRate' => round($escalationRate, 1),
            ]);
        }
    }
}
