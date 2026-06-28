<?php

namespace App\Services\Blog;

use App\Models\BlogArticle;
use App\Models\BlogTag;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArticleService
{
    public function listPublished(int $perPage = 12, ?string $category = null, ?string $tag = null, ?string $search = null)
    {
        $query = BlogArticle::published()->recent()->with(['author', 'category', 'tags']);

        if ($category) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($tag) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $tag));
        }

        if ($search) {
            $query->search($search);
        }

        return $query->paginate($perPage);
    }

    public function findBySlug(string $slug): ?BlogArticle
    {
        return BlogArticle::published()
            ->with(['author', 'category', 'tags'])
            ->where('slug', $slug)
            ->first();
    }

    public function findById(int $id): ?BlogArticle
    {
        return BlogArticle::with(['author', 'category', 'tags'])->find($id);
    }

    public function getFeatured(int $limit = 5)
    {
        return BlogArticle::published()->featured()->with(['author', 'category'])->take($limit)->get();
    }

    public function getPopular(int $limit = 5)
    {
        return BlogArticle::published()->popular()->with(['author', 'category'])->take($limit)->get();
    }

    public function getRecent(int $limit = 5)
    {
        return BlogArticle::published()->recent()->with(['author', 'category'])->take($limit)->get();
    }

    public function getRelated(BlogArticle $article, int $limit = 3)
    {
        return BlogArticle::published()
            ->where('id', '!=', $article->id)
            ->where(function ($q) use ($article) {
                if ($article->category_id) {
                    $q->where('category_id', $article->category_id);
                }
                $tagIds = $article->tags->pluck('id')->toArray();
                if (! empty($tagIds)) {
                    $q->orWhereHas('tags', fn ($t) => $t->whereIn('blog_tags.id', $tagIds));
                }
            })
            ->recent()
            ->with(['author', 'category'])
            ->take($limit)
            ->get();
    }

    public function create(array $data, ?array $tags = null): BlogArticle
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        if (isset($data['content']) && is_string($data['content'])) {
            $data['content'] = json_decode($data['content'], true);
        }

        $data['reading_time'] = $this->calculateReadingTime($data['content'] ?? '');

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $article = BlogArticle::create($data);

        if ($tags) {
            $article->tags()->sync($this->resolveTagIds($tags));
        }

        return $article->load(['author', 'category', 'tags']);
    }

    public function update(BlogArticle $article, array $data, ?array $tags = null): BlogArticle
    {
        if (isset($data['content']) && is_string($data['content'])) {
            $data['content'] = json_decode($data['content'], true);
        }

        if (isset($data['content'])) {
            $data['reading_time'] = $this->calculateReadingTime($data['content']);
        }

        if (($data['status'] ?? null) === 'published' && empty($article->published_at) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $article->update($data);

        if ($tags !== null) {
            $article->tags()->sync($this->resolveTagIds($tags));
        }

        return $article->fresh(['author', 'category', 'tags']);
    }

    public function delete(BlogArticle $article): void
    {
        if ($article->featured_image) {
            Storage::disk('public')->delete($article->featured_image);
        }
        $article->delete();
    }

    public function duplicate(BlogArticle $article): BlogArticle
    {
        $clone = $article->replicate(['slug', 'view_count', 'published_at']);
        $clone->title = $article->title.' (Copy)';
        $clone->slug = Str::slug($clone->title).'-'.Str::random(4);
        $clone->status = 'draft';
        $clone->save();

        $clone->tags()->sync($article->tags->pluck('id')->toArray());

        return $clone->load(['author', 'category', 'tags']);
    }

    public function toggleFeatured(BlogArticle $article): bool
    {
        $article->update(['is_featured' => ! $article->is_featured]);

        return $article->is_featured;
    }

    public function updateStatus(BlogArticle $article, string $status): BlogArticle
    {
        $data = ['status' => $status];

        if ($status === 'published' && empty($article->published_at)) {
            $data['published_at'] = now();
        }

        if ($status === 'archived' && $article->status === 'published') {
            // Keep published_at but mark as archived
        }

        $article->update($data);

        return $article->fresh();
    }

    public function incrementViews(BlogArticle $article): void
    {
        $article->increment('view_count');
    }

    public function getStats(): array
    {
        return [
            'total' => BlogArticle::count(),
            'published' => BlogArticle::published()->count(),
            'drafts' => BlogArticle::draft()->count(),
            'scheduled' => BlogArticle::scheduled()->count(),
            'archived' => BlogArticle::where('status', 'archived')->count(),
            'total_views' => BlogArticle::sum('view_count'),
            'featured' => BlogArticle::where('is_featured', true)->count(),
            'recently_updated' => BlogArticle::recent()->take(5)->get(['id', 'title', 'status', 'updated_at']),
        ];
    }

    private function calculateReadingTime(array|string $content): int
    {
        $text = '';
        if (is_array($content)) {
            $text = json_encode($content);
        } elseif (is_string($content)) {
            $text = $content;
        }
        $words = str_word_count(strip_tags($text));

        return max(1, (int) ceil($words / 200));
    }

    private function resolveTagIds(array $tags): array
    {
        $ids = [];
        foreach ($tags as $tag) {
            if (is_numeric($tag)) {
                $ids[] = (int) $tag;
            } else {
                $model = BlogTag::firstOrCreate(['name' => $tag], ['slug' => Str::slug($tag)]);
                $ids[] = $model->id;
            }
        }

        return $ids;
    }
}
