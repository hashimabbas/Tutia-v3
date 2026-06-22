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
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
