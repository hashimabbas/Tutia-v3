<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmClassification;
use App\Models\CrmOrganization;
use App\Services\Crm\CrmHealthService;
use App\Services\Crm\CrmNextBestActionService;
use App\Services\Crm\CrmRelationshipService;
use App\Services\Crm\Timeline\CrmTimelineService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function __construct(
        private readonly CrmTimelineService $timeline,
        private readonly CrmHealthService $health,
        private readonly CrmNextBestActionService $nba,
        private readonly CrmRelationshipService $relationships,
    ) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmOrganization::class);

        $query = CrmOrganization::with(['owner', 'primaryContacts', 'classifications']);

        if ($request->user()->hasRole('sales_rep')) {
            $query->where('owner_id', $request->user()->id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('domain', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('industry', 'like', "%{$search}%");
            });
        }

        if ($request->filled('classification')) {
            $query->whereHas('classifications', fn ($q) => $q->where('slug', $request->classification));
        }

        if ($request->filled('industry')) {
            $query->where('industry', $request->industry);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        $organizations = $query->paginate(25)->withQueryString();

        $classifications = CrmClassification::all();
        $industries = CrmOrganization::distinct()->pluck('industry')->filter()->values();

        return inertia('crm/organizations/index', [
            'organizations' => $organizations,
            'classifications' => $classifications,
            'industries' => $industries,
            'filters' => $request->only(['search', 'classification', 'industry', 'sort', 'dir']),
        ]);
    }

    public function show(CrmOrganization $organization)
    {
        $this->authorize('view', $organization);

        $organization->load([
            'owner',
            'contacts' => fn ($q) => $q->withPivot(['contact_role_id', 'is_primary', 'job_title']),
            'classifications',
            'addresses',
            'tags',
            'deals' => fn ($q) => $q->with('owner')->orderBy('created_at', 'desc'),
        ]);

        $healthScore = $this->health->latest($organization);
        $recommendations = $this->nba->collect($organization);
        $relationshipGraph = $this->relationships->getOrganizationGraph($organization);

        return inertia('crm/organizations/show', [
            'organization' => $organization,
            'health_score' => $healthScore,
            'recommendations' => $recommendations,
            'relationship_graph' => $relationshipGraph,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CrmOrganization::class);

        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'domain' => 'nullable|string|max:200',
            'industry' => 'nullable|string|max:100',
            'size' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:200',
            'notes' => 'nullable|string',
            'classifications' => 'nullable|array',
            'classifications.*' => 'exists:crm_classifications,id',
        ]);

        $validated['created_by'] = $request->user()->id;

        $org = CrmOrganization::create($validated);

        if (! empty($validated['classifications'])) {
            $org->classifications()->sync($validated['classifications']);
        }

        return redirect()->route('crm.organizations.show', $org)->with('success', 'Organization created');
    }

    public function update(Request $request, CrmOrganization $organization): RedirectResponse
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:200',
            'domain' => 'nullable|string|max:200',
            'industry' => 'nullable|string|max:100',
            'size' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:200',
            'notes' => 'nullable|string',
            'owner_id' => 'nullable|exists:users,id',
            'classifications' => 'nullable|array',
            'classifications.*' => 'exists:crm_classifications,id',
        ]);

        $organization->update($validated);

        if (array_key_exists('classifications', $validated)) {
            $organization->classifications()->sync($validated['classifications'] ?? []);
        }

        return back()->with('success', 'Organization updated');
    }

    public function destroy(CrmOrganization $organization): RedirectResponse
    {
        $this->authorize('delete', $organization);

        $organization->contacts()->detach();
        $organization->activities()->delete();
        $organization->deals()->delete();
        $organization->delete();

        return redirect()->route('crm.organizations.index')->with('success', 'Organization deleted');
    }
}
