<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmContact;
use App\Models\CrmDeal;
use App\Models\CrmOrganization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmDeal::class);

        $query = CrmDeal::with(['lead', 'owner']);

        if ($request->user()->hasRole('sales_rep')) {
            $query->where('owner_id', $request->user()->id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        $deals = $query->paginate(25)->withQueryString();

        $stages = [
            'qualification' => 'Qualification',
            'meeting' => 'Meeting Scheduled',
            'proposal' => 'Proposal Sent',
            'negotiation' => 'Negotiation',
            'closed_won' => 'Closed Won',
            'closed_lost' => 'Closed Lost',
        ];

        if ($request->wantsJson()) {
            return response()->json($deals);
        }

        $stageGroups = collect($stages)->mapWithKeys(fn ($label, $key) => [
            $key => [
                'label' => $label,
                'deals' => CrmDeal::with(['lead', 'owner'])
                    ->where('stage', $key)
                    ->when($request->user()->hasRole('sales_rep'), fn ($q) => $q->where('owner_id', $request->user()->id))
                    ->orderBy('updated_at', 'desc')
                    ->get(),
                'total' => CrmDeal::where('stage', $key)
                    ->when($request->user()->hasRole('sales_rep'), fn ($q) => $q->where('owner_id', $request->user()->id))
                    ->sum('value'),
            ],
        ]);

        return inertia('crm/deals/index', [
            'deals' => $deals,
            'stage_groups' => $stageGroups,
            'stages' => $stages,
            'filters' => $request->only(['search', 'stage', 'sort', 'dir']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', CrmDeal::class);

        return inertia('crm/deals/create', [
            'contacts' => CrmContact::with('organizations')->limit(500)->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'job_title' => $c->job_title,
                'organization_name' => $c->organizations->first(fn ($o) => $o->pivot->is_primary)?->name,
                'organization_id' => $c->organizations->first(fn ($o) => $o->pivot->is_primary)?->id,
            ]),
            'organizations' => CrmOrganization::limit(500)->get()->map(fn ($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'industry' => $o->industry,
            ]),
        ]);
    }

    public function edit(CrmDeal $deal)
    {
        $this->authorize('update', $deal);

        return inertia('crm/deals/create', [
            'deal' => $deal->only(['id', 'title', 'value', 'currency', 'stage', 'probability', 'company', 'contact_name', 'contact_email', 'contact_phone', 'expected_close_date', 'notes', 'organization_id', 'contact_id']),
            'contacts' => CrmContact::with('organizations')->limit(500)->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'job_title' => $c->job_title,
                'organization_name' => $c->organizations->first(fn ($o) => $o->pivot->is_primary)?->name,
                'organization_id' => $c->organizations->first(fn ($o) => $o->pivot->is_primary)?->id,
            ]),
            'organizations' => CrmOrganization::limit(500)->get()->map(fn ($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'industry' => $o->industry,
            ]),
        ]);
    }

    public function show(CrmDeal $deal)
    {
        $this->authorize('view', $deal);

        $deal->load(['lead', 'owner', 'activities.createdBy']);

        return inertia('crm/deals/show', [
            'deal' => $deal,
        ]);
    }

    public function update(Request $request, CrmDeal $deal): RedirectResponse
    {
        $this->authorize('update', $deal);

        $validated = $request->validate([
            'stage' => 'sometimes|string|max:50',
            'value' => 'sometimes|numeric|min:0',
            'probability' => 'sometimes|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'lost_reason' => 'nullable|string|max:255',
            'title' => 'sometimes|string|max:255',
            'currency' => 'sometimes|string|size:3',
            'organization_id' => 'nullable|exists:crm_organizations,id',
            'contact_id' => 'nullable|exists:crm_contacts,id',
            'contact_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
        ]);

        $deal->update($validated);

        return back()->with('success', 'Deal updated');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CrmDeal::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'value' => 'required|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'stage' => 'sometimes|string|max:50',
            'lead_id' => 'nullable|exists:crm_leads,id',
            'organization_id' => 'nullable|exists:crm_organizations,id',
            'contact_id' => 'nullable|exists:crm_contacts,id',
            'contact_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'expected_close_date' => 'nullable|date',
            'probability' => 'nullable|integer|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        $validated['owner_id'] = $request->user()->id;

        CrmDeal::create($validated);

        return redirect()->route('crm.deals.index')->with('success', 'Deal created');
    }

    public function destroy(CrmDeal $deal): RedirectResponse
    {
        $this->authorize('delete', $deal);

        $deal->activities()->delete();
        $deal->delete();

        return redirect()->route('crm.deals.index')->with('success', 'Deal deleted');
    }
}
