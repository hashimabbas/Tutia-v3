<?php

namespace App\Http\Controllers\Crm\Blog;

use App\Http\Controllers\Controller;
use App\Models\BlogAuthor;
use App\Services\Blog\AuthorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BlogAuthorController extends Controller
{
    public function __construct(
        private readonly AuthorService $authorService,
    ) {}

    public function index()
    {
        $this->authorize('viewAny', BlogAuthor::class);

        return inertia('crm/blog/authors/index', [
            'authors' => $this->authorService->listAll(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BlogAuthor::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:blog_authors,email'],
            'title' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:5120'],
            'biography' => ['nullable', 'string', 'max:2000'],
            'social_links' => ['nullable', 'json'],
            'is_active' => ['boolean'],
        ]);

        $this->authorService->create($data, $request->file('avatar'));

        return redirect()->route('crm.blog.authors.index')
            ->with('success', 'Author created successfully.');
    }

    public function update(Request $request, BlogAuthor $author): RedirectResponse
    {
        $this->authorize('update', BlogAuthor::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:blog_authors,email,'.$author->id],
            'title' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'file', 'mimes:jpeg,png,webp', 'max:5120'],
            'biography' => ['nullable', 'string', 'max:2000'],
            'social_links' => ['nullable', 'json'],
            'is_active' => ['boolean'],
        ]);

        $this->authorService->update($author, $data, $request->file('avatar'));

        return redirect()->route('crm.blog.authors.index')
            ->with('success', 'Author updated successfully.');
    }

    public function destroy(BlogAuthor $author): RedirectResponse
    {
        $this->authorize('delete', BlogAuthor::class);

        $this->authorService->delete($author);

        return redirect()->route('crm.blog.authors.index')
            ->with('success', 'Author deleted successfully.');
    }
}
