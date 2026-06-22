<?php

namespace App\Services\Crm\Health;

class HealthResult
{
    public function __construct(
        public readonly int $score,
        public readonly string $tier,
        public readonly array $factors,
        public readonly string $trend = 'stable',
    ) {}
}
