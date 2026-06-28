<?php

namespace App\Services\Crm\Optimization\Automation\DTO;

use JsonSerializable;

readonly class AutomationScoreSnapshot implements JsonSerializable
{
    public function __construct(
        public string $date,
        public float $overallScore,
        public string $classification,
        public array $breakdown,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'date' => $this->date,
            'overall_score' => $this->overallScore,
            'classification' => $this->classification,
            'breakdown' => array_map(fn (AutomationScoreBreakdown $b) => $b->jsonSerialize(), $this->breakdown),
        ];
    }
}
