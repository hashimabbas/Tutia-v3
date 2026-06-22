<?php

namespace App\Policies;

use App\Models\CrmDeliverable;
use App\Models\User;

class CrmDeliverablePolicy
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
        return $user->hasAnyPermission(['crm.deliverables.view', 'crm.deliverables.edit', 'crm.deliverables.create']);
    }

    public function view(User $user, CrmDeliverable $deliverable): bool
    {
        return $user->hasPermissionTo('crm.deliverables.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.deliverables.create');
    }

    public function update(User $user, CrmDeliverable $deliverable): bool
    {
        return $user->hasPermissionTo('crm.deliverables.edit');
    }

    public function delete(User $user, CrmDeliverable $deliverable): bool
    {
        return $user->hasRole('manager');
    }
}
