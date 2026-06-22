<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmPortalNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_account_id', 'type', 'title', 'body',
        'notifiable_type', 'notifiable_id', 'idempotency_key',
        'metadata', 'read_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'json',
            'read_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(CrmPortalAccount::class, 'portal_account_id');
    }
}
