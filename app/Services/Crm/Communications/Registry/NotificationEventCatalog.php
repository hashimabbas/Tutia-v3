<?php

namespace App\Services\Crm\Communications\Registry;

final class NotificationEventCatalog
{
    public const DEAL_CONVERTED = 'deal.converted';

    public const PROJECT_CREATED = 'project.created';

    public const MILESTONE_COMPLETED = 'milestone.completed';

    public const DELIVERABLE_COMPLETED = 'deliverable.completed';

    public const RISK_CLOSED = 'risk.closed';

    public const ISSUE_RESOLVED = 'issue.resolved';

    public const ISSUE_ESCALATED = 'issue.escalated';

    public const PROJECT_AT_RISK = 'project.at_risk';

    public const HEALTH_DEGRADED = 'health.degraded';

    public const CHANGE_ORDER_APPROVED = 'change_order.approved';

    public const CHANGE_ORDER_REJECTED = 'change_order.rejected';
}
