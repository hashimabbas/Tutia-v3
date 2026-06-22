<?php

namespace App\Http\Resources;

use App\Models\CrmWorkflow;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmWorkflow */
class WorkflowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'entityType' => $this->entity_type,
            'isActive' => $this->is_active,
            'version' => $this->version,
            'slug' => $this->slug,
            'conditionsVersion' => $this->conditions_version,
            'expression' => $this->expression,
            'triggers' => WorkflowTriggerResource::collection($this->whenLoaded('triggers')),
            'conditions' => WorkflowConditionResource::collection($this->whenLoaded('conditions')),
            'actions' => WorkflowActionResource::collection($this->whenLoaded('actions')),
            'createdBy' => $this->created_by,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
