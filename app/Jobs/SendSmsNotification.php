<?php

namespace App\Jobs;

use App\Services\Crm\Communications\Channels\SmsChannel;
use App\Services\Crm\Communications\NotificationInstruction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendSmsNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public string $queue = 'communications-sms';

    public function __construct(
        public readonly NotificationInstruction $instruction,
    ) {}

    public function handle(SmsChannel $channel): void
    {
        $channel->send($this->instruction);
    }
}
