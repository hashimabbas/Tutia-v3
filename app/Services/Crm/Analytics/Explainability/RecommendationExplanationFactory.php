<?php

namespace App\Services\Crm\Analytics\Explainability;

class RecommendationExplanationFactory
{
    public function explain(array $recommendation): ?RecommendationExplanation
    {
        return match ($recommendation['type']) {
            'orphaned_workflow' => $this->explainOrphanedWorkflow($recommendation),
            'high_failure_rate' => $this->explainHighFailureRate($recommendation),
            'retry_candidate' => $this->explainRetryCandidate($recommendation),
            'disabled_with_history' => $this->explainDisabledWithHistory($recommendation),
            'frequent_failure' => $this->explainFrequentFailure($recommendation),
            'bottleneck_step' => $this->explainBottleneckStep($recommendation),
            'sla_risk' => $this->explainSlaRisk($recommendation),
            'high_escalation' => $this->explainHighEscalation($recommendation),
            'single_approver_risk' => $this->explainSingleApproverRisk($recommendation),
            'strategy_change' => $this->explainStrategyChange($recommendation),
            default => null,
        };
    }

    private function explainOrphanedWorkflow(array $r): RecommendationExplanation
    {
        return new RecommendationExplanation(
            summary: 'Workflow is active but has not executed recently',
            reasons: [
                new RecommendationReason('Status', 'Active', 'info'),
                new RecommendationReason('Inactive Days', '90+', 'warning'),
            ],
            recommendedActions: [
                'Review whether this workflow is still needed',
                'Deactivate if no longer relevant',
                'Schedule a periodic health check for all workflows',
            ],
        );
    }

    private function explainHighFailureRate(array $r): RecommendationExplanation
    {
        $reasons = [
            new RecommendationReason('Failure Rate', "{$r['failureRate']}%", 'critical'),
            new RecommendationReason('Failed Runs', (string) $r['failedRuns'], 'critical'),
            new RecommendationReason('Total Runs', (string) $r['totalRuns'], 'info'),
        ];

        return new RecommendationExplanation(
            summary: "Workflow failed {$r['failedRuns']} of {$r['totalRuns']} runs ({$r['failureRate']}%)",
            reasons: $reasons,
            recommendedActions: [
                'Review failing action handlers in workflow',
                'Enable retry strategy for idempotent actions',
                'Inspect workflow execution logs for root cause',
                'Add error handling and fallback actions',
            ],
        );
    }

    private function explainRetryCandidate(array $r): RecommendationExplanation
    {
        return new RecommendationExplanation(
            summary: "Action \"{$r['entityName']}\" has a {$r['failureRate']}% failure rate and is safe to retry",
            reasons: [
                new RecommendationReason('Failure Rate', "{$r['failureRate']}%", 'warning'),
                new RecommendationReason('Failed', "{$r['failureCount']}/{$r['totalCount']}", 'warning'),
                new RecommendationReason('Retryable', 'Yes', 'info'),
            ],
            recommendedActions: [
                'Add retry logic with exponential backoff',
                'Review action configuration for timeout issues',
                'Test action with sample data to verify correctness',
            ],
        );
    }

    private function explainDisabledWithHistory(array $r): RecommendationExplanation
    {
        return new RecommendationExplanation(
            summary: 'Disabled workflow has historical data worth reviewing',
            reasons: [
                new RecommendationReason('Historical Runs', (string) ($r['runs_count'] ?? 0), 'info'),
                new RecommendationReason('Status', 'Disabled', 'warning'),
            ],
            recommendedActions: [
                'Re-enable if the workflow is still relevant',
                'Archive historical data and remove if no longer needed',
                'Document why this workflow was disabled',
            ],
        );
    }

    private function explainFrequentFailure(array $r): RecommendationExplanation
    {
        return new RecommendationExplanation(
            summary: "Action \"{$r['entityName']}\" failed {$r['failCount']} times in the last 30 days",
            reasons: [
                new RecommendationReason('Failures (30d)', (string) $r['failCount'], 'warning'),
                new RecommendationReason('Period', 'Last 30 days', 'info'),
            ],
            recommendedActions: [
                'Investigate root cause of recurring failures',
                'Check action dependencies and external services',
                'Review error logs for failure patterns',
                'Consider replacing with a more reliable action',
            ],
        );
    }

