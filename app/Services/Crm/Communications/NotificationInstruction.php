<?php

namespace App\Services\Crm\Communications;

class NotificationInstruction
{
    /**
     * @param  array<int, string>  $channels
     * @param  array<int, RecipientTarget>  $recipients
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly string $event,
        public readonly string $template,
        public readonly array $channels,
        public readonly array $recipients,
        public readonly array $payload,
        public readonly string $correlationId,
        public readonly string $idempotencyKey,
    ) {}
}
