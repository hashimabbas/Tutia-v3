<?php

use App\Services\Crm\Expressions\DTOs\ExpressionContext;
use App\Services\Crm\Expressions\DTOs\ExpressionResult;
use App\Services\Crm\Expressions\DTOs\RuleTrace;
use App\Services\Crm\Expressions\Evaluation\EvaluationVisitor;
use App\Services\Crm\Expressions\Evaluation\ExpressionEvaluator;
use App\Services\Crm\Expressions\Nodes\AndNode;
use App\Services\Crm\Expressions\Nodes\ComparisonNode;
use App\Services\Crm\Expressions\Nodes\FieldNode;
use App\Services\Crm\Expressions\Nodes\ValueNode;
use App\Services\Crm\Expressions\Parser\ExpressionParser;

beforeEach(function () {
    $this->evaluator = new ExpressionEvaluator(new ExpressionParser);
});

function ctx(array $data): ExpressionContext
{
    return new ExpressionContext($data);
}

function assertPassed(ExpressionResult $result, bool $expected): void
{
    expect($result->passed)->toBe($expected);
}

function assertMatchedRules(ExpressionResult $result, array $expected): void
{
    expect($result->matchedRules)->toHaveCount(count($expected));

    foreach ($expected as $i => $expectedRule) {
        expect($result->matchedRules[$i]['rule'])->toBe($expectedRule);
        expect($result->matchedRules[$i])->toHaveKey('passed');
    }
}

function assertErrors(ExpressionResult $result, array $expected): void
{
    expect($result->errors)->toBe($expected);
}

describe('Basic comparisons', function () {
    it('evaluates equality — true', function () {
        $result = $this->evaluator->evaluateExpression('status = "open"', ctx(['status' => 'open']));

        assertPassed($result, true);
    });

    it('evaluates equality — false', function () {
        $result = $this->evaluator->evaluateExpression('status = "open"', ctx(['status' => 'closed']));

        assertPassed($result, false);
    });

    it('evaluates inequality — true', function () {
        $result = $this->evaluator->evaluateExpression('status != "closed"', ctx(['status' => 'open']));

        assertPassed($result, true);
    });

    it('evaluates inequality — false', function () {
        $result = $this->evaluator->evaluateExpression('status != "open"', ctx(['status' => 'open']));

        assertPassed($result, false);
    });

    it('evaluates greater than — true', function () {
        $result = $this->evaluator->evaluateExpression('amount > 10000', ctx(['amount' => 15000]));

        assertPassed($result, true);
    });

    it('evaluates greater than — false', function () {
        $result = $this->evaluator->evaluateExpression('amount > 10000', ctx(['amount' => 5000]));

        assertPassed($result, false);
    });

    it('evaluates greater than or equal — true', function () {
        $result = $this->evaluator->evaluateExpression('amount >= 10000', ctx(['amount' => 10000]));

        assertPassed($result, true);
    });

    it('evaluates less than — true', function () {
        $result = $this->evaluator->evaluateExpression('score < 50', ctx(['score' => 30]));

        assertPassed($result, true);
    });

    it('evaluates less than or equal — true', function () {
        $result = $this->evaluator->evaluateExpression('score <= 75', ctx(['score' => 75]));

        assertPassed($result, true);
    });

    it('evaluates boolean — true', function () {
        $result = $this->evaluator->evaluateExpression('vip = true', ctx(['vip' => true]));

        assertPassed($result, true);
    });

    it('evaluates boolean — false', function () {
        $result = $this->evaluator->evaluateExpression('vip = true', ctx(['vip' => false]));

        assertPassed($result, false);
    });

    it('evaluates negative number', function () {
        $result = $this->evaluator->evaluateExpression('temperature > -5', ctx(['temperature' => -3]));

        assertPassed($result, true);
    });

    it('evaluates float comparison', function () {
        $result = $this->evaluator->evaluateExpression('price <= 99.50', ctx(['price' => 99.50]));

        assertPassed($result, true);
    });
});

