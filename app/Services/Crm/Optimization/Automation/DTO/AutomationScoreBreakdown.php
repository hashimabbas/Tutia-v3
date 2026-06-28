<?php

namespace App\Services\Crm\Optimization\Automation\DTO;

use JsonSerializable;

readonly class AutomationScoreBreakdown implements JsonSerializable
{
    public function __construct(
        public string $label,
        public float $score,
        public float $weight,
        public string $description,
    ) {}

    public function weightedScore(): float
    {
        return round($this->score * $this->weight, 2);
    }

    public function jsonSerialize(): array
    {
        return [
            'label' => $this->label,
            'score' => $this->score,
            'weight' => $this->weight,
            'description' => $this->description,
            'weighted_score' => $this->weightedScore(),
        ];
    }
}
