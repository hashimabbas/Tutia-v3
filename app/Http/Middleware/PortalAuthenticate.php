<?php

namespace App\Http\Middleware;

use App\Models\CrmPortalSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PortalAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        $plaintext = $request->cookie('portal_session') ?? $request->bearerToken();

        if (! $plaintext) {
            return redirect()->route('portal.auth.login');
        }

        $hashed = hash('sha256', $plaintext);
        $session = CrmPortalSession::where('token_hash', $hashed)
            ->whereNull('revoked_at')
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->first();

        if (! $session || ! $session->account->enabled_at || $session->account->disabled_at) {
            return redirect()->route('portal.auth.login');
        }

        $session->update(['last_used_at' => now()]);

        $request->merge(['portal_account' => $session->account]);
        app()->instance('portal-account', $session->account);

        return $next($request);
    }
}
