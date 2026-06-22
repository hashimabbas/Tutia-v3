<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\CrmPortalSession;
use App\Models\CrmPortalToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PortalAuthController extends Controller
{
    public function loginForm()
    {
        return inertia('portal/auth/login');
    }

    public function consumeToken(string $plaintext): RedirectResponse
    {
        $hashed = hash('sha256', $plaintext);
        $token = CrmPortalToken::where('token_hash', $hashed)
            ->where('type', 'magic_link')
            ->whereNull('used_at')
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->first();

        if (! $token) {
            return redirect()->route('portal.auth.login')
                ->with('error', 'Invalid or expired link.');
        }

        if ($token->account->disabled_at) {
            return redirect()->route('portal.auth.login')
                ->with('error', 'Access has been revoked.');
        }

        $token->update([
            'used_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        $sessionPlaintext = bin2hex(random_bytes(32));
        CrmPortalSession::create([
            'portal_account_id' => $token->portal_account_id,
            'token_hash' => hash('sha256', $sessionPlaintext),
            'expires_at' => now()->addDays(30),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        $token->account->update([
            'last_login_at' => now(),
            'login_count' => $token->account->login_count + 1,
        ]);

        return redirect()->route('portal.dashboard')
            ->withCookie(cookie('portal_session', $sessionPlaintext, 60 * 24 * 30, secure: true, httpOnly: true, sameSite: 'lax'));
    }

    public function logout(Request $request): RedirectResponse
    {
        $plaintext = $request->cookie('portal_session');

        if ($plaintext) {
            $hashed = hash('sha256', $plaintext);
            CrmPortalSession::where('token_hash', $hashed)
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now(), 'revoked_reason' => 'logout']);
        }

        return redirect()->route('portal.auth.login')
            ->withCookie(cookie('portal_session', '', -1));
    }
}
