<?php

namespace App\Services\Crm\Approvals\Contracts;

use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\DTOs\ApprovalEvaluationResult;

interface ApprovalStrategyInterface
{
    public function handles(): string;

    public function evaluate(CrmApprovalRequest $request): ApprovalEvaluationResult;
}