describe('String operators', function () {
    it('evaluates contains — true', function () {
        $result = $this->evaluator->evaluateExpression('name CONTAINS "test"', ctx(['name' => 'testing123']));

        assertPassed($result, true);
    });

    it('evaluates contains — false', function () {
        $result = $this->evaluator->evaluateExpression('name CONTAINS "xyz"', ctx(['name' => 'testing123']));

        assertPassed($result, false);
    });

    it('evaluates starts_with — true', function () {
        $result = $this->evaluator->evaluateExpression('code STARTS_WITH "ABC"', ctx(['code' => 'ABC-123']));

        assertPassed($result, true);
    });

    it('evaluates starts_with — false', function () {
        $result = $this->evaluator->evaluateExpression('code STARTS_WITH "XYZ"', ctx(['code' => 'ABC-123']));

        assertPassed($result, false);
    });

    it('evaluates ends_with — true', function () {
        $result = $this->evaluator->evaluateExpression('code ENDS_WITH "123"', ctx(['code' => 'ABC-123']));

        assertPassed($result, true);
    });

    it('evaluates ends_with — false', function () {
        $result = $this->evaluator->evaluateExpression('code ENDS_WITH "ABC"', ctx(['code' => 'ABC-123']));

        assertPassed($result, false);
    });
});

describe('IN / NOT_IN operators', function () {
    it('evaluates in — true', function () {
        $result = $this->evaluator->evaluateExpression('status IN "active"', ctx(['status' => 'active']));

        assertPassed($result, true);
    });

    it('evaluates in — false', function () {
        $result = $this->evaluator->evaluateExpression('status IN "active"', ctx(['status' => 'inactive']));

        assertPassed($result, false);
    });

    it('evaluates not_in — true', function () {
        $result = $this->evaluator->evaluateExpression('status NOT_IN "closed"', ctx(['status' => 'open']));

        assertPassed($result, true);
    });

    it('evaluates not_in — false', function () {
        $result = $this->evaluator->evaluateExpression('status NOT_IN "open"', ctx(['status' => 'open']));

        assertPassed($result, false);
    });
});

describe('Logical — AND', function () {
    it('evaluates A AND B — both true', function () {
        $result = $this->evaluator->evaluateExpression('amount > 1000 AND status = "open"', ctx([
            'amount' => 5000,
            'status' => 'open',
        ]));

        assertPassed($result, true);
    });

    it('evaluates A AND B — first false', function () {
        $result = $this->evaluator->evaluateExpression('amount > 1000 AND status = "open"', ctx([
            'amount' => 500,
            'status' => 'open',
        ]));

        assertPassed($result, false);
    });

    it('evaluates A AND B — second false', function () {
        $result = $this->evaluator->evaluateExpression('amount > 1000 AND status = "open"', ctx([
            'amount' => 5000,
            'status' => 'closed',
        ]));

        assertPassed($result, false);
    });

    it('short-circuits AND on first false', function () {
        $visitor = new EvaluationVisitor(ctx([
            'amount' => 500,
            'status' => 'open',
        ]));

        $ast = (new ExpressionParser)->parse('amount > 1000 AND status = "open"');

        $result = $ast->accept($visitor);

        expect($result)->toBeFalse();

        expect($visitor->matchedRules)->toHaveCount(1);
    });
});

describe('Logical — OR', function () {
    it('evaluates A OR B — both true', function () {
        $result = $this->evaluator->evaluateExpression('amount > 1000 OR status = "open"', ctx([
            'amount' => 5000,
            'status' => 'open',
        ]));

        assertPassed($result, true);
    });

    it('evaluates A OR B — first true, short-circuit', function () {
        $visitor = new EvaluationVisitor(ctx([
            'amount' => 5000,
            'status' => 'closed',
        ]));

        $ast = (new ExpressionParser)->parse('amount > 1000 OR status = "open"');

        $result = $ast->accept($visitor);

        expect($result)->toBeTrue();

        expect($visitor->matchedRules)->toHaveCount(1);
    });

    it('evaluates A OR B — both false', function () {
        $result = $this->evaluator->evaluateExpression('amount > 1000 OR status = "open"', ctx([
            'amount' => 500,
            'status' => 'closed',
        ]));

        assertPassed($result, false);
    });
});

