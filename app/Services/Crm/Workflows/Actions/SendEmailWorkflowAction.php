<?php

namespace App\Services\Crm\Workflows\Actions;

use App\Jobs\DispatchNotificationInstruction;
use App\Services\Crm\Communications\NotificationCoordinator;
use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;

class SendEmailWorkflowAction implements WorkflowActionHandlerInterface
{
    public function __construct(
        private readonly NotificationCoordinator $coordinator,
    ) {}

    public function handles(): string
    {
        return WorkflowActionCatalog::SEND_EMAIL;
    }

    public function execute(WorkflowActionContext $actionContext): WorkflowActionResult
    {
        try {
            $instruction = $this->coordinator->handle($actionContext->workflowContext->event);

            if ($instruction !== null) {
                DispatchNotificationInstruction::dispatch($instruction);
            }

            return new WorkflowActionResult(
                actionId: $actionContext->action->id,
                actionType: $this->handles(),
                configuration: $actionContext->action->configuration_json,
                success: true,
                response: ['dispatched' => $instruction !== null],
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
