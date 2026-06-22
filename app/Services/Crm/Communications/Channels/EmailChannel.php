<?php

namespace App\Services\Crm\Communications\Channels;

use App\Services\Crm\Communications\Contracts\ChannelInterface;
use App\Services\Crm\Communications\Contracts\DeliveryTrackerInterface;
use App\Services\Crm\Communications\Contracts\TemplateRendererInterface;
use App\Services\Crm\Communications\NotificationInstruction;
use Illuminate\Support\Facades\Log;

class EmailChannel implements ChannelInterface
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
                channel: 'email',
            );

            if ($recipient->email === '') {
                $this->tracker->trackFailed(
                    $instruction->correlationId,
                    'email',
                    'No email address for account '.$recipient->portalAccountId,
                );

                continue;
            }

            $body = $this->renderer->render(
                $instruction->template,
                $instruction->payload,
                $recipient->locale,
            );

            Log::info('CRM-5 EmailChannel: would send email', [
                'to' => $recipient->email,
                'template' => $instruction->template,
                'body' => $body,
                'correlation_id' => $instruction->correlationId,
            ]);

            $this->tracker->trackSent(
                $instruction->correlationId,
                'email',
                'log-'.str()->random(16),
            );
        }
    }
}
