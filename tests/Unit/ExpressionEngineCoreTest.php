<?php

use App\Services\Crm\Expressions\DTOs\ExpressionContext;
use App\Services\Crm\Expressions\DTOs\ExpressionResult;
use App\Services\Crm\Expressions\Nodes\AndNode;
use App\Services\Crm\Expressions\Nodes\ComparisonNode;
use App\Services\Crm\Expressions\Nodes\ExpressionNode;
use App\Services\Crm\Expressions\Nodes\FieldNode;
use App\Services\Crm\Expressions\Nodes\NotNode;
use App\Services\Crm\Expressions\Nodes\OrNode;
use App\Services\Crm\Expressions\Nodes\ValueNode;

describe('ExpressionResult DTO', function () {
    it('creates a passed result', function () {
        $result = new ExpressionResult(passed: true);

        expect($result->passed)->toBeTrue()
            ->and($result->matchedRules)->toBeEmpty()
            ->and($result->errors)->toBeEmpty();
    });

    it('creates a failed result with errors', function () {
        $result = new ExpressionResult(
            passed: false,
            errors: ['Field "deal.amount" not found'],
        );

        expect($result->passed)->toBeFalse()
            ->and($result->errors)->toHaveCount(1)
            ->and($result->errors[0])->toBe('Field "deal.amount" not found');
    });

    it('creates a passed result with matched rules', function () {
        $result = new ExpressionResult(
            passed: true,
            matchedRules: ['deal.amount > 10000'],
        );

        expect($result->passed)->toBeTrue()
            ->and($result->matchedRules)->toHaveCount(1)
            ->and($result->matchedRules[0])->toBe('deal.amount > 10000');
    });

    it('is immutable (readonly)', function () {
        $result = new ExpressionResult(passed: true);

        expect(fn () => $result->passed = false)->toThrow(Error::class);
    });
});

describe('ExpressionContext DTO', function () {
    it('creates a context with data', function () {
        $context = new ExpressionContext([
            'deal.amount' => 15000,
            'customer.vip' => true,
            'project.status' => 'active',
        ]);

        expect($context->data['deal.amount'])->toBe(15000)
            ->and($context->data['customer.vip'])->toBeTrue()
            ->and($context->data['project.status'])->toBe('active');
    });

    it('creates an empty context', function () {
        $context = new ExpressionContext([]);

        expect($context->data)->toBeEmpty();
    });

    it('is immutable (readonly)', function () {
        $context = new ExpressionContext(['key' => 'value']);

        expect(fn () => $context->data = [])->toThrow(Error::class);
    });
});

describe('ExpressionNode abstract', function () {
    it('returns the class basename as type', function () {
        $node = new class extends ExpressionNode {};

        expect($node->type())->not->toBeEmpty();
    });

    it('is readonly', function () {
        $reflection = new ReflectionClass(ExpressionNode::class);

        expect($reflection->isReadOnly())->toBeTrue();
    });
});

describe('AndNode', function () {
    it('creates an AND node with children', function () {
        $left = new ComparisonNode(
            field: new FieldNode('amount'),
            operator: '>',
            value: new ValueNode(10000),
        );
        $right = new ComparisonNode(
            field: new FieldNode('status'),
            operator: '=',
            value: new ValueNode('open'),
        );
        $node = new AndNode([$left, $right]);

        expect($node->children)->toHaveCount(2)
            ->and($node->children[0])->toBe($left)
            ->and($node->children[1])->toBe($right)
            ->and($node->type())->toBe('AndNode');
    });

    it('creates an AND node with no children', function () {
        $node = new AndNode([]);

        expect($node->children)->toBeEmpty();
    });

    it('extends ExpressionNode', function () {
        expect(new AndNode([]))->toBeInstanceOf(ExpressionNode::class);
    });

    it('is readonly', function () {
        $node = new AndNode([]);

        expect(fn () => $node->children = [])->toThrow(Error::class);
    });
});

describe('OrNode', function () {
    it('creates an OR node with children', function () {
        $left = new ComparisonNode(
            field: new FieldNode('vip'),
            operator: '=',
            value: new ValueNode(true),
        );
        $right = new ComparisonNode(
            field: new FieldNode('risk_score'),
            operator: '>',
            value: new ValueNode(80),
        );
        $node = new OrNode([$left, $right]);

        expect($node->children)->toHaveCount(2)
            ->and($node->type())->toBe('OrNode');
    });

    it('extends ExpressionNode', function () {
        expect(new OrNode([]))->toBeInstanceOf(ExpressionNode::class);
    });

    it('supports nested AND/OR', function () {
        $innerAnd = new AndNode([
            new ComparisonNode(
                field: new FieldNode('amount'),
                operator: '>',
                value: new ValueNode(10000),
            ),
            new ComparisonNode(
                field: new FieldNode('status'),
                operator: '=',
                value: new ValueNode('proposal'),
            ),
        ]);
        $innerOr = new OrNode([
            new ComparisonNode(
                field: new FieldNode('vip'),
                operator: '=',
                value: new ValueNode(true),
            ),
            new ComparisonNode(
                field: new FieldNode('risk_score'),
                operator: '>',
                value: new ValueNode(80),
            ),
        ]);
        $root = new OrNode([$innerAnd, $innerOr]);

        expect($root->children)->toHaveCount(2)
            ->and($root->children[0])->toBeInstanceOf(AndNode::class)
            ->and($root->children[1])->toBeInstanceOf(OrNode::class);
    });
});

