<?php

namespace App\Services\Crm\Workflows\Actions;

use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\Services\CrmActionService;

class CreateRiskWorkflowAction implements WorkflowActionHandlerInterface
{
    public function __construct(
        private readonly CrmActionService $crmActionService,
    ) {}

    public function handles(): string
    {
        return WorkflowActionCatalog::CREATE_RISK;
    }

    public function execute(WorkflowActionContext $actionContext): WorkflowActionResult
    {
        try {
            $risk = $this->crmActionService->createRisk($actionContext);

            return new WorkflowActionResult(
                actionId: $actionContext->action->id,
                actionType: $this->handles(),
                configuration: $actionContext->action->configuration_json,
                success: true,
                response: ['risk_id' => $risk->id],
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
}
