<?php

namespace App\Services\Crm\Communications\Contracts;

use App\Services\Crm\Communications\NotificationInstruction;

interface ChannelInterface
{
    public function send(NotificationInstruction $instruction): void;
}