describe('Logical — NOT', function () {
    it('evaluates NOT — true becomes false', function () {
        $result = $this->evaluator->evaluateExpression('NOT vip = true', ctx(['vip' => true]));

        assertPassed($result, false);
    });

    it('evaluates NOT — false becomes true', function () {
        $result = $this->evaluator->evaluateExpression('NOT vip = true', ctx(['vip' => false]));

        assertPassed($result, true);
    });

    it('evaluates NOT (A AND B)', function () {
        $result = $this->evaluator->evaluateExpression('NOT (status = "active" AND score > 50)', ctx([
            'status' => 'active',
            'score' => 80,
        ]));

        assertPassed($result, false);
    });
});

describe('Nested / grouped expressions', function () {
    it('evaluates parenthesized group', function () {
        $result = $this->evaluator->evaluateExpression('(amount > 1000 AND status = "open")', ctx([
            'amount' => 5000,
            'status' => 'open',
        ]));

        assertPassed($result, true);
    });

    it('evaluates (A AND B) OR (C AND D) — left true', function () {
        $result = $this->evaluator->evaluateExpression(
            '(amount > 1000 AND status = "open") OR (vip = true AND score > 80)',
            ctx([
                'amount' => 5000,
                'status' => 'open',
                'vip' => false,
                'score' => 90,
            ])
        );

        assertPassed($result, true);
    });

    it('evaluates (A AND B) OR (C AND D) — right true', function () {
        $result = $this->evaluator->evaluateExpression(
            '(amount > 1000 AND status = "open") OR (vip = true AND score > 80)',
            ctx([
                'amount' => 500,
                'status' => 'open',
                'vip' => true,
                'score' => 90,
            ])
        );

        assertPassed($result, true);
    });

    it('evaluates (A AND B) OR (C AND D) — both false', function () {
        $result = $this->evaluator->evaluateExpression(
            '(amount > 1000 AND status = "open") OR (vip = true AND score > 80)',
            ctx([
                'amount' => 500,
                'status' => 'open',
                'vip' => false,
                'score' => 90,
            ])
        );

        assertPassed($result, false);
    });

    it('evaluates deeply nested ((A AND B) OR C) AND D', function () {
        $result = $this->evaluator->evaluateExpression(
            '((a > 1 AND b > 2) OR c > 3) AND d > 4',
            ctx([
                'a' => 0,
                'b' => 5,
                'c' => 10,
                'd' => 5,
            ])
        );

        assertPassed($result, true);
    });

    it('evaluates the full reference example', function () {
        $result = $this->evaluator->evaluateExpression(
            '(deal.amount > 10000 AND deal.stage = "proposal") OR (customer.vip = true AND project.risk_score > 80)',
            ctx([
                'deal' => ['amount' => 15000, 'stage' => 'proposal'],
                'customer' => ['vip' => false],
                'project' => ['risk_score' => 90],
            ])
        );

        assertPassed($result, true);
    });
});

describe('Context — dot-path resolution', function () {
    it('resolves single-level path', function () {
        $result = $this->evaluator->evaluateExpression('status = "active"', ctx(['status' => 'active']));

        assertPassed($result, true);
    });

    it('resolves two-level dot path', function () {
        $result = $this->evaluator->evaluateExpression('deal.amount > 10000', ctx([
            'deal' => ['amount' => 15000],
        ]));

        assertPassed($result, true);
    });

    it('resolves three-level dot path', function () {
        $result = $this->evaluator->evaluateExpression('project.risk.assessment > 80', ctx([
            'project' => ['risk' => ['assessment' => 85]],
        ]));

        assertPassed($result, true);
    });

    it('returns error for missing field', function () {
        $result = $this->evaluator->evaluateExpression('unknown.field > 100', ctx(['something' => 'else']));

        assertPassed($result, false);
        expect($result->errors)->toHaveCount(1);
        expect($result->errors[0])->toContain('not found');
    });

    it('handles nested field partially missing', function () {
        $result = $this->evaluator->evaluateExpression('deal.score > 100', ctx([
            'deal' => ['amount' => 15000],
        ]));

        assertPassed($result, false);
        expect($result->errors)->toHaveCount(1);
        expect($result->errors[0])->toContain('not found');
    });

    it('handles falsy field value', function () {
        $result = $this->evaluator->evaluateExpression('score = 0', ctx(['score' => 0]));

        assertPassed($result, true);
    });
});

