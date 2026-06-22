<?php

namespace App\Services\Crm\Communications;

use App\Models\CrmCommunicationLog;
use App\Services\Crm\Communications\Contracts\DeliveryTrackerInterface;

class DeliveryTracker implements DeliveryTrackerInterface
{
    public function trackQueued(NotificationInstruction $instruction, int $portalAccountId, string $channel): void
    {
        CrmCommunicationLog::create([
            'portal_account_id' => $portalAccountId,
            'correlation_id' => $instruction->correlationId,
            'channel' => $channel,
            'template' => $instruction->template,
            'status' => 'queued',
            'provider_response' => [
                'event' => $instruction->event,
                'payload' => $instruction->payload,
                'idempotency_key' => $instruction->idempotencyKey,
                'recipient_locale' => $this->findRecipientLocale($instruction, $portalAccountId),
            ],
        ]);
    }

    public function trackSent(string $correlationId, string $channel, string $providerMessageId): void
    {
        CrmCommunicationLog::where('correlation_id', $correlationId)
            ->where('channel', $channel)
            ->where('status', 'queued')
            ->update([
                'status' => 'sent',
                'provider_message_id' => $providerMessageId,
            ]);
    }

    public function trackDelivered(string $correlationId, string $channel): void
    {
        CrmCommunicationLog::where('correlation_id', $correlationId)
            ->where('channel', $channel)
            ->where('status', 'sent')
            ->update([
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);
    }

    public function trackFailed(string $correlationId, string $channel, string $errorMessage): void
    {
        CrmCommunicationLog::where('correlation_id', $correlationId)
            ->where('channel', $channel)
            ->whereIn('status', ['queued', 'sent'])
            ->update([
                'status' => 'failed',
                'error_message' => $errorMessage,
            ]);
    }

    private function findRecipientLocale(NotificationInstruction $instruction, int $portalAccountId): string
    {
        foreach ($instruction->recipients as $recipient) {
            if ($recipient->portalAccountId === $portalAccountId) {
                return $recipient->locale;
            }
        }

        return 'en';
    }
}
