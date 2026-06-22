<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmChangeOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'title', 'description', 'status',
        'cost_impact', 'timeline_impact_days', 'requested_by',
        'approved_at', 'approved_by', 'rejection_reason',
        'customer_status', 'approved_by_portal_account_id', 'customer_responded_at',
    ];

    protected function casts(): array
    {
        return [
            'cost_impact' => 'decimal:2',
            'timeline_impact_days' => 'integer',
            'approved_at' => 'datetime',
            'customer_responded_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(CrmProject::class, 'project_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvedByPortalAccount(): BelongsTo
    {
        return $this->belongsTo(CrmPortalAccount::class, 'approved_by_portal_account_id');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
