<?php

namespace App\Http\Resources;

use App\Models\CrmApprovalDecision;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CrmApprovalDecision */
class ApprovalDecisionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'approval_request_id' => $this->approval_request_id,
            'approval_step_id' => $this->approval_step_id,
            'user_id' => $this->user_id,
            'decision' => $this->decision,
            'comment' => $this->comment,
            'decided_at' => $this->decided_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
