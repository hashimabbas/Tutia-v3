<?php

namespace App\Policies;

use App\Models\CrmIssue;
use App\Models\User;

class CrmIssuePolicy
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
        return $user->hasAnyPermission(['crm.issues.view', 'crm.issues.edit', 'crm.issues.create']);
    }

    public function view(User $user, CrmIssue $issue): bool
    {
        return $user->hasRole('manager') || $user->hasPermissionTo('crm.issues.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.issues.create');
    }

    public function update(User $user, CrmIssue $issue): bool
    {
        return $user->hasRole('manager') || $user->hasPermissionTo('crm.issues.edit');
    }

    public function delete(User $user, CrmIssue $issue): bool
    {
        return $user->hasRole('manager');
    }
}
