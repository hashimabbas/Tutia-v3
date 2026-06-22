<?php

namespace App\Policies;

use App\Models\CrmDeal;
use App\Models\User;

class CrmDealPolicy
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
        return $user->hasAnyPermission(['crm.deals.view', 'crm.deals.edit', 'crm.deals.create']);
    }

    public function view(User $user, CrmDeal $deal): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $deal->owner_id === $user->id || $user->hasPermissionTo('crm.deals.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.deals.create');
    }

    public function update(User $user, CrmDeal $deal): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $deal->owner_id === $user->id && $user->hasPermissionTo('crm.deals.edit');
    }

    public function delete(User $user, CrmDeal $deal): bool
    {
        return $user->hasRole('manager');
    }
}
