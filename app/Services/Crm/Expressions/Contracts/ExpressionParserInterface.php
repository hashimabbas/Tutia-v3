<?php

namespace App\Services\Crm\Expressions\Contracts;

use App\Services\Crm\Expressions\Nodes\ExpressionNode;

interface ExpressionParserInterface
{
    public function parse(string $expression): ExpressionNode;
}
