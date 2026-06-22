<?php

namespace App\Services\Crm\Expressions\DTOs;

readonly class ExpressionResult
{
    /** @param RuleTrace[] $trace */
    public function __construct(
        public bool $passed,
        public array $matchedRules = [],
        public array $errors = [],
        public array $trace = [],
        public int $evaluatedRules = 0,
        public int $passedRules = 0,
    ) {}
}