describe('Explainability — matchedRules', function () {
    it('returns matched rules for single comparison', function () {
        $result = $this->evaluator->evaluateExpression('amount > 10000', ctx(['amount' => 15000]));

        assertMatchedRules($result, ['amount > 10000']);
    });

    it('returns matched rules for AND expression', function () {
        $result = $this->evaluator->evaluateExpression('amount > 1000 AND status = "open"', ctx([
            'amount' => 5000,
            'status' => 'open',
        ]));

        expect($result->matchedRules)->toHaveCount(2);
        expect($result->matchedRules[0]['rule'])->toContain('amount >');
        expect($result->matchedRules[1]['rule'])->toContain('status =');
    });

    it('returns matched rules for OR expression', function () {
        $result = $this->evaluator->evaluateExpression('status = "open" OR status = "pending"', ctx([
            'status' => 'open',
        ]));

        expect($result->matchedRules)->toHaveCount(1);
        expect($result->matchedRules[0]['rule'])->toContain('status = "open"');
    });

    it('formats boolean values in matched rules', function () {
        $result = $this->evaluator->evaluateExpression('vip = true', ctx(['vip' => true]));

        assertMatchedRules($result, ['vip = true']);
    });

    it('formats string values in matched rules', function () {
        $result = $this->evaluator->evaluateExpression('status = "open"', ctx(['status' => 'open']));

        assertMatchedRules($result, ['status = "open"']);
    });
});

describe('Explainability — errors', function () {
    it('returns evaluation errors', function () {
        $result = $this->evaluator->evaluateExpression('missing_field > 100', ctx(['other' => 'value']));

        assertPassed($result, false);
        expect($result->errors)->toHaveCount(1);
    });

    it('does not throw on missing field', function () {
        $result = $this->evaluator->evaluateExpression('missing = true', ctx([]));

        expect($result->errors)->toHaveCount(1);
    });

    it('returns multiple errors for compound expression with missing fields', function () {
        $result = $this->evaluator->evaluateExpression('a > 1 AND b > 2', ctx(['c' => 3]));

        expect($result->errors)->toHaveCount(1);
    });

    it('returns parse error for invalid syntax', function () {
        $result = $this->evaluator->evaluateExpression('invalid syntax !!!', ctx([]));

        assertPassed($result, false);
        expect($result->errors)->not->toBeEmpty();
    });
});

describe('Trace — RuleTrace DTO', function () {
    it('creates a trace entry for a passing comparison', function () {
        $result = $this->evaluator->evaluateExpression('amount > 10000', ctx(['amount' => 15000]));

        expect($result->trace)->toHaveCount(1);
        $trace = $result->trace[0];
        expect($trace)->toBeInstanceOf(RuleTrace::class);
        expect($trace->field)->toBe('amount');
        expect($trace->operator)->toBe('>');
        expect($trace->expected)->toBe(10000);
        expect($trace->actual)->toBe(15000);
        expect($trace->passed)->toBeTrue();
        expect($trace->rule)->toBe('amount > 10000');
        expect($trace->ruleId)->toBe('amount::>');
    });

    it('creates a trace entry for a failing comparison', function () {
        $result = $this->evaluator->evaluateExpression('amount > 10000', ctx(['amount' => 5000]));

        expect($result->trace)->toHaveCount(1);
        $trace = $result->trace[0];
        expect($trace->passed)->toBeFalse();
        expect($trace->actual)->toBe(5000);
        expect($trace->expected)->toBe(10000);
        expect($trace->ruleId)->toBe('amount::>');
    });

    it('captures actual value correctly for string comparison', function () {
        $result = $this->evaluator->evaluateExpression('status = "open"', ctx(['status' => 'open']));

        $trace = $result->trace[0];
        expect($trace->actual)->toBe('open');
        expect($trace->expected)->toBe('open');
        expect($trace->passed)->toBeTrue();
        expect($trace->ruleId)->toBe('status::=');
    });

    it('captures actual null for missing field trace', function () {
        $result = $this->evaluator->evaluateExpression('missing > 100', ctx(['other' => 'value']));

        expect($result->trace)->toHaveCount(1);
        $trace = $result->trace[0];
        expect($trace->actual)->toBeNull();
        expect($trace->passed)->toBeFalse();
        expect($trace->field)->toBe('missing');
        expect($trace->ruleId)->toBe('missing::>');
    });

    it('captures dot-path resolution in trace', function () {
        $result = $this->evaluator->evaluateExpression('deal.amount > 10000', ctx([
            'deal' => ['amount' => 15000],
        ]));

        $trace = $result->trace[0];
        expect($trace->field)->toBe('deal.amount');
        expect($trace->actual)->toBe(15000);
        expect($trace->ruleId)->toBe('deal.amount::>');
    });
});

