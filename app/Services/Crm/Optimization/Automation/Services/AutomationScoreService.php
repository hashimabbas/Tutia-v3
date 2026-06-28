<?php

namespace App\Services\Crm\Optimization\Automation\Services;

use App\Services\Crm\Optimization\Automation\DTO\AutomationScore;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreBreakdown;
use App\Services\Crm\Optimization\Automation\DTO\ScoreTrend;
use App\Services\Crm\Optimization\Automation\Registries\AutomationScoreRegistryInterface;

class AutomationScoreService
{
    public function __construct(
        private ScoreCalculator $calculator,
        private ScoreClassificationService $classificationService,
        private ScoreExplainabilityService $explainabilityService,
        private AutomationScoreRegistryInterface $registry,
    ) {}

    public function score(
        array $lifecycleStats,
        ?array $impactResults = null,
        ?ScoreTrend $trend = null,
    ): AutomationScore {
        $componentScores = [];
        $breakdown = [];

        foreach ($this->registry->metrics() as $metric) {
            $score = $this->computeComponent($metric, $lifecycleStats, $impactResults);
            $componentScores[$metric] = $score;

            $breakdown[] = new AutomationScoreBreakdown(
                label: $this->registry->label($metric),
                score: $score,
                weight: $this->registry->weight($metric),
                description: $this->registry->description($metric),
            );
        }

        $overallScore = $this->calculator->calculate($componentScores, $this->registry);
        $classification = $this->classificationService->classify($overallScore);

        $dummyScore = new AutomationScore(
            overallScore: $overallScore,
            breakdown: $breakdown,
            classification: $classification,
            summary: '',
            trend: $trend,
        );

        $summary = $this->explainabilityService->generateSummary($dummyScore);

        return new AutomationScore(
            overallScore: $overallScore,
            breakdown: $breakdown,
            classification: $classification,
            summary: $summary,
            trend: $trend,
        );
    }

    public function scoreById(
        int $targetId,
        string $targetType = 'workflow',
        array $lifecycleStats = [],
        ?array $impactResults = null,
        ?ScoreTrend $trend = null,
    ): AutomationScore {
        return $this->score(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            trend: $trend,
        );
    }

    private function computeComponent(string $metric, array $lifecycleStats, ?array $impactResults): float
    {
        return match ($metric) {
            'impact_success' => $this->computeImpactSuccess($impactResults),
            'adoption_rate' => $this->computeAdoptionRate($lifecycleStats),
            'verification_rate' => $this->computeVerificationRate($lifecycleStats),
            'lifecycle_completion' => $this->computeLifecycleCompletion($lifecycleStats),
            'avg_improvement' => $this->computeAvgImprovement($impactResults),
            'cycle_time' => $this->computeCycleTime($lifecycleStats),
            'sla_compliance' => $this->computeSlaCompliance($lifecycleStats),
            default => 0.0,
        };
    }

    private function computeImpactSuccess(?array $impactResults): float
    {
        if ($impactResults === null || empty($impactResults)) {
            return 0.0;
        }

        $totalScore = 0.0;
        $count = 0;

        foreach ($impactResults as $result) {
            if (isset($result['overallScore'])) {
                $totalScore += $result['overallScore'];
                $count++;
            }
        }

        if ($count === 0) {
            return 0.0;
        }

        return round($totalScore / $count, 2);
    }

    private function computeAdoptionRate(array $lifecycleStats): float
    {
        $total = $lifecycleStats['total_viewed'] ?? 0;
        $accepted = $lifecycleStats['total_accepted'] ?? 0;

        if ($total === 0) {
            return 0.0;
        }

        return round(($accepted / $total) * 100, 2);
    }

    private function computeVerificationRate(array $lifecycleStats): float
    {
        $applied = $lifecycleStats['total_applied'] ?? 0;
        $verified = $lifecycleStats['total_verified'] ?? 0;

        if ($applied === 0) {
            return 0.0;
        }

        return round(($verified / $applied) * 100, 2);
    }

    private function computeLifecycleCompletion(array $lifecycleStats): float
    {
        $total = $lifecycleStats['total_events'] ?? 0;
        $completed = ($lifecycleStats['total_completed'] ?? 0) + ($lifecycleStats['total_verified'] ?? 0);

        if ($total === 0) {
            return 0.0;
        }

        return round(($completed / $total) * 100, 2);
    }

    private function computeAvgImprovement(?array $impactResults): float
    {
        if ($impactResults === null || empty($impactResults)) {
            return 0.0;
        }

        $totalImprovement = 0.0;
        $count = 0;

        foreach ($impactResults as $result) {
            if (isset($result['improvements']) && is_array($result['improvements'])) {
                foreach ($result['improvements'] as $imp) {
                    $totalImprovement += abs($imp['percentage'] ?? 0);
                    $count++;
                }
            }
        }

        if ($count === 0) {
            return 0.0;
        }

        return round(min(100, $totalImprovement / $count), 2);
    }

    private function computeCycleTime(array $lifecycleStats): float
    {
        $avgHours = $lifecycleStats['avg_cycle_hours'] ?? 0;

        if ($avgHours <= 0) {
            return 0.0;
        }

        $score = max(0, 100 - ($avgHours / 24));

        return round(min(100, $score), 2);
    }

    private function computeSlaCompliance(array $lifecycleStats): float
    {
        return round($lifecycleStats['sla_compliance_pct'] ?? 0, 2);
    }
}
