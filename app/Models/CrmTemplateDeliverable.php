<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmTemplateDeliverable extends Model
{
    protected $fillable = [
        'template_milestone_id', 'name', 'description', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function templateMilestone(): BelongsTo
    {
        return $this->belongsTo(CrmTemplateMilestone::class, 'template_milestone_id');
    }
}
