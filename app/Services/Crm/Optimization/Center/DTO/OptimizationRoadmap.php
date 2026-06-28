<?php

namespace App\Services\Crm\Optimization\Center\DTO;

use JsonSerializable;

readonly class OptimizationRoadmap implements JsonSerializable
{
    public function __construct(
        public array $phases,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'phases' => $this->phases,
        ];
    }
}
