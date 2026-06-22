<?php

namespace App\Services\Crm\Workflows\DTOs;

class WorkflowExecutionResult
{
    /**
     * @param  array<int, WorkflowConditionResult>  $conditionResults
     * @param  array<int, WorkflowActionResult>  $actionResults
     */
    public function __construct(
        public readonly int $workflowId,
        public readonly bool $conditionsPassed,
        public readonly array $conditionResults,
        public readonly array $actionResults,
        public readonly bool $allActionsSucceeded,
        public readonly string $status,
    ) {}
}
