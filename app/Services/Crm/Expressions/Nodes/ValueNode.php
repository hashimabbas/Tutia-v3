<?php

namespace App\Services\Crm\Expressions\Nodes;

use App\Services\Crm\Expressions\Contracts\ExpressionNodeVisitor;

readonly class ValueNode extends ExpressionNode
{
    public function __construct(
        public mixed $value,
    ) {}

    public function accept(ExpressionNodeVisitor $visitor): mixed
    {
        return $visitor->visitValue($this);
    }
}
