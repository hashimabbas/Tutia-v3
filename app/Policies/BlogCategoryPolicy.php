<?php

namespace App\Policies;

use App\Models\User;

class BlogCategoryPolicy
{
    public function before(?User $user): ?bool
    {
        if ($user?->hasRole('admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('blog.categories');
    }

    public function update(User $user): bool
    {
        return $user->hasPermissionTo('blog.categories');
    }

    public function delete(User $user): bool
    {
        return $user->hasPermissionTo('blog.categories');
    }
}
