<?php

namespace App\Http\Resources;

use App\Models\CrmApprovalRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmApprovalRequest */
class ApprovalRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'approval_flow_id' => $this->approval_flow_id,
            'workflow_run_id' => $this->workflow_run_id,
            'entity_type' => $this->entity_type,
            'entity_id' => $this->entity_id,
            'status' => $this->status,
            'requested_by' => $this->requested_by,
            'requested_at' => $this->requested_at?->toIso8601String(),
            'sla_warning_sent_at' => $this->sla_warning_sent_at?->toIso8601String(),
            'sla_breach_at' => $this->sla_breach_at?->toIso8601String(),
            'escalated_at' => $this->escalated_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'notes' => $this->notes,
            'decisions' => ApprovalDecisionResource::collection($this->whenLoaded('decisions')),
            'flow' => $this->whenLoaded('flow'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
