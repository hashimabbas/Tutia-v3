<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmCommunicationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_account_id', 'correlation_id', 'event_id',
        'channel', 'template', 'status', 'provider_message_id',
        'provider_response', 'error_message',
        'delivered_at', 'read_at', 'clicked_at',
    ];

    protected function casts(): array
    {
        return [
            'provider_response' => 'json',
            'delivered_at' => 'datetime',
            'read_at' => 'datetime',
            'clicked_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(CrmPortalAccount::class, 'portal_account_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(CrmActivity::class, 'event_id');
    }
}
