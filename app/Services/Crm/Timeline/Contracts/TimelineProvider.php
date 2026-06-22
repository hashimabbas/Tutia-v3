<?php

namespace App\Services\Crm\Timeline\Contracts;

use App\Services\Crm\Timeline\TimelineCollection;

interface TimelineProvider
{
    public function supports(string $entityType, int $entityId): bool;

    public function getEvents(
        string $entityType,
        int $entityId,
        ?string $cursor,
        int $limit,
        array $filters,
    ): TimelineCollection;
}
