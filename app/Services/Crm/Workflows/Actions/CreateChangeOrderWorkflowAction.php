<?php

namespace App\Services\Crm\Workflows\Actions;

use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\Services\CrmActionService;

class CreateChangeOrderWorkflowAction implements WorkflowActionHandlerInterface
{
    public function __construct(
        private readonly CrmActionService $crmActionService,
    ) {}

    public function handles(): string
    {
        return WorkflowActionCatalog::CREATE_CHANGE_ORDER;
    }

    public function execute(WorkflowActionContext $actionContext): WorkflowActionResult
    {
        try {
            $co = $this->crmActionService->createChangeOrder($actionContext);

            return new WorkflowActionResult(
                actionId: $actionContext->action->id,
                actionType: $this->handles(),
                configuration: $actionContext->action->configuration_json,
                success: true,
                response: ['change_order_id' => $co->id],
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
