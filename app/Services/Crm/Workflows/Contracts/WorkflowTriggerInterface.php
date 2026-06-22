<?php

namespace App\Services\Crm\Workflows\Contracts;

use App\Models\CrmWorkflowTrigger;

interface WorkflowTriggerInterface
{
    public function matches(object $event, CrmWorkflowTrigger $trigger): bool;
}
