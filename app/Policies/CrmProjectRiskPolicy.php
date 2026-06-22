<?php

namespace App\Policies;

use App\Models\CrmProjectRisk;
use App\Models\User;

class CrmProjectRiskPolicy
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
        return $user->hasAnyPermission(['crm.risks.view', 'crm.risks.edit', 'crm.risks.create']);
    }

    public function view(User $user, CrmProjectRisk $risk): bool
    {
        return $user->hasRole('manager') || $user->hasPermissionTo('crm.risks.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.risks.create');
    }

    public function update(User $user, CrmProjectRisk $risk): bool
    {
        return $user->hasRole('manager') || $user->hasPermissionTo('crm.risks.edit');
    }

    public function delete(User $user, CrmProjectRisk $risk): bool
    {
        return $user->hasRole('manager');
    }
}
