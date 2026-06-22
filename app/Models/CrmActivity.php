<?php

namespace App\Models;

use Database\Factories\CrmActivityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmActivity extends Model
{
    /** @use HasFactory<CrmActivityFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'activitable_type', 'activitable_id',
        'type', 'subject', 'description', 'due_at', 'completed_at', 'created_by',
        'customer_safe',
    ];

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
            'completed_at' => 'datetime',
            'customer_safe' => 'boolean',
        ];
    }

    public function activitable()
    {
        return $this->morphTo();
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
