<?php

namespace App\Services\Crm\Timeline;

use App\Services\Crm\Timeline\Contracts\TimelineProvider;

class CrmTimelineService
{
    /** @var TimelineProvider[] */
    private array $providers = [];

    public function addProvider(TimelineProvider $provider): void
    {
        $this->providers[] = $provider;
    }

    public function getTimeline(
        string $entityType,
        int $entityId,
        ?string $cursor = null,
        int $limit = 20,
        array $filters = ['all'],
    ): TimelineCollection {
        $allEvents = [];
        $hasMore = false;
        $nextCursor = null;

        foreach ($this->providers as $provider) {
            if (! $provider->supports($entityType, $entityId)) {
                continue;
            }

            $collection = $provider->getEvents(
                $entityType,
                $entityId,
                $cursor,
                $limit,
                $filters,
            );

            $allEvents = array_merge($allEvents, $collection->events);
            if ($collection->hasMore) {
                $hasMore = true;
            }
        }

        usort($allEvents, fn (TimelineEvent $a, TimelineEvent $b) => strcmp($b->timestamp, $a->timestamp));

        $merged = array_slice($allEvents, 0, $limit);

        if (count($merged) > 0) {
            $nextCursor = $merged[count($merged) - 1]->timestamp;
        }

        return new TimelineCollection($merged, $nextCursor, $hasMore);
    }
}
