<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmTemplateMilestone extends Model
{
    protected $fillable = [
        'template_id', 'name', 'description', 'default_duration_days', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'default_duration_days' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CrmProjectTemplate::class, 'template_id');
    }

    public function templateDeliverables(): HasMany
    {
        return $this->hasMany(CrmTemplateDeliverable::class, 'template_milestone_id')->orderBy('sort_order');
    }
}
