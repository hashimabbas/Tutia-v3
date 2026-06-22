<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PortalPreferencesController extends Controller
{
    public function index(Request $request)
    {
        $account = $request->get('portal_account');

        return inertia('portal/preferences', [
            'preferences' => $account->preferences,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $account = $request->get('portal_account');

        $request->validate([
            'preferences' => 'required|array',
            'preferences.*.id' => 'sometimes|exists:crm_portal_notification_preferences,id',
            'preferences.*.channel' => 'required|string|in:email,whatsapp,sms,portal',
            'preferences.*.frequency' => 'required|string|in:immediate,daily,weekly,muted',
            'preferences.*.event_filters' => 'nullable|string',
        ]);

        foreach ($request->preferences as $pref) {
            $account->preferences()->updateOrCreate(
                ['channel' => $pref['channel']],
                [
                    'frequency' => $pref['frequency'],
                    'event_filters' => $pref['event_filters'] ?? null,
                ],
            );
        }

        return redirect()->back()->with('success', 'Preferences updated.');
    }
}
