<?php

namespace App\Policies;

use App\Models\ExperienceEvent;
use App\Models\User;

class ExperienceEventPolicy
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

    public function view(?User $user, ExperienceEvent $event): bool
    {
        if (! $event->is_published && ($user === null || ! $user->hasAnyPermission(['gallery.view', 'gallery.edit', 'gallery.create']))) {
            return false;
        }

        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('gallery.create');
    }

    public function update(User $user, ExperienceEvent $event): bool
    {
        return $user->hasPermissionTo('gallery.edit');
    }

    public function delete(User $user, ExperienceEvent $event): bool
    {
        return $user->hasPermissionTo('gallery.edit');
    }
}
