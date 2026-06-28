<?php

namespace App\Policies;

use App\Models\BlogArticle;
use App\Models\User;

class BlogArticlePolicy
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

    public function view(?User $user, BlogArticle $article): bool
    {
        if ($article->status === 'published') {
            return true;
        }

        return $user?->hasPermissionTo('blog.view') ?? false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('blog.create');
    }

    public function update(User $user, BlogArticle $article): bool
    {
        return $user->hasPermissionTo('blog.edit');
    }

    public function delete(User $user, BlogArticle $article): bool
    {
        return $user->hasPermissionTo('blog.delete');
    }

    public function publish(User $user, BlogArticle $article): bool
    {
        return $user->hasPermissionTo('blog.publish');
    }

    public function archive(User $user, BlogArticle $article): bool
    {
        return $user->hasPermissionTo('blog.archive');
    }
}
