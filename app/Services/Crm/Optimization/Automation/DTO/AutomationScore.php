<?php

namespace App\Services\Crm\Optimization\Automation\DTO;

use JsonSerializable;

readonly class AutomationScore implements JsonSerializable
{
    public function __construct(
        public float $overallScore,
        public array $breakdown,
        public string $classification,
        public string $summary,
        public ?ScoreTrend $trend = null,
        public array $metadata = [],
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'overall_score' => $this->overallScore,
            'breakdown' => array_map(fn (AutomationScoreBreakdown $b) => $b->jsonSerialize(), $this->breakdown),
            'classification' => $this->classification,
            'summary' => $this->summary,
            'trend' => $this->trend?->jsonSerialize(),
            'metadata' => $this->metadata,
        ];
    }
}
