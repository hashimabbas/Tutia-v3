<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmQuotation extends Model
{
    protected $fillable = [
        'deal_id', 'version', 'parent_id', 'status',
        'subtotal', 'discount_total', 'tax_rate', 'tax_total', 'grand_total',
        'payment_terms', 'valid_until', 'viewed_at', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'valid_until' => 'date',
            'viewed_at' => 'datetime',
        ];
    }

    public function deal(): BelongsTo
    {
        return $this->belongsTo(CrmDeal::class, 'deal_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CrmQuotationItem::class, 'quotation_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(CrmQuotation::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(CrmQuotation::class, 'parent_id');
    }

    public function scopeVersionsForDeal($query, int $dealId)
    {
        return $query->where('deal_id', $dealId)->orderBy('version', 'desc');
    }
}
