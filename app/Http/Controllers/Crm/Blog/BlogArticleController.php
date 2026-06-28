<?php

namespace App\Http\Controllers\Crm\Blog;

use App\Http\Controllers\Controller;
use App\Models\BlogArticle;
use App\Services\Blog\ArticleService;
use App\Services\Blog\AuthorService;
use App\Services\Blog\CategoryService;
use App\Services\Blog\TagService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class BlogArticleController extends Controller
{
    public function __construct(
        private readonly ArticleService $articleService,
        private readonly CategoryService $categoryService,
        private readonly TagService $tagService,
        private readonly AuthorService $authorService,
    ) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', BlogArticle::class);

        $query = BlogArticle::with(['author', 'category', 'tags'])->withCount('tags');

        if ($search = $request->input('search')) {
            $query->search($search);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $sortField = $request->input('sort', 'updated_at');
        $sortDir = $request->input('dir', 'desc');
        $allowedSorts = ['title', 'status', 'published_at', 'view_count', 'reading_time', 'created_at', 'updated_at'];

        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->recent();
        }

        $articles = $query->paginate(15)->withQueryString();

        return inertia('crm/blog/articles/index', [
            'articles' => $articles,
            'filters' => (object) $request->only(['search', 'status', 'category_id', 'featured', 'sort', 'dir']),
            'categories' => $this->categoryService->listAll(),
            'stats' => $this->articleService->getStats(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', BlogArticle::class);

        return inertia('crm/blog/articles/create', [
            'categories' => $this->categoryService->listAll(),
            'tags' => $this->tagService->listAll(),
            'authors' => $this->authorService->listActive(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BlogArticle::class);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_articles')],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'json'],
            'author_id' => ['nullable', 'integer', 'exists:blog_authors,id'],
            'category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
            'status' => ['required', Rule::in(['draft', 'published', 'scheduled'])],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
            'is_featured' => ['boolean'],
            'featured_order' => ['nullable', 'integer', 'min:0'],
            'featured_image' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:5120'],
            'featured_image_alt' => ['nullable', 'string', 'max:255'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:160'],
            'seo_keywords' => ['nullable', 'string', 'max:255'],
            'canonical_url' => ['nullable', 'url'],
            'og_image' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:5120'],
            'twitter_card' => ['nullable', 'string', Rule::in(['summary', 'summary_large_image', 'app', 'player']),
            ],
        ]);

        $featuredImagePath = null;
        if ($request->hasFile('featured_image')) {
            $featuredImagePath = $request->file('featured_image')->store('blog/articles', 'public');
        }

        $ogImagePath = null;
        if ($request->hasFile('og_image')) {
            $ogImagePath = $request->file('og_image')->store('blog/og', 'public');
        }

        $data['featured_image'] = $featuredImagePath;
        $data['og_image'] = $ogImagePath;

        $tags = $request->input('tags');
        $article = $this->articleService->create($data, $tags);

        return redirect()->route('crm.blog.articles.edit', $article)
            ->with('success', 'Article created successfully.');
    }

    public function edit(BlogArticle $article)
    {
        $this->authorize('update', $article);

        $article->load(['author', 'category', 'tags']);

        return inertia('crm/blog/articles/create', [
            'article' => $article,
            'categories' => $this->categoryService->listAll(),
            'tags' => $this->tagService->listAll(),
            'authors' => $this->authorService->listActive(),
        ]);
    }

    public function update(Request $request, BlogArticle $article): RedirectResponse
    {
        $this->authorize('update', $article);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_articles')->ignore($article->id)],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'json'],
            'author_id' => ['nullable', 'integer', 'exists:blog_authors,id'],
            'category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
            'status' => ['required', Rule::in(['draft', 'published', 'scheduled', 'archived'])],
            'scheduled_at' => ['nullable', 'date'],
            'is_featured' => ['boolean'],
            'featured_order' => ['nullable', 'integer', 'min:0'],
            'featured_image' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:5120'],
            'featured_image_alt' => ['nullable', 'string', 'max:255'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:160'],
            'seo_keywords' => ['nullable', 'string', 'max:255'],
            'canonical_url' => ['nullable', 'url'],
            'og_image' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:5120'],
            'twitter_card' => ['nullable', 'string', Rule::in(['summary', 'summary_large_image', 'app', 'player']),
            ],
        ]);

        if ($request->hasFile('featured_image')) {
            if ($article->featured_image) {
                Storage::disk('public')->delete($article->featured_image);
            }
            $data['featured_image'] = $request->file('featured_image')->store('blog/articles', 'public');
        }

        if ($request->hasFile('og_image')) {
            if ($article->og_image) {
                Storage::disk('public')->delete($article->og_image);
            }
            $data['og_image'] = $request->file('og_image')->store('blog/og', 'public');
        }

        $tags = $request->input('tags');
        $this->articleService->update($article, $data, $tags);

        return redirect()->route('crm.blog.articles.index')
            ->with('success', 'Article updated successfully.');
    }

    public function destroy(BlogArticle $article): RedirectResponse
    {
        $this->authorize('delete', $article);

        $this->articleService->delete($article);

        return redirect()->route('crm.blog.articles.index')
            ->with('success', 'Article deleted successfully.');
    }

    public function duplicate(BlogArticle $article): RedirectResponse
    {
        $this->authorize('create', BlogArticle::class);

        $clone = $this->articleService->duplicate($article);

        return redirect()->route('crm.blog.articles.edit', $clone)
            ->with('success', 'Article duplicated.');
    }

    public function togglePublished(BlogArticle $article): RedirectResponse
    {
        $this->authorize('publish', $article);

        $newStatus = $article->status === 'published' ? 'draft' : 'published';
        $this->articleService->updateStatus($article, $newStatus);

        $message = $newStatus === 'published' ? 'Article published.' : 'Article reverted to draft.';

        return redirect()->back()->with('success', $message);
    }

    public function updateStatus(Request $request, BlogArticle $article): RedirectResponse
    {
        $this->authorize('publish', $article);

        $data = $request->validate([
            'status' => ['required', Rule::in(['draft', 'review', 'scheduled', 'published', 'archived'])],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $updated = $this->articleService->updateStatus($article, $data['status']);

        return redirect()->back()->with('success', "Article status updated to {$updated->status}.");
    }

    public function bulkDelete(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:blog_articles,id'],
        ]);

        foreach (BlogArticle::whereIn('id', $data['ids'])->get() as $article) {
            $this->authorize('delete', $article);
            $this->articleService->delete($article);
        }

        return redirect()->route('crm.blog.articles.index')
            ->with('success', 'Articles deleted successfully.');
    }

    public function bulkStatus(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:blog_articles,id'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
        ]);

        foreach (BlogArticle::whereIn('id', $data['ids'])->get() as $article) {
            $this->authorize('publish', $article);
            $this->articleService->updateStatus($article, $data['status']);
        }

        return redirect()->route('crm.blog.articles.index')
            ->with('success', 'Articles updated successfully.');
    }

    public function uploadImage(Request $request)
    {
        $data = $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,png,webp,gif', 'max:10240'],
        ]);

        $path = $request->file('image')->store('blog/media', 'public');

        return response()->json([
            'url' => Storage::url($path),
            'path' => $path,
        ]);
    }
}
