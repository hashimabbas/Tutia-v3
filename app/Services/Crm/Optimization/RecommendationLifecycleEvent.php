<?php

namespace App\Services\Crm\Optimization;

use JsonSerializable;

readonly class RecommendationLifecycleEvent implements JsonSerializable
{
    public function __construct(
        public string $recommendationType,
        public LifecycleStatus $status,
        public RecommendationTarget $target,
        public RecommendationSnapshot $snapshot,
        public ?RecommendationVersion $version = null,
        public array $metadata = [],
        public ?string $statusChangedAt = null,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'recommendation_type' => $this->recommendationType,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'target' => $this->target->jsonSerialize(),
            'snapshot' => $this->snapshot->jsonSerialize(),
            'version' => $this->version?->jsonSerialize(),
            'metadata' => $this->metadata,
            'status_changed_at' => $this->statusChangedAt,
        ];
    }
}
