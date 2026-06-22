<?php

namespace App\Services\Crm\Approvals\DTOs;

class ApprovalEvaluationResult
{
    public function __construct(
        public readonly int $requestId,
        public readonly string $status,
        public readonly bool $approved,
        public readonly bool $rejected,
        public readonly int $totalSteps,
        public readonly int $decidedSteps,
        public readonly int $approvedCount,
        public readonly int $rejectedCount,
        public readonly int $abstainedCount,
    ) {}
}
