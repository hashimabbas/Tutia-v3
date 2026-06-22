<?php

namespace App\Services\Crm\Approvals\Strategies;

use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Approvals\Contracts\ApprovalStrategyInterface;
use App\Services\Crm\Approvals\DTOs\ApprovalEvaluationResult;

class UnanimousStrategy implements ApprovalStrategyInterface
{
    public function handles(): string
    {
        return 'all_must_approve';
    }

    public function evaluate(CrmApprovalRequest $request): ApprovalEvaluationResult
    {
        $decisions = $request->decisions;
        $steps = $request->flow->steps;

        $totalSteps = $steps->count();
        $decidedSteps = $decisions->count();
        $approvedCount = $decisions->where('decision', 'approved')->count();
        $rejectedCount = $decisions->where('decision', 'rejected')->count();
        $abstainedCount = $decisions->where('decision', 'abstained')->count();

        $requiredSteps = $steps->where('required', true)->count();

        if ($rejectedCount > 0) {
            return new ApprovalEvaluationResult(
                requestId: $request->id,
                status: ApprovalStatusCatalog::REQUEST_REJECTED,
                approved: false,
                rejected: true,
                totalSteps: $totalSteps,
                decidedSteps: $decidedSteps,
                approvedCount: $approvedCount,
                rejectedCount: $rejectedCount,
                abstainedCount: $abstainedCount,
            );
        }

        $approvedRequired = $steps
            ->where('required', true)
            ->filter(fn ($step) => $decisions->contains('approval_step_id', $step->id))
            ->count();

        if ($requiredSteps > 0 && $approvedRequired < $requiredSteps) {
            return new ApprovalEvaluationResult(
                requestId: $request->id,
                status: ApprovalStatusCatalog::REQUEST_PENDING,
                approved: false,
                rejected: false,
                totalSteps: $totalSteps,
                decidedSteps: $decidedSteps,
                approvedCount: $approvedCount,
                rejectedCount: $rejectedCount,
                abstainedCount: $abstainedCount,
            );
        }

        return new ApprovalEvaluationResult(
            requestId: $request->id,
            status: ApprovalStatusCatalog::REQUEST_APPROVED,
            approved: true,
            rejected: false,
            totalSteps: $totalSteps,
            decidedSteps: $decidedSteps,
            approvedCount: $approvedCount,
            rejectedCount: $rejectedCount,
            abstainedCount: $abstainedCount,
        );
    }
}
