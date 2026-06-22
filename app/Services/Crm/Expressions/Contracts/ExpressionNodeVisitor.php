<?php

namespace App\Services\Crm\Expressions\Contracts;

use App\Services\Crm\Expressions\Nodes\AndNode;
use App\Services\Crm\Expressions\Nodes\ComparisonNode;
use App\Services\Crm\Expressions\Nodes\FieldNode;
use App\Services\Crm\Expressions\Nodes\NotNode;
use App\Services\Crm\Expressions\Nodes\OrNode;
use App\Services\Crm\Expressions\Nodes\ValueNode;

interface ExpressionNodeVisitor
{
    public function visitAnd(AndNode $node): mixed;

    public function visitOr(OrNode $node): mixed;

    public function visitNot(NotNode $node): mixed;

    public function visitComparison(ComparisonNode $node): mixed;

    public function visitField(FieldNode $node): mixed;

    public function visitValue(ValueNode $node): mixed;
}
