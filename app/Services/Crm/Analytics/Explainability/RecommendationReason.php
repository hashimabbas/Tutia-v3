<?php

namespace App\Services\Crm\Analytics\Explainability;

readonly class RecommendationReason implements \JsonSerializable
{
    public function __construct(
        public string $label,
        public string $value,
        public string $severity,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'label' => $this->label,
            'value' => $this->value,
            'severity' => $this->severity,
        ];
    }
}
