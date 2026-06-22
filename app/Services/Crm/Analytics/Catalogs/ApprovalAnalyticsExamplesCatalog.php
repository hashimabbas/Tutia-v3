<?php

namespace App\Services\Crm\Analytics\Catalogs;

final class ApprovalAnalyticsExamplesCatalog
{
    private const EXAMPLES = [
        [
            'expression' => 'approval.sla_compliance < 80',
            'label' => 'SLA risk',
            'description' => 'Approval flows with SLA compliance below 80%',
        ],
        [
            'expression' => 'approval.escalation_rate > 15',
            'label' => 'High escalation',
            'description' => 'Approval flows with escalation rate above 15%',
        ],
        [
            'expression' => 'approval.health_score >= 80',
            'label' => 'Healthy flows',
            'description' => 'Approval flows in good health',
        ],
        [
            'expression' => 'approval.approval_rate < 50',
            'label' => 'Low approval rate',
            'description' => 'Flows with approval rate below 50%',
        ],
        [
            'expression' => 'approval.status = "active"',
            'label' => 'Active flows',
            'description' => 'Currently active approval flows',
        ],
        [
            'expression' => 'approval.expiry_rate > 10',
            'label' => 'High expiry rate',
            'description' => 'Approval flows with high request expiry rate',
        ],
        [
            'expression' => 'approval.avg_resolution_minutes > 1440',
            'label' => 'Slow resolution',
            'description' => 'Flows averaging more than 24 hours resolution',
        ],
        [
            'expression' => 'approval.rejection_rate > 30 AND approval.escalation_rate > 10',
            'label' => 'Troubled flows',
            'description' => 'High rejection AND high escalation',
        ],
    ];

    /** @return array<int, array{expression: string, label: string, description: string}> */
    public static function all(): array
    {
        return self::EXAMPLES;
    }
}
