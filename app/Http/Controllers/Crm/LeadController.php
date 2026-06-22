<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmLead::class);

        $query = CrmLead::with(['assignedTo', 'deals']);

        if ($request->user()->hasRole('sales_rep')) {
            $query->where('assigned_to', $request->user()->id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        $leads = $query->paginate(25)->withQueryString();

        $stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost'];
        $sources = ['consultation', 'proposal', 'quote', 'contact', 'seller_registration', 'newsletter'];

        if ($request->wantsJson()) {
            return response()->json($leads);
        }

        $kanbanGroups = collect($stages)->mapWithKeys(fn ($stage) => [
            $stage => CrmLead::with('assignedTo')
                ->where('stage', $stage)
                ->when($request->user()->hasRole('sales_rep'), fn ($q) => $q->where('assigned_to', $request->user()->id))
                ->where(function ($q) use ($request) {
                    if ($request->filled('source')) {
                        $q->where('source', $request->source);
                    }
                    if ($request->filled('priority')) {
                        $q->where('priority', $request->priority);
                    }
                })
                ->orderBy('updated_at', 'desc')
                ->get(),
        ]);

        return inertia('crm/leads/index', [
            'leads' => $leads,
            'kanban_groups' => $kanbanGroups,
            'stages' => $stages,
            'sources' => $sources,
            'filters' => $request->only(['search', 'stage', 'source', 'priority', 'sort', 'dir']),
        ]);
    }

    public function show(CrmLead $lead)
    {
        $this->authorize('view', $lead);

        $lead->load(['assignedTo', 'deals', 'activities.createdBy']);

        return inertia('crm/leads/show', [
            'lead' => $lead,
        ]);
    }

    public function update(Request $request, CrmLead $lead): RedirectResponse
    {
        $this->authorize('update', $lead);

        $validated = $request->validate([
            'stage' => 'sometimes|string|max:50',
            'priority' => 'sometimes|string|max:20',
            'assigned_to' => 'nullable|exists:users,id',
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:50',
            'company' => 'sometimes|string|max:255',
        ]);

        $lead->update($validated);

        if ($request->wantsJson()) {
            return response()->json($lead->fresh()->load('assignedTo'));
        }

        return back()->with('success', 'Lead updated');
    }

    public function destroy(CrmLead $lead): RedirectResponse
    {
        $this->authorize('delete', $lead);

        $lead->activities()->delete();
        $lead->deals()->delete();
        $lead->delete();

        return redirect()->route('crm.leads.index')->with('success', 'Lead deleted');
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $this->authorize('update', CrmLead::class);

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:crm_leads,id',
            'stage' => 'required|string|max:50',
        ]);

        CrmLead::whereIn('id', $validated['ids'])->update([
            'stage' => $validated['stage'],
        ]);

        return back()->with('success', count($validated['ids']).' leads updated');
    }
}
