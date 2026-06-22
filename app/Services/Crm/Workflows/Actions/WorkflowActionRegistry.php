<?php

namespace App\Services\Crm\Workflows\Actions;

use App\Models\CrmWorkflowAction;
use App\Models\CrmWorkflowRun;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;
use RuntimeException;

class WorkflowActionRegistry
{
    /** @var array<string, WorkflowActionHandlerInterface> */
    private array $handlers = [];

    /**
     * @param  array<int, WorkflowActionHandlerInterface>  $handlers
     */
    public function __construct(array $handlers = [])
    {
        foreach ($handlers as $handler) {
            $this->register($handler);
        }
    }

    public function register(WorkflowActionHandlerInterface $handler): void
    {
        $this->handlers[$handler->handles()] = $handler;
    }

    public function hasHandler(string $actionType): bool
    {
        return isset($this->handlers[$actionType]);
    }

    public function execute(CrmWorkflowAction $action, WorkflowContext $context, ?CrmWorkflowRun $workflowRun = null): WorkflowActionResult
    {
        $handler = $this->handlers[$action->action_type]
            ?? throw new RuntimeException("No handler registered for action type: {$action->action_type}");

        return $handler->execute(new WorkflowActionContext($context, $action, $workflowRun));
    }
}
