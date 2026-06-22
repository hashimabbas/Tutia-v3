<?php

namespace App\Http\Resources;

use App\Models\CrmWorkflowAction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmWorkflowAction */
class WorkflowActionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workflowId' => $this->workflow_id,
            'actionType' => $this->action_type,
            'configuration' => $this->configuration_json,
            'sortOrder' => $this->sort_order,
            'stopOnFail' => $this->stop_on_fail,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
