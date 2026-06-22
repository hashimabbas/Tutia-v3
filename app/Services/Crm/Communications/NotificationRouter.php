<?php

namespace App\Services\Crm\Communications;

use App\Services\Crm\Communications\Contracts\NotificationRouterInterface;
use App\Services\Crm\Communications\Registry\NotificationMap;

class NotificationRouter implements NotificationRouterInterface
{
    public function __construct(
        private readonly NotificationMap $map,
    ) {}

    public function route(string $eventClass): ?array
    {
        $config = $this->map->get($eventClass);

        if ($config === null) {
            return null;
        }

        return [
            'template' => $config['template'],
            'channels' => $config['channels'],
        ];
    }
}
