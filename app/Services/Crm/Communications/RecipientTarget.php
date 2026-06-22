<?php

namespace App\Services\Crm\Communications;

class RecipientTarget
{
    public function __construct(
        public readonly int $portalAccountId,
        public readonly string $email,
        public readonly string $locale,
    ) {}
}
