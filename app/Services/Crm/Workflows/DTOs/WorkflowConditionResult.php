<?php

namespace App\Services\Crm\Workflows\DTOs;

class WorkflowConditionResult
{
    public function __construct(
        public readonly int $conditionId,
        public readonly string $field,
        public readonly string $operator,
        public readonly string $expectedValue,
        public readonly mixed $actualValue,
        public readonly bool $passed,
        public readonly int $groupOrder,
    ) {}
}
