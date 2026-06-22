<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CrmDismissedAction extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'dismissable_type', 'dismissable_id',
        'rule_key', 'dismissed_until',
    ];

    protected function casts(): array
    {
        return [
            'dismissed_until' => 'datetime',
        ];
    }

    public function dismissable(): MorphTo
    {
        return $this->morphTo();
    }
}
