<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmRecommendationLifecycleEvent extends Model
{
    use HasFactory;

    protected $table = 'crm_recommendation_lifecycle_events';

    protected $fillable = [
        'recommendation_type',
        'status',
        'target_type',
        'target_id',
        'snapshot',
        'version',
        'metadata',
        'status_changed_at',
    ];

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'version' => 'array',
            'metadata' => 'array',
            'status_changed_at' => 'datetime',
        ];
    }
}
