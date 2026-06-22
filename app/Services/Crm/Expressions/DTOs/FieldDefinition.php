<?php

namespace App\Services\Crm\Expressions\DTOs;

readonly class FieldDefinition
{
    public function __construct(
        public string $path,
        public string $type,
        public array $supportedOperators,
        public ?float $suggestedMax = null,
        public ?float $suggestedMin = null,
    ) {}
}
