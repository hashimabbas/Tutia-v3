<?php

namespace App\Services\Crm\Expressions\Nodes;

use App\Services\Crm\Expressions\Contracts\ExpressionNodeVisitor;

readonly class FieldNode extends ExpressionNode
{
    public function __construct(
        public string $path,
    ) {}

    public function accept(ExpressionNodeVisitor $visitor): mixed
    {
        return $visitor->visitField($this);
    }
}
