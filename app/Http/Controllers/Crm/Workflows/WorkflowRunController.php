<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkflowRunDetailsResource;
use App\Http\Resources\WorkflowRunResource;
use App\Models\CrmWorkflowRun;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkflowRunController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CrmWorkflowRun::class);

        $query = CrmWorkflowRun::with('workflow');

        if ($request->filled('workflow_id')) {
            $query->where('workflow_id', $request->workflow_id);
        }

        if ($request->filled('status') && WorkflowStatusCatalog::isValidRunStatus($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->filled('date_from')) {
            $query->where('started_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('started_at', '<=', $request->date_to);
        }

        $runs = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return WorkflowRunResource::collection($runs)->response();
    }

    public function show(CrmWorkflowRun $run): JsonResponse
    {
        $this->authorize('view', $run);

        $run->load(['workflow', 'actionRuns', 'approvalRequests.decisions', 'approvalRequests.flow']);

        return response()->json([
            'run' => new WorkflowRunDetailsResource($run),
        ]);
    }

    public function metrics(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CrmWorkflowRun::class);

        $query = CrmWorkflowRun::query();

        if ($request->filled('workflow_id')) {
            $query->where('workflow_id', $request->workflow_id);
        }

        $total = (clone $query)->count();
        $completed = (clone $query)->where('status', WorkflowStatusCatalog::RUN_COMPLETED)->count();
        $failed = (clone $query)->where('status', WorkflowStatusCatalog::RUN_FAILED)->count();
        $paused = (clone $query)->where('status', WorkflowStatusCatalog::RUN_PAUSED)->count();

        $completedRuns = (clone $query)
            ->whereNotNull('completed_at')
            ->whereNotNull('started_at')
            ->get(['started_at', 'completed_at']);

        $avgDuration = $completedRuns->isNotEmpty()
            ? round($completedRuns->avg(fn ($r) => $r->started_at->diffInSeconds($r->completed_at)))
            : null;

        return response()->json([
            'total' => $total,
            'completed' => $completed,
            'failed' => $failed,
            'paused' => $paused,
            'averageDurationSeconds' => $avgDuration,
        ]);
    }
}
