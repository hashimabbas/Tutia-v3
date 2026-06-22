<?php

namespace App\Http\Controllers\Crm;

use App\Events\Crm\MilestoneCompleted;
use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use App\Models\CrmMilestone;
use App\Models\CrmProject;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    public function __construct(
        private readonly DeliveryHealthService $health,
    ) {}

    public function index(Request $request, CrmProject $project)
    {
        $this->authorize('viewAny', CrmMilestone::class);

        $query = $project->milestones()->with('deliverables');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort ?? 'sort_order';
        $sortDir = $request->dir ?? 'asc';
        $query->orderBy($sortField, $sortDir);

        if ($request->wantsJson()) {
            return response()->json($query->get());
        }

        $milestones = $query->paginate(25)->withQueryString();

        return inertia('crm/projects/milestones/index', [
            'project' => $project->load('organization'),
            'milestones' => $milestones,
            'filters' => $request->only(['status', 'sort', 'dir']),
        ]);
    }

    public function store(Request $request, CrmProject $project): RedirectResponse
    {
        $this->authorize('create', CrmMilestone::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $maxSort = $project->milestones()->max('sort_order') ?? 0;
        $validated['project_id'] = $project->id;
        $validated['sort_order'] = $maxSort + 1;
        $validated['status'] = 'pending';

        $milestone = CrmMilestone::create($validated);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'milestone_created',
            'subject' => 'Milestone created',
            'description' => "Milestone \"{$milestone->name}\" created.",
            'created_by' => $request->user()->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json($milestone->fresh()->load('owner', 'deliverables'));
        }

        return back()->with('success', 'Milestone created');
    }

    public function update(Request $request, CrmProject $project, CrmMilestone $milestone): RedirectResponse
    {
        $this->authorize('update', $milestone);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $milestone->update($validated);

        return back()->with('success', 'Milestone updated');
    }

    public function complete(Request $request, CrmProject $project, CrmMilestone $milestone): RedirectResponse
    {
        $this->authorize('update', $milestone);

        $milestone->update([
            'status' => 'completed',
            'actual_end_date' => now(),
        ]);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'milestone_completed',
            'subject' => 'Milestone completed',
            'description' => "Milestone \"{$milestone->name}\" completed.",
            'created_by' => $request->user()->id,
        ]);

        MilestoneCompleted::dispatch($milestone, $request->user());

        $this->health->recalculate($project);

        return back()->with('success', 'Milestone completed');
    }

    public function reopen(Request $request, CrmProject $project, CrmMilestone $milestone): RedirectResponse
    {
        $this->authorize('update', $milestone);

        $milestone->update([
            'status' => 'in_progress',
            'actual_end_date' => null,
        ]);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'milestone_reopened',
            'subject' => 'Milestone reopened',
            'description' => "Milestone \"{$milestone->name}\" reopened.",
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Milestone reopened');
    }

    public function destroy(Request $request, CrmProject $project, CrmMilestone $milestone): RedirectResponse
    {
        $this->authorize('delete', $milestone);

        $milestone->delete();

        return redirect()->route('crm.projects.milestones.index', $project)->with('success', 'Milestone deleted');
    }
}
