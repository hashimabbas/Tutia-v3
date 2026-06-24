<?php

namespace App\Services\Crm\Analytics\Explainability;

readonly class RecommendationExplanation implements \JsonSerializable
{
    public function __construct(
        public string $summary,
        public array $reasons,
        public array $recommendedActions,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'summary' => $this->summary,
            'reasons' => $this->reasons,
            'recommendedActions' => $this->recommendedActions,
        ];
    }
}
