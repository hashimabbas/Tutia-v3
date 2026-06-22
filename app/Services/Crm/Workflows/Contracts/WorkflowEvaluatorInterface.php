<?php

namespace App\Services\Crm\Workflows\Contracts;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowCondition;
use App\Services\Crm\Workflows\DTOs\WorkflowConditionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;

interface WorkflowEvaluatorInterface
{
    /**
     * @param  array<int, CrmWorkflowCondition>  $conditions
     * @return array<int, WorkflowConditionResult>
     */
    public function evaluate(CrmWorkflow $workflow, WorkflowContext $context): array;
}
