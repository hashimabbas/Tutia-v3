<?php

namespace App\Services\Crm\Optimization\Impact\Services;

use App\Services\Crm\Optimization\Impact\DTO\ImpactResult;
use App\Services\Crm\Optimization\Impact\DTO\MetricImpact;
use App\Services\Crm\Optimization\Impact\Registries\ImpactMetricRegistryInterface;
use App\Services\Crm\Optimization\RecommendationSnapshot;

class RecommendationImpactService
{
    public function __construct(
        private SnapshotComparisonService $comparisonService,
        private ImpactClassificationService $classificationService,
        private ImpactExplainabilityService $explainabilityService,
        private ImpactMetricRegistryInterface $registry,
    ) {}

    public function measure(
        RecommendationSnapshot $before,
        RecommendationSnapshot $after,
    ): ImpactResult {
        $metricImpacts = $this->comparisonService->compare($before, $after, $this->registry);

        $totalWeight = array_sum(array_map(fn (MetricImpact $m) => $m->weight, $metricImpacts));

        $overallScore = $totalWeight > 0
            ? round((array_sum(array_map(fn (MetricImpact $m) => $m->score, $metricImpacts)) / $totalWeight) * 100, 1)
            : 0.0;

        $healthDelta = $after->healthScore !== null && $before->healthScore !== null
            ? round($after->healthScore - $before->healthScore, 1)
            : 0.0;

        $improvements = array_values(array_filter(
            $metricImpacts,
            fn (MetricImpact $m) => $m->isImprovement(),
        ));

        $regressions = array_values(array_filter(
            $metricImpacts,
            fn (MetricImpact $m) => ! $m->isImprovement() && $m->delta !== 0.0,
        ));

        $classification = $this->classificationService->classify($overallScore);

        $summary = $this->buildSummary($overallScore, $classification, $improvements, $regressions);

        return new ImpactResult(
            overallScore: $overallScore,
            healthDelta: $healthDelta,
            metrics: $metricImpacts,
            improvements: array_map(fn (MetricImpact $m) => [
                'metric' => $m->metric,
                'before' => $m->before,
                'after' => $m->after,
                'delta' => $m->delta,
                'percentage' => $m->percentage,
                'direction' => $this->directionWord($m->delta),
            ], $improvements),
            regressions: array_map(fn (MetricImpact $m) => [
                'metric' => $m->metric,
                'before' => $m->before,
                'after' => $m->after,
                'delta' => $m->delta,
                'percentage' => $m->percentage,
                'direction' => $this->directionWord($m->delta),
            ], $regressions),
            summary: $summary,
            classification: $classification,
            totalWeight: $totalWeight,
        );
    }

    private function buildSummary(
        float $overallScore,
        string $classification,
        array $improvements,
        array $regressions,
    ): string {
        $parts = [];

        $parts[] = "Overall impact score: {$overallScore}/100 ({$classification}).";

        $impCount = count($improvements);
        $regCount = count($regressions);

        if ($impCount > 0) {
            $parts[] = "{$impCount} metric(s) improved.";
        }

        if ($regCount > 0) {
            $parts[] = "{$regCount} metric(s) regressed.";
        }

        if ($impCount === 0 && $regCount === 0) {
            $parts[] = 'No significant metric changes detected.';
        }

        return implode(' ', $parts);
    }

    private function directionWord(float $delta): string
    {
        return match (true) {
            $delta > 0 => 'increased',
            $delta < 0 => 'decreased',
            default => 'unchanged',
        };
    }
}
