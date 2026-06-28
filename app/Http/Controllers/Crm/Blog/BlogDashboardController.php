<?php

namespace App\Http\Controllers\Crm\Blog;

use App\Http\Controllers\Controller;
use App\Models\BlogArticle;
use App\Services\Blog\ArticleService;
use App\Services\Blog\AuthorService;
use App\Services\Blog\CategoryService;
use App\Services\Blog\TagService;

class BlogDashboardController extends Controller
{
    public function __construct(
        private readonly ArticleService $articleService,
        private readonly CategoryService $categoryService,
        private readonly TagService $tagService,
        private readonly AuthorService $authorService,
    ) {}

    public function __invoke()
    {
        $this->authorize('viewAny', BlogArticle::class);

        return inertia('crm/blog/dashboard', [
            'stats' => $this->articleService->getStats(),
            'categories' => $this->categoryService->listAll(),
            'tags' => $this->tagService->listAll(),
            'authors' => $this->authorService->listAll(),
            'recentArticles' => $this->articleService->getRecent(5),
            'popularArticles' => $this->articleService->getPopular(5),
        ]);
    }
}
