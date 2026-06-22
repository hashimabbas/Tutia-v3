<?php

namespace App\Services\Crm\Expressions\Nodes;

use App\Services\Crm\Expressions\Contracts\ExpressionNodeVisitor;

readonly class OrNode extends ExpressionNode
{
    public function __construct(
        public array $children,
    ) {}

    public function accept(ExpressionNodeVisitor $visitor): mixed
    {
        return $visitor->visitOr($this);
    }
}
