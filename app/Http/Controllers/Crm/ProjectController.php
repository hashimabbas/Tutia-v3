<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmProject;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(
        private readonly DeliveryHealthService $health,
    ) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmProject::class);

        $query = CrmProject::with('organization');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        if ($request->wantsJson()) {
            return response()->json($query->get());
        }

        $projects = $query->paginate(25)->withQueryString();

        return inertia('crm/projects/index', [
            'projects' => $projects,
            'filters' => $request->only(['status', 'search', 'sort', 'dir']),
        ]);
    }

    public function show(Request $request, CrmProject $project)
    {
        $this->authorize('view', $project);

        $project->load([
            'organization',
            'milestones' => fn ($q) => $q->with('deliverables'),
            'risks.owner',
            'issues.owner',
            'changeOrders',
        ]);

        $healthResult = $this->health->latest($project) ?? $this->health->calculate($project);

        if ($request->wantsJson()) {
            return response()->json($project);
        }

        return inertia('crm/projects/show', [
            'project' => $project,
            'health' => $healthResult->toArray(),
        ]);
    }

    public function update(Request $request, CrmProject $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:planned,active,at_risk,completed,archived',
            'contract_value' => 'sometimes|numeric|min:0',
            'change_order_total' => 'sometimes|numeric|min:0',
            'billed_amount' => 'sometimes|numeric|min:0',
            'collected_amount' => 'sometimes|numeric|min:0',
            'start_date' => 'sometimes|nullable|date',
            'target_end_date' => 'sometimes|nullable|date',
            'actual_end_date' => 'sometimes|nullable|date',
            'customer_sentiment' => 'sometimes|nullable|in:positive,neutral,negative',
            'visibility' => 'sometimes|in:internal,customer',
        ]);

        $project->update($validated);

        return back()->with('success', 'Project updated');
    }

    public function archive(Request $request, CrmProject $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $project->update(['status' => 'archived']);

        return back()->with('success', 'Project archived');
    }

    public function restore(Request $request, CrmProject $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $project->update(['status' => 'active']);

        return back()->with('success', 'Project restored');
    }
}
