<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowRun;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Support\Collection;

class WorkflowAnalyticsService
{
    public function overview(): array
    {
        $query = CrmWorkflowRun::query();
        $total = (clone $query)->count();
        $completed = (clone $query)->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count();
        $failed = (clone $query)->where('status', WorkflowStatusCatalog::RUN_FAILED)->count();
        $paused = (clone $query)->where('status', WorkflowStatusCatalog::RUN_PAUSED)->count();
        $running = (clone $query)->where('status', WorkflowStatusCatalog::RUN_RUNNING)->count();
        $pending = (clone $query)->where('status', WorkflowStatusCatalog::RUN_PENDING)->count();
        $skipped = (clone $query)->where('status', WorkflowStatusCatalog::RUN_SKIPPED)->count();

        $terminal = $completed + $failed;
        $successRate = $terminal > 0 ? round(($completed / $terminal) * 100, 1) : null;
        $failureRate = $terminal > 0 ? round(($failed / $terminal) * 100, 1) : null;

        $completedRuns = CrmWorkflowRun::where('status', WorkflowStatusCatalog::RUN_COMPLETED)
            ->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->get(['started_at', 'completed_at']);

        $avgDuration = $completedRuns->isNotEmpty()
            ? round($completedRuns->avg(fn ($r) => $r->started_at->diffInSeconds($r->completed_at)))
            : null;

        return [
            'total' => $total,
            'completed' => $completed,
            'failed' => $failed,
            'paused' => $paused,
            'running' => $running,
            'pending' => $pending,
            'skipped' => $skipped,
            'successRate' => $successRate,
            'failureRate' => $failureRate,
            'averageDurationSeconds' => $avgDuration,
        ];
    }

    public function topTriggeredWorkflows(int $limit = 10): Collection
    {
        return CrmWorkflowRun::select('workflow_id', 'status')
            ->with('workflow:id,name')
            ->get()
            ->groupBy('workflow_id')
            ->sortByDesc(fn (Collection $group) => $group->count())
            ->take($limit)
            ->map(fn (Collection $group, int $workflowId) => [
                'workflowId' => $workflowId,
                'workflowName' => $group->first()->workflow?->name,
                'totalRuns' => $group->count(),
                'completed' => $group->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count(),
                'failed' => $group->where('status', WorkflowStatusCatalog::RUN_FAILED)->count(),
            ])
            ->values();
    }

    public function topFailedActions(int $limit = 10): Collection
    {
        return CrmWorkflowActionRun::select('action_type', 'status')
            ->get()
            ->groupBy('action_type')
            ->map(fn (Collection $group, string $actionType) => [
                'actionType' => $actionType,
                'totalCount' => $group->count(),
                'failureCount' => $group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count(),
                'failureRate' => $group->count() > 0
                    ? round(($group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count() / $group->count()) * 100, 1)
                    : 0,
            ])
            ->sortByDesc('failureCount')
            ->take($limit)
            ->values();
    }

    public function dailyTrends(int $days = 30): Collection
    {
        $since = now()->subDays($days)->startOfDay();

        $runs = CrmWorkflowRun::where('created_at', '>=', $since)
            ->get(['created_at', 'status']);

        $dates = collect();
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayRuns = $runs->filter(fn ($r) => $r->created_at->format('Y-m-d') === $date);
            $dates->push([
                'date' => $date,
                'total' => $dayRuns->count(),
                'completed' => $dayRuns->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count(),
                'failed' => $dayRuns->where('status', WorkflowStatusCatalog::RUN_FAILED)->count(),
                'paused' => $dayRuns->where('status', WorkflowStatusCatalog::RUN_PAUSED)->count(),
            ]);
        }

        return $dates;
    }

    public function byWorkflow(): Collection
    {
        return CrmWorkflow::with('runs')
            ->get()
            ->filter(fn (CrmWorkflow $w) => $w->runs->isNotEmpty())
            ->map(fn (CrmWorkflow $w) => [
                'id' => $w->id,
                'name' => $w->name,
                'totalRuns' => $w->runs->count(),
                'completed' => $w->runs->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count(),
                'failed' => $w->runs->where('status', WorkflowStatusCatalog::RUN_FAILED)->count(),
                'paused' => $w->runs->where('status', WorkflowStatusCatalog::RUN_PAUSED)->count(),
                'successRate' => $w->runs->count() > 0
                    ? round(($w->runs->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count() / $w->runs->count()) * 100, 1)
                    : 0,
            ])
            ->sortByDesc('totalRuns')
            ->values();
    }

    public function actionPerformance(): Collection
    {
        return CrmWorkflowActionRun::select('action_type', 'status', 'started_at', 'completed_at')
            ->get()
            ->groupBy('action_type')
            ->map(fn (Collection $group, string $actionType) => [
                'actionType' => $actionType,
                'totalCount' => $group->count(),
                'failureCount' => $group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count(),
                'failureRate' => $group->count() > 0
                    ? round(($group->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count() / $group->count()) * 100, 1)
                    : 0,
                'averageDurationSeconds' => (function () use ($group) {
                    $completed = $group
                        ->where('status', WorkflowStatusCatalog::ACTION_COMPLETED)
                        ->filter(fn ($a) => $a->started_at !== null && $a->completed_at !== null);

                    return $completed->isNotEmpty()
                        ? round($completed->avg(fn ($a) => $a->started_at->diffInSeconds($a->completed_at)))
                        : null;
                })(),
            ])
            ->sortByDesc('totalCount')
            ->values();
    }
}
