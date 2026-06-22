<?php

namespace App\Http\Controllers\Portal;

use App\Events\Crm\ChangeOrderRejected;
use App\Http\Controllers\Controller;
use App\Models\CrmChangeOrder;
use App\Models\CrmProject;
use App\Services\Crm\Portal\CustomerVisibilityService;
use App\Services\Crm\Portal\PortalRoleResolver;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PortalChangeOrderController extends Controller
{
    public function __construct(
        private CustomerVisibilityService $visibility,
        private PortalRoleResolver $roles,
        private DeliveryHealthService $health,
    ) {}

    public function approve(Request $request, CrmProject $project, CrmChangeOrder $changeOrder): RedirectResponse
    {
        $account = $request->get('portal_account');

        abort_unless($this->visibility->canAccessProject($account, $project), 403);
        abort_unless($this->roles->hasPermission($account, $project, 'approve_co'), 403);
        abort_unless($changeOrder->customer_status === 'pending', 422);

        $changeOrder->update([
            'customer_status' => 'approved',
            'approved_by_portal_account_id' => $account->id,
            'customer_responded_at' => now(),
            'status' => 'approved',
        ]);

        $changeOrder->project()->increment('change_order_total', $changeOrder->cost_impact);

        $this->health->recalculate($project);

        return redirect()->back()->with('success', 'Change order approved.');
    }

    public function reject(Request $request, CrmProject $project, CrmChangeOrder $changeOrder): RedirectResponse
    {
        $account = $request->get('portal_account');

        abort_unless($this->visibility->canAccessProject($account, $project), 403);
        abort_unless($this->roles->hasPermission($account, $project, 'approve_co'), 403);
        abort_unless($changeOrder->customer_status === 'pending', 422);

        $request->validate(['reason' => 'required|string|max:500']);

        $changeOrder->update([
            'customer_status' => 'rejected',
            'approved_by_portal_account_id' => $account->id,
            'customer_responded_at' => now(),
            'status' => 'draft',
        ]);

        ChangeOrderRejected::dispatch($changeOrder->fresh(), $account, $request->input('reason'));

        $this->health->recalculate($project);

        return redirect()->back()->with('info', 'Change order rejected.');
    }
}
