<?php

namespace App\Services\Crm\Expressions\Validation;

use App\Services\Crm\Expressions\Catalogs\ExpressionFieldCatalog;
use App\Services\Crm\Expressions\Contracts\ExpressionNodeVisitor;
use App\Services\Crm\Expressions\Contracts\ExpressionParserInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionValidatorInterface;
use App\Services\Crm\Expressions\DTOs\FieldDefinition;
use App\Services\Crm\Expressions\DTOs\ValidationResult;
use App\Services\Crm\Expressions\Nodes\AndNode;
use App\Services\Crm\Expressions\Nodes\ComparisonNode;
use App\Services\Crm\Expressions\Nodes\FieldNode;
use App\Services\Crm\Expressions\Nodes\NotNode;
use App\Services\Crm\Expressions\Nodes\OrNode;
use App\Services\Crm\Expressions\Nodes\ValueNode;
use App\Services\Crm\Expressions\Parser\ExpressionParseException;

class ExpressionValidator implements ExpressionValidatorInterface
{
    public function __construct(
        private ExpressionParserInterface $parser,
    ) {}

    public function validate(string $expression, array $availableFields = []): ValidationResult
    {
        try {
            $ast = $this->parser->parse($expression);
        } catch (ExpressionParseException $e) {
            return new ValidationResult(
                valid: false,
                errors: [$e->getMessage()],
            );
        }

        $visitor = new ValidationFieldVisitor($availableFields);
        $ast->accept($visitor);

        return new ValidationResult(
            valid: empty($visitor->errors),
            errors: $visitor->errors,
            warnings: $visitor->warnings,
        );
    }
}

class ValidationFieldVisitor implements ExpressionNodeVisitor
{
    public array $errors = [];

    public array $warnings = [];

    private array $fieldPool;

    public function __construct(array $availableFields = [])
    {
        $this->fieldPool = $availableFields !== [] ? $availableFields : ExpressionFieldCatalog::all();
    }

    public function visitAnd(AndNode $node): mixed
    {
        foreach ($node->children as $child) {
            $child->accept($this);
        }

        return null;
    }

    public function visitOr(OrNode $node): mixed
    {
        foreach ($node->children as $child) {
            $child->accept($this);
        }

        return null;
    }

    public function visitNot(NotNode $node): mixed
    {
        $node->child->accept($this);

        return null;
    }

    public function visitComparison(ComparisonNode $node): mixed
    {
        $node->field->accept($this);
        $node->value->accept($this);

        $field = $node->field->path;
        $operator = $node->operator;
        $value = $node->value->value;

        if (! in_array($field, $this->fieldPool, true)) {
            $this->errors[] = "Unknown field: {$field}";

            return null;
        }

        $def = ExpressionFieldCatalog::find($field);

        if ($def === null) {
            return null;
        }

        if (! in_array($operator, $def->supportedOperators, true)) {
            $this->errors[] = "Operator {$operator} not allowed for field {$field}";

            return null;
        }

        $typeError = $this->checkType($def, $value, $field);

        if ($typeError !== null) {
            $this->errors[] = $typeError;
        }

        $warning = $this->checkWarning($def, $value, $field);

        if ($warning !== null) {
            $this->warnings[] = $warning;
        }

        return null;
    }

    public function visitField(FieldNode $node): mixed
    {
        return null;
    }

    public function visitValue(ValueNode $node): mixed
    {
        return null;
    }

    private function checkType(FieldDefinition $def, mixed $value, string $field): ?string
    {
        return match ($def->type) {
            ExpressionFieldCatalog::TYPE_NUMERIC => is_numeric($value) ? null : "Expected numeric value for field {$field}, got ".gettype($value),
            ExpressionFieldCatalog::TYPE_BOOLEAN => is_bool($value) ? null : "Expected boolean value for field {$field}, got ".gettype($value),
            ExpressionFieldCatalog::TYPE_STRING => is_string($value) ? null : "Expected string value for field {$field}, got ".gettype($value),
            default => null,
        };
    }

    private function checkWarning(FieldDefinition $def, mixed $value, string $field): ?string
    {
        if ($def->type !== ExpressionFieldCatalog::TYPE_NUMERIC || ! is_numeric($value)) {
            return null;
        }

        if ($def->suggestedMax !== null && (float) $value > $def->suggestedMax) {
            return "Suspicious threshold value for {$field}: {$value} exceeds suggested maximum {$def->suggestedMax}";
        }

        if ($def->suggestedMin !== null && (float) $value < $def->suggestedMin) {
            return "Suspicious threshold value for {$field}: {$value} is below suggested minimum {$def->suggestedMin}";
        }

        return null;
    }
}
