<?php

namespace App\Http\Controllers;

use App\Models\CrmLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CrmController extends Controller
{
    public function submit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'service' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        CrmLead::create([
            ...$validated,
            'source' => 'contact',
            'stage' => 'new',
        ]);

        return redirect()->route('contact.thank-you');
    }

    public function consultation(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'company' => 'nullable|string|max:255',
            'description' => 'required|string|max:5000',
            'time_slot' => 'required|string|max:50',
        ]);

        CrmLead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'company' => $validated['company'] ?? null,
            'brief' => $validated['description'],
            'time_slot' => $validated['time_slot'],
            'source' => 'consultation',
            'stage' => 'new',
        ]);

        return redirect()->route('contact.thank-you');
    }

    public function proposal(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'project_type' => 'required|string|max:255',
            'budget' => 'nullable|string|max:255',
            'timeline' => 'nullable|string|max:255',
            'requirements' => 'required|string|max:10000',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'company' => 'nullable|string|max:255',
        ]);

        CrmLead::create([
            ...$validated,
            'source' => 'proposal',
            'stage' => 'new',
        ]);

        return redirect()->route('contact.thank-you');
    }

    public function quote(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'service' => 'required|string|max:255',
            'requirements' => 'required|string|max:5000',
        ]);

        CrmLead::create([
            ...$validated,
            'source' => 'quote',
            'stage' => 'new',
        ]);

        return redirect()->route('contact.thank-you');
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        CrmLead::create([
            'name' => explode('@', $validated['email'])[0],
            'email' => $validated['email'],
            'source' => 'newsletter',
            'stage' => 'new',
            'message' => 'Newsletter subscription',
        ]);

        return redirect()->back()->with('success', 'Subscribed successfully');
    }
}
