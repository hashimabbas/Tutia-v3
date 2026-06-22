<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowRun;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Support\Collection;

class WorkflowIntelligenceService
{
    private const RETRYABLE_ACTIONS = [
        'email', 'sms', 'whatsapp', 'portal_notification',
        'create_task', 'create_activity', 'create_note',
        'assign_owner', 'update_status',
        'create_risk', 'create_issue', 'create_change_order',
    ];

    public function topFailureReasons(int $limit = 10): Collection
    {
        $workflows = CrmWorkflow::with(['runs.actionRuns'])->get();

        return $workflows
            ->filter(fn (CrmWorkflow $w) => $w->runs->where('status', WorkflowStatusCatalog::RUN_FAILED)->isNotEmpty())
            ->map(fn (CrmWorkflow $w) => [
                'workflowId' => $w->id,
                'workflowName' => $w->name,
                'totalRuns' => $w->runs->count(),
                'failedRuns' => $w->runs->where('status', WorkflowStatusCatalog::RUN_FAILED)->count(),
                'failureRate' => $w->runs->count() > 0
                    ? round(($w->runs->where('status', WorkflowStatusCatalog::RUN_FAILED)->count() / $w->runs->count()) * 100, 1)
                    : 0,
                'topActions' => (function () use ($w) {
                    $failedActionRuns = $w->runs
                        ->flatMap(fn ($run) => $run->actionRuns->where('status', WorkflowStatusCatalog::ACTION_FAILED));

                    $totalFailed = $failedActionRuns->count();

                    return $failedActionRuns
                        ->groupBy('action_type')
                        ->map(fn (Collection $group, string $actionType) => [
                            'actionType' => $actionType,
                            'failureCount' => $group->count(),
                            'failurePercentage' => $totalFailed > 0
                                ? round(($group->count() / $totalFailed) * 100, 1)
                                : 0,
                        ])
                        ->sortByDesc('failureCount')
                        ->take(3)
                        ->values()
                        ->toArray();
                })(),
            ])
            ->sortByDesc('failureRate')
            ->take($limit)
            ->values();
    }

    public function failureHeatmap(): Collection
    {
        $workflows = CrmWorkflow::with(['runs.actionRuns'])->get();

        return $workflows
            ->filter(fn (CrmWorkflow $w) => $w->runs->isNotEmpty())
            ->flatMap(fn (CrmWorkflow $w) => (function () use ($w) {
                $allActionRuns = $w->runs->flatMap->actionRuns;

                return $allActionRuns
                    ->groupBy('action_type')
                    ->map(fn (Collection $group, string $actionType) => [
                        'workflowId' => $w->id,
                        'workflowName' => $w->name,
                        'actionType' => $actionType,
                        'totalRuns' => $group->count(),
                        'failures' => $group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count(),
                        'failureRate' => $group->count() > 0
                            ? round(($group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count() / $group->count()) * 100, 1)
                            : 0,
                    ]);
            })())
            ->sortByDesc('failures')
            ->values();
    }

    public function successTrends(int $weeks = 12): Collection
    {
        $since = now()->subWeeks($weeks)->startOfWeek();

        $runs = CrmWorkflowRun::where('created_at', '>=', $since)
            ->get(['created_at', 'status']);

        $weekly = collect();
        for ($i = $weeks; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = now()->subWeeks($i)->endOfWeek();
            $weekRuns = $runs->filter(fn ($r) => $r->created_at >= $weekStart && $r->created_at <= $weekEnd);

            $total = $weekRuns->count();
            $completed = $weekRuns->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count();
            $failed = $weekRuns->where('status', WorkflowStatusCatalog::RUN_FAILED)->count();

            $weekly->push([
                'week' => $weekStart->format('Y-m-d'),
                'label' => $weekStart->format('M d'),
                'totalRuns' => $total,
                'completed' => $completed,
                'failed' => $failed,
                'successRate' => $total > 0 ? round(($completed / $total) * 100, 1) : null,
                'failureRate' => $total > 0 ? round(($failed / $total) * 100, 1) : null,
            ]);
        }

        return $weekly;
    }

    public function slowestWorkflows(int $limit = 10): Collection
    {
        $completedRuns = CrmWorkflowRun::where('status', WorkflowStatusCatalog::RUN_COMPLETED)
            ->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->with('workflow:id,name')
            ->get(['workflow_id', 'started_at', 'completed_at']);

        return $completedRuns
            ->groupBy('workflow_id')
            ->map(fn (Collection $group) => [
                'workflowId' => $group->first()->workflow_id,
                'workflowName' => $group->first()->workflow?->name,
                'totalRuns' => $group->count(),
                'avgDurationSeconds' => round($group->avg(fn ($r) => $r->started_at->diffInSeconds($r->completed_at))),
                'maxDurationSeconds' => round($group->max(fn ($r) => $r->started_at->diffInSeconds($r->completed_at))),
                'minDurationSeconds' => round($group->min(fn ($r) => $r->started_at->diffInSeconds($r->completed_at))),
            ])
            ->sortByDesc('avgDurationSeconds')
            ->take($limit)
            ->values();
    }

    public function slowestActions(int $limit = 10): Collection
    {
        $completedActions = CrmWorkflowActionRun::where('status', WorkflowStatusCatalog::ACTION_COMPLETED)
            ->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->get(['action_type', 'started_at', 'completed_at']);

        return $completedActions
            ->groupBy('action_type')
            ->map(fn (Collection $group) => [
                'actionType' => $group->first()->action_type,
                'totalCount' => $group->count(),
                'avgDurationSeconds' => round($group->avg(fn ($a) => $a->started_at->diffInSeconds($a->completed_at))),
                'maxDurationSeconds' => round($group->max(fn ($a) => $a->started_at->diffInSeconds($a->completed_at))),
            ])
            ->sortByDesc('avgDurationSeconds')
            ->take($limit)
            ->values();
    }

    public function retryCandidates(int $limit = 10): Collection
    {
        $actionStats = CrmWorkflowActionRun::select('action_type', 'status')
            ->get()
            ->groupBy('action_type')
            ->map(fn (Collection $group, string $actionType) => [
                'actionType' => $actionType,
                'totalCount' => $group->count(),
                'failureCount' => $group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count(),
                'failureRate' => $group->count() > 0
                    ? round(($group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count() / $group->count()) * 100, 1)
                    : 0,
                'isRetryable' => in_array($actionType, self::RETRYABLE_ACTIONS, true),
            ])
            ->filter(fn (array $stat) => $stat['failureCount'] > 0)
            ->sortByDesc('failureRate')
            ->values();

        $retryable = $actionStats->filter(fn ($s) => $s['isRetryable'])->take($limit);
        $nonRetryable = $actionStats->filter(fn ($s) => ! $s['isRetryable'])->take(3);

        return $retryable->concat($nonRetryable)->take($limit)->values();
    }
}
