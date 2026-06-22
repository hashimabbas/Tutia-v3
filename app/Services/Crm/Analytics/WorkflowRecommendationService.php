<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowActionRun;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Support\Collection;

class WorkflowRecommendationService
{
    private const HIGH_FAILURE_THRESHOLD = 30;

    private const RETRYABLE_ACTIONS = [
        'email', 'sms', 'whatsapp', 'portal_notification',
        'create_task', 'create_activity', 'create_note',
        'assign_owner', 'update_status',
        'create_risk', 'create_issue', 'create_change_order',
    ];

    public function recommendations(): Collection
    {
        $recommendations = collect();

        $this->orphanedWorkflows($recommendations);
        $this->highFailureWorkflows($recommendations);
        $this->retryCandidates($recommendations);
        $this->disabledWithUsage($recommendations);
        $this->highFailureActionsAcrossWorkflows($recommendations);

        return $recommendations->sortByDesc('priority')->values();
    }

    private function orphanedWorkflows(Collection &$recommendations): void
    {
        $workflows = CrmWorkflow::where('is_active', true)
            ->whereDoesntHave('runs', fn ($q) => $q->where('created_at', '>=', now()->subDays(90)))
            ->get(['id', 'name', 'updated_at']);

        foreach ($workflows as $w) {
            $recommendations->push([
                'type' => 'orphaned_workflow',
                'severity' => 'info',
                'priority' => 30,
                'message' => "Workflow \"{$w->name}\" is active but has not executed in 90 days. Consider reviewing or deactivating.",
                'entityId' => $w->id,
                'entityName' => $w->name,
                'entityType' => 'workflow',
            ]);
        }
    }

    private function highFailureWorkflows(Collection &$recommendations): void
    {
        $workflows = CrmWorkflow::withCount([
            'runs as total_runs',
            'runs as failed_runs' => fn ($q) => $q->where('status', WorkflowStatusCatalog::RUN_FAILED),
        ])->get();

        foreach ($workflows as $w) {
            if ($w->total_runs < 5) {
                continue;
            }

            $failureRate = ((int) $w->failed_runs / (int) $w->total_runs) * 100;

            if ($failureRate < self::HIGH_FAILURE_THRESHOLD) {
                continue;
            }

            $topAction = CrmWorkflowActionRun::whereIn('workflow_run_id', function ($q) use ($w) {
                $q->select('id')->from('crm_workflow_runs')
                    ->where('workflow_id', $w->id)
                    ->where('status', WorkflowStatusCatalog::RUN_FAILED);
            })
                ->select('action_type')
                ->selectRaw('COUNT(*) as fail_count')
                ->where('status', WorkflowStatusCatalog::ACTION_FAILED)
                ->groupBy('action_type')
                ->orderByDesc('fail_count')
                ->first();

            $actionHint = $topAction !== null
                ? " Most failures are in the \"{$topAction->action_type}\" action ({$topAction->fail_count} failures)."
                : '';

            $recommendations->push([
                'type' => 'high_failure_rate',
                'severity' => 'critical',
                'priority' => 90,
                'message' => "Workflow \"{$w->name}\" has a {$failureRate}% failure rate ({$w->failed_runs}/{$w->total_runs} runs).{$actionHint}",
                'entityId' => $w->id,
                'entityName' => $w->name,
                'entityType' => 'workflow',
                'failureRate' => round($failureRate, 1),
                'failedRuns' => (int) $w->failed_runs,
                'totalRuns' => (int) $w->total_runs,
            ]);
        }
    }

    private function retryCandidates(Collection &$recommendations): void
    {
        $actionStats = CrmWorkflowActionRun::select('action_type', 'status')
            ->get()
            ->groupBy('action_type');

        foreach ($actionStats as $actionType => $group) {
            if (! in_array($actionType, self::RETRYABLE_ACTIONS, true)) {
                continue;
            }

            $total = $group->count();
            if ($total < 5) {
                continue;
            }

            $failed = $group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count();
            $failureRate = ($failed / $total) * 100;

            if ($failureRate < self::HIGH_FAILURE_THRESHOLD) {
                continue;
            }

            $recommendations->push([
                'type' => 'retry_candidate',
                'severity' => 'warning',
                'priority' => 70,
                'message' => "Action \"{$actionType}\" has {$failed} failures ({$failureRate}%). Consider adding retry logic — this action is idempotent and safe to retry.",
                'entityId' => null,
                'entityName' => $actionType,
                'entityType' => 'action',
                'failureRate' => round($failureRate, 1),
                'failureCount' => $failed,
                'totalCount' => $total,
            ]);
        }
    }

    private function disabledWithUsage(Collection &$recommendations): void
    {
        $workflows = CrmWorkflow::where('is_active', false)
            ->withCount('runs')
            ->having('runs_count', '>', 0)
            ->orderByDesc('runs_count')
            ->limit(5)
            ->get(['id', 'name', 'runs_count']);

        foreach ($workflows as $w) {
            $recommendations->push([
                'type' => 'disabled_with_history',
                'severity' => 'info',
                'priority' => 40,
                'message' => "Workflow \"{$w->name}\" is disabled but has {$w->runs_count} historical runs. Consider re-enabling if still relevant or archiving.",
                'entityId' => $w->id,
                'entityName' => $w->name,
                'entityType' => 'workflow',
            ]);
        }
    }

    private function highFailureActionsAcrossWorkflows(Collection &$recommendations): void
    {
        $lastMonth = now()->subMonth();

        $monthlyFailures = CrmWorkflowActionRun::where('status', WorkflowStatusCatalog::ACTION_FAILED)
            ->where('created_at', '>=', $lastMonth)
            ->get()
            ->groupBy('action_type')
            ->map(fn (Collection $group, string $actionType) => [
                'actionType' => $actionType,
                'failCount' => $group->count(),
            ])
            ->filter(fn ($a) => $a['failCount'] >= 10)
            ->sortByDesc('failCount');

        foreach ($monthlyFailures as $stat) {
            $recommendations->push([
                'type' => 'frequent_failure',
                'severity' => 'warning',
                'priority' => 60,
                'message' => "Action \"{$stat['actionType']}\" has failed {$stat['failCount']} times in the last 30 days. Investigate root cause.",
                'entityId' => null,
                'entityName' => $stat['actionType'],
                'entityType' => 'action',
                'failCount' => $stat['failCount'],
            ]);
        }
    }
}
