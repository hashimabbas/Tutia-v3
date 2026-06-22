<?php

namespace App\Http\Resources;

use App\Models\CrmWorkflowCondition;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmWorkflowCondition */
class WorkflowConditionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workflowId' => $this->workflow_id,
            'field' => $this->field,
            'operator' => $this->operator,
            'value' => $this->value,
            'groupOrder' => $this->group_order,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
