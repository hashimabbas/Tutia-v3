<?php

namespace App\Services\Crm\Projects\Health;

class DeliveryHealthResult
{
    public function __construct(
        public readonly int $score,
        public readonly string $tier,
        public readonly array $factors,
        public readonly string $trend = 'stable',
    ) {}

    public function toArray(): array
    {
        return [
            'score' => $this->score,
            'tier' => $this->tier,
            'factors' => $this->factors,
            'trend' => $this->trend,
        ];
    }
}
