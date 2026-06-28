<?php

namespace App\Services\Crm\Optimization;

use JsonSerializable;

readonly class RecommendationSnapshot implements JsonSerializable
{
    public function __construct(
        public array $metrics,
        public ?float $healthScore = null,
        public ?string $trend = null,
        public string $recommendationVersion = 'v1',
        public ?string $generatedAt = null,
        public array $context = [],
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'metrics' => $this->metrics,
            'health_score' => $this->healthScore,
            'trend' => $this->trend,
            'recommendation_version' => $this->recommendationVersion,
            'generated_at' => $this->generatedAt,
            'context' => $this->context,
        ];
    }
}
