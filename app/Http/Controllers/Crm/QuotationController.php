<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmDeal;
use App\Models\CrmQuotation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    public function indexAll(Request $request): Response
    {
        $query = CrmQuotation::with(['deal.organization', 'createdBy']);

        if ($search = $request->get('search')) {
            $query->whereHas('deal', fn ($q) => $q->where('title', 'like', "%{$search}%"));
        }

        return Inertia::render('crm/quotations/index', [
            'quotations' => $query->latest()->paginate(15),
            'filters' => (object) $request->only('search'),
        ]);
    }

    public function index(CrmDeal $deal): Response
    {
        $deal->load(['quotations' => fn ($q) => $q->latest('version'), 'organization']);

        return Inertia::render('crm/quotations/index', [
            'deal' => $deal,
            'quotations' => $deal->quotations,
        ]);
    }

    public function show(CrmQuotation $quotation): Response
    {
        $quotation->load(['deal.organization', 'items.product', 'createdBy']);

        $previousVersions = $quotation->deal->quotations()
            ->with('createdBy')
            ->orderBy('version', 'desc')
            ->get();

        return Inertia::render('crm/quotations/show', [
            'quotation' => $quotation,
            'previousVersions' => $previousVersions,
        ]);
    }

    public function store(CrmDeal $deal): RedirectResponse
    {
        $maxVersion = $deal->quotations()->max('version') ?? 0;

        $quotation = $deal->quotations()->create([
            'version' => $maxVersion + 1,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('crm.quotations.show', $quotation);
    }

    public function clone(CrmQuotation $quotation): RedirectResponse
    {
        $deal = $quotation->deal;
        $maxVersion = $deal->quotations()->max('version') ?? 0;

        $clone = $deal->quotations()->create([
            'version' => $maxVersion + 1,
            'parent_id' => $quotation->id,
            'status' => 'draft',
            'subtotal' => $quotation->subtotal,
            'discount_total' => $quotation->discount_total,
            'tax_rate' => $quotation->tax_rate,
            'tax_total' => $quotation->tax_total,
            'grand_total' => $quotation->grand_total,
            'payment_terms' => $quotation->payment_terms,
            'valid_until' => $quotation->valid_until,
            'notes' => $quotation->notes,
            'created_by' => auth()->id(),
        ]);

        foreach ($quotation->items as $item) {
            $clone->items()->create($item->only([
                'product_id', 'product_name', 'description',
                'quantity', 'unit_price', 'discount_percent',
                'net_price', 'total', 'sort_order',
            ]));
        }

        return redirect()->route('crm.quotations.show', $clone);
    }

    public function update(CrmQuotation $quotation): RedirectResponse
    {
        request()->validate([
            'status' => 'in:draft,internal_review,sent,viewed,accepted,rejected,expired',
            'payment_terms' => 'nullable|string',
            'valid_until' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if (request('status') === 'sent' && $quotation->status === 'draft') {
            $quotation->update(array_merge(
                request()->only(['status', 'payment_terms', 'valid_until', 'notes']),
                ['viewed_at' => null],
            ));
        } else {
            $quotation->update(request()->only(['status', 'payment_terms', 'valid_until', 'notes']));
        }

        return redirect()->back();
    }
}
