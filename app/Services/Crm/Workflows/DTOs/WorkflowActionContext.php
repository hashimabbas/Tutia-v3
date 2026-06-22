<?php

namespace App\Services\Crm\Workflows\DTOs;

use App\Models\CrmWorkflowAction;
use App\Models\CrmWorkflowRun;

class WorkflowActionContext
{
    public function __construct(
        public readonly WorkflowContext $workflowContext,
        public readonly CrmWorkflowAction $action,
        public readonly ?CrmWorkflowRun $workflowRun = null,
    ) {}
}
