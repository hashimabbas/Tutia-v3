<?php

namespace App\Services\Crm\Expressions\Contracts;

use App\Services\Crm\Expressions\DTOs\ExpressionContext;
use App\Services\Crm\Expressions\DTOs\ExpressionResult;
use App\Services\Crm\Expressions\Nodes\ExpressionNode;

interface ExpressionEvaluatorInterface
{
    public function evaluate(
        ExpressionNode $node,
        ExpressionContext $context,
    ): ExpressionResult;
}
