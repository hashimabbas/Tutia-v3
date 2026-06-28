<?php

namespace App\Services\Crm\Optimization\Center\Services;

use App\Services\Crm\Optimization\Center\DTO\OptimizationHealth;

class OptimizationHealthService
{
    public function assess(
        array $lifecycleStats,
        ?array $impactResults = null,
        ?array $automationScore = null,
        ?float $adoptionRate = null,
        ?float $verificationRate = null,
    ): OptimizationHealth {
        $components = [];
        $totalScore = 0.0;
        $weightSum = 0.0;

        $componentDefs = [
            ['name' => 'Recommendation Lifecycle', 'weight' => 0.20, 'score' => $this->computeLifecycleHealth($lifecycleStats)],
            ['name' => 'Impact Performance', 'weight' => 0.25, 'score' => $this->computeImpactHealth($impactResults)],
            ['name' => 'Automation Score', 'weight' => 0.25, 'score' => $this->computeScoreHealth($automationScore)],
            ['name' => 'Recommendation Adoption', 'weight' => 0.15, 'score' => $this->computeAdoptionHealth($adoptionRate)],
            ['name' => 'Verification Success', 'weight' => 0.15, 'score' => $this->computeVerificationHealth($verificationRate)],
        ];

        $statusDistribution = ['healthy' => 0, 'warning' => 0, 'critical' => 0];

        foreach ($componentDefs as $def) {
            $status = match (true) {
                $def['score'] >= 70 => 'healthy',
                $def['score'] >= 40 => 'warning',
                default => 'critical',
            };

            $components[] = [
                'name' => $def['name'],
                'score' => $def['score'],
                'weight' => $def['weight'],
                'status' => $status,
            ];

            $statusDistribution[$status]++;
            $totalScore += $def['score'] * $def['weight'];
            $weightSum += $def['weight'];
        }

        $maturity = $weightSum > 0 ? round($totalScore / $weightSum, 2) : 0.0;

        $recentChanges = $this->buildRecentChanges($lifecycleStats);

        return new OptimizationHealth(
            maturity: $maturity,
            components: $components,
            statusDistribution: $statusDistribution,
            recentChanges: $recentChanges,
        );
    }

    private function computeLifecycleHealth(array $stats): float
    {
        $total = $stats['total_events'] ?? 0;
        $completed = ($stats['total_completed'] ?? 0) + ($stats['total_verified'] ?? 0);

        if ($total === 0) {
            return 0.0;
        }

        return round(($completed / $total) * 100, 2);
    }

    private function computeImpactHealth(?array $results): float
    {
        if ($results === null || empty($results)) {
            return 0.0;
        }

        $scores = array_filter(array_map(fn ($r) => $r['overallScore'] ?? null, $results));

        return ! empty($scores) ? round(array_sum($scores) / count($scores), 2) : 0.0;
    }

    private function computeScoreHealth(?array $score): float
    {
        return $score['overall_score'] ?? 0.0;
    }

    private function computeAdoptionHealth(?float $rate): float
    {
        if ($rate === null) {
            return 0.0;
        }

        return round(min(100, $rate * 100), 2);
    }

    private function computeVerificationHealth(?float $rate): float
    {
        if ($rate === null) {
            return 0.0;
        }

        return round(min(100, $rate * 100), 2);
    }

    private function buildRecentChanges(array $stats): array
    {
        $changes = [];

        if (($stats['total_verified'] ?? 0) > 0) {
            $changes[] = [
                'metric' => 'verification_rate',
                'label' => 'Verification Rate',
                'status' => $stats['total_verified'] >= ($stats['total_applied'] ?? 0) * 0.7 ? 'improved' : 'stable',
            ];
        }

        return $changes;
    }
}
