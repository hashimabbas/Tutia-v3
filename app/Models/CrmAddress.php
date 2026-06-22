<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CrmAddress extends Model
{
    protected $fillable = [
        'addressable_type', 'addressable_id',
        'label', 'line_1', 'line_2', 'city', 'state',
        'postal_code', 'country', 'is_primary',
    ];

    public function addressable(): MorphTo
    {
        return $this->morphTo();
    }
}
