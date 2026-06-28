<?php

namespace App\Services\Crm\Optimization\Center\Services;

use App\Services\Crm\Optimization\Center\DTO\OptimizationDashboard;

class OptimizationDashboardService
{
    public function build(
        array $lifecycleStats,
        ?array $impactResults = null,
        ?array $automationScore = null,
        ?array $trend = null,
        ?array $analytics = null,
    ): OptimizationDashboard {
        $totalRecommendations = $lifecycleStats['total_events'] ?? 0;
        $active = ($lifecycleStats['total_viewed'] ?? 0) - ($lifecycleStats['total_completed'] ?? 0);
        $completed = $lifecycleStats['total_completed'] ?? 0;
        $avgImpact = $this->computeAvgImpact($impactResults);

        $overallStats = [
            'total_recommendations' => max(0, $totalRecommendations),
            'active_recommendations' => max(0, $active),
            'completed_recommendations' => max(0, $completed),
            'avg_impact_score' => $avgImpact,
        ];

        $recentActivity = $this->buildRecentActivity($lifecycleStats, $impactResults);

        return new OptimizationDashboard(
            overallStats: $overallStats,
            automationScore: $automationScore ?? [],
            health: [],
            trend: $trend ?? [],
            recentActivity: $recentActivity,
        );
    }

    private function computeAvgImpact(?array $impactResults): float
    {
        if ($impactResults === null || empty($impactResults)) {
            return 0.0;
        }

        $scores = array_filter(array_map(fn ($r) => $r['overallScore'] ?? null, $impactResults));

        return ! empty($scores) ? round(array_sum($scores) / count($scores), 2) : 0.0;
    }

    private function buildRecentActivity(array $lifecycleStats, ?array $impactResults): array
    {
        $activity = [];

        if (($lifecycleStats['total_verified'] ?? 0) > 0) {
            $activity[] = [
                'type' => 'verification',
                'count' => $lifecycleStats['total_verified'],
                'label' => 'Recommendations verified',
            ];
        }

        if (($lifecycleStats['total_completed'] ?? 0) > 0) {
            $activity[] = [
                'type' => 'completion',
                'count' => $lifecycleStats['total_completed'],
                'label' => 'Lifecycles completed',
            ];
        }

        if ($impactResults !== null) {
            $totalImprovements = 0;
            foreach ($impactResults as $result) {
                $totalImprovements += count($result['improvements'] ?? []);
            }
            if ($totalImprovements > 0) {
                $activity[] = [
                    'type' => 'improvement',
                    'count' => $totalImprovements,
                    'label' => 'Metric improvements detected',
                ];
            }
        }

        return $activity;
    }
}
