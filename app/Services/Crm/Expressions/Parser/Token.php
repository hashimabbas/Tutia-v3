<?php

namespace App\Services\Crm\Expressions\Parser;

readonly class Token
{
    public function __construct(
        public TokenType $type,
        public string $value,
        public int $line = 1,
        public int $column = 1,
    ) {}
}
