<?php

namespace App\Http\Resources;

use App\Models\CrmWorkflowTrigger;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmWorkflowTrigger */
class WorkflowTriggerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workflowId' => $this->workflow_id,
            'eventKey' => $this->event_key,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
