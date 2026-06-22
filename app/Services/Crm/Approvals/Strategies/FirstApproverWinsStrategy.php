<?php

namespace App\Services\Crm\Approvals\Strategies;

use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Approvals\Contracts\ApprovalStrategyInterface;
use App\Services\Crm\Approvals\DTOs\ApprovalEvaluationResult;

class FirstApproverWinsStrategy implements ApprovalStrategyInterface
{
    public function handles(): string
    {
        return 'first_approver_wins';
    }

    public function evaluate(CrmApprovalRequest $request): ApprovalEvaluationResult
    {
        $decisions = $request->decisions;

        if ($decisions->isEmpty()) {
            $steps = $request->flow->steps;

            return new ApprovalEvaluationResult(
                requestId: $request->id,
                status: ApprovalStatusCatalog::REQUEST_PENDING,
                approved: false,
                rejected: false,
                totalSteps: $steps->count(),
                decidedSteps: 0,
                approvedCount: 0,
                rejectedCount: 0,
                abstainedCount: 0,
            );
        }

        $firstDecision = $decisions->sortBy('id')->first();

        $isApproved = $firstDecision->decision === 'approved';
        $isRejected = $firstDecision->decision === 'rejected';

        return new ApprovalEvaluationResult(
            requestId: $request->id,
            status: $isApproved
                ? ApprovalStatusCatalog::REQUEST_APPROVED
                : ($isRejected
                    ? ApprovalStatusCatalog::REQUEST_REJECTED
                    : ApprovalStatusCatalog::REQUEST_PENDING),
            approved: $isApproved,
            rejected: $isRejected,
            totalSteps: $request->flow->steps->count(),
            decidedSteps: 1,
            approvedCount: $isApproved ? 1 : 0,
            rejectedCount: $isRejected ? 1 : 0,
            abstainedCount: 0,
        );
    }
}
