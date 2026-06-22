<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PortalProfileController extends Controller
{
    public function show(Request $request)
    {
        $account = $request->get('portal_account');

        return inertia('portal/profile', [
            'account' => [
                'email' => $account->email_snapshot ?? $account->contact->email,
                'name' => $account->name_snapshot ?? $account->contact->name,
                'locale' => $account->locale,
                'login_count' => $account->login_count,
                'last_login_at' => $account->last_login_at,
                'enabled_at' => $account->enabled_at,
            ],
        ]);
    }
}
