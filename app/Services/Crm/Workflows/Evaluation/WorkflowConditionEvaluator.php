<?php

namespace App\Services\Crm\Workflows\Evaluation;

use App\Models\CrmWorkflow;
use App\Services\Crm\Workflows\Catalogs\WorkflowConditionsVersion;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionEvaluatorInterface;
use App\Services\Crm\Workflows\DTOs\WorkflowConditionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;

class WorkflowConditionEvaluator implements WorkflowConditionEvaluatorInterface
{
    public function __construct(
        private readonly LegacyConditionEvaluator $legacyEvaluator,
        private readonly ExpressionWorkflowEvaluator $expressionEvaluator,
    ) {}

    public function evaluate(CrmWorkflow $workflow, WorkflowContext $context): array
    {
        if ($workflow->conditions_version === WorkflowConditionsVersion::V2->value) {
            return $this->expressionEvaluator->evaluate($workflow, $context);
        }

        return $this->legacyEvaluator->evaluate($workflow, $context);
    }

    public function conditionsPassed(array $results): bool
    {
        if (empty($results)) {
            return true;
        }

        $isExpressionResult = count($results) === 1 && $results[0]->conditionId === 0 && $results[0]->operator === 'expression';

        if ($isExpressionResult) {
            return $results[0]->passed;
        }

        $grouped = collect($results)->groupBy('groupOrder');

        return $grouped->every(fn ($group) => $group->every(fn (WorkflowConditionResult $r) => $r->passed));
    }
}
