<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkflowRunResource;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowRun;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Http\Request;

class WorkflowRunPageController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmWorkflowRun::class);

        if ($request->wantsJson()) {
            return app(WorkflowRunController::class)->index($request);
        }

        $query = CrmWorkflowRun::with('workflow');

        if ($request->filled('workflow_id')) {
            $query->where('workflow_id', (int) $request->workflow_id);
        }

        if ($request->filled('status') && WorkflowStatusCatalog::isValidRunStatus($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('started_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('started_at', '<=', $request->date_to);
        }

        $runs = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $workflows = CrmWorkflow::select('id', 'name')->orderBy('name')->get();
        $statuses = collect(WorkflowStatusCatalog::RUN_ALL)->map(fn (string $status) => [
            'key' => $status,
            'label' => ucfirst($status),
        ]);

        $metricsQuery = CrmWorkflowRun::query();

        if ($request->filled('workflow_id')) {
            $metricsQuery->where('workflow_id', (int) $request->workflow_id);
        }

        $total = (clone $metricsQuery)->count();
        $completed = (clone $metricsQuery)->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count();
        $failed = (clone $metricsQuery)->where('status', WorkflowStatusCatalog::RUN_FAILED)->count();
        $paused = (clone $metricsQuery)->where('status', WorkflowStatusCatalog::RUN_PAUSED)->count();
        $avgDurationQuery = (clone $metricsQuery)
            ->whereNotNull('completed_at')
            ->whereNotNull('started_at')
            ->get(['started_at', 'completed_at']);

        $avgDuration = $avgDurationQuery->isNotEmpty()
            ? round($avgDurationQuery->avg(fn ($r) => $r->started_at->diffInSeconds($r->completed_at)))
            : null;

        return inertia('crm/workflows/runs/index', [
            'runs' => $runs,
            'workflows' => $workflows,
            'statuses' => $statuses,
            'filters' => $request->only(['workflow_id', 'status', 'date_from', 'date_to']),
            'metrics' => [
                'total' => $total,
                'completed' => $completed,
                'failed' => $failed,
                'paused' => $paused,
                'averageDurationSeconds' => $avgDuration ? round((float) $avgDuration) : null,
            ],
        ]);
    }

    public function show(Request $request, CrmWorkflowRun $run)
    {
        $this->authorize('view', $run);

        if ($request->wantsJson()) {
            return app(WorkflowRunController::class)->show($run);
        }

        $run->load(['workflow', 'actionRuns', 'approvalRequests.decisions', 'approvalRequests.flow']);

        return inertia('crm/workflows/runs/show', [
            'run' => WorkflowRunResource::make($run)->toArray($request),
        ]);
    }
}
