<?php

namespace App\Services\Crm\Approvals\Strategies;

use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Approvals\Contracts\ApprovalStrategyInterface;
use App\Services\Crm\Approvals\DTOs\ApprovalEvaluationResult;

class MajorityVoteStrategy implements ApprovalStrategyInterface
{
    public function handles(): string
    {
        return 'majority_vote';
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

        $majorityThreshold = (int) floor($totalSteps / 2) + 1;

        if ($approvedCount >= $majorityThreshold) {
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

        if ($rejectedCount >= $majorityThreshold) {
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

        $remaining = $totalSteps - $decidedSteps;
        $neededForMajority = $majorityThreshold - $approvedCount;

        if ($remaining <= 0 || $remaining < $neededForMajority) {
            if ($approvedCount > $rejectedCount) {
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
}
