<?php

namespace App\Services\Crm\Optimization\Automation\DTO;

use JsonSerializable;

readonly class ScoreTrend implements JsonSerializable
{
    public function __construct(
        public string $direction,
        public float $magnitude,
        public string $period = '30d',
    ) {}

    public function percentage(): float
    {
        return round($this->magnitude * 100, 1);
    }

    public function jsonSerialize(): array
    {
        return [
            'direction' => $this->direction,
            'magnitude' => $this->magnitude,
            'period' => $this->period,
            'percentage' => $this->percentage(),
        ];
    }
}
