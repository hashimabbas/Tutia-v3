<?php

namespace App\Http\Controllers\Crm;

use App\Events\Crm\RiskClosed;
use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CrmProjectRiskController extends Controller
{
    public function __construct(
        private readonly DeliveryHealthService $health,
    ) {}

    public function indexAll(Request $request): Response
    {
        $this->authorize('viewAny', CrmProjectRisk::class);

        $query = CrmProjectRisk::with('project.organization', 'owner');

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        return Inertia::render('crm/risks/index', [
            'risks' => $query->paginate(25)->withQueryString(),
            'filters' => (object) $request->only(['severity', 'status', 'sort', 'dir']),
        ]);
    }

    public function index(Request $request, CrmProject $project)
    {
        $this->authorize('viewAny', CrmProjectRisk::class);

        $query = $project->risks()->with('owner');

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        if ($request->wantsJson()) {
            return response()->json($query->get());
        }

        $risks = $query->paginate(25)->withQueryString();

        return inertia('crm/projects/risks/index', [
            'project' => $project->load('organization'),
            'risks' => $risks,
            'filters' => $request->only(['severity', 'status', 'sort', 'dir']),
        ]);
    }

    public function store(Request $request, CrmProject $project): RedirectResponse
    {
        $this->authorize('create', CrmProjectRisk::class);

        $validated = $request->validate([
            'description' => 'required|string|max:1000',
            'severity' => 'required|in:critical,high,medium,low',
            'probability' => 'required|in:high,medium,low',
            'impact' => 'nullable|string|max:1000',
            'mitigation_plan' => 'nullable|string|max:2000',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $validated['project_id'] = $project->id;
        $validated['status'] = 'identified';

        $risk = CrmProjectRisk::create($validated);

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => 'risk_created',
            'subject' => 'Risk identified',
            'description' => "Risk \"{$risk->description}\" identified with {$risk->severity} severity.",
            'created_by' => $request->user()->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json($risk->fresh()->load('owner'));
        }

        return back()->with('success', 'Risk created');
    }

    public function update(Request $request, CrmProject $project, CrmProjectRisk $risk): RedirectResponse
    {
        $this->authorize('update', $risk);

        $validated = $request->validate([
            'description' => 'sometimes|string|max:1000',
            'severity' => 'sometimes|in:critical,high,medium,low',
            'probability' => 'sometimes|in:high,medium,low',
            'impact' => 'nullable|string|max:1000',
            'mitigation_plan' => 'nullable|string|max:2000',
            'status' => 'sometimes|in:identified,being_mitigated,closed',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $original = $risk->fresh();
        $risk->update($validated);

        $eventType = null;
        $eventSubject = null;
        $eventDescription = null;

        if (isset($validated['status'])) {
            if ($validated['status'] === 'being_mitigated' && $original->status !== 'being_mitigated') {
                $eventType = 'risk_mitigated';
                $eventSubject = 'Risk being mitigated';
                $eventDescription = "Risk \"{$risk->description}\" is now being mitigated.";
            } elseif ($validated['status'] === 'closed' && $original->status !== 'closed') {
                $eventType = 'risk_closed';
                $eventSubject = 'Risk closed';
                $eventDescription = "Risk \"{$risk->description}\" has been closed.";
            }
        }

        if ($eventType !== null) {
            CrmActivity::create([
                'activitable_type' => $project->getMorphClass(),
                'activitable_id' => $project->id,
                'type' => $eventType,
                'subject' => $eventSubject,
                'description' => $eventDescription,
                'created_by' => $request->user()->id,
            ]);
        }

        if (isset($validated['status']) && $validated['status'] === 'closed' && $original->status !== 'closed') {
            RiskClosed::dispatch($risk->fresh(), $request->user());
        }

        if (isset($validated['status']) && $validated['status'] !== $original->status) {
            $this->health->recalculate($project);
        }

        if ($request->wantsJson()) {
            return response()->json($risk->fresh()->load('owner'));
        }

        return back()->with('success', 'Risk updated');
    }

    public function destroy(Request $request, CrmProject $project, CrmProjectRisk $risk): RedirectResponse
    {
        $this->authorize('delete', $risk);

        $risk->delete();

        return redirect()->route('crm.projects.risks.index', $project)->with('success', 'Risk deleted');
    }
}
