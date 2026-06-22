<?php

namespace App\Jobs;

use App\Services\Crm\Communications\NotificationInstruction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DispatchNotificationInstruction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public string $queue = 'default';

    public function __construct(
        public readonly NotificationInstruction $instruction,
    ) {}

    public function handle(): void
    {
        if (in_array('email', $this->instruction->channels, true)) {
            SendEmailNotification::dispatch($this->instruction);
        }

        if (in_array('whatsapp', $this->instruction->channels, true)) {
            SendWhatsAppNotification::dispatch($this->instruction);
        }

        if (in_array('sms', $this->instruction->channels, true)) {
            SendSmsNotification::dispatch($this->instruction);
        }

        if (in_array('portal', $this->instruction->channels, true)) {
            SendPortalNotification::dispatch($this->instruction);
        }
    }
}
