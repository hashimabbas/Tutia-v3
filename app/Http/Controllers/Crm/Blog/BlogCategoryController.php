<?php

namespace App\Http\Controllers\Crm\Blog;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Services\Blog\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BlogCategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService,
    ) {}

    public function index()
    {
        $this->authorize('viewAny', BlogCategory::class);

        return inertia('crm/blog/categories/index', [
            'categories' => $this->categoryService->listAll(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BlogCategory::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_categories')],
            'description' => ['nullable', 'string', 'max:500'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:50'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $this->categoryService->create($data);

        return redirect()->route('crm.blog.categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function update(Request $request, BlogCategory $category): RedirectResponse
    {
        $this->authorize('update', BlogCategory::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_categories')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:50'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $this->categoryService->update($category, $data);

        return redirect()->route('crm.blog.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(BlogCategory $category): RedirectResponse
    {
        $this->authorize('delete', BlogCategory::class);

        $this->categoryService->delete($category);

        return redirect()->route('crm.blog.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