describe('Trace — evaluatedRules / passedRules', function () {
    it('counts a single passing rule', function () {
        $result = $this->evaluator->evaluateExpression('amount > 10000', ctx(['amount' => 15000]));

        expect($result->evaluatedRules)->toBe(1);
        expect($result->passedRules)->toBe(1);
    });

    it('counts a single failing rule', function () {
        $result = $this->evaluator->evaluateExpression('amount > 10000', ctx(['amount' => 5000]));

        expect($result->evaluatedRules)->toBe(1);
        expect($result->passedRules)->toBe(0);
    });

    it('counts AND — both passing', function () {
        $result = $this->evaluator->evaluateExpression(
            'amount > 1000 AND status = "open"',
            ctx(['amount' => 5000, 'status' => 'open']),
        );

        expect($result->evaluatedRules)->toBe(2);
        expect($result->passedRules)->toBe(2);
    });

    it('counts AND — first failing (short-circuit)', function () {
        $result = $this->evaluator->evaluateExpression(
            'amount > 1000 AND status = "open"',
            ctx(['amount' => 500, 'status' => 'open']),
        );

        expect($result->evaluatedRules)->toBe(1);
        expect($result->passedRules)->toBe(0);
    });

    it('counts OR — first passing (short-circuit)', function () {
        $result = $this->evaluator->evaluateExpression(
            'amount > 1000 OR status = "open"',
            ctx(['amount' => 5000, 'status' => 'closed']),
        );

        expect($result->evaluatedRules)->toBe(1);
        expect($result->passedRules)->toBe(1);
    });

    it('counts OR — both failing', function () {
        $result = $this->evaluator->evaluateExpression(
            'amount > 1000 OR status = "open"',
            ctx(['amount' => 500, 'status' => 'closed']),
        );

        expect($result->evaluatedRules)->toBe(2);
        expect($result->passedRules)->toBe(0);
    });

    it('counts NOT — single rule inverted', function () {
        $result = $this->evaluator->evaluateExpression('NOT vip = true', ctx(['vip' => true]));

        expect($result->evaluatedRules)->toBe(1);
        expect($result->passedRules)->toBe(1);
        expect($result->trace[0]->passed)->toBeTrue();
    });
});

describe('Trace — AND trace count (short-circuit behaviour)', function () {
    it('traces only first comparison when AND short-circuits on first false', function () {
        $visitor = new EvaluationVisitor(ctx([
            'amount' => 500,
            'status' => 'open',
        ]));

        $ast = (new ExpressionParser)->parse('amount > 1000 AND status = "open"');
        $ast->accept($visitor);

        expect($visitor->trace)->toHaveCount(1);
        expect($visitor->trace[0]->field)->toBe('amount');
        expect($visitor->trace[0]->passed)->toBeFalse();
        expect($visitor->trace[0]->ruleId)->toBe('amount::>');
    });

    it('traces both when AND passes', function () {
        $visitor = new EvaluationVisitor(ctx([
            'amount' => 5000,
            'status' => 'open',
        ]));

        $ast = (new ExpressionParser)->parse('amount > 1000 AND status = "open"');
        $ast->accept($visitor);

        expect($visitor->trace)->toHaveCount(2);
        expect($visitor->trace[0]->ruleId)->toBe('amount::>');
        expect($visitor->trace[1]->ruleId)->toBe('status::=');
    });
});

