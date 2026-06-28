<?php

namespace App\Services\Crm\Workflows\Conversion;

readonly class ConversionResult implements \JsonSerializable
{
    public function __construct(
        public string $expression,
        public bool $valid,
        public array $warnings = [],
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'expression' => $this->expression,
            'valid' => $this->valid,
            'warnings' => $this->warnings,
        ];
    }
}
