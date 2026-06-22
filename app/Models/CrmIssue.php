<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'description', 'severity', 'status',
        'owner_id', 'resolution', 'resolved_at',
        'is_visible_to_customer',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(CrmProject::class, 'project_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'in_progress']);
    }

    public function scopeBlockers($query)
    {
        return $query->where('severity', 'blocker')->whereIn('status', ['open', 'in_progress']);
    }
}
