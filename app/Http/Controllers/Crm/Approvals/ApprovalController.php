<?php

namespace App\Http\Controllers\Crm\Approvals;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApprovalDetailsResource;
use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\ApprovalEngine;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class ApprovalController extends Controller
{
    public function __construct(
        private readonly ApprovalEngine $approvalEngine,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CrmApprovalRequest::class);

        $query = CrmApprovalRequest::with('flow');

        if ($request->filled('status') && ApprovalStatusCatalog::isValidRequestStatus($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->filled('flow_id')) {
            $query->where('approval_flow_id', $request->flow_id);
        }

        if ($request->filled('workflow_id')) {
            $query->whereHas('workflowRun', fn ($q) => $q->where('workflow_id', $request->workflow_id));
        }

        if ($request->filled('date_from')) {
            $query->where('requested_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('requested_at', '<=', $request->date_to);
        }

        $requests = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $requests->map(fn (CrmApprovalRequest $req) => [
                'id' => $req->id,
                'approvalFlowId' => $req->approval_flow_id,
                'workflowRunId' => $req->workflow_run_id,
                'entityType' => $req->entity_type,
                'entityId' => $req->entity_id,
                'status' => $req->status,
                'requestedAt' => $req->requested_at?->toIso8601String(),
                'completedAt' => $req->completed_at?->toIso8601String(),
                'resolutionTimeMinutes' => $req->resolution_time_minutes,
                'escalationCount' => $req->escalation_count,
                'flow' => $req->relationLoaded('flow') && $req->flow ? [
                    'id' => $req->flow->id,
                    'name' => $req->flow->name,
                ] : null,
            ]),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function show(CrmApprovalRequest $request): JsonResponse
    {
        $this->authorize('view', $request);

        $request->load(['flow.steps', 'workflowRun.workflow', 'requester', 'decisions.user', 'decisions.step']);

        return response()->json([
            'request' => new ApprovalDetailsResource($request),
        ]);
    }

    public function decide(Request $httpRequest, CrmApprovalRequest $approvalRequest): JsonResponse
    {
        $this->authorize('decide', $approvalRequest);

        if ($approvalRequest->status !== ApprovalStatusCatalog::REQUEST_PENDING) {
            return response()->json(['message' => 'Approval request is not pending'], 422);
        }

        $validated = $httpRequest->validate([
            'decision' => ['required', 'string', 'in:approved,rejected,abstained'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validated['decision'] === ApprovalStatusCatalog::DECISION_REJECTED && blank($validated['comment'] ?? null)) {
            return response()->json(['message' => 'Comment is required when rejecting'], 422);
        }

        $approvalRequest->loadMissing(['flow.steps', 'decisions']);

        $user = $httpRequest->user();

        $step = $approvalRequest->flow->steps
            ->filter(fn ($step) => $step->approver_type === 'user' && (int) $step->approver_id === (int) $user->id)
            ->reject(fn ($step) => $approvalRequest->decisions->contains('approval_step_id', $step->id))
            ->first();

        if ($step === null) {
            return response()->json(['message' => 'No actionable step found for current user'], 403);
        }

        try {
            $this->approvalEngine->recordDecision(
                $approvalRequest,
                $step,
                $user,
                $validated['decision'],
                $validated['comment'] ?? null,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $approvalRequest->refresh();
        $approvalRequest->load(['flow.steps', 'workflowRun.workflow', 'requester', 'decisions.user', 'decisions.step']);

        return response()->json([
            'request' => new ApprovalDetailsResource($approvalRequest),
            'message' => $validated['decision'] === 'approved'
                ? 'Approved successfully'
                : ($validated['decision'] === 'rejected' ? 'Rejected' : 'Abstained'),
        ]);
    }

    public function metrics(Request $httpRequest): JsonResponse
    {
        $this->authorize('viewAny', CrmApprovalRequest::class);

        $total = CrmApprovalRequest::count();
        $pending = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_PENDING)->count();
        $approvedToday = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_APPROVED)
            ->whereDate('approved_at', today())->count();
        $rejectedToday = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_REJECTED)
            ->whereDate('rejected_at', today())->count();
        $escalated = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count();
        $expired = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_EXPIRED)->count();

        $resolved = CrmApprovalRequest::whereNotNull('resolution_time_minutes')->get();
        $avgResolutionTime = $resolved->isNotEmpty()
            ? round($resolved->avg('resolution_time_minutes'))
            : null;

        $withFirstResponse = CrmApprovalRequest::whereNotNull('first_response_at')->get(['requested_at', 'first_response_at']);
        $avgFirstResponse = $withFirstResponse->isNotEmpty()
            ? round($withFirstResponse->avg(fn ($r) => $r->requested_at->diffInMinutes($r->first_response_at, true)))
            : null;

        $totalCount = max(CrmApprovalRequest::count(), 1);
        $escalationRate = round(($escalated / $totalCount) * 100, 1);

        return response()->json([
            'pending' => $pending,
            'approvedToday' => $approvedToday,
            'rejectedToday' => $rejectedToday,
            'escalated' => $escalated,
            'expired' => $expired,
            'total' => $total,
            'averageResolutionTimeMinutes' => $avgResolutionTime,
            'averageFirstResponseMinutes' => $avgFirstResponse,
            'escalationRatePercent' => $escalationRate,
        ]);
    }
}
