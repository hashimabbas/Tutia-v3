<?php

namespace App\Http\Controllers\Crm;

use App\Events\Crm\ChangeOrderApproved;
use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use App\Models\CrmChangeOrder;
use App\Models\CrmProject;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChangeOrderController extends Controller
{
    public function __construct(
        private readonly DeliveryHealthService $health,
    ) {}

    public function indexAll(Request $request): Response
    {
        $this->authorize('viewAny', CrmChangeOrder::class);

        $query = CrmChangeOrder::with('project.organization');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        return Inertia::render('crm/change-orders/index', [
            'changeOrders' => $query->paginate(25)->withQueryString(),
            'filters' => (object) $request->only(['status', 'sort', 'dir']),
        ]);
    }

    public function index(Request $request, CrmProject $project)
    {
        $this->authorize('viewAny', CrmChangeOrder::class);

        $query = $project->changeOrders();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        if ($request->wantsJson()) {
            return response()->json($query->get());
        }

        $changeOrders = $query->paginate(25)->withQueryString();

        return inertia('crm/projects/change-orders/index', [
            'project' => $project->load('organization'),
            'changeOrders' => $changeOrders,
            'filters' => $request->only(['status', 'sort', 'dir']),
        ]);
    }

    public function store(Request $request, CrmProject $project): RedirectResponse
    {
        $this->authorize('create', CrmChangeOrder::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'cost_impact' => 'required|numeric|min:0',
            'timeline_impact_days' => 'required|integer',
            'requested_by' => 'nullable|string|max:255',
        ]);

        $validated['project_id'] = $project->id;
        $validated['status'] = 'identified';

        $changeOrder = CrmChangeOrder::create($validated);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'change_order_created',
            'subject' => 'Change order created',
            'description' => "Change order \"{$changeOrder->title}\" created (\${$changeOrder->cost_impact}).",
            'created_by' => $request->user()->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json($changeOrder->fresh());
        }

        return back()->with('success', 'Change order created');
    }

    public function update(Request $request, CrmProject $project, CrmChangeOrder $changeOrder): RedirectResponse
    {
        $this->authorize('update', $changeOrder);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'cost_impact' => 'sometimes|numeric|min:0',
            'timeline_impact_days' => 'sometimes|integer',
            'requested_by' => 'nullable|string|max:255',
        ]);

        $changeOrder->update($validated);

        return back()->with('success', 'Change order updated');
    }

    public function approve(Request $request, CrmProject $project, CrmChangeOrder $changeOrder): RedirectResponse
    {
        $this->authorize('update', $changeOrder);

        $changeOrder->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        $project->increment('change_order_total', $changeOrder->cost_impact);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'change_order_approved',
            'subject' => 'Change order approved',
            'description' => "Change order \"{$changeOrder->title}\" approved (\${$changeOrder->cost_impact}, +{$changeOrder->timeline_impact_days} days).",
            'created_by' => $request->user()->id,
        ]);

        ChangeOrderApproved::dispatch($changeOrder, $request->user());

        $this->health->recalculate($project);

        return back()->with('success', 'Change order approved');
    }

    public function reject(Request $request, CrmProject $project, CrmChangeOrder $changeOrder): RedirectResponse
    {
        $this->authorize('update', $changeOrder);

        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:2000',
        ]);

        $changeOrder->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return back()->with('success', 'Change order rejected');
    }

    public function destroy(Request $request, CrmProject $project, CrmChangeOrder $changeOrder): RedirectResponse
    {
        $this->authorize('delete', $changeOrder);

        $changeOrder->delete();

        return redirect()->route('crm.projects.change-orders.index', $project)->with('success', 'Change order deleted');
    }
}
