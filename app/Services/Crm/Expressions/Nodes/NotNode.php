<?php

namespace App\Services\Crm\Expressions\Nodes;

use App\Services\Crm\Expressions\Contracts\ExpressionNodeVisitor;

readonly class NotNode extends ExpressionNode
{
    public function __construct(
        public ExpressionNode $child,
    ) {}

    public function accept(ExpressionNodeVisitor $visitor): mixed
    {
        return $visitor->visitNot($this);
    }
}
