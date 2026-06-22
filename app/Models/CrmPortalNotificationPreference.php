<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmPortalNotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_account_id', 'channel', 'frequency', 'event_filters',
    ];

    protected function casts(): array
    {
        return [
            'event_filters' => 'json',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(CrmPortalAccount::class, 'portal_account_id');
    }
}
