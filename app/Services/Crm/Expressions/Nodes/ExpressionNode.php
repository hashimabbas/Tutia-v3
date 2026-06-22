<?php

namespace App\Services\Crm\Expressions\Nodes;

use App\Services\Crm\Expressions\Contracts\ExpressionNodeVisitor;

abstract readonly class ExpressionNode
{
    abstract public function accept(ExpressionNodeVisitor $visitor): mixed;

    public function type(): string
    {
        return class_basename(static::class);
    }
}
