<?php

namespace App\Services\Crm\Communications\Contracts;

use App\Services\Crm\Communications\RecipientTarget;

interface RecipientResolverInterface
{
    /** @return array<int, RecipientTarget> */
    public function resolve(object $event): array;
}
