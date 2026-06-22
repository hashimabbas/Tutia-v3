<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmDeliverable extends Model
{
    use HasFactory;

    protected $fillable = [
        'milestone_id', 'name', 'description', 'status',
        'due_date', 'owner_id', 'acceptance_criteria',
        'is_visible_to_customer', 'customer_approved_at', 'customer_approved_by',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'is_visible_to_customer' => 'boolean',
            'customer_approved_at' => 'datetime',
            'sort_order' => 'integer',
        ];
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(CrmMilestone::class, 'milestone_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVisibleToCustomer($query)
    {
        return $query->where('is_visible_to_customer', true);
    }
}
