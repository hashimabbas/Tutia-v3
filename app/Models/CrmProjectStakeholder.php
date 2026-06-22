<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmProjectStakeholder extends Model
{
    protected $fillable = [
        'project_id', 'contact_id', 'derived_from_deal_id',
        'project_role', 'influence_type_at_conversion', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(CrmProject::class, 'project_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(CrmContact::class, 'contact_id');
    }

    public function derivedFromDeal(): BelongsTo
    {
        return $this->belongsTo(CrmDeal::class, 'derived_from_deal_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
