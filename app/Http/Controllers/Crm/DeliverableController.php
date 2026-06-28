<?php

namespace App\Http\Controllers\Crm;

use App\Events\Crm\DeliverableCompleted;
use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use App\Models\CrmDeliverable;
use App\Models\CrmMilestone;
use App\Models\CrmProject;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliverableController extends Controller
{
    public function __construct(
        private readonly DeliveryHealthService $health,
    ) {}

    public function indexAll(Request $request): Response
    {
        $this->authorize('viewAny', CrmDeliverable::class);

        $query = CrmDeliverable::with('milestone.project.organization');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort ?? 'sort_order';
        $sortDir = $request->dir ?? 'asc';
        $query->orderBy($sortField, $sortDir);

        return Inertia::render('crm/deliverables/index', [
            'deliverables' => $query->paginate(25)->withQueryString(),
            'filters' => (object) $request->only(['status', 'sort', 'dir']),
        ]);
    }

    public function index(Request $request, CrmProject $project, CrmMilestone $milestone)
    {
        $this->authorize('viewAny', CrmDeliverable::class);

        $query = $milestone->deliverables();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort ?? 'sort_order';
        $sortDir = $request->dir ?? 'asc';
        $query->orderBy($sortField, $sortDir);

        if ($request->wantsJson()) {
            return response()->json($query->get());
        }

        $deliverables = $query->paginate(25)->withQueryString();

        return inertia('crm/projects/milestones/deliverables/index', [
            'project' => $project->load('organization'),
            'milestone' => $milestone,
            'deliverables' => $deliverables,
            'filters' => $request->only(['status', 'sort', 'dir']),
        ]);
    }

    public function store(Request $request, CrmProject $project, CrmMilestone $milestone): RedirectResponse
    {
        $this->authorize('create', CrmDeliverable::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'due_date' => 'nullable|date',
            'owner_id' => 'nullable|exists:users,id',
            'acceptance_criteria' => 'nullable|string|max:2000',
            'is_visible_to_customer' => 'boolean',
        ]);

        $maxSort = $milestone->deliverables()->max('sort_order') ?? 0;
        $validated['milestone_id'] = $milestone->id;
        $validated['sort_order'] = $maxSort + 1;
        $validated['status'] = 'pending';

        $deliverable = CrmDeliverable::create($validated);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'deliverable_created',
            'subject' => 'Deliverable created',
            'description' => "Deliverable \"{$deliverable->name}\" created.",
            'created_by' => $request->user()->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json($deliverable->fresh()->load('owner'));
        }

        return back()->with('success', 'Deliverable created');
    }

    public function update(Request $request, CrmProject $project, CrmMilestone $milestone, CrmDeliverable $deliverable): RedirectResponse
    {
        $this->authorize('update', $deliverable);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'due_date' => 'nullable|date',
            'owner_id' => 'nullable|exists:users,id',
            'acceptance_criteria' => 'nullable|string|max:2000',
            'is_visible_to_customer' => 'boolean',
        ]);

        $deliverable->update($validated);

        return back()->with('success', 'Deliverable updated');
    }

    public function complete(Request $request, CrmProject $project, CrmMilestone $milestone, CrmDeliverable $deliverable): RedirectResponse
    {
        $this->authorize('update', $deliverable);

        $deliverable->update(['status' => 'completed']);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'deliverable_completed',
            'subject' => 'Deliverable completed',
            'description' => "Deliverable \"{$deliverable->name}\" completed.",
            'created_by' => $request->user()->id,
        ]);

        DeliverableCompleted::dispatch($deliverable, $request->user());

        $this->health->recalculate($project);

        return back()->with('success', 'Deliverable completed');
    }

    public function approve(Request $request, CrmProject $project, CrmMilestone $milestone, CrmDeliverable $deliverable): RedirectResponse
    {
        $this->authorize('update', $deliverable);

        $deliverable->update([
            'status' => 'approved',
            'customer_approved_at' => now(),
            'customer_approved_by' => (string) $request->user()->id,
        ]);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'deliverable_approved',
            'subject' => 'Deliverable approved',
            'description' => "Deliverable \"{$deliverable->name}\" approved.",
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Deliverable approved');
    }

    public function destroy(Request $request, CrmProject $project, CrmMilestone $milestone, CrmDeliverable $deliverable): RedirectResponse
    {
        $this->authorize('delete', $deliverable);

        $deliverable->delete();

        return redirect()->route('crm.projects.milestones.deliverables.index', [$project, $milestone])
            ->with('success', 'Deliverable deleted');
    }
}
