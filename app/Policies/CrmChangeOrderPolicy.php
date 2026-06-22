<?php

namespace App\Policies;

use App\Models\CrmChangeOrder;
use App\Models\User;

class CrmChangeOrderPolicy
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
        return $user->hasAnyPermission(['crm.change_orders.view', 'crm.change_orders.edit', 'crm.change_orders.create']);
    }

    public function view(User $user, CrmChangeOrder $changeOrder): bool
    {
        return $user->hasPermissionTo('crm.change_orders.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.change_orders.create');
    }

    public function update(User $user, CrmChangeOrder $changeOrder): bool
    {
        return $user->hasPermissionTo('crm.change_orders.edit');
    }

    public function delete(User $user, CrmChangeOrder $changeOrder): bool
    {
        return $user->hasRole('manager');
    }
}
