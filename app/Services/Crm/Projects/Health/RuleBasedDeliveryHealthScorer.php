<?php

namespace App\Services\Crm\Projects\Health;

use App\Models\CrmProject;
use App\Services\Crm\Projects\Health\Contributors\ChangeOrderStabilityContributor;
use App\Services\Crm\Projects\Health\Contributors\ContributorInterface;
use App\Services\Crm\Projects\Health\Contributors\CustomerSentimentContributor;
use App\Services\Crm\Projects\Health\Contributors\IssueImpactContributor;
use App\Services\Crm\Projects\Health\Contributors\MilestoneProgressContributor;
use App\Services\Crm\Projects\Health\Contributors\RiskImpactContributor;
use App\Services\Crm\Projects\Health\Contributors\ScheduleVarianceContributor;

class RuleBasedDeliveryHealthScorer implements DeliveryHealthScorerInterface
{
    private array $contributors;

    public function __construct()
    {
        $this->contributors = [
            new MilestoneProgressContributor,
            new ScheduleVarianceContributor,
            new RiskImpactContributor,
            new IssueImpactContributor,
            new CustomerSentimentContributor,
            new ChangeOrderStabilityContributor,
        ];
    }

    public function addContributor(ContributorInterface $contributor): void
    {
        $this->contributors[] = $contributor;
    }

    public function calculate(CrmProject $project): DeliveryHealthResult
    {
        $factors = [];
        $totalScore = 0;

        foreach ($this->contributors as $contributor) {
            $factor = $contributor->calculate($project);
            $factors[] = $factor;
            $totalScore += $factor['score'];
        }

        $score = min(100, max(0, $totalScore));
        $tier = $this->determineTier($score);

        return new DeliveryHealthResult(
            score: $score,
            tier: $tier,
            factors: $factors,
        );
    }

    private function determineTier(int $score): string
    {
        return match (true) {
            $score >= 80 => 'healthy',
            $score >= 50 => 'at_risk',
            default => 'critical',
        };
    }
}
