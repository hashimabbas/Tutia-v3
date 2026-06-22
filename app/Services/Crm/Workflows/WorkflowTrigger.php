<?php

namespace App\Services\Crm\Workflows;

use App\Models\CrmWorkflowTrigger as CrmWorkflowTriggerModel;
use App\Services\Crm\Workflows\Contracts\WorkflowTriggerInterface;

class WorkflowTrigger implements WorkflowTriggerInterface
{
    public function matches(object $event, CrmWorkflowTriggerModel $trigger): bool
    {
        return true;
    }
}
