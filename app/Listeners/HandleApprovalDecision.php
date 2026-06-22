<?php

namespace App\Listeners;

use App\Events\Crm\ApprovalApproved;
use App\Events\Crm\ApprovalRejected;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use App\Services\Crm\Workflows\WorkflowEngine;

class HandleApprovalDecision
{
    public function __construct(
        private readonly WorkflowEngine $workflowEngine,
    ) {}

    public function handleApproved(ApprovalApproved $event): void
    {
        $run = $event->request->workflowRun;

        if ($run === null || $run->status !== WorkflowStatusCatalog::RUN_PAUSED) {
            return;
        }

        $this->workflowEngine->resume($run->id);
    }

    public function handleRejected(ApprovalRejected $event): void
    {
        $run = $event->request->workflowRun;

        if ($run === null || $run->status !== WorkflowStatusCatalog::RUN_PAUSED) {
            return;
        }

        $this->workflowEngine->resume($run->id);
    }
}
