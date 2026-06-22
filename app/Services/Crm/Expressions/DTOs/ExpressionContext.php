<?php

namespace App\Services\Crm\Expressions\DTOs;

readonly class ExpressionContext
{
    public function __construct(
        public array $data,
    ) {}
}
