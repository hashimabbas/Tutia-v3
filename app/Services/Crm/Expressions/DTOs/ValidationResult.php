<?php

namespace App\Services\Crm\Expressions\DTOs;

readonly class ValidationResult
{
    public function __construct(
        public bool $valid,
        public array $errors = [],
        public array $warnings = [],
    ) {}
}
