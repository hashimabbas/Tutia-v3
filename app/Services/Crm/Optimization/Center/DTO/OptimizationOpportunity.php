<?php

namespace App\Services\Crm\Optimization\Center\DTO;

use JsonSerializable;

readonly class OptimizationOpportunity implements JsonSerializable
{
    public function __construct(
        public string $id,
        public string $title,
        public string $priority,
        public float $expectedGain,
        public float $confidence,
        public string $estimatedEffort,
        public string $category,
        public array $dependencies,
        public string $recommendationType,
        public int $targetId,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'priority' => $this->priority,
            'expected_gain' => $this->expectedGain,
            'confidence' => $this->confidence,
            'estimated_effort' => $this->estimatedEffort,
            'category' => $this->category,
            'dependencies' => $this->dependencies,
            'recommendation_type' => $this->recommendationType,
            'target_id' => $this->targetId,
        ];
    }
}
