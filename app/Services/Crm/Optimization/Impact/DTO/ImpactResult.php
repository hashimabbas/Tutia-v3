<?php

namespace App\Services\Crm\Optimization\Impact\DTO;

use JsonSerializable;

readonly class ImpactResult implements JsonSerializable
{
    public function __construct(
        public float $overallScore,
        public float $healthDelta,
        public array $metrics,
        public array $improvements,
        public array $regressions,
        public string $summary,
        public string $classification,
        public float $totalWeight,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'overall_score' => $this->overallScore,
            'health_delta' => $this->healthDelta,
            'metrics' => array_map(fn (MetricImpact $m) => $m->jsonSerialize(), $this->metrics),
            'improvements' => $this->improvements,
            'regressions' => $this->regressions,
            'summary' => $this->summary,
            'classification' => $this->classification,
            'total_weight' => $this->totalWeight,
        ];
    }
}
