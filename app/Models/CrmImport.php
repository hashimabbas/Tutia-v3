<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmImport extends Model
{
    protected $fillable = [
        'user_id', 'entity_type', 'filename',
        'total_rows', 'processed_rows', 'failed_rows',
        'status', 'errors', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'errors' => 'array',
            'total_rows' => 'integer',
            'processed_rows' => 'integer',
            'failed_rows' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
