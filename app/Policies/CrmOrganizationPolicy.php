<?php

namespace App\Policies;

use App\Models\CrmOrganization;
use App\Models\User;

class CrmOrganizationPolicy
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
        return $user->hasAnyPermission(['crm.organizations.view', 'crm.organizations.edit', 'crm.organizations.create']);
    }

    public function view(User $user, CrmOrganization $org): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $org->owner_id === $user->id || $user->hasPermissionTo('crm.organizations.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.organizations.create');
    }

    public function update(User $user, CrmOrganization $org): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $org->owner_id === $user->id && $user->hasPermissionTo('crm.organizations.edit');
    }

    public function delete(User $user, CrmOrganization $org): bool
    {
        return $user->hasRole('manager');
    }
}
