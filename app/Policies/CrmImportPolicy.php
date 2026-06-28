<?php

namespace App\Policies;

use App\Models\CrmImport;
use App\Models\User;

class CrmImportPolicy
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
        return $user->hasPermissionTo('crm.imports.view');
    }

    public function view(User $user, CrmImport $import): bool
    {
        return $user->hasPermissionTo('crm.imports.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crm.imports.create');
    }
}
