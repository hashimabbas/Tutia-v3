<?php

use App\Services\Crm\Workflows\Conversion\ConversionResult;
use App\Services\Crm\Workflows\Conversion\LegacyConditionToExpressionConverter;

describe('ConversionResult', function () {
    it('creates a result with all properties', function () {
        $result = new ConversionResult(
            expression: 'status = "open"',
            valid: true,
            warnings: ['Test warning'],
        );

        expect($result->expression)->toBe('status = "open"')
            ->and($result->valid)->toBeTrue()
            ->and($result->warnings)->toBe(['Test warning']);
    });

    it('defaults to empty warnings', function () {
        $result = new ConversionResult(
            expression: 'status = "open"',
            valid: true,
        );

        expect($result->warnings)->toBeEmpty();
    });

    it('json serializes correctly', function () {
        $result = new ConversionResult(
            expression: 'status = "open"',
            valid: true,
            warnings: ['warning'],
        );

        $json = json_decode(json_encode($result), true);

        expect($json)->toBe([
            'expression' => 'status = "open"',
            'valid' => true,
            'warnings' => ['warning'],
        ]);
    });

    it('is immutable', function () {
        $result = new ConversionResult('a', true);

        expect(fn () => $result->expression = 'b')->toThrow(Error::class);
    });
});

