<?php

namespace App\Services\Blog;

use App\Models\BlogArticle;
use App\Models\BlogCategory;
use Illuminate\Support\Str;

class CategoryService
{
    public function listAll()
    {
        return BlogCategory::ordered()->withCount('articles')->get();
    }

    public function listActive()
    {
        return BlogCategory::active()->ordered()->withCount('articles')->get();
    }

    public function findById(int $id): ?BlogCategory
    {
        return BlogCategory::find($id);
    }

    public function findBySlug(string $slug): ?BlogCategory
    {
        return BlogCategory::where('slug', $slug)->first();
    }

    public function create(array $data): BlogCategory
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return BlogCategory::create($data);
    }

    public function update(BlogCategory $category, array $data): BlogCategory
    {
        $category->update($data);

        return $category->fresh();
    }

    public function delete(BlogCategory $category): void
    {
        BlogArticle::where('category_id', $category->id)->update(['category_id' => null]);
        $category->delete();
    }
}