describe('NotNode', function () {
    it('creates a NOT node with a single child', function () {
        $comparison = new ComparisonNode(
            field: new FieldNode('status'),
            operator: '=',
            value: new ValueNode('closed'),
        );
        $node = new NotNode($comparison);

        expect($node->child)->toBe($comparison)
            ->and($node->type())->toBe('NotNode');
    });

    it('extends ExpressionNode', function () {
        $child = new ValueNode(true);

        expect(new NotNode($child))->toBeInstanceOf(ExpressionNode::class);
    });

    it('supports wrapping complex nodes', function () {
        $andNode = new AndNode([
            new ComparisonNode(
                field: new FieldNode('a'),
                operator: '>',
                value: new ValueNode(1),
            ),
        ]);
        $node = new NotNode($andNode);

        expect($node->child)->toBeInstanceOf(AndNode::class);
    });
});

describe('ComparisonNode', function () {
    it('creates a comparison with field, operator, and value', function () {
        $field = new FieldNode('deal.amount');
        $value = new ValueNode(10000);
        $node = new ComparisonNode($field, '>', $value);

        expect($node->field)->toBe($field)
            ->and($node->operator)->toBe('>')
            ->and($node->value)->toBe($value)
            ->and($node->type())->toBe('ComparisonNode');
    });

    it('supports various operators', function () {
        $field = new FieldNode('field');
        $value = new ValueNode('test');

        $operators = ['=', '>', '<', '>=', '<=', '!=', 'in', 'not_in', 'contains', 'starts_with', 'ends_with'];

        foreach ($operators as $op) {
            $node = new ComparisonNode($field, $op, $value);

            expect($node->operator)->toBe($op);
        }
    });

    it('extends ExpressionNode', function () {
        $node = new ComparisonNode(new FieldNode('f'), '=', new ValueNode(1));

        expect($node)->toBeInstanceOf(ExpressionNode::class);
    });
});

describe('FieldNode', function () {
    it('creates a field node with a dot-path', function () {
        $field = new FieldNode('deal.amount');

        expect($field->path)->toBe('deal.amount')
            ->and($field->type())->toBe('FieldNode');
    });

    it('supports single-level paths', function () {
        $field = new FieldNode('status');

        expect($field->path)->toBe('status');
    });

    it('supports deep nested paths', function () {
        $field = new FieldNode('project.risk.assessment.score');

        expect($field->path)->toBe('project.risk.assessment.score');
    });

    it('extends ExpressionNode', function () {
        expect(new FieldNode('field'))->toBeInstanceOf(ExpressionNode::class);
    });
});

describe('ValueNode', function () {
    it('creates a value node with a string', function () {
        $node = new ValueNode('open');

        expect($node->value)->toBe('open')
            ->and($node->type())->toBe('ValueNode');
    });

    it('creates a value node with an integer', function () {
        $node = new ValueNode(10000);

        expect($node->value)->toBe(10000);
    });

    it('creates a value node with a float', function () {
        $node = new ValueNode(99.5);

        expect($node->value)->toBe(99.5);
    });

    it('creates a value node with a boolean', function () {
        $node = new ValueNode(true);

        expect($node->value)->toBeTrue();
    });

    it('creates a value node with null', function () {
        $node = new ValueNode(null);

        expect($node->value)->toBeNull();
    });

    it('creates a value node with an array', function () {
        $node = new ValueNode(['a', 'b', 'c']);

        expect($node->value)->toBe(['a', 'b', 'c']);
    });

    it('extends ExpressionNode', function () {
        expect(new ValueNode(1))->toBeInstanceOf(ExpressionNode::class);
    });
});

describe('Complex AST construction', function () {
    it('builds the example expression: (deal.amount > 10000 AND deal.stage = "proposal") OR (customer.vip = true AND project.risk_score > 80)', function () {
        $root = new OrNode([
            new AndNode([
                new ComparisonNode(
                    field: new FieldNode('deal.amount'),
                    operator: '>',
                    value: new ValueNode(10000),
                ),
                new ComparisonNode(
                    field: new FieldNode('deal.stage'),
                    operator: '=',
                    value: new ValueNode('proposal'),
                ),
            ]),
            new AndNode([
                new ComparisonNode(
                    field: new FieldNode('customer.vip'),
                    operator: '=',
                    value: new ValueNode(true),
                ),
                new ComparisonNode(
                    field: new FieldNode('project.risk_score'),
                    operator: '>',
                    value: new ValueNode(80),
                ),
            ]),
        ]);

        expect($root)->toBeInstanceOf(OrNode::class);
        expect($root->children)->toHaveCount(2);

        $leftAnd = $root->children[0];
        expect($leftAnd)->toBeInstanceOf(AndNode::class);
        expect($leftAnd->children)->toHaveCount(2);

        $rightAnd = $root->children[1];
        expect($rightAnd)->toBeInstanceOf(AndNode::class);
        expect($rightAnd->children)->toHaveCount(2);

        $comparison = $leftAnd->children[0];
        expect($comparison)->toBeInstanceOf(ComparisonNode::class);
        expect($comparison->field->path)->toBe('deal.amount');
        expect($comparison->operator)->toBe('>');
        expect($comparison->value->value)->toBe(10000);
    });

    it('builds: NOT (status = "closed" OR status = "cancelled")', function () {
        $root = new NotNode(
            new OrNode([
                new ComparisonNode(
                    field: new FieldNode('status'),
                    operator: '=',
                    value: new ValueNode('closed'),
                ),
                new ComparisonNode(
                    field: new FieldNode('status'),
                    operator: '=',
                    value: new ValueNode('cancelled'),
                ),
            ]),
        );

        expect($root)->toBeInstanceOf(NotNode::class);
        expect($root->child)->toBeInstanceOf(OrNode::class);
        expect($root->child->children)->toHaveCount(2);
    });
});
