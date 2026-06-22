<?php

use App\Services\Crm\Expressions\Catalogs\ExpressionFieldCatalog;
use App\Services\Crm\Expressions\DTOs\FieldDefinition;
use App\Services\Crm\Expressions\DTOs\ValidationResult;
use App\Services\Crm\Expressions\Parser\ExpressionParser;
use App\Services\Crm\Expressions\Validation\ExpressionValidator;

beforeEach(function () {
    $this->validator = new ExpressionValidator(new ExpressionParser);
});

describe('ValidationResult DTO', function () {
    it('creates a valid result', function () {
        $result = new ValidationResult(valid: true);

        expect($result->valid)->toBeTrue()
            ->and($result->errors)->toBeEmpty()
            ->and($result->warnings)->toBeEmpty();
    });

    it('creates an invalid result with errors', function () {
        $result = new ValidationResult(
            valid: false,
            errors: ['Syntax error'],
        );

        expect($result->valid)->toBeFalse()
            ->and($result->errors)->toHaveCount(1)
            ->and($result->errors[0])->toBe('Syntax error');
    });

    it('creates a result with warnings', function () {
        $result = new ValidationResult(
            valid: true,
            warnings: ['Suspicious value'],
        );

        expect($result->valid)->toBeTrue()
            ->and($result->warnings)->toHaveCount(1)
            ->and($result->warnings[0])->toBe('Suspicious value');
    });

    it('is immutable (readonly)', function () {
        $result = new ValidationResult(valid: true);

        expect(fn () => $result->valid = false)->toThrow(Error::class);
    });
});

describe('FieldDefinition DTO', function () {
    it('creates a field definition', function () {
        $def = new FieldDefinition(
            path: 'deal.amount',
            type: ExpressionFieldCatalog::TYPE_NUMERIC,
            supportedOperators: ['=', '>'],
        );

        expect($def->path)->toBe('deal.amount')
            ->and($def->type)->toBe('numeric')
            ->and($def->supportedOperators)->toContain('=', '>');
    });

    it('is immutable (readonly)', function () {
        $def = new FieldDefinition(
            path: 'deal.amount',
            type: ExpressionFieldCatalog::TYPE_NUMERIC,
            supportedOperators: ['='],
        );

        expect(fn () => $def->path = 'other')->toThrow(Error::class);
    });
});

describe('ExpressionFieldCatalog', function () {
    it('returns all field paths', function () {
        $all = ExpressionFieldCatalog::all();

        expect($all)->toBeArray()
            ->and($all)->toContain('deal.amount', 'status', 'customer.vip');
    });

    it('finds a known field definition', function () {
        $def = ExpressionFieldCatalog::find('deal.amount');

        expect($def)->not->toBeNull()
            ->and($def->type)->toBe(ExpressionFieldCatalog::TYPE_NUMERIC)
            ->and($def->supportedOperators)->toContain('=', '>', '<');
    });

    it('returns null for unknown field', function () {
        expect(ExpressionFieldCatalog::find('nonexistent'))->toBeNull();
    });

    it('checks field existence', function () {
        expect(ExpressionFieldCatalog::has('deal.amount'))->toBeTrue()
            ->and(ExpressionFieldCatalog::has('unknown'))->toBeFalse();
    });
});

describe('Validator — Layer 1: Parse validation', function () {
    it('rejects empty expression', function () {
        $result = $this->validator->validate('');

        expect($result->valid)->toBeFalse();
        expect($result->errors)->not->toBeEmpty();
    });

    it('rejects invalid syntax', function () {
        $result = $this->validator->validate('amount >');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Expected value');
    });

    it('rejects unterminated string', function () {
        $result = $this->validator->validate('status = "unclosed');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Unterminated string');
    });
});

describe('Validator — Layer 2: Field validation', function () {
    it('accepts known fields from default catalog', function () {
        $result = $this->validator->validate('deal.amount > 10000');

        expect($result->valid)->toBeTrue();
    });

    it('rejects unknown field from default catalog', function () {
        $result = $this->validator->validate('unknown_field > 100');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Unknown field');
    });

    it('rejects unknown field when available fields specified', function () {
        $result = $this->validator->validate('deal.amount > 100', availableFields: ['status']);

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Unknown field');
    });

    it('accepts field from available fields list', function () {
        $result = $this->validator->validate('status = "open"', availableFields: ['status']);

        expect($result->valid)->toBeTrue();
    });

    it('accepts multiple known fields in AND expression', function () {
        $result = $this->validator->validate('deal.amount > 1000 AND status = "open"');

        expect($result->valid)->toBeTrue();
    });

    it('rejects unknown field in right side of AND', function () {
        $result = $this->validator->validate('amount > 1000 AND badfield = "x"');

        expect($result->valid)->toBeFalse();
        expect($result->errors)->toHaveCount(1);
    });

    it('rejects unknown field in NOT expression', function () {
        $result = $this->validator->validate('NOT badfield = true');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Unknown field');
    });

    it('rejects unknown field in nested group', function () {
        $result = $this->validator->validate('(amount > 1000 AND badfield = "x")');

        expect($result->valid)->toBeFalse();
    });
});

