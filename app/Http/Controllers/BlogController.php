<?php

namespace App\Http\Controllers;

use App\Services\Blog\ArticleService;
use App\Services\Blog\CategoryService;
use App\Services\Blog\TagService;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function __construct(
        private readonly ArticleService $articleService,
        private readonly CategoryService $categoryService,
        private readonly TagService $tagService,
    ) {}

    public function index(Request $request)
    {
        $articles = $this->articleService->listPublished(
            perPage: 12,
            category: $request->input('category'),
            tag: $request->input('tag'),
            search: $request->input('search'),
        );

        $featured = $this->articleService->getFeatured(3);
        $popular = $this->articleService->getPopular(5);
        $categories = $this->categoryService->listActive();
        $recent = $this->articleService->getRecent(5);

        return inertia('insights/blog', [
            'articles' => $articles,
            'featured' => $featured,
            'popular' => $popular,
            'categories' => $categories,
            'recent' => $recent,
            'filters' => (object) $request->only(['category', 'tag', 'search']),
        ]);
    }

    public function show(Request $request, string $slug)
    {
        $article = $this->articleService->findBySlug($slug);

        if (! $article) {
            abort(404);
        }

        $this->articleService->incrementViews($article);

        $related = $this->articleService->getRelated($article);
        $popular = $this->articleService->getPopular(5);
        $categories = $this->categoryService->listActive();

        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $article->title,
            'description' => $article->excerpt,
            'datePublished' => $article->published_at?->toIso8601String(),
            'dateModified' => $article->updated_at->toIso8601String(),
            'author' => $article->author ? [
                '@type' => 'Person',
                'name' => $article->author->name,
            ] : null,
            'image' => $article->featured_image ? asset('storage/'.$article->featured_image) : null,
        ];

        return inertia('insights/blog-details', [
            'article' => $article->load(['author', 'category', 'tags']),
            'related' => $related,
            'popular' => $popular,
            'categories' => $categories,
            'structuredData' => $structuredData,
        ]);
    }
}
