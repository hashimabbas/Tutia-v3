<?php

namespace App\Listeners;

use App\Events\Crm\ChangeOrderApproved;
use App\Events\Crm\ChangeOrderRejected;
use App\Events\Crm\DealConvertedToProject;
use App\Events\Crm\DeliverableCompleted;
use App\Events\Crm\HealthDegraded;
use App\Events\Crm\IssueEscalated;
use App\Events\Crm\IssueResolved;
use App\Events\Crm\MilestoneCompleted;
use App\Events\Crm\ProjectAtRisk;
use App\Events\Crm\ProjectCreated;
use App\Events\Crm\RiskClosed;
use App\Jobs\DispatchNotificationInstruction;
use App\Services\Crm\Communications\NotificationCoordinator;

class HandleDomainNotification
{
    public function __construct(
        private readonly NotificationCoordinator $coordinator,
    ) {}

    public function handle(
        DealConvertedToProject|
        ProjectCreated|
        MilestoneCompleted|
        DeliverableCompleted|
        RiskClosed|
        IssueResolved|
        IssueEscalated|
        ProjectAtRisk|
        HealthDegraded|
        ChangeOrderApproved|
        ChangeOrderRejected $event,
    ): void {
        $instruction = $this->coordinator->handle($event);

        if ($instruction === null) {
            return;
        }

        DispatchNotificationInstruction::dispatch($instruction);
    }
}
