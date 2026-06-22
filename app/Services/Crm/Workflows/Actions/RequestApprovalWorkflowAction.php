<?php

namespace App\Services\Crm\Workflows\Actions;

use App\Models\CrmApprovalFlow;
use App\Models\User;
use App\Services\Crm\Approvals\Contracts\ApprovalEngineInterface;
use App\Services\Crm\Approvals\DTOs\ApprovalContext;
use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use RuntimeException;

class RequestApprovalWorkflowAction implements WorkflowActionHandlerInterface
{
    public function __construct(
        private readonly ApprovalEngineInterface $approvalEngine,
    ) {}

    public function handles(): string
    {
        return WorkflowActionCatalog::REQUEST_APPROVAL;
    }

    public function execute(WorkflowActionContext $actionContext): WorkflowActionResult
    {
        try {
            $config = $actionContext->action->configuration_json;
            $flowId = $config['approval_flow_id'] ?? null;

            if ($flowId === null) {
                throw new RuntimeException('request_approval action requires approval_flow_id in config');
            }

            $flow = CrmApprovalFlow::find($flowId);

            if ($flow === null) {
                throw new RuntimeException("Approval flow not found: {$flowId}");
            }

            $run = $actionContext->workflowRun;

            if ($run === null) {
                throw new RuntimeException('request_approval action requires a workflow run');
            }

            $requestedBy = $this->resolveRequestedBy($actionContext);

            $context = new ApprovalContext(
                workflowRun: $run,
                entityType: $config['entity_type'] ?? $run->entity_type,
                entityId: $config['entity_id'] ?? $run->entity_id,
                requestedBy: $requestedBy,
                notes: $config['notes'] ?? null,
            );

            $request = $this->approvalEngine->createRequest($flow, $context);

            return new WorkflowActionResult(
                actionId: $actionContext->action->id,
                actionType: $this->handles(),
                configuration: $actionContext->action->configuration_json,
                success: true,
                response: [
                    'approval_request_id' => $request->id,
                    'approval_flow_id' => $flow->id,
                    'crm_workflow_action_id' => $actionContext->action->id,
                ],
                isPending: true,
            );
        } catch (\Throwable $e) {
            return new WorkflowActionResult(
                actionId: $actionContext->action->id,
                actionType: $this->handles(),
                configuration: $actionContext->action->configuration_json,
                success: false,
                errorMessage: $e->getMessage(),
            );
        }
    }

    private function resolveRequestedBy(WorkflowActionContext $actionContext): User
    {
        $triggeredBy = $actionContext->workflowContext->triggeredBy;

        if ($triggeredBy instanceof User) {
            return $triggeredBy;
        }

        if (is_array($triggeredBy) && isset($triggeredBy['id'])) {
            $user = User::find($triggeredBy['id']);

            if ($user !== null) {
                return $user;
            }
        }

        $config = $actionContext->action->configuration_json;
        $requestedById = $config['requested_by'] ?? null;

        if ($requestedById !== null) {
            $user = User::find($requestedById);

            if ($user !== null) {
                return $user;
            }
        }

        throw new RuntimeException('Cannot resolve requested_by user for approval request');
    }
}
