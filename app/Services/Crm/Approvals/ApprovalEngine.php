<?php

namespace App\Services\Crm\Approvals;

use App\Events\Crm\ApprovalApproved;
use App\Events\Crm\ApprovalEscalated;
use App\Events\Crm\ApprovalExpired;
use App\Events\Crm\ApprovalRejected;
use App\Events\Crm\ApprovalRequested;
use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Models\CrmApprovalStep;
use App\Models\User;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Approvals\Contracts\ApprovalEngineInterface;
use App\Services\Crm\Approvals\DTOs\ApprovalContext;
use App\Services\Crm\Approvals\DTOs\ApprovalDecisionResult;
use App\Services\Crm\Approvals\DTOs\ApprovalEvaluationResult;
use RuntimeException;

class ApprovalEngine implements ApprovalEngineInterface
{
    public function __construct(
        private readonly ApprovalStrategyRegistry $strategyRegistry,
    ) {}

    public function createRequest(CrmApprovalFlow $flow, ApprovalContext $context): CrmApprovalRequest
    {
        $request = CrmApprovalRequest::create([
            'approval_flow_id' => $flow->id,
            'workflow_run_id' => $context->workflowRun->id,
            'entity_type' => $context->entityType,
            'entity_id' => $context->entityId,
            'status' => ApprovalStatusCatalog::REQUEST_PENDING,
            'requested_by' => $context->requestedBy->id,
            'requested_at' => now(),
            'notes' => $context->notes,
        ]);

        ApprovalRequested::dispatch($request, $context->requestedBy);

        return $request;
    }

    public function recordDecision(
        CrmApprovalRequest $request,
        CrmApprovalStep $step,
        User $user,
        string $decision,
        ?string $comment,
    ): ApprovalDecisionResult {
        $existing = $request->decisions()
            ->where('approval_step_id', $step->id)
            ->first();

        if ($existing !== null) {
            throw new RuntimeException("Step {$step->id} already has a decision for request {$request->id}");
        }

        $recorded = $request->decisions()->create([
            'approval_step_id' => $step->id,
            'user_id' => $user->id,
            'decision' => $decision,
            'comment' => $comment,
            'decided_at' => now(),
        ]);

        if ($request->first_response_at === null) {
            $request->update(['first_response_at' => now()]);
            $request->refresh();
        }

        $result = $this->evaluateRequest($request);

        if ($result->approved || $result->rejected) {
            $updates = [
                'status' => $result->status,
                'completed_at' => now(),
                'resolution_time_minutes' => (int) $request->requested_at->diffInMinutes(now(), true),
            ];

            if ($result->approved) {
                $updates['approved_at'] = now();
            } else {
                $updates['rejected_at'] = now();
            }

            $request->update($updates);

            $request->refresh();

            if ($result->approved) {
                ApprovalApproved::dispatch($request, $user, $comment);
            } else {
                ApprovalRejected::dispatch($request, $user, $comment);
            }
        }

        return new ApprovalDecisionResult(
            decisionId: $recorded->id,
            requestId: $request->id,
            stepId: $step->id,
            userId: $user->id,
            decision: $decision,
            comment: $comment,
        );
    }

    public function evaluateRequest(CrmApprovalRequest $request): ApprovalEvaluationResult
    {
        $request->loadMissing(['flow.steps', 'decisions']);

        $strategyKey = $request->flow->strategy;

        $strategy = $this->strategyRegistry->get($strategyKey);

        return $strategy->evaluate($request);
    }

    public function expireRequest(CrmApprovalRequest $request): void
    {
        $request->update([
            'status' => ApprovalStatusCatalog::REQUEST_EXPIRED,
            'completed_at' => now(),
            'resolution_time_minutes' => (int) $request->requested_at->diffInMinutes(now(), true),
        ]);

        ApprovalExpired::dispatch($request->fresh());
    }

    public function checkSla(CrmApprovalRequest $request): void
    {
        if ($request->status !== ApprovalStatusCatalog::REQUEST_PENDING) {
            return;
        }

        $flow = $request->flow;

        if ($flow->sla_breach_minutes === null) {
            return;
        }

        $elapsed = $request->requested_at->diffInMinutes(now(), true);

        if ($elapsed >= $flow->sla_breach_minutes) {
            if ($flow->escalation_model !== 'none') {
                $this->escalateRequest($request);

                return;
            }

            $this->expireRequest($request);

            return;
        }

        if (
            $flow->sla_warning_minutes !== null
            && $elapsed >= $flow->sla_warning_minutes
            && $request->sla_warning_sent_at === null
        ) {
            $request->update(['sla_warning_sent_at' => now()]);
        }
    }

    public function escalateRequest(CrmApprovalRequest $request): void
    {
        $flow = $request->flow;

        if ($flow->escalation_model === 'none') {
            throw new RuntimeException("Cannot escalate request {$request->id}: flow has no escalation model");
        }

        $request->increment('escalation_count');

        $request->update([
            'status' => ApprovalStatusCatalog::REQUEST_ESCALATED,
            'escalated_at' => now(),
        ]);

        ApprovalEscalated::dispatch($request->fresh());
    }
}
