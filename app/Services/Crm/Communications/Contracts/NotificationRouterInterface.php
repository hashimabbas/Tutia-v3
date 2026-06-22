<?php

namespace App\Services\Crm\Communications\Contracts;

interface NotificationRouterInterface
{
    public function route(string $eventClass): ?array;
}
