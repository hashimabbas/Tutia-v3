<?php

namespace App\Services\Crm\Approvals\DTOs;

class ApprovalDecisionResult
{
    public function __construct(
        public readonly int $decisionId,
        public readonly int $requestId,
        public readonly int $stepId,
        public readonly int $userId,
        public readonly string $decision,
        public readonly ?string $comment = null,
    ) {}
}
