<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CrmActivity::class);

        $validated = $request->validate([
            'activitable_type' => 'required|string',
            'activitable_id' => 'required|integer',
            'type' => 'required|string|max:50',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_at' => 'nullable|date',
        ]);

        $validated['created_by'] = $request->user()->id;

        CrmActivity::create($validated);

        return back()->with('success', 'Activity logged');
    }

    public function complete(CrmActivity $activity): RedirectResponse
    {
        $this->authorize('update', $activity);

        $activity->update(['completed_at' => now()]);

        return back()->with('success', 'Activity completed');
    }

    public function destroy(CrmActivity $activity): RedirectResponse
    {
        $this->authorize('delete', $activity);

        $activity->delete();

        return back()->with('success', 'Activity deleted');
    }
}
