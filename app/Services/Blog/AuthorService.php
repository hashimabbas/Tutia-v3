<?php

namespace App\Services\Blog;

use App\Models\BlogAuthor;
use Illuminate\Support\Facades\Storage;

class AuthorService
{
    public function listAll()
    {
        return BlogAuthor::withCount('articles')->orderBy('name')->get();
    }

    public function listActive()
    {
        return BlogAuthor::active()->withCount('articles')->orderBy('name')->get();
    }

    public function findById(int $id): ?BlogAuthor
    {
        return BlogAuthor::withCount('articles')->find($id);
    }

    public function create(array $data, $avatar = null): BlogAuthor
    {
        if ($avatar) {
            $data['avatar'] = $avatar->store('blog/authors', 'public');
        }

        if (isset($data['social_links']) && is_string($data['social_links'])) {
            $data['social_links'] = json_decode($data['social_links'], true);
        }

        return BlogAuthor::create($data);
    }

    public function update(BlogAuthor $author, array $data, $avatar = null): BlogAuthor
    {
        if ($avatar) {
            if ($author->avatar) {
                Storage::disk('public')->delete($author->avatar);
            }
            $data['avatar'] = $avatar->store('blog/authors', 'public');
        }

        if (isset($data['social_links']) && is_string($data['social_links'])) {
            $data['social_links'] = json_decode($data['social_links'], true);
        }

        $author->update($data);

        return $author->fresh();
    }

    public function delete(BlogAuthor $author): void
    {
        if ($author->avatar) {
            Storage::disk('public')->delete($author->avatar);
        }
        $author->articles()->update(['author_id' => null]);
        $author->delete();
    }
}
