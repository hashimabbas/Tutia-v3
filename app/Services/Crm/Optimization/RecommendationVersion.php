<?php

namespace App\Services\Crm\Optimization;

use JsonSerializable;

readonly class RecommendationVersion implements JsonSerializable
{
    public function __construct(
        public string $type,
        public int $versionNumber,
        public int $priority,
        public array $parameters = [],
        public ?string $generatedAt = null,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type,
            'version_number' => $this->versionNumber,
            'priority' => $this->priority,
            'parameters' => $this->parameters,
            'generated_at' => $this->generatedAt,
        ];
    }
}
