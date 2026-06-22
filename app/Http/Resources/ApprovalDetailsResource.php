<?php

namespace App\Http\Resources;

use App\Models\CrmApprovalRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmApprovalRequest */
class ApprovalDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'approvalFlowId' => $this->approval_flow_id,
            'workflowRunId' => $this->workflow_run_id,
            'entityType' => $this->entity_type,
            'entityId' => $this->entity_id,
            'status' => $this->status,
            'notes' => $this->notes,
            'requestedBy' => $this->whenLoaded('requester', fn () => [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
                'email' => $this->requester->email,
            ]),
            'requestedAt' => $this->requested_at?->toIso8601String(),
            'completedAt' => $this->completed_at?->toIso8601String(),
            'approvedAt' => $this->approved_at?->toIso8601String(),
            'rejectedAt' => $this->rejected_at?->toIso8601String(),
            'firstResponseAt' => $this->first_response_at?->toIso8601String(),
            'resolutionTimeMinutes' => $this->resolution_time_minutes,
            'escalationCount' => $this->escalation_count,
            'slaWarningSentAt' => $this->sla_warning_sent_at?->toIso8601String(),
            'slaBreachAt' => $this->sla_breach_at?->toIso8601String(),
            'escalatedAt' => $this->escalated_at?->toIso8601String(),
            'flow' => $this->whenLoaded('flow', fn () => [
                'id' => $this->flow->id,
                'name' => $this->flow->name,
                'strategy' => $this->flow->strategy,
                'escalationModel' => $this->flow->escalation_model,
                'slaWarningMinutes' => $this->flow->sla_warning_minutes,
                'slaBreachMinutes' => $this->flow->sla_breach_minutes,
                'steps' => $this->flow->steps->map(fn ($step) => [
                    'id' => $step->id,
                    'stepOrder' => $step->step_order,
                    'approverType' => $step->approver_type,
                    'approverId' => $step->approver_id,
                    'required' => $step->required,
                ]),
            ]),
            'workflowRun' => $this->whenLoaded('workflowRun', fn () => [
                'id' => $this->workflowRun->id,
                'status' => $this->workflowRun->status,
                'contextSnapshot' => $this->workflowRun->context_snapshot,
                'startedAt' => $this->workflowRun->started_at?->toIso8601String(),
                'completedAt' => $this->workflowRun->completed_at?->toIso8601String(),
                'workflow' => $this->when($this->workflowRun->relationLoaded('workflow'), fn () => [
                    'id' => $this->workflowRun->workflow->id,
                    'name' => $this->workflowRun->workflow->name,
                ]),
            ]),
            'decisions' => ApprovalDecisionResource::collection($this->whenLoaded('decisions')),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
