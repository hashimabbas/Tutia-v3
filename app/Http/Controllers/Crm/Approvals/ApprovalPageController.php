<?php

namespace App\Http\Controllers\Crm\Approvals;

use App\Http\Controllers\Controller;
use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use Illuminate\Http\Request;

class ApprovalPageController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmApprovalRequest::class);

        if ($request->wantsJson()) {
            return app(ApprovalController::class)->index($request);
        }

        $query = CrmApprovalRequest::with('flow');

        if ($request->filled('status') && ApprovalStatusCatalog::isValidRequestStatus($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->filled('flow_id')) {
            $query->where('approval_flow_id', (int) $request->flow_id);
        }

        if ($request->filled('date_from')) {
            $query->where('requested_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('requested_at', '<=', $request->date_to);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $flows = CrmApprovalFlow::select('id', 'name')->orderBy('name')->get();
        $statuses = collect(ApprovalStatusCatalog::REQUEST_ALL)->map(fn (string $s) => [
            'key' => $s,
            'label' => ucfirst($s),
        ]);

        $pending = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_PENDING)->count();
        $approvedToday = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_APPROVED)
            ->whereDate('approved_at', today())->count();
        $rejectedToday = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_REJECTED)
            ->whereDate('rejected_at', today())->count();
        $escalated = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_ESCALATED)->count();

        return inertia('crm/approvals/index', [
            'requests' => $requests,
            'flows' => $flows,
            'statuses' => $statuses,
            'filters' => $request->only(['status', 'flow_id', 'date_from', 'date_to']),
            'metrics' => [
                'pending' => $pending,
                'approvedToday' => $approvedToday,
                'rejectedToday' => $rejectedToday,
                'escalated' => $escalated,
            ],
        ]);
    }

    public function show(Request $request, CrmApprovalRequest $approvalRequest)
    {
        $this->authorize('view', $approvalRequest);

        if ($request->wantsJson()) {
            return app(ApprovalController::class)->show($approvalRequest);
        }

        $approvalRequest->load([
            'flow.steps',
            'workflowRun.workflow',
            'requester',
            'decisions.user',
            'decisions.step',
        ]);

        return inertia('crm/approvals/show', [
            'request' => $approvalRequest,
        ]);
    }
}
