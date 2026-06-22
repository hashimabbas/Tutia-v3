<?php

namespace App\Services\Crm\Approvals\DTOs;

use App\Models\CrmWorkflowRun;
use App\Models\User;

class ApprovalContext
{
    public function __construct(
        public readonly CrmWorkflowRun $workflowRun,
        public readonly string $entityType,
        public readonly int $entityId,
        public readonly User $requestedBy,
        public readonly ?string $notes = null,
    ) {}
}
