<?php

namespace App\Policies;

use App\Models\CrmActivity;
use App\Models\User;

class CrmActivityPolicy
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
        return $user->hasPermissionTo('crm.activities.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.activities.create');
    }

    public function update(User $user, CrmActivity $activity): bool
    {
        return $user->hasAnyPermission(['crm.activities.edit', 'crm.activities.create']);
    }

    public function delete(User $user, CrmActivity $activity): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $activity->created_by === $user->id;
    }
}
