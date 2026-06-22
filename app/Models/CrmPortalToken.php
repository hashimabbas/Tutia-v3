<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmPortalToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_account_id', 'token_hash', 'type',
        'expires_at', 'used_at', 'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(CrmPortalAccount::class, 'portal_account_id');
    }
}
