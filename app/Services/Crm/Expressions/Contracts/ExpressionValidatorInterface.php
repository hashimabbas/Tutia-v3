<?php

namespace App\Services\Crm\Expressions\Contracts;

use App\Services\Crm\Expressions\DTOs\ValidationResult;

interface ExpressionValidatorInterface
{
    public function validate(string $expression, array $availableFields = []): ValidationResult;
}
