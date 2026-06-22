<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmWorkflowRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id', 'event_key', 'entity_type', 'entity_id',
        'status', 'context_snapshot', 'root_cause', 'correlation_id',
        'started_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'context_snapshot' => 'json',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(CrmWorkflow::class, 'workflow_id');
    }

    public function actionRuns(): HasMany
    {
        return $this->hasMany(CrmWorkflowActionRun::class, 'workflow_run_id');
    }

    public function approvalRequests(): HasMany
    {
        return $this->hasMany(CrmApprovalRequest::class, 'workflow_run_id');
    }
}
