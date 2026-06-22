<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmWorkflowActionRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_run_id', 'action_type', 'status',
        'configuration_json', 'response_json',
        'started_at', 'completed_at', 'error_message',
    ];

    protected function casts(): array
    {
        return [
            'configuration_json' => 'json',
            'response_json' => 'json',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function workflowRun(): BelongsTo
    {
        return $this->belongsTo(CrmWorkflowRun::class, 'workflow_run_id');
    }
}
