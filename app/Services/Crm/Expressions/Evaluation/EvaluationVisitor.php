<?php

namespace App\Services\Crm\Expressions\Evaluation;

use App\Services\Crm\Expressions\Contracts\ExpressionNodeVisitor;
use App\Services\Crm\Expressions\DTOs\ExpressionContext;
use App\Services\Crm\Expressions\DTOs\RuleTrace;
use App\Services\Crm\Expressions\Nodes\AndNode;
use App\Services\Crm\Expressions\Nodes\ComparisonNode;
use App\Services\Crm\Expressions\Nodes\FieldNode;
use App\Services\Crm\Expressions\Nodes\NotNode;
use App\Services\Crm\Expressions\Nodes\OrNode;
use App\Services\Crm\Expressions\Nodes\ValueNode;

class EvaluationVisitor implements ExpressionNodeVisitor
{
    public array $errors = [];

    public array $matchedRules = [];

    /** @var RuleTrace[] */
    public array $trace = [];

    public int $evaluatedRules = 0;

    public int $passedRules = 0;

    private ExpressionContext $context;

    public function __construct(ExpressionContext $context)
    {
        $this->context = $context;
    }

    public function visitAnd(AndNode $node): mixed
    {
        foreach ($node->children as $child) {
            if ($child->accept($this) !== true) {
                return false;
            }
        }

        return true;
    }

    public function visitOr(OrNode $node): mixed
    {
        foreach ($node->children as $child) {
            if ($child->accept($this) === true) {
                return true;
            }
        }

        return false;
    }

    public function visitNot(NotNode $node): mixed
    {
        return $node->child->accept($this) !== true;
    }

    public function visitComparison(ComparisonNode $node): mixed
    {
        $fieldPath = $node->field->path;
        $operator = $node->operator;
        $compareValue = $node->value->value;

        if (! $this->fieldExists($fieldPath)) {
            $rule = $this->formatRule($fieldPath, $operator, $compareValue);
            $ruleId = $this->formatRuleId($fieldPath, $operator);

            $this->errors[] = "Field {$fieldPath} not found";

            $this->matchedRules[] = [
                'rule' => $rule,
                'passed' => false,
            ];

            $this->trace[] = new RuleTrace(
                field: $fieldPath,
                operator: $operator,
                expected: $compareValue,
                actual: null,
                passed: false,
                rule: $rule,
                ruleId: $ruleId,
            );

            $this->evaluatedRules++;

            return false;
        }

        $fieldValue = $this->resolveDotPath($fieldPath);

        $result = $this->evaluateOperator($fieldValue, $operator, $compareValue);

        $rule = $this->formatRule($fieldPath, $operator, $compareValue);

        $this->matchedRules[] = [
            'rule' => $rule,
            'passed' => $result,
        ];

        $this->trace[] = new RuleTrace(
            field: $fieldPath,
            operator: $operator,
            expected: $compareValue,
            actual: $fieldValue,
            passed: $result,
            rule: $rule,
            ruleId: $this->formatRuleId($fieldPath, $operator),
        );

        $this->evaluatedRules++;
        if ($result) {
            $this->passedRules++;
        }

        return $result;
    }

    public function visitField(FieldNode $node): mixed
    {
        return $this->resolveDotPath($node->path);
    }

    public function visitValue(ValueNode $node): mixed
    {
        return $node->value;
    }

    private function fieldExists(string $path): bool
    {
        $keys = explode('.', $path);
        $data = $this->context->data;

        foreach ($keys as $key) {
            if (! is_array($data) || ! array_key_exists($key, $data)) {
                return false;
            }

            $data = $data[$key];
        }

        return true;
    }

    private function resolveDotPath(string $path): mixed
    {
        $keys = explode('.', $path);
        $data = $this->context->data;

        foreach ($keys as $key) {
            if (! is_array($data) || ! array_key_exists($key, $data)) {
                return null;
            }

            $data = $data[$key];
        }

        return $data;
    }

    private function evaluateOperator(mixed $fieldValue, string $operator, mixed $compareValue): bool
    {
        return match ($operator) {
            '=' => $fieldValue == $compareValue,
            '!=' => $fieldValue != $compareValue,
            '>' => $fieldValue > $compareValue,
            '>=' => $fieldValue >= $compareValue,
            '<' => $fieldValue < $compareValue,
            '<=' => $fieldValue <= $compareValue,
            'contains' => is_string($fieldValue) && is_string($compareValue) && str_contains($fieldValue, $compareValue),
            'starts_with' => is_string($fieldValue) && is_string($compareValue) && str_starts_with($fieldValue, $compareValue),
            'ends_with' => is_string($fieldValue) && is_string($compareValue) && str_ends_with($fieldValue, $compareValue),
            'in' => $fieldValue == $compareValue,
            'not_in' => $fieldValue != $compareValue,
            default => false,
        };
    }

    private function formatRule(string $field, string $operator, mixed $value): string
    {
        $valueStr = match (true) {
            is_bool($value) => $value ? 'true' : 'false',
            is_null($value) => 'null',
            is_string($value) => '"'.$value.'"',
            default => (string) $value,
        };

        return $field.' '.$operator.' '.$valueStr;
    }

    private function formatRuleId(string $field, string $operator): string
    {
        return $field.'::'.$operator;
    }
}
