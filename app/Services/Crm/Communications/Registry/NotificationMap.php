<?php

namespace App\Services\Crm\Communications\Registry;

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

class NotificationMap
{
    private const MAP = [
        DealConvertedToProject::class => [
            'template' => NotificationEventCatalog::DEAL_CONVERTED,
            'channels' => ['portal'],
        ],

        ProjectCreated::class => [
            'template' => NotificationEventCatalog::PROJECT_CREATED,
            'channels' => ['portal'],
        ],

        MilestoneCompleted::class => [
            'template' => NotificationEventCatalog::MILESTONE_COMPLETED,
            'channels' => ['portal'],
        ],

        DeliverableCompleted::class => [
            'template' => NotificationEventCatalog::DELIVERABLE_COMPLETED,
            'channels' => ['portal'],
        ],

        RiskClosed::class => [
            'template' => NotificationEventCatalog::RISK_CLOSED,
            'channels' => ['portal'],
        ],

        IssueResolved::class => [
            'template' => NotificationEventCatalog::ISSUE_RESOLVED,
            'channels' => ['portal'],
        ],

        IssueEscalated::class => [
            'template' => NotificationEventCatalog::ISSUE_ESCALATED,
            'channels' => ['email', 'portal'],
        ],

        ProjectAtRisk::class => [
            'template' => NotificationEventCatalog::PROJECT_AT_RISK,
            'channels' => ['email', 'portal'],
        ],

        HealthDegraded::class => [
            'template' => NotificationEventCatalog::HEALTH_DEGRADED,
            'channels' => ['portal'],
        ],

        ChangeOrderApproved::class => [
            'template' => NotificationEventCatalog::CHANGE_ORDER_APPROVED,
            'channels' => ['email', 'portal'],
        ],

        ChangeOrderRejected::class => [
            'template' => NotificationEventCatalog::CHANGE_ORDER_REJECTED,
            'channels' => ['email', 'portal', 'whatsapp'],
        ],
    ];

    public function get(string $eventClass): ?array
    {
        return self::MAP[$eventClass] ?? null;
    }

    /** @return array<class-string, array{template: string, channels: array<int, string>}> */
    public function all(): array
    {
        return self::MAP;
    }

    public function eventKeyForTemplate(string $template): ?string
    {
        return match ($template) {
            NotificationEventCatalog::DEAL_CONVERTED => 'deal_converted_to_project',
            NotificationEventCatalog::PROJECT_CREATED => 'project_created',
            NotificationEventCatalog::MILESTONE_COMPLETED => 'milestone_completed',
            NotificationEventCatalog::DELIVERABLE_COMPLETED => 'deliverable_completed',
            NotificationEventCatalog::RISK_CLOSED => 'risk_closed',
            NotificationEventCatalog::ISSUE_RESOLVED => 'issue_resolved',
            NotificationEventCatalog::ISSUE_ESCALATED => 'issue_escalated',
            NotificationEventCatalog::PROJECT_AT_RISK => 'project_at_risk',
            NotificationEventCatalog::HEALTH_DEGRADED => 'health_degraded',
            NotificationEventCatalog::CHANGE_ORDER_APPROVED => 'change_order_approved',
            NotificationEventCatalog::CHANGE_ORDER_REJECTED => 'change_order_rejected',
            default => null,
        };
    }
}
