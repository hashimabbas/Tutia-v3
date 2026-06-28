<?php

namespace App\Services\Blog;

use App\Models\BlogTag;
use Illuminate\Support\Str;

class TagService
{
    public function listAll()
    {
        return BlogTag::withCount('articles')->orderBy('name')->get();
    }

    public function findById(int $id): ?BlogTag
    {
        return BlogTag::find($id);
    }

    public function create(array $data): BlogTag
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return BlogTag::create($data);
    }

    public function update(BlogTag $tag, array $data): BlogTag
    {
        $tag->update($data);

        return $tag->fresh();
    }

    public function delete(BlogTag $tag): void
    {
        $tag->articles()->detach();
        $tag->delete();
    }
}
