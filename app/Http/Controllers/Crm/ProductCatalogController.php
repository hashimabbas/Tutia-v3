<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ProductCatalogController extends Controller
{
    public function index(): Response
    {
        $products = CrmProduct::where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        $categories = CrmProduct::where('is_active', true)
            ->selectRaw('category, count(*) as total, sum(unit_price) as total_value')
            ->groupBy('category')
            ->get();

        return inertia('crm/products/index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return inertia('crm/products/create');
    }

    public function edit(CrmProduct $product): Response
    {
        return inertia('crm/products/create', [
            'product' => $product->only(['id', 'name', 'description', 'category', 'type', 'unit_price', 'unit_type', 'version', 'is_active']),
        ]);
    }

    public function show(CrmProduct $product): Response
    {
        $product->load('children');

        return inertia('crm/products/show', [
            'product' => $product,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'type' => 'required|string|in:product,service,subscription,package',
            'unit_price' => 'required|numeric|min:0',
            'unit_type' => 'required|string|max:20',
            'version' => 'sometimes|integer|min:1',
        ]);

        $validated['is_active'] = true;

        CrmProduct::create($validated);

        return redirect()->route('crm.products.index')->with('success', 'Product created');
    }

    public function update(Request $request, CrmProduct $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|string|max:100',
            'type' => 'sometimes|string|in:product,service,subscription,package',
            'unit_price' => 'sometimes|numeric|min:0',
            'unit_type' => 'sometimes|string|max:20',
            'version' => 'sometimes|integer|min:1',
            'is_active' => 'sometimes|boolean',
        ]);

        $product->update($validated);

        return redirect()->route('crm.products.index')->with('success', 'Product updated');
    }

    public function destroy(CrmProduct $product): RedirectResponse
    {
        $product->update(['is_active' => false]);

        return redirect()->route('crm.products.index')->with('success', 'Product deactivated');
    }
}
