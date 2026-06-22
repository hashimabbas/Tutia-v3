<?php

namespace App\Services\Crm\Expressions\DTOs;

readonly class RuleTrace
{
    public function __construct(
        public string $field,
        public string $operator,
        public mixed $expected,
        public mixed $actual,
        public bool $passed,
        public string $rule,
        public string $ruleId,
    ) {}
}
