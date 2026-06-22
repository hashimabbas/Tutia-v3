<?php

namespace App\Services\Crm\Communications\Channels;

use App\Services\Crm\Communications\Contracts\ChannelInterface;
use App\Services\Crm\Communications\Contracts\DeliveryTrackerInterface;
use App\Services\Crm\Communications\Contracts\TemplateRendererInterface;
use App\Services\Crm\Communications\NotificationInstruction;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel implements ChannelInterface
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
                channel: 'whatsapp',
            );

            $body = $this->renderer->render(
                $instruction->template,
                $instruction->payload,
                $recipient->locale,
            );

            Log::info('CRM-5 WhatsAppChannel: would send WhatsApp message', [
                'account_id' => $recipient->portalAccountId,
                'template' => $instruction->template,
                'body' => $body,
                'correlation_id' => $instruction->correlationId,
            ]);

            $this->tracker->trackSent(
                $instruction->correlationId,
                'whatsapp',
                'wa-'.str()->random(16),
            );
        }
    }
}
