<?php

namespace App\Services\Crm\Optimization;

use JsonSerializable;

readonly class RecommendationTarget implements JsonSerializable
{
    public function __construct(
        public string $targetType,
        public int $targetId,
        public ?string $targetLabel = null,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'target_type' => $this->targetType,
            'target_id' => $this->targetId,
            'target_label' => $this->targetLabel,
        ];
    }
}
