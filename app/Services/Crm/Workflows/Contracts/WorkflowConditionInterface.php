<?php

namespace App\Services\Crm\Workflows\Contracts;

use App\Models\CrmWorkflowCondition;

interface WorkflowConditionInterface
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function evaluate(CrmWorkflowCondition $condition, array $payload): bool;
}
