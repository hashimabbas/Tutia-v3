<?php

namespace App\Services\Crm\Workflows;

use App\Models\CrmWorkflowCondition as CrmWorkflowConditionModel;
use App\Services\Crm\Workflows\Catalogs\WorkflowOperatorCatalog;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionInterface;
use Illuminate\Support\Arr;

class WorkflowCondition implements WorkflowConditionInterface
{
    public function evaluate(CrmWorkflowConditionModel $condition, array $payload): bool
    {
        $actualValue = Arr::get($payload, $condition->field);
        $expectedValue = $this->decodeValue($condition->value);

        return match ($condition->operator) {
            WorkflowOperatorCatalog::EQ => $actualValue == $expectedValue,
            WorkflowOperatorCatalog::NEQ => $actualValue != $expectedValue,
            WorkflowOperatorCatalog::GT => is_numeric($actualValue) && $actualValue > $expectedValue,
            WorkflowOperatorCatalog::GTE => is_numeric($actualValue) && $actualValue >= $expectedValue,
            WorkflowOperatorCatalog::LT => is_numeric($actualValue) && $actualValue < $expectedValue,
            WorkflowOperatorCatalog::LTE => is_numeric($actualValue) && $actualValue <= $expectedValue,
            WorkflowOperatorCatalog::IN => is_array($expectedValue) && in_array($actualValue, $expectedValue, true),
            WorkflowOperatorCatalog::NOT_IN => is_array($expectedValue) && ! in_array($actualValue, $expectedValue, true),
            WorkflowOperatorCatalog::CONTAINS => is_string($actualValue) && str_contains(mb_strtolower($actualValue), mb_strtolower((string) $expectedValue)),
            WorkflowOperatorCatalog::IS_EMPTY => empty($actualValue) && $actualValue !== false && $actualValue !== 0,
            WorkflowOperatorCatalog::NOT_EMPTY => ! empty($actualValue) || $actualValue === false || $actualValue === 0,
            default => false,
        };
    }

    private function decodeValue(string $value): mixed
    {
        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}
