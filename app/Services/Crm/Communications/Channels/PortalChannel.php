<?php

namespace App\Services\Crm\Communications\Channels;

use App\Models\CrmPortalAccount;
use App\Models\CrmPortalNotification;
use App\Services\Crm\Communications\Contracts\ChannelInterface;
use App\Services\Crm\Communications\Contracts\DeliveryTrackerInterface;
use App\Services\Crm\Communications\Contracts\TemplateRendererInterface;
use App\Services\Crm\Communications\NotificationInstruction;
use Illuminate\Support\Facades\Log;

class PortalChannel implements ChannelInterface
{
    public function __construct(
        private readonly TemplateRendererInterface $renderer,
        private readonly DeliveryTrackerInterface $tracker,
    ) {}

    public function send(NotificationInstruction $instruction): void
    {
        foreach ($instruction->recipients as $recipient) {
            $this->tracker->trackQueued(
                instruction: $instruction,
                portalAccountId: $recipient->portalAccountId,
                channel: 'portal',
            );

            $body = $this->renderer->render(
                $instruction->template,
                $instruction->payload,
                $recipient->locale,
            );

            CrmPortalNotification::create([
                'portal_account_id' => $recipient->portalAccountId,
                'type' => $instruction->template,
                'title' => $body,
                'notifiable_type' => CrmPortalAccount::class,
                'notifiable_id' => $recipient->portalAccountId,
                'metadata' => $instruction->payload,
                'idempotency_key' => $instruction->idempotencyKey.'-'.$recipient->portalAccountId,
                'read_at' => null,
            ]);

            Log::info('CRM-5 PortalChannel: created portal notification', [
                'account_id' => $recipient->portalAccountId,
                'type' => $instruction->template,
                'correlation_id' => $instruction->correlationId,
                'idempotency_key' => $instruction->idempotencyKey,
            ]);

            $this->tracker->trackSent(
                $instruction->correlationId,
                'portal',
                'pn-'.$instruction->idempotencyKey,
            );
        }
    }
}
