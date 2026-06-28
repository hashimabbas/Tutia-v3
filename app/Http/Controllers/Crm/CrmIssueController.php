<?php

namespace App\Http\Controllers\Crm;

use App\Events\Crm\IssueEscalated;
use App\Events\Crm\IssueResolved;
use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use App\Models\CrmIssue;
use App\Models\CrmProject;
use App\Services\Crm\Projects\Health\DeliveryHealthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CrmIssueController extends Controller
{
    public function __construct(
        private readonly DeliveryHealthService $health,
    ) {}

    public function indexAll(Request $request): Response
    {
        $this->authorize('viewAny', CrmIssue::class);

        $query = CrmIssue::with('project.organization', 'owner');

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        return Inertia::render('crm/issues/index', [
            'issues' => $query->paginate(25)->withQueryString(),
            'filters' => (object) $request->only(['severity', 'status', 'sort', 'dir']),
        ]);
    }

    public function index(Request $request, CrmProject $project)
    {
        $this->authorize('viewAny', CrmIssue::class);

        $query = $project->issues()->with('owner');

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

        $issues = $query->paginate(25)->withQueryString();

        return inertia('crm/projects/issues/index', [
            'project' => $project->load('organization'),
            'issues' => $issues,
            'filters' => $request->only(['severity', 'status', 'sort', 'dir']),
        ]);
    }

    public function store(Request $request, CrmProject $project): RedirectResponse
    {
        $this->authorize('create', CrmIssue::class);

        $validated = $request->validate([
            'description' => 'required|string|max:1000',
            'severity' => 'required|in:blocker,critical,major,minor',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $validated['project_id'] = $project->id;
        $validated['status'] = 'open';

        $issue = CrmIssue::create($validated);

        $eventType = 'issue_created';
        $eventSubject = 'Issue logged';

        if ($issue->severity === 'blocker') {
            $eventType = 'issue_escalated';
            $eventSubject = 'Blocker issue escalated';
        }

        CrmActivity::create([
            'activitable_type' => $project->getMorphClass(),
            'activitable_id' => $project->id,
            'type' => $eventType,
            'subject' => $eventSubject,
            'description' => "Issue \"{$issue->description}\" logged with {$issue->severity} severity.",
            'created_by' => $request->user()->id,
        ]);

        if ($issue->severity === 'blocker') {
            IssueEscalated::dispatch($issue->fresh(), $request->user(), 'new');
        }

        $this->health->recalculate($project);

        if ($request->wantsJson()) {
            return response()->json($issue->fresh()->load('owner'));
        }

        return back()->with('success', 'Issue logged');
    }

    public function update(Request $request, CrmProject $project, CrmIssue $issue): RedirectResponse
    {
        $this->authorize('update', $issue);

        $validated = $request->validate([
            'description' => 'sometimes|string|max:1000',
            'severity' => 'sometimes|in:blocker,critical,major,minor',
            'status' => 'sometimes|in:open,in_progress,resolved,closed',
            'owner_id' => 'nullable|exists:users,id',
            'resolution' => 'nullable|string|max:2000',
        ]);

        $original = $issue->fresh();
        $issue->update($validated);

        $eventType = null;
        $eventSubject = null;
        $eventDescription = null;

        if (isset($validated['status'])) {
            if ($validated['status'] === 'resolved' && $original->status !== 'resolved') {
                $issue->resolved_at ??= now();
                $issue->saveQuietly();

                $eventType = 'issue_resolved';
                $eventSubject = 'Issue resolved';
                $eventDescription = "Issue \"{$issue->description}\" has been resolved.";
            } elseif ($validated['status'] === 'closed' && $original->status !== 'closed') {
                $eventType = 'issue_closed';
                $eventSubject = 'Issue closed';
                $eventDescription = "Issue \"{$issue->description}\" has been closed.";
            } elseif ($validated['status'] === 'in_progress' && $original->status === 'open') {
                $eventType = 'issue_escalated';
                $eventSubject = 'Issue escalated';
                $eventDescription = "Issue \"{$issue->description}\" escalated — now in progress.";
            }
        }

        if (isset($validated['severity']) && in_array($validated['severity'], ['blocker', 'critical'])) {
            $eventType = 'issue_escalated';
            $eventSubject = 'Issue severity escalated';
            $eventDescription = "Issue \"{$issue->description}\" escalated to {$validated['severity']}.";
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

        if (isset($validated['status']) && $validated['status'] === 'resolved' && $original->status !== 'resolved') {
            IssueResolved::dispatch($issue->fresh(), $request->user());
        }

        $escalatedFromUpdate = isset($validated['status']) && $validated['status'] === 'in_progress' && $original->status === 'open';
        $escalatedFromSeverity = isset($validated['severity']) && in_array($validated['severity'], ['blocker', 'critical']);

        if ($escalatedFromUpdate || $escalatedFromSeverity) {
            IssueEscalated::dispatch($issue->fresh(), $request->user(), $original->severity);
        }

        if (isset($validated['status']) && $validated['status'] !== $original->status) {
            $this->health->recalculate($project);
        }

        if ($request->wantsJson()) {
            return response()->json($issue->fresh()->load('owner'));
        }

        return back()->with('success', 'Issue updated');
    }

    public function destroy(Request $request, CrmProject $project, CrmIssue $issue): RedirectResponse
    {
        $this->authorize('delete', $issue);

        $issue->delete();

        return redirect()->route('crm.projects.issues.index', $project)->with('success', 'Issue deleted');
    }
}
