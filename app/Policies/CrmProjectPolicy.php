<?php

namespace App\Policies;

use App\Models\CrmProject;
use App\Models\User;

class CrmProjectPolicy
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
        return $user->hasAnyPermission(['crm.milestones.view', 'crm.risks.view', 'crm.issues.view']);
    }

    public function view(User $user, CrmProject $project): bool
    {
        return $user->hasRole('manager') || $user->hasAnyPermission([
            'crm.milestones.view', 'crm.risks.view', 'crm.issues.view',
        ]);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('manager');
    }

    public function update(User $user, CrmProject $project): bool
    {
        return $user->hasRole('manager');
    }

    public function delete(User $user, CrmProject $project): bool
    {
        return $user->hasRole('manager');
    }
}
