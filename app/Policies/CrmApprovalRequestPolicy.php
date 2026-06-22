<?php

namespace App\Policies;

use App\Models\User;

class CrmApprovalRequestPolicy
{
    public function before(?User $user): ?bool
    {
        if ($user?->hasRole('admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user): bool
    {
        return true;
    }

    public function decide(User $user): bool
    {
        return true;
    }
}
