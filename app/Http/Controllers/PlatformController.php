<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PlatformController extends Controller
{
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'category' => 'required|string|max:255',
            'location' => 'required|string|max:255',
        ]);

        Log::info('Seller registration', $validated);

        return redirect()->route('contact.thank-you');
    }
}
