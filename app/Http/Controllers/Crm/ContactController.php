<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmContact;
use App\Models\CrmContactInfluenceType;
use App\Models\CrmContactRole;
use App\Models\CrmOrganization;
use App\Services\Crm\CrmDuplicateDetectionService;
use App\Services\Crm\CrmRelationshipService;
use App\Services\Crm\Health\CrmHealthService;
use App\Services\Crm\NextBestAction\CrmNextBestActionService;
use App\Services\Crm\Timeline\CrmTimelineService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function __construct(
        private readonly CrmTimelineService $timeline,
        private readonly CrmHealthService $health,
        private readonly CrmNextBestActionService $nba,
        private readonly CrmRelationshipService $relationships,
        private readonly CrmDuplicateDetectionService $duplicates,
    ) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmContact::class);

        $query = CrmContact::with(['owner', 'influenceType', 'organizations' => fn ($q) => $q->wherePivot('is_primary', true)]);

        if ($request->user()->hasRole('sales_rep')) {
            $query->where('owner_id', $request->user()->id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('influence_type_id')) {
            $query->where('influence_type_id', $request->influence_type_id);
        }

        if ($request->filled('organization_id')) {
            $query->whereHas('organizations', fn ($q) => $q->where('crm_organizations.id', $request->organization_id));
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        $contacts = $query->paginate(25)->withQueryString();

        $influenceTypes = CrmContactInfluenceType::all();

        return inertia('crm/contacts/index', [
            'contacts' => $contacts,
            'influence_types' => $influenceTypes,
            'filters' => $request->only(['search', 'influence_type_id', 'organization_id', 'sort', 'dir']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', CrmContact::class);

        return inertia('crm/contacts/create', [
            'influence_types' => CrmContactInfluenceType::all(),
            'organizations' => CrmOrganization::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function edit(CrmContact $contact)
    {
        $this->authorize('update', $contact);

        $contact->load('organizations');

        return inertia('crm/contacts/create', [
            'contact' => $contact->only(['id', 'first_name', 'last_name', 'email', 'phone', 'mobile', 'job_title', 'department', 'linkedin_url', 'influence_type_id']),
            'influence_types' => CrmContactInfluenceType::all(),
            'organizations' => CrmOrganization::orderBy('name')->get(['id', 'name']),
            'selected_organization_ids' => $contact->organizations->pluck('id')->map(fn ($id) => (string) $id),
        ]);
    }

    public function show(Request $request, CrmContact $contact)
    {
        $this->authorize('view', $contact);

        $contact->load([
            'owner',
            'organizations' => fn ($q) => $q->withPivot(['contact_role_id', 'is_primary', 'job_title']),
            'addresses',
            'tags',
            'deals' => fn ($q) => $q->with('owner')->orderBy('created_at', 'desc'),
        ]);

        $healthScore = $this->health->latest($contact);
        $recommendations = $this->nba->collect($contact, $request->user()->id);

        return inertia('crm/contacts/show', [
            'contact' => $contact,
            'health_score' => $healthScore,
            'recommendations' => $recommendations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CrmContact::class);

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'nullable|email|max:200',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:200',
            'department' => 'nullable|string|max:100',
            'linkedin_url' => 'nullable|string|max:500',
            'influence_type_id' => 'nullable|exists:crm_contact_influence_types,id',
            'organization_ids' => 'nullable|array',
            'organization_ids.*' => 'exists:crm_organizations,id',
        ]);

        if ($validated['email'] ?? null) {
            $existing = $this->duplicates->findContactDuplicates($validated['email']);
            if ($existing->isNotEmpty()) {
                return back()->withErrors(['email' => 'A contact with this email already exists.'])->withInput();
            }
        }

        $validated['created_by'] = $request->user()->id;

        $contact = CrmContact::create($validated);

        if (! empty($validated['organization_ids'])) {
            $contact->organizations()->syncWithPivotValues($validated['organization_ids'], [
                'contact_role_id' => CrmContactRole::where('slug', 'employee')->value('id'),
                'is_primary' => count($validated['organization_ids']) === 1,
            ]);
        }

        return redirect()->route('crm.contacts.show', $contact)->with('success', 'Contact created');
    }

    public function update(Request $request, CrmContact $contact): RedirectResponse
    {
        $this->authorize('update', $contact);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'email' => 'nullable|email|max:200',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:200',
            'department' => 'nullable|string|max:100',
            'linkedin_url' => 'nullable|string|max:500',
            'influence_type_id' => 'nullable|exists:crm_contact_influence_types,id',
            'owner_id' => 'nullable|exists:users,id',
            'organization_ids' => 'nullable|array',
            'organization_ids.*' => 'exists:crm_organizations,id',
        ]);

        $contact->update($validated);

        if (array_key_exists('organization_ids', $validated)) {
            $existingRoles = $contact->organizations()->pluck('contact_role_id', 'crm_organization_contact.organization_id');
            $sync = [];
            foreach ($validated['organization_ids'] as $orgId) {
                $sync[$orgId] = [
                    'contact_role_id' => $existingRoles[$orgId] ?? 1,
                    'is_primary' => count($validated['organization_ids']) === 1,
                ];
            }
            $contact->organizations()->sync($sync);
        }

        return back()->with('success', 'Contact updated');
    }

    public function destroy(CrmContact $contact): RedirectResponse
    {
        $this->authorize('delete', $contact);

        $contact->organizations()->detach();
        $contact->activities()->delete();
        $contact->delete();

        return redirect()->route('crm.contacts.index')->with('success', 'Contact deleted');
    }
}