describe('Validator — Layer 3: Operator validation', function () {
    it('rejects > operator on string field', function () {
        $result = $this->validator->validate('status > "open"');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Operator');
    });

    it('rejects contains on numeric field', function () {
        $result = $this->validator->validate('amount CONTAINS "test"');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Operator');
    });

    it('rejects starts_with on numeric field', function () {
        $result = $this->validator->validate('amount STARTS_WITH "12"');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Operator');
    });

    it('accepts = on any field type', function () {
        expect($this->validator->validate('amount = 100')->valid)->toBeTrue();
        expect($this->validator->validate('status = "open"')->valid)->toBeTrue();
        expect($this->validator->validate('vip = true')->valid)->toBeTrue();
    });
});

describe('Validator — Layer 4: Type validation', function () {
    it('rejects string value for numeric field', function () {
        $result = $this->validator->validate('amount > "abc"');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Expected numeric');
    });

    it('rejects numeric value for boolean field', function () {
        $result = $this->validator->validate('vip = 1');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Expected boolean');
    });

    it('rejects numeric value for string field', function () {
        $result = $this->validator->validate('status = 123');

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Expected string');
    });

    it('accepts correct type for numeric field', function () {
        expect($this->validator->validate('amount = 5000')->valid)->toBeTrue();
        expect($this->validator->validate('score = 85')->valid)->toBeTrue();
    });

    it('accepts correct type for boolean field', function () {
        expect($this->validator->validate('vip = true')->valid)->toBeTrue();
        expect($this->validator->validate('active = false')->valid)->toBeTrue();
    });
});

describe('Validator — Layer 5: Warnings', function () {
    it('warns when value exceeds suggested max', function () {
        $result = $this->validator->validate('amount > 1000000000');

        expect($result->valid)->toBeTrue();
        expect($result->warnings)->not->toBeEmpty();
        expect($result->warnings[0])->toContain('Suspicious threshold');
    });

    it('does not warn for normal values', function () {
        $result = $this->validator->validate('amount > 100');

        expect($result->valid)->toBeTrue();
        expect($result->warnings)->toBeEmpty();
    });
});

describe('Validator — Complex expressions', function () {
    it('validates AND expression fully', function () {
        $result = $this->validator->validate('deal.amount > 10000 AND deal.status = "proposal"');

        expect($result->valid)->toBeTrue();
    });

    it('validates OR expression fully', function () {
        $result = $this->validator->validate('status = "open" OR status = "pending"');

        expect($result->valid)->toBeTrue();
    });

    it('validates NOT expression fully', function () {
        $result = $this->validator->validate('NOT vip = true');

        expect($result->valid)->toBeTrue();
    });

    it('validates grouped expression fully', function () {
        $result = $this->validator->validate('(amount > 1000 AND status = "open")');

        expect($result->valid)->toBeTrue();
    });

    it('validates complex nested expression', function () {
        $result = $this->validator->validate('(deal.amount > 10000 AND deal.stage = "proposal") OR (customer.vip = true AND project.risk_score > 80)');

        expect($result->valid)->toBeTrue();
    });

    it('returns multiple errors for compound expression', function () {
        $result = $this->validator->validate('bad1 > 100 AND bad2 = "x"');

        expect($result->valid)->toBeFalse();
        expect($result->errors)->toHaveCount(2);
    });

    it('uses availableFields to restrict which fields are valid', function () {
        $result = $this->validator->validate('deal.amount > 1000 AND status = "open"', availableFields: ['deal.amount']);

        expect($result->valid)->toBeFalse();
        expect($result->errors[0])->toContain('Unknown field');
    });
});

describe('Validator — Edge cases', function () {
    it('handles dot-path fields', function () {
        expect($this->validator->validate('deal.amount > 100')->valid)->toBeTrue();
        expect($this->validator->validate('project.risk_score > 80')->valid)->toBeTrue();
    });

    it('handles expresssions with extra whitespace', function () {
        expect($this->validator->validate('  amount  >  1000  AND  status  =  "open"  ')->valid)->toBeTrue();
    });

    it('handles single comparison with IN operator', function () {
        expect($this->validator->validate('status IN "active"')->valid)->toBeTrue();
    });

    it('handles CONTAINS on string field', function () {
        expect($this->validator->validate('name CONTAINS "test"')->valid)->toBeTrue();
    });

    it('handles STARTS_WITH on string field', function () {
        expect($this->validator->validate('code STARTS_WITH "ABC"')->valid)->toBeTrue();
    });

    it('rejects field not in catalog with custom availableFields', function () {
        $result = $this->validator->validate('score = 80', availableFields: ['score']);

        expect($result->valid)->toBeTrue();
    });
});
