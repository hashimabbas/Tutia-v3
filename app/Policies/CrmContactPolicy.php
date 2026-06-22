<?php

namespace App\Policies;

use App\Models\CrmContact;
use App\Models\User;

class CrmContactPolicy
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
        return $user->hasAnyPermission(['crm.contacts.view', 'crm.contacts.edit', 'crm.contacts.create']);
    }

    public function view(User $user, CrmContact $contact): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $contact->owner_id === $user->id || $user->hasPermissionTo('crm.contacts.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.contacts.create');
    }

    public function update(User $user, CrmContact $contact): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }

        return $contact->owner_id === $user->id && $user->hasPermissionTo('crm.contacts.edit');
    }

    public function delete(User $user, CrmContact $contact): bool
    {
        return $user->hasRole('manager');
    }
}
