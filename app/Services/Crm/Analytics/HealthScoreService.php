<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmApprovalFlow;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowActionRun;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Support\Collection;

class HealthScoreService
{
    public function workflowHealth(): Collection
    {
        $workflows = CrmWorkflow::with('runs')->get();

        return $workflows
            ->filter(fn (CrmWorkflow $w) => $w->runs->isNotEmpty())
            ->map(fn (CrmWorkflow $w) => [
                'entityId' => $w->id,
                'entityName' => $w->name,
                'entityType' => 'workflow',
                'score' => $this->calculateWorkflowScore($w),
                'status' => $this->classifyScore($this->calculateWorkflowScore($w)),
                'factors' => $this->workflowFactors($w),
            ])
            ->sortByDesc('score')
            ->values();
    }

    public function approvalHealth(): Collection
    {
        $flows = CrmApprovalFlow::with('requests')->get();

        return $flows
            ->filter(fn (CrmApprovalFlow $f) => $f->requests->isNotEmpty())
            ->map(fn (CrmApprovalFlow $f) => [
                'entityId' => $f->id,
                'entityName' => $f->name,
                'entityType' => 'approval_flow',
                'score' => $this->calculateApprovalScore($f),
                'status' => $this->classifyScore($this->calculateApprovalScore($f)),
                'factors' => $this->approvalFactors($f),
            ])
            ->sortByDesc('score')
            ->values();
    }

    private function calculateWorkflowScore(CrmWorkflow $workflow): int
    {
        $runs = $workflow->runs;
        $total = $runs->count();

        if ($total === 0) {
            return 0;
        }

        $completed = $runs->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count();
        $failed = $runs->where('status', WorkflowStatusCatalog::RUN_FAILED)->count();
        $paused = $runs->where('status', WorkflowStatusCatalog::RUN_PAUSED)->count();

        $successRate = $completed / max($total, 1);
        $failureRate = $failed / max($total, 1);
        $pausedRate = $paused / max($total, 1);

        $recencyScore = 100;
        $latestRun = $runs->sortByDesc('created_at')->first();
        if ($latestRun !== null) {
            $daysSinceLastRun = $latestRun->created_at->diffInDays(now());
            $recencyScore = max(0, 100 - ($daysSinceLastRun * 2));
        }

        $allActionRuns = CrmWorkflowActionRun::whereIn('workflow_run_id', $runs->pluck('id'))->get();
        $actionFailureRate = $allActionRuns->count() > 0
            ? $allActionRuns->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count() / $allActionRuns->count()
            : 0;

        $recentRuns = $runs->filter(fn ($r) => $r->created_at >= now()->subDays(30));
        $olderRuns = $runs->filter(fn ($r) => $r->created_at->lt(now()->subDays(30)));

        $trendScore = 50;
        if ($recentRuns->isNotEmpty() && $olderRuns->isNotEmpty()) {
            $recentFailureRate = $recentRuns->where('status', WorkflowStatusCatalog::RUN_FAILED)->count() / max($recentRuns->count(), 1);
            $olderFailureRate = $olderRuns->where('status', WorkflowStatusCatalog::RUN_FAILED)->count() / max($olderRuns->count(), 1);

            if ($recentFailureRate < $olderFailureRate) {
                $trendScore = 100;
            } elseif ($recentFailureRate > $olderFailureRate) {
                $trendScore = 0;
            }
        }

        $score = ($successRate * 40)
            + ((1 - $failureRate) * 20)
            + ((1 - $pausedRate) * 10)
            + ($recencyScore * 0.15)
            + ((1 - $actionFailureRate) * 10)
            + ($trendScore * 0.05);

        return (int) round($score);
    }

    private function calculateApprovalScore(CrmApprovalFlow $flow): int
    {
        $requests = $flow->requests;
        $total = $requests->count();

        if ($total === 0) {
            return 0;
        }

        $approved = $requests->where('status', ApprovalStatusCatalog::REQUEST_APPROVED)->count();
        $rejected = $requests->where('status', ApprovalStatusCatalog::REQUEST_REJECTED)->count();
        $escalated = $requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count();
        $expired = $requests->where('status', ApprovalStatusCatalog::REQUEST_EXPIRED)->count();

        $decided = $approved + $rejected;
        $approvalRate = $decided > 0 ? $approved / $decided : 0.5;
        $escalationRate = $escalated / max($total, 1);
        $expiredRate = $expired / max($total, 1);

        $slaScore = 100;
        if ($flow->sla_breach_minutes !== null) {
            $resolved = $requests->filter(fn ($r) => $r->resolution_time_minutes !== null);
            if ($resolved->isNotEmpty()) {
                $breaches = $resolved->filter(fn ($r) => $r->resolution_time_minutes > $flow->sla_breach_minutes)->count();
                $breachRate = $breaches / $resolved->count();
                $slaScore = max(0, 100 - ($breachRate * 100));
            }
        }

        $score = ($approvalRate * 30)
            + ((1 - $escalationRate) * 25)
            + ((1 - $expiredRate) * 15)
            + ($slaScore * 0.30);

        return (int) round($score);
    }

    private function workflowFactors(CrmWorkflow $workflow): array
    {
        $runs = $workflow->runs;
        $total = $runs->count();

        $completed = $runs->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count();
        $failed = $runs->where('status', WorkflowStatusCatalog::RUN_FAILED)->count();

        $allActionRuns = CrmWorkflowActionRun::whereIn('workflow_run_id', $runs->pluck('id'))->get();

        return [
            'successRate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
            'failureRate' => $total > 0 ? round(($failed / $total) * 100, 1) : 0,
            'totalRuns' => $total,
            'actionFailureRate' => $allActionRuns->count() > 0
                ? round(($allActionRuns->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count() / $allActionRuns->count()) * 100, 1)
                : 0,
            'isActive' => $workflow->is_active,
        ];
    }

    private function approvalFactors(CrmApprovalFlow $flow): array
    {
        $requests = $flow->requests;
        $total = $requests->count();

        $approved = $requests->where('status', ApprovalStatusCatalog::REQUEST_APPROVED)->count();
        $rejected = $requests->where('status', ApprovalStatusCatalog::REQUEST_REJECTED)->count();
        $escalated = $requests->where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count();

        $decided = $approved + $rejected;

        return [
            'approvalRate' => $decided > 0 ? round(($approved / $decided) * 100, 1) : 0,
            'escalationRate' => $total > 0 ? round(($escalated / $total) * 100, 1) : 0,
            'totalRequests' => $total,
            'pendingCount' => $requests->where('status', ApprovalStatusCatalog::REQUEST_PENDING)->count(),
            'strategy' => $flow->strategy,
        ];
    }

    private function classifyScore(int $score): string
    {
        if ($score >= 80) {
            return 'healthy';
        }
        if ($score >= 50) {
            return 'needs_attention';
        }

        return 'critical';
    }
}
