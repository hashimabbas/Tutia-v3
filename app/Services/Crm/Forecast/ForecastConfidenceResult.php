<?php

namespace App\Services\Crm\Forecast;

class ForecastConfidenceResult
{
    public function __construct(
        public readonly int $confidence,
        public readonly string $suggestedCategory,
        public readonly bool $mismatch,
        public readonly array $factors,
    ) {}
}
