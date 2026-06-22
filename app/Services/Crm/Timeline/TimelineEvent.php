<?php

namespace App\Services\Crm\Timeline;

class TimelineEvent
{
    public function __construct(
        public readonly string $eventId,
        public readonly string $eventType,
        public readonly string $eventCategory,
        public readonly string $icon,
        public readonly string $color,
        public readonly string $occurredAt,
        public readonly ?int $actorId,
        public readonly array $actor,
        public readonly string $summary,
        public readonly ?string $description,
        public readonly string $source,
        public readonly string $entityType,
        public readonly int $entityId,
        public readonly array $entityBreadcrumb,
        public readonly array $metadata,
    ) {}
}
