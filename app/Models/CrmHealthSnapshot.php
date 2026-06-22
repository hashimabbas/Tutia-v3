<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CrmHealthSnapshot extends Model
{
    protected $fillable = [
        'healthable_type', 'healthable_id',
        'scorer', 'score', 'tier', 'factors', 'trend',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'factors' => 'array',
        ];
    }

    public function healthable(): MorphTo
    {
        return $this->morphTo();
    }
}