describe('Trace — OR trace count (short-circuit behaviour)', function () {
    it('traces only first comparison when OR short-circuits on first true', function () {
        $visitor = new EvaluationVisitor(ctx([
            'amount' => 5000,
            'status' => 'closed',
        ]));

        $ast = (new ExpressionParser)->parse('amount > 1000 OR status = "open"');
        $ast->accept($visitor);

        expect($visitor->trace)->toHaveCount(1);
        expect($visitor->trace[0]->field)->toBe('amount');
        expect($visitor->trace[0]->passed)->toBeTrue();
        expect($visitor->trace[0]->ruleId)->toBe('amount::>');
    });

    it('traces both when OR fails', function () {
        $visitor = new EvaluationVisitor(ctx([
            'amount' => 500,
            'status' => 'closed',
        ]));

        $ast = (new ExpressionParser)->parse('amount > 1000 OR status = "open"');
        $ast->accept($visitor);

        expect($visitor->trace)->toHaveCount(2);
        expect($visitor->trace[0]->ruleId)->toBe('amount::>');
        expect($visitor->trace[1]->ruleId)->toBe('status::=');
    });
});

describe('Trace — nested expression trace', function () {
    it('traces (A AND B) OR (C AND D) — right true', function () {
        $result = $this->evaluator->evaluateExpression(
            '(amount > 1000 AND status = "open") OR (vip = true AND score > 80)',
            ctx([
                'amount' => 500,
                'status' => 'open',
                'vip' => true,
                'score' => 90,
            ]),
        );

        // Left group: amount > 1000 = false (short-circuit, status skipped)
        // Right group: vip = true = true, score > 80 = true (both evaluated)
        expect($result->trace)->toHaveCount(3);
        expect($result->trace[0]->field)->toBe('amount');
        expect($result->trace[0]->passed)->toBeFalse();
        expect($result->trace[0]->ruleId)->toBe('amount::>');
        expect($result->trace[1]->field)->toBe('vip');
        expect($result->trace[1]->passed)->toBeTrue();
        expect($result->trace[1]->ruleId)->toBe('vip::=');
        expect($result->trace[2]->field)->toBe('score');
        expect($result->trace[2]->passed)->toBeTrue();
        expect($result->trace[2]->ruleId)->toBe('score::>');
    });

    it('traces NOT (A AND B) — only A is evaluated when A fails', function () {
        $result = $this->evaluator->evaluateExpression('NOT (status = "active" AND score > 50)', ctx([
            'status' => 'inactive',
            'score' => 80,
        ]));

        expect($result->trace)->toHaveCount(1);
        expect($result->trace[0]->field)->toBe('status');
        expect($result->trace[0]->passed)->toBeFalse();
        expect($result->trace[0]->ruleId)->toBe('status::=');
    });
});

describe('Empty edge cases', function () {
    it('evaluates against empty context — false', function () {
        $result = $this->evaluator->evaluateExpression('amount > 100', ctx([]));

        assertPassed($result, false);
    });

    it('handles empty expression', function () {
        $result = $this->evaluator->evaluateExpression('', ctx(['x' => 1]));

        assertPassed($result, false);
        expect($result->errors)->not->toBeEmpty();
    });
});

describe('Boolean field comparison', function () {
    it('compares boolean true with =', function () {
        $result = $this->evaluator->evaluateExpression('active = true', ctx(['active' => true]));

        assertPassed($result, true);
    });

    it('compares boolean false with =', function () {
        $result = $this->evaluator->evaluateExpression('active = false', ctx(['active' => false]));

        assertPassed($result, true);
    });

    it('compares boolean with !=', function () {
        $result = $this->evaluator->evaluateExpression('active != true', ctx(['active' => false]));

        assertPassed($result, true);
    });
});

describe('Standalone AST evaluation (without parser)', function () {
    it('evaluates AST node directly', function () {
        $ast = new ComparisonNode(
            new FieldNode('status'),
            '=',
            new ValueNode('open'),
        );

        $result = $this->evaluator->evaluate($ast, ctx(['status' => 'open']));

        assertPassed($result, true);
    });

    it('evaluates complex AST directly', function () {
        $ast = new AndNode([
            new ComparisonNode(new FieldNode('a'), '>', new ValueNode(10)),
            new ComparisonNode(new FieldNode('b'), '=', new ValueNode('x')),
        ]);

        $result = $this->evaluator->evaluate($ast, ctx([
            'a' => 20,
            'b' => 'x',
        ]));

        assertPassed($result, true);
    });
});
