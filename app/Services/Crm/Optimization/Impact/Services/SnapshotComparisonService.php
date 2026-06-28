<?php

namespace App\Services\Crm\Optimization\Impact\Services;

use App\Services\Crm\Optimization\Impact\DTO\MetricImpact;
use App\Services\Crm\Optimization\Impact\Registries\ImpactMetricRegistryInterface;
use App\Services\Crm\Optimization\RecommendationSnapshot;

class SnapshotComparisonService
{
    public function compare(
        RecommendationSnapshot $before,
        RecommendationSnapshot $after,
        ImpactMetricRegistryInterface $registry,
    ): array {
        $impacts = [];

        foreach ($registry->metrics() as $metric) {
            $beforeValue = $before->metrics[$metric] ?? null;
            $afterValue = $after->metrics[$metric] ?? null;

            if ($beforeValue === null || $afterValue === null) {
                continue;
            }

            $impacts[] = MetricImpact::compare(
                metric: $metric,
                before: (float) $beforeValue,
                after: (float) $afterValue,
                weight: $registry->weight($metric),
                direction: $registry->direction($metric),
            );
        }

        return $impacts;
    }
}
