<?php

namespace App\Services\Crm\Communications\Contracts;

use App\Services\Crm\Communications\NotificationInstruction;

interface DeliveryTrackerInterface
{
    public function trackQueued(NotificationInstruction $instruction, int $portalAccountId, string $channel): void;

    public function trackSent(string $correlationId, string $channel, string $providerMessageId): void;

    public function trackDelivered(string $correlationId, string $channel): void;

    public function trackFailed(string $correlationId, string $channel, string $errorMessage): void;
}
