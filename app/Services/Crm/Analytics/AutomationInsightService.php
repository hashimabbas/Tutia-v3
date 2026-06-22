<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmApprovalRequest;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowActionRun;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Support\Collection;

class AutomationInsightService
{
    public function insights(): Collection
    {
        $insights = collect();

        $this->inactiveWorkflows($insights);
        $this->actionFailureSpike($insights);
        $this->slaBreachesRecent($insights);
        $this->approvalVolumeChange($insights);
        $this->pendingApprovalsAging($insights);
        $this->workloadImbalance($insights);

        return $insights->sortByDesc('priority')->values();
    }

    private function inactiveWorkflows(Collection &$insights): void
    {
        $inactive = CrmWorkflow::where('is_active', false)->count();
        $total = CrmWorkflow::count();

        if ($total === 0) {
            return;
        }

        $inactiveRate = round(($inactive / $total) * 100, 1);

        if ($inactiveRate > 50) {
            $insights->push([
                'type' => 'inactive_workflows',
                'severity' => 'info',
                'priority' => 40,
                'message' => "{$inactiveRate}% of workflows ({$inactive}/{$total}) are disabled. Review if they should be archived.",
            ]);
        }
    }

    private function actionFailureSpike(Collection &$insights): void
    {
        $lastMonth = now()->subMonth();
        $previousMonth = now()->subMonths(2);

        $recentFailures = CrmWorkflowActionRun::where('status', WorkflowStatusCatalog::ACTION_FAILED)
            ->where('created_at', '>=', $lastMonth)
            ->count();

        $olderFailures = CrmWorkflowActionRun::where('status', WorkflowStatusCatalog::ACTION_FAILED)
            ->where('created_at', '>=', $previousMonth)
            ->where('created_at', '<', $lastMonth)
            ->count();

        if ($olderFailures > 0 && $recentFailures > ($olderFailures * 1.5)) {
            $increase = round((($recentFailures - $olderFailures) / $olderFailures) * 100, 1);

            $insights->push([
                'type' => 'action_failure_spike',
                'severity' => 'warning',
                'priority' => 80,
                'message' => "Action failures increased {$increase}% this month ({$recentFailures}) compared to last month ({$olderFailures}). Investigate recent changes.",
                'recentFailures' => $recentFailures,
                'previousFailures' => $olderFailures,
                'increasePercent' => $increase,
            ]);
        }
    }

    private function slaBreachesRecent(Collection &$insights): void
    {
        $lastWeek = now()->subWeek();

        $breaches = CrmApprovalRequest::whereNotNull('resolution_time_minutes')
            ->where('completed_at', '>=', $lastWeek)
            ->get()
            ->filter(fn ($r) => $r->flow !== null
                && $r->flow->sla_breach_minutes !== null
                && $r->resolution_time_minutes > $r->flow->sla_breach_minutes);

        $breachCount = $breaches->count();

        if ($breachCount > 0) {
            $flowNames = $breaches->groupBy(fn ($r) => $r->flow->name)
                ->map(fn ($g) => $g->count())
                ->sortDesc()
                ->take(3);

            $flowDetail = $flowNames->map(fn ($count, $name) => "{$name} ({$count})")->implode(', ');

            $insights->push([
                'type' => 'sla_breaches_recent',
                'severity' => 'critical',
                'priority' => 90,
                'message' => "{$breachCount} SLA breaches in the last 7 days: {$flowDetail}. Review approval flows immediately.",
                'breachCount' => $breachCount,
                'topFlows' => $flowNames->toArray(),
            ]);
        }
    }

    private function approvalVolumeChange(Collection &$insights): void
    {
        $lastMonth = now()->subMonth();
        $previousMonth = now()->subMonths(2);

        $recentCount = CrmApprovalRequest::where('created_at', '>=', $lastMonth)->count();
        $olderCount = CrmApprovalRequest::where('created_at', '>=', $previousMonth)
            ->where('created_at', '<', $lastMonth)
            ->count();

        if ($olderCount > 0 && $recentCount > ($olderCount * 1.3)) {
            $increase = round((($recentCount - $olderCount) / $olderCount) * 100, 1);

            $insights->push([
                'type' => 'approval_volume_increase',
                'severity' => 'info',
                'priority' => 50,
                'message' => "Approval request volume increased {$increase}% this month ({$recentCount} vs {$olderCount}). Ensure capacity is adequate.",
                'recentCount' => $recentCount,
                'previousCount' => $olderCount,
                'increasePercent' => $increase,
            ]);
        }
    }

    private function pendingApprovalsAging(Collection &$insights): void
    {
        $pending = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_PENDING)->get();

        $aging = $pending->filter(fn ($r) => $r->requested_at !== null && $r->requested_at->diffInDays(now()) > 3);

        $agingCount = $aging->count();

        if ($agingCount > 0) {
            $insights->push([
                'type' => 'aging_pending_approvals',
                'severity' => 'warning',
                'priority' => 70,
                'message' => "{$agingCount} approval requests have been pending for more than 3 days. Follow up with approvers.",
                'count' => $agingCount,
                'oldest' => $aging->sortBy('requested_at')->first()?->requested_at?->diffInDays(now()) ?? 0,
            ]);
        }
    }

    private function workloadImbalance(Collection &$insights): void
    {
        $decisions = CrmApprovalRequest::whereHas('decisions')
            ->with('decisions')
            ->get()
            ->flatMap->decisions;

        $perUser = $decisions->groupBy('user_id')->map->count();

        if ($perUser->count() < 2) {
            return;
        }

        $max = $perUser->max();
        $min = $perUser->min();

        if ($min > 0 && $max > ($min * 3)) {
            $insights->push([
                'type' => 'workload_imbalance',
                'severity' => 'info',
                'priority' => 45,
                'message' => "Approval workload is unbalanced — the busiest approver has {$max} decisions while the least busy has {$min}. Consider redistributing.",
                'maxDecisions' => $max,
                'minDecisions' => $min,
                'ratio' => round($max / $min, 1),
            ]);
        }
    }
}
