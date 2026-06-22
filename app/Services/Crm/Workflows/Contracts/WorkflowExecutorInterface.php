<?php

namespace App\Services\Crm\Workflows\Contracts;

use App\Models\CrmWorkflow;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;
use App\Services\Crm\Workflows\DTOs\WorkflowExecutionResult;

interface WorkflowExecutorInterface
{
    public function execute(CrmWorkflow $workflow, WorkflowContext $context): WorkflowExecutionResult;

    public function resume(int $runId): WorkflowExecutionResult;
}
