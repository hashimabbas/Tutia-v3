<?php

namespace App\Services\Crm\Workflows\Actions;

use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\Services\CrmActionService;

class CreateActivityWorkflowAction implements WorkflowActionHandlerInterface
{
    public function __construct(
        private readonly CrmActionService $crmActionService,
    ) {}

    public function handles(): string
    {
        return WorkflowActionCatalog::CREATE_ACTIVITY;
    }

    public function execute(WorkflowActionContext $actionContext): WorkflowActionResult
    {
        try {
            $activity = $this->crmActionService->createActivity($actionContext);

            return new WorkflowActionResult(
                actionId: $actionContext->action->id,
                actionType: $this->handles(),
                configuration: $actionContext->action->configuration_json,
                success: true,
                response: ['activity_id' => $activity->id],
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
