<?php

namespace App\Policies;

use App\Models\CrmLead;
use App\Models\User;

class CrmLeadPolicy
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
        return $user->hasAnyPermission(['crm.leads.view', 'crm.leads.edit', 'crm.leads.create']);
    }

    public function view(User $user, CrmLead $lead): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $lead->assigned_to === $user->id || $user->hasPermissionTo('crm.leads.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.leads.create');
    }

    public function update(User $user, CrmLead $lead): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $lead->assigned_to === $user->id && $user->hasPermissionTo('crm.leads.edit');
    }

    public function delete(User $user, CrmLead $lead): bool
    {
        return $user->hasRole('manager');
    }
}
