<?php

namespace App\Http\Resources;

use App\Models\CrmWorkflowRun;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmWorkflowRun */
class WorkflowRunResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workflowId' => $this->workflow_id,
            'eventKey' => $this->event_key,
            'entityType' => $this->entity_type,
            'entityId' => $this->entity_id,
            'status' => $this->status,
            'rootCause' => $this->root_cause,
            'startedAt' => $this->started_at?->toIso8601String(),
            'completedAt' => $this->completed_at?->toIso8601String(),
            'durationSeconds' => $this->started_at && $this->completed_at
                ? $this->started_at->diffInSeconds($this->completed_at)
                : null,
            'workflow' => $this->whenLoaded('workflow', fn () => [
                'id' => $this->workflow->id,
                'name' => $this->workflow->name,
            ]),
            'contextSnapshot' => $this->context_snapshot,
            'actionRuns' => $this->whenLoaded('actionRuns', fn () => $this->actionRuns->map(fn ($a) => [
                'id' => $a->id,
                'actionType' => $a->action_type,
                'status' => $a->status,
                'configuration' => $a->configuration,
                'response' => $a->response,
                'errorMessage' => $a->error_message,
                'startedAt' => $a->started_at?->toIso8601String(),
                'completedAt' => $a->completed_at?->toIso8601String(),
                'durationSeconds' => $a->started_at && $a->completed_at
                    ? $a->started_at->diffInSeconds($a->completed_at)
                    : null,
            ])->values()->all()),
            'approvalRequests' => $this->whenLoaded('approvalRequests', fn () => $this->approvalRequests->map(fn ($ar) => [
                'id' => $ar->id,
                'approvalFlowId' => $ar->approval_flow_id,
                'status' => $ar->status,
                'requestedAt' => $ar->requested_at?->toIso8601String(),
                'completedAt' => $ar->completed_at?->toIso8601String(),
                'resolutionTimeMinutes' => $ar->resolution_time_minutes,
                'escalationCount' => $ar->escalation_count,
                'flow' => $ar->relationLoaded('flow') && $ar->flow ? [
                    'id' => $ar->flow->id,
                    'name' => $ar->flow->name,
                    'strategy' => $ar->flow->strategy,
                ] : null,
                'decisions' => $ar->relationLoaded('decisions') ? $ar->decisions->map(fn ($d) => [
                    'id' => $d->id,
                    'userId' => $d->user_id,
                    'decision' => $d->decision,
                    'comment' => $d->comment,
                    'decidedAt' => $d->decided_at?->toIso8601String(),
                ])->values()->all() : [],
            ])->values()->all()),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
