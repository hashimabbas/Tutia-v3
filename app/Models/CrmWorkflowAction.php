<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmWorkflowAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id', 'action_type', 'configuration_json',
        'sort_order', 'stop_on_fail',
    ];

    protected function casts(): array
    {
        return [
            'configuration_json' => 'json',
            'stop_on_fail' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(CrmWorkflow::class, 'workflow_id');
    }
}
