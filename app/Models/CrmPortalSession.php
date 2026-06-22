<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmPortalSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_account_id', 'token_hash', 'expires_at',
        'revoked_at', 'revoked_reason', 'last_used_at',
        'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'last_used_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(CrmPortalAccount::class, 'portal_account_id');
    }
}
