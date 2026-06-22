<?php

namespace App\Http\Resources;

use App\Models\CrmWorkflowActionRun;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmWorkflowActionRun */
class WorkflowActionRunResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workflowRunId' => $this->workflow_run_id,
            'actionType' => $this->action_type,
            'status' => $this->status,
            'configuration' => $this->configuration_json,
            'response' => $this->response_json,
            'errorMessage' => $this->error_message,
            'startedAt' => $this->started_at?->toIso8601String(),
            'completedAt' => $this->completed_at?->toIso8601String(),
            'durationSeconds' => $this->started_at && $this->completed_at
                ? $this->started_at->diffInSeconds($this->completed_at)
                : null,
        ];
    }
}
