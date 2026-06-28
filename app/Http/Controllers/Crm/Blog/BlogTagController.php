<?php

namespace App\Http\Controllers\Crm\Blog;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;
use App\Services\Blog\TagService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BlogTagController extends Controller
{
    public function __construct(
        private readonly TagService $tagService,
    ) {}

    public function index()
    {
        $this->authorize('viewAny', BlogTag::class);

        return inertia('crm/blog/tags/index', [
            'tags' => $this->tagService->listAll(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BlogTag::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_tags')],
        ]);

        $this->tagService->create($data);

        return redirect()->route('crm.blog.tags.index')
            ->with('success', 'Tag created successfully.');
    }

    public function update(Request $request, BlogTag $tag): RedirectResponse
    {
        $this->authorize('update', BlogTag::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_tags')->ignore($tag->id)],
        ]);

        $this->tagService->update($tag, $data);

        return redirect()->route('crm.blog.tags.index')
            ->with('success', 'Tag updated successfully.');
    }

    public function destroy(BlogTag $tag): RedirectResponse
    {
        $this->authorize('delete', BlogTag::class);

        $this->tagService->delete($tag);

        return redirect()->route('crm.blog.tags.index')
            ->with('success', 'Tag deleted successfully.');
    }
}
