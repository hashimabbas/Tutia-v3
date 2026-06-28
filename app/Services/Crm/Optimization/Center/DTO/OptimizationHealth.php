<?php

namespace App\Services\Crm\Optimization\Center\DTO;

use JsonSerializable;

readonly class OptimizationHealth implements JsonSerializable
{
    public function __construct(
        public float $maturity,
        public array $components,
        public array $statusDistribution,
        public array $recentChanges,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'maturity' => $this->maturity,
            'components' => $this->components,
            'status_distribution' => $this->statusDistribution,
            'recent_changes' => $this->recentChanges,
        ];
    }
}
