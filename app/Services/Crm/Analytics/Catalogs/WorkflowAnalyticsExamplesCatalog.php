<?php

namespace App\Services\Crm\Analytics\Catalogs;

final class WorkflowAnalyticsExamplesCatalog
{
    private const EXAMPLES = [
        [
            'expression' => 'workflow.health_score < 50',
            'label' => 'Failing workflows',
            'description' => 'Workflows with health score below 50 (critical)',
        ],
        [
            'expression' => 'workflow.failure_rate > 20',
            'label' => 'High failure rate',
            'description' => 'Workflows with failure rate above 20%',
        ],
        [
            'expression' => 'workflow.success_rate > 90',
            'label' => 'Highly reliable',
            'description' => 'Workflows with success rate above 90%',
        ],
        [
            'expression' => 'workflow.action_failure_rate > 10',
            'label' => 'Action failures',
            'description' => 'Workflows with action failure rate above 10%',
        ],
        [
            'expression' => 'workflow.status = "active"',
            'label' => 'Active workflows',
            'description' => 'Currently active workflows',
        ],
        [
            'expression' => 'workflow.trend = "declining"',
            'label' => 'Declining trend',
            'description' => 'Workflows with declining success trend',
        ],
        [
            'expression' => 'workflow.escalation_count > 0',
            'label' => 'With escalations',
            'description' => 'Workflows that had at least 1 escalation',
        ],
        [
            'expression' => 'workflow.trigger_count > 100 AND workflow.health_score > 80',
            'label' => 'High-volume healthy',
            'description' => 'High-volume workflows in good health',
        ],
    ];

    /** @return array<int, array{expression: string, label: string, description: string}> */
    public static function all(): array
    {
        return self::EXAMPLES;
    }
}
