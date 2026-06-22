<?php

namespace App\Services\Crm\Workflows\Contracts;

use App\Models\CrmWorkflowAction;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;

interface WorkflowActionInterface
{
    public function execute(
        CrmWorkflowAction $action,
        WorkflowContext $context,
    ): WorkflowActionResult;
}