describe('LegacyConditionToExpressionConverter', function () {
    beforeEach(function () {
        $this->converter = new LegacyConditionToExpressionConverter;
    });

    describe('basic operators', function () {
        it('converts eq operator', function () {
            $conditions = [
                ['field' => 'status', 'operator' => 'eq', 'value' => 'open', 'group_order' => 0],
            ];

            $result = $this->converter->convert($conditions);

            expect($result->expression)->toBe('status = "open"')
                ->and($result->valid)->toBeTrue();
        });

        it('converts neq operator', function () {
            $conditions = [
                ['field' => 'status', 'operator' => 'neq', 'value' => 'closed', 'group_order' => 0],
            ];

            $result = $this->converter->convert($conditions);

            expect($result->expression)->toBe('status != "closed"');
        });

        it('converts numeric comparisons', function () {
            $conditions = [
                ['field' => 'amount', 'operator' => 'gt', 'value' => '1000', 'group_order' => 0],
            ];

            $result = $this->converter->convert($conditions);

            expect($result->expression)->toBe('amount > 1000');
        });

        it('converts gte operator', function () {
            $result = $this->converter->convert([
                ['field' => 'score', 'operator' => 'gte', 'value' => '75', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('score >= 75');
        });

        it('converts lt operator', function () {
            $result = $this->converter->convert([
                ['field' => 'price', 'operator' => 'lt', 'value' => '500', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('price < 500');
        });

        it('converts lte operator', function () {
            $result = $this->converter->convert([
                ['field' => 'temperature', 'operator' => 'lte', 'value' => '30', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('temperature <= 30');
        });

        it('converts contains operator', function () {
            $result = $this->converter->convert([
                ['field' => 'name', 'operator' => 'contains', 'value' => 'test', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('name CONTAINS "test"');
        });
    });

    describe('array operators', function () {
        it('converts in with single value', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => 'in', 'value' => '["open"]', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('status = "open"');
        });

        it('converts in with multiple values to OR chain', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => 'in', 'value' => '["open","pending"]', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('status = "open" OR status = "pending"');
        });

        it('converts not_in with single value', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => 'not_in', 'value' => '["closed"]', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('status != "closed"');
        });

        it('converts not_in with multiple values to AND chain', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => 'not_in', 'value' => '["closed","cancelled"]', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('status != "closed" AND status != "cancelled"');
        });

        it('adds warning for IN with multiple values', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => 'in', 'value' => '["a","b","c"]', 'group_order' => 0],
            ]);

            expect($result->warnings)->not->toBeEmpty()
                ->and($result->warnings[0])->toContain('IN')
                ->and($result->warnings[0])->toContain('OR');
        });

        it('adds warning for NOT_IN with multiple values', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => 'not_in', 'value' => '["a","b"]', 'group_order' => 0],
            ]);

            expect($result->warnings)->not->toBeEmpty()
                ->and($result->warnings[0])->toContain('NOT_IN')
                ->and($result->warnings[0])->toContain('AND');
        });

        it('handles in with numeric array values', function () {
            $result = $this->converter->convert([
                ['field' => 'amount', 'operator' => 'in', 'value' => '[100,200,300]', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('amount = 100 OR amount = 200 OR amount = 300');
        });
    });

    describe('empty operators', function () {
        it('converts is_empty to field = ""', function () {
            $result = $this->converter->convert([
                ['field' => 'description', 'operator' => 'is_empty', 'value' => '', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('description = ""');
        });

        it('converts not_empty to field != ""', function () {
            $result = $this->converter->convert([
                ['field' => 'description', 'operator' => 'not_empty', 'value' => '', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('description != ""');
        });
    });

    describe('grouping', function () {
        it('converts multiple conditions in same group to AND', function () {
            $conditions = [
                ['field' => 'status', 'operator' => 'eq', 'value' => 'open', 'group_order' => 0],
                ['field' => 'amount', 'operator' => 'gt', 'value' => '1000', 'group_order' => 0],
            ];

            $result = $this->converter->convert($conditions);

            expect($result->expression)->toBe('status = "open" AND amount > 1000');
        });

        it('converts conditions across multiple groups to AND', function () {
            $conditions = [
                ['field' => 'status', 'operator' => 'eq', 'value' => 'open', 'group_order' => 0],
                ['field' => 'amount', 'operator' => 'gt', 'value' => '1000', 'group_order' => 1],
            ];

            $result = $this->converter->convert($conditions);

            expect($result->expression)->toContain('AND');
        });

        it('handles mixed operators in same group', function () {
            $conditions = [
                ['field' => 'status', 'operator' => 'in', 'value' => '["open","pending"]', 'group_order' => 0],
                ['field' => 'vip', 'operator' => 'eq', 'value' => 'true', 'group_order' => 0],
            ];

            $result = $this->converter->convert($conditions);

            expect($result->expression)->toContain('OR')
                ->and($result->expression)->toContain('AND');
        });
    });

    describe('value formatting', function () {
        it('formats string values with quotes', function () {
            $result = $this->converter->convert([
                ['field' => 'name', 'operator' => 'eq', 'value' => 'hello', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('name = "hello"');
        });

        it('formats numeric values without quotes', function () {
            $result = $this->converter->convert([
                ['field' => 'amount', 'operator' => 'gt', 'value' => '5000', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('amount > 5000');
        });

        it('formats decimal values without quotes', function () {
            $result = $this->converter->convert([
                ['field' => 'price', 'operator' => 'gte', 'value' => '99.99', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('price >= 99.99');
        });

        it('formats boolean true without quotes', function () {
            $result = $this->converter->convert([
                ['field' => 'vip', 'operator' => 'eq', 'value' => 'true', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('vip = true');
        });

        it('formats boolean false without quotes', function () {
            $result = $this->converter->convert([
                ['field' => 'active', 'operator' => 'neq', 'value' => 'false', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('active != false');
        });
    });

    describe('dot-notation fields', function () {
        it('preserves dot-notation field paths', function () {
            $result = $this->converter->convert([
                ['field' => 'deal.amount', 'operator' => 'gt', 'value' => '10000', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('deal.amount > 10000');
        });

        it('converts nested field conditions', function () {
            $result = $this->converter->convert([
                ['field' => 'project.health_score', 'operator' => 'gte', 'value' => '80', 'group_order' => 0],
                ['field' => 'customer.vip', 'operator' => 'eq', 'value' => 'true', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('project.health_score >= 80 AND customer.vip = true');
        });
    });

    describe('edge cases', function () {
        it('returns empty expression for empty conditions', function () {
            $result = $this->converter->convert([]);

            expect($result->expression)->toBe('')
                ->and($result->warnings)->toHaveCount(1);
        });

        it('skips conditions with missing field', function () {
            $result = $this->converter->convert([
                ['operator' => 'eq', 'value' => 'test', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('');
        });

        it('skips conditions with empty operator', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => '', 'value' => 'open', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('');
        });

        it('adds warning for unknown operator', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => 'unknown_op', 'value' => 'test', 'group_order' => 0],
            ]);

            expect($result->warnings)->toHaveCount(1)
                ->and($result->warnings[0])->toContain('unknown_op');
        });

        it('parenthesizes OR chains within AND groups', function () {
            $conditions = [
                ['field' => 'status', 'operator' => 'in', 'value' => '["open","pending"]', 'group_order' => 0],
                ['field' => 'amount', 'operator' => 'gt', 'value' => '1000', 'group_order' => 0],
            ];

            $result = $this->converter->convert($conditions);

            expect($result->expression)->toContain('(status = "open" OR status = "pending")')
                ->and($result->expression)->toContain('AND amount > 1000');
        });

        it('handles real-world complex condition set', function () {
            $conditions = [
                ['field' => 'deal.amount', 'operator' => 'gt', 'value' => '50000', 'group_order' => 0],
                ['field' => 'deal.stage', 'operator' => 'eq', 'value' => 'proposal', 'group_order' => 0],
                ['field' => 'customer.vip', 'operator' => 'eq', 'value' => 'true', 'group_order' => 1],
            ];

            $result = $this->converter->convert($conditions);

            expect($result->valid)->toBeTrue()
                ->and($result->expression)->toContain('deal.amount > 50000')
                ->and($result->expression)->toContain('deal.stage = "proposal"')
                ->and($result->expression)->toContain('customer.vip = true');
        });

        it('handles single condition with raw string value', function () {
            $result = $this->converter->convert([
                ['field' => 'name', 'operator' => 'contains', 'value' => 'urgent', 'group_order' => 0],
            ]);

            expect($result->expression)->toBe('name CONTAINS "urgent"');
        });

        it('returns valid true for all valid conversions', function () {
            $result = $this->converter->convert([
                ['field' => 'status', 'operator' => 'eq', 'value' => 'open', 'group_order' => 0],
            ]);

            expect($result->valid)->toBeTrue();
        });
    });
});
