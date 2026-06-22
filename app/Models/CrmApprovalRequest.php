<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmApprovalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'approval_flow_id', 'workflow_run_id', 'entity_type', 'entity_id',
        'status', 'requested_by', 'requested_at',
        'sla_warning_sent_at', 'sla_breach_at', 'escalated_at',
        'completed_at', 'notes',
        'approved_at', 'rejected_at', 'first_response_at',
        'resolution_time_minutes', 'escalation_count',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'sla_warning_sent_at' => 'datetime',
            'sla_breach_at' => 'datetime',
            'escalated_at' => 'datetime',
            'completed_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'first_response_at' => 'datetime',
            'resolution_time_minutes' => 'integer',
            'escalation_count' => 'integer',
        ];
    }

    public function flow(): BelongsTo
    {
        return $this->belongsTo(CrmApprovalFlow::class, 'approval_flow_id');
    }

    public function workflowRun(): BelongsTo
    {
        return $this->belongsTo(CrmWorkflowRun::class, 'workflow_run_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function decisions(): HasMany
    {
        return $this->hasMany(CrmApprovalDecision::class, 'approval_request_id');
    }
}
