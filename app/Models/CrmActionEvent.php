<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CrmActionEvent extends Model
{
    protected $fillable = [
        'user_id', 'actionable_type', 'actionable_id',
        'rule_key', 'origin', 'status', 'helpful',
    ];

    protected function casts(): array
    {
        return [
            'helpful' => 'boolean',
        ];
    }

    public function actionable(): MorphTo
    {
        return $this->morphTo();
    }
}
