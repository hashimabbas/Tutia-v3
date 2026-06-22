<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmProjectMember extends Model
{
    protected $fillable = [
        'project_id', 'user_id', 'role',
        'allocation_percent', 'assigned_at', 'unassigned_at',
    ];

    protected function casts(): array
    {
        return [
            'allocation_percent' => 'integer',
            'assigned_at' => 'datetime',
            'unassigned_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(CrmProject::class, 'project_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopeActive($query)
    {
        return $query->whereNull('unassigned_at');
    }
}
