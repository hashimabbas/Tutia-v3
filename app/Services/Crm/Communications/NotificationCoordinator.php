<?php

namespace App\Services\Crm\Communications;

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
use App\Models\CrmPortalNotificationPreference;
use App\Services\Crm\Communications\Contracts\NotificationRouterInterface;
use App\Services\Crm\Communications\Contracts\RecipientResolverInterface;
use Illuminate\Support\Str;

class NotificationCoordinator
{
    public function __construct(
        private readonly NotificationRouterInterface $router,
        private readonly RecipientResolverInterface $recipientResolver,
    ) {}

    public function handle(object $event): ?NotificationInstruction
    {
        $route = $this->router->route($event::class);

        if ($route === null) {
            return null;
        }

        $targets = $this->recipientResolver->resolve($event);

        if ($targets === []) {
            return null;
        }

        $targets = $this->filterByPreferences($targets, $route['channels'], $route['template']);

        if ($targets === []) {
            return null;
        }

        return new NotificationInstruction(
            event: $event::class,
            template: $route['template'],
            channels: $route['channels'],
            recipients: $targets,
            payload: $this->buildPayload($event),
            correlationId: (string) Str::uuid(),
            idempotencyKey: (string) Str::uuid(),
        );
    }

    /** @param array<int, RecipientTarget> $targets */
    private function filterByPreferences(array $targets, array $channels, string $template): array
    {
        return array_values(array_filter($targets, function (RecipientTarget $target) use ($channels, $template) {
            foreach ($channels as $channel) {
                $preference = CrmPortalNotificationPreference::where('portal_account_id', $target->portalAccountId)
                    ->where('channel', $channel)
                    ->first();

                if ($preference === null) {
                    continue;
                }

                $filters = $preference->event_filters ?? [];

                if (in_array($template, $filters, true)) {
                    return false;
                }

                if ($preference->frequency === 'never') {
                    return false;
                }
            }

            return true;
        }));
    }

    /** @return array<string, mixed> */
    private function buildPayload(object $event): array
    {
        return match (true) {
            $event instanceof DealConvertedToProject => [
                'deal_title' => $event->deal->title,
                'project_id' => $event->projectId,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof ProjectCreated => [
                'project_name' => $event->project->name,
                'milestone_count' => $event->milestoneCount,
                'deliverable_count' => $event->deliverableCount,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof MilestoneCompleted => [
                'milestone_name' => $event->milestone->name,
                'project_name' => $event->milestone->project->name,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof IssueEscalated => [
                'issue_title' => $event->issue->title,
                'previous_severity' => $event->previousSeverity,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof ProjectAtRisk => [
                'health_score' => $event->healthScore,
                'previous_score' => $event->previousScore,
                'project_name' => $event->project->name,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof HealthDegraded => [
                'health_score' => $event->healthScore,
                'previous_score' => $event->previousScore,
                'drop' => $event->drop,
                'project_name' => $event->project->name,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof DeliverableCompleted => [
                'deliverable_name' => $event->deliverable->name,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof RiskClosed => [
                'risk_description' => $event->risk->description,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof IssueResolved => [
                'issue_description' => $event->issue->description,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof ChangeOrderApproved => [
                'change_order_title' => $event->changeOrder->title,
                'project_name' => $event->changeOrder->project->name,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            $event instanceof ChangeOrderRejected => [
                'change_order_title' => $event->changeOrder->title,
                'reason' => $event->reason,
                'project_name' => $event->changeOrder->project->name,
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
            default => [
                'event_class' => $event::class,
                'timestamp' => now()->toIso8601String(),
            ],
        };
    }
}
