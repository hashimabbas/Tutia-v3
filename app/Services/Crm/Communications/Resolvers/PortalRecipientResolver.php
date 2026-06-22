<?php

namespace App\Services\Crm\Communications\Resolvers;

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
use App\Models\CrmProject;
use App\Services\Crm\Communications\Contracts\RecipientResolverInterface;
use App\Services\Crm\Communications\RecipientTarget;

class PortalRecipientResolver implements RecipientResolverInterface
{
    /** @return array<int, RecipientTarget> */
    public function resolve(object $event): array
    {
        $project = $this->resolveProject($event);

        if ($project === null) {
            return [];
        }

        $roles = $this->resolveRoles($event);

        $accounts = $project->portalAccounts()
            ->wherePivotIn('role', $roles)
            ->whereNull('disabled_at')
            ->get();

        return $accounts->map(fn ($account) => new RecipientTarget(
            portalAccountId: $account->id,
            email: $account->email_snapshot ?? $account->contact?->email ?? '',
            locale: $account->locale ?? 'en',
        ))->all();
    }

    private function resolveProject(object $event): ?CrmProject
    {
        return match (true) {
            $event instanceof DealConvertedToProject => CrmProject::find($event->projectId),
            $event instanceof ProjectCreated => $event->project,
            $event instanceof MilestoneCompleted => $event->milestone->project,
            $event instanceof DeliverableCompleted => $event->deliverable->milestone->project,
            $event instanceof RiskClosed => $event->risk->project,
            $event instanceof IssueResolved => $event->issue->project,
            $event instanceof IssueEscalated => $event->issue->project,
            $event instanceof ProjectAtRisk => $event->project,
            $event instanceof HealthDegraded => $event->project,
            $event instanceof ChangeOrderApproved => $event->changeOrder->project,
            $event instanceof ChangeOrderRejected => $event->changeOrder->project,
            default => null,
        };
    }

    /** @return array<int, string> */
    private function resolveRoles(object $event): array
    {
        return match (true) {
            $event instanceof DealConvertedToProject => ['primary_contact', 'stakeholder'],
            $event instanceof ProjectCreated => ['primary_contact', 'stakeholder'],
            $event instanceof MilestoneCompleted => ['primary_contact', 'stakeholder'],
            $event instanceof DeliverableCompleted => ['primary_contact', 'stakeholder'],
            $event instanceof RiskClosed => ['primary_contact', 'stakeholder'],
            $event instanceof IssueResolved => ['primary_contact', 'stakeholder'],
            $event instanceof IssueEscalated => ['primary_contact', 'stakeholder'],
            $event instanceof ProjectAtRisk => ['primary_contact', 'stakeholder', 'approver'],
            $event instanceof HealthDegraded => ['primary_contact', 'stakeholder'],
            $event instanceof ChangeOrderApproved => ['primary_contact', 'stakeholder'],
            $event instanceof ChangeOrderRejected => ['primary_contact', 'stakeholder'],
            default => [],
        };
    }
}
