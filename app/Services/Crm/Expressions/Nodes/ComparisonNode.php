<?php

namespace App\Services\Crm\Expressions\Nodes;

use App\Services\Crm\Expressions\Contracts\ExpressionNodeVisitor;

readonly class ComparisonNode extends ExpressionNode
{
    public function __construct(
        public FieldNode $field,
        public string $operator,
        public ValueNode $value,
    ) {}

    public function accept(ExpressionNodeVisitor $visitor): mixed
    {
        return $visitor->visitComparison($this);
    }
}
