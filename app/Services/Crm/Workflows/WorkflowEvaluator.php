<?php

namespace App\Services\Crm\Workflows;

use App\Models\CrmWorkflow;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionEvaluatorInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowEvaluatorInterface;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;

class WorkflowEvaluator implements WorkflowEvaluatorInterface
{
    public function __construct(
        private readonly WorkflowConditionEvaluatorInterface $conditionEvaluator,
    ) {}

    public function evaluate(CrmWorkflow $workflow, WorkflowContext $context): array
    {
        return $this->conditionEvaluator->evaluate($workflow, $context);
    }

    public function conditionsPassed(array $results): bool
    {
        return $this->conditionEvaluator->conditionsPassed($results);
    }
}
