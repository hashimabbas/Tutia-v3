<?php

namespace App\Services\Crm\Timeline;

class TimelineCollection
{
    public function __construct(
        /** @var TimelineEvent[] */
        public readonly array $events,
        public readonly ?string $nextCursor,
        public readonly bool $hasMore,
    ) {}
}
