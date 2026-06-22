<?php

namespace App\Services\Crm\Workflows\Actions;

use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;

interface WorkflowActionHandlerInterface
{
    public function handles(): string;

    public function execute(WorkflowActionContext $actionContext): WorkflowActionResult;
}
