<?php

namespace App\Services\Crm\Workflows\Contracts;

use App\Models\CrmWorkflow;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;

interface WorkflowConditionEvaluatorInterface
{
    public function evaluate(CrmWorkflow $workflow, WorkflowContext $context): array;

    public function conditionsPassed(array $results): bool;
}