    private function explainBottleneckStep(array $r): RecommendationExplanation
    {
        return new RecommendationExplanation(
            summary: "Step {$r['stepOrder']} ({$r['stepName']}) takes {$r['ratio']}x longer than the flow average",
            reasons: [
                new RecommendationReason('Avg Decision Time', "{$r['avgTimeMinutes']}m", 'warning'),
                new RecommendationReason('Flow Average', "{$r['flowAvgMinutes']}m", 'info'),
                new RecommendationReason('Bottleneck Ratio', "{$r['ratio']}x", 'warning'),
            ],
            recommendedActions: [
                'Add a backup approver for this step',
                'Review step configuration for unnecessary complexity',
                'Set a decision timeout to auto-escalate',
            ],
        );
    }

    private function explainSlaRisk(array $r): RecommendationExplanation
    {
        $severity = $r['ratio'] >= 1.0 ? 'critical' : 'warning';

        return new RecommendationExplanation(
            summary: "Avg resolution {$r['avgResolutionMinutes']}m vs {$r['slaBreachMinutes']}m SLA ({$r['breachCount']} breaches)",
            reasons: [
                new RecommendationReason('Avg Resolution', "{$r['avgResolutionMinutes']}m", $severity),
                new RecommendationReason('SLA Threshold', "{$r['slaBreachMinutes']}m", 'info'),
                new RecommendationReason('Breaches', (string) $r['breachCount'], $severity),
                new RecommendationReason('SLA Ratio', (string) $r['ratio'], $severity),
            ],
            recommendedActions: [
                'Increase SLA threshold if current is unrealistic',
                'Streamline approval flow to reduce cycle time',
                'Add parallel approval steps where possible',
                'Set up SLA breach notifications for early warning',
            ],
        );
    }

    private function explainHighEscalation(array $r): RecommendationExplanation
    {
        return new RecommendationExplanation(
            summary: "Escalation rate {$r['escalationRate']}% ({$r['escalatedCount']}/{$r['totalRequests']}) with {$r['stepsCount']} steps",
            reasons: [
                new RecommendationReason('Escalation Rate', "{$r['escalationRate']}%", 'warning'),
                new RecommendationReason('Escalated', "{$r['escalatedCount']}/{$r['totalRequests']}", 'warning'),
                new RecommendationReason('Approval Steps', (string) $r['stepsCount'], 'info'),
            ],
            recommendedActions: [
                'Reduce the number of approval steps',
                'Switch to first-approver-wins strategy',
                'Review escalation rules and thresholds',
            ],
        );
    }

    private function explainSingleApproverRisk(array $r): RecommendationExplanation
    {
        return new RecommendationExplanation(
            summary: "Step {$r['stepOrder']} has {$r['slowDecisions']} decisions taking over 24 hours",
            reasons: [
                new RecommendationReason('Slow Decisions', (string) $r['slowDecisions'], 'warning'),
                new RecommendationReason('Step', (string) $r['stepOrder'], 'info'),
                new RecommendationReason('Delay Threshold', '>24h', 'warning'),
            ],
            recommendedActions: [
                'Add a backup approver for this step',
                'Set a maximum decision time with auto-escalation',
                'Notify approver when decisions are pending >12h',
            ],
        );
    }

    private function explainStrategyChange(array $r): RecommendationExplanation
    {
        return new RecommendationExplanation(
            summary: "Unanimous approval flow has {$r['escalationRate']}% escalation rate",
            reasons: [
                new RecommendationReason('Escalation Rate', "{$r['escalationRate']}%", 'info'),
                new RecommendationReason('Current Strategy', $r['currentStrategy'], 'info'),
            ],
            recommendedActions: [
                'Consider switching to first-approver-wins',
                'Consider majority vote strategy',
                'Reduce the number of required approvers',
            ],
        );
    }
}
