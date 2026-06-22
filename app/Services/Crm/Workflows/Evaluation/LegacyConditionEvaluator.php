<?php

namespace App\Services\Crm\Workflows\Evaluation;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowCondition as CrmWorkflowConditionModel;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionEvaluatorInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionInterface;
use App\Services\Crm\Workflows\DTOs\WorkflowConditionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;

class LegacyConditionEvaluator implements WorkflowConditionEvaluatorInterface
{
    public function __construct(
        private readonly WorkflowConditionInterface $conditionEvaluator,
    ) {}

    public function evaluate(CrmWorkflow $workflow, WorkflowContext $context): array
    {
        $payload = $context->eventPayload;

        $grouped = $workflow->conditions->groupBy('group_order');

        $results = [];

        foreach ($grouped as $groupOrder => $conditions) {
            $groupResults = $conditions->map(
                fn (CrmWorkflowConditionModel $c) => $this->evaluateCondition($c, $payload, $groupOrder),
            );

            $groupPassed = $groupResults->every(fn (WorkflowConditionResult $r) => $r->passed);

            $results = array_merge($results, $groupResults->all());

            if (! $groupPassed) {
                break;
            }
        }

        return $results;
    }

    public function conditionsPassed(array $results): bool
    {
        if (empty($results)) {
            return true;
        }

        $grouped = collect($results)->groupBy('groupOrder');

        return $grouped->every(fn ($group) => $group->every(fn (WorkflowConditionResult $r) => $r->passed));
    }

    private function evaluateCondition(
        CrmWorkflowConditionModel $condition,
        array $payload,
        int $groupOrder,
    ): WorkflowConditionResult {
        $actualValue = $this->resolveField($payload, $condition->field);
        $passed = $this->conditionEvaluator->evaluate($condition, $payload);

        return new WorkflowConditionResult(
            conditionId: $condition->id,
            field: $condition->field,
            operator: $condition->operator,
            expectedValue: $condition->value,
            actualValue: $actualValue,
            passed: $passed,
            groupOrder: $groupOrder,
        );
    }

    private function resolveField(array $payload, string $field): mixed
    {
        return data_get($payload, $field);
    }
}
