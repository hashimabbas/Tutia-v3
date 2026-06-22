<?php

namespace App\Services\Crm\Approvals\Contracts;

use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Models\CrmApprovalStep;
use App\Models\User;
use App\Services\Crm\Approvals\DTOs\ApprovalContext;
use App\Services\Crm\Approvals\DTOs\ApprovalDecisionResult;
use App\Services\Crm\Approvals\DTOs\ApprovalEvaluationResult;

interface ApprovalEngineInterface
{
    public function createRequest(CrmApprovalFlow $flow, ApprovalContext $context): CrmApprovalRequest;

    public function recordDecision(
        CrmApprovalRequest $request,
        CrmApprovalStep $step,
        User $user,
        string $decision,
        ?string $comment,
    ): ApprovalDecisionResult;

    public function evaluateRequest(CrmApprovalRequest $request): ApprovalEvaluationResult;

    public function expireRequest(CrmApprovalRequest $request): void;

    public function checkSla(CrmApprovalRequest $request): void;

    public function escalateRequest(CrmApprovalRequest $request): void;
}
