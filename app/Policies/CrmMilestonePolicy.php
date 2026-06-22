<?php

namespace App\Policies;

use App\Models\CrmMilestone;
use App\Models\User;

class CrmMilestonePolicy
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
        return $user->hasAnyPermission(['crm.milestones.view', 'crm.milestones.edit', 'crm.milestones.create']);
    }

    public function view(User $user, CrmMilestone $milestone): bool
    {
        return $user->hasPermissionTo('crm.milestones.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.milestones.create');
    }

    public function update(User $user, CrmMilestone $milestone): bool
    {
        return $user->hasPermissionTo('crm.milestones.edit');
    }

    public function delete(User $user, CrmMilestone $milestone): bool
    {
        return $user->hasRole('manager');
    }
}
