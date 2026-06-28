<?php

namespace App\Services\Crm\Workflows\Conversion;

class LegacyConditionToExpressionConverter
{
    private const OPERATOR_MAP = [
        'eq' => '=',
        'neq' => '!=',
        'gt' => '>',
        'gte' => '>=',
        'lt' => '<',
        'lte' => '<=',
        'in' => 'in',
        'not_in' => 'not_in',
        'contains' => 'CONTAINS',
    ];

    private array $warnings = [];

    public function convert(array $conditions): ConversionResult
    {
        $this->warnings = [];

        if (empty($conditions)) {
            return new ConversionResult(
                expression: '',
                valid: true,
                warnings: ['No conditions to convert'],
            );
        }

        $grouped = $this->groupByOrder($conditions);
        $groupExprs = [];

        foreach ($grouped as $groupOrder => $group) {
            $parts = [];

            foreach ($group as $condition) {
                $result = $this->convertCondition($condition);

                if ($result !== null) {
                    $parts[] = $result;
                }
            }

            if (! empty($parts)) {
                $groupExprs[] = $this->joinWithAnd($parts);
            }
        }

        $expression = $this->joinWithAnd($groupExprs);

        return new ConversionResult(
            expression: $expression,
            valid: true,
            warnings: array_values(array_unique($this->warnings)),
        );
    }

    private function joinWithAnd(array $parts): string
    {
        if (count($parts) <= 1) {
            return implode(' AND ', $parts);
        }

        $wrapped = array_map(
            fn ($p) => $this->isComplex($p) ? "({$p})" : $p,
            $parts,
        );

        return implode(' AND ', $wrapped);
    }

    private function isComplex(string $part): bool
    {
        return str_contains($part, ' OR ') || str_contains($part, ' AND ');
    }

    private function convertCondition(array $condition): ?string
    {
        $field = $condition['field'] ?? '';
        $operator = $condition['operator'] ?? '';
        $value = $condition['value'] ?? '';

        if (empty($field) || empty($operator)) {
            return null;
        }

        if ($operator === 'is_empty') {
            return "{$field} = \"\"";
        }

        if ($operator === 'not_empty') {
            return "{$field} != \"\"";
        }

        $v2Operator = self::OPERATOR_MAP[$operator] ?? null;

        if ($v2Operator === null) {
            $this->warnings[] = "Unsupported operator \"{$operator}\" for field \"{$field}\"";

            return null;
        }

        $decodedValue = $this->decodeValue($value);

        if ($operator === 'in' && is_array($decodedValue)) {
            return $this->convertIn($field, $decodedValue);
        }

        if ($operator === 'not_in' && is_array($decodedValue)) {
            return $this->convertNotIn($field, $decodedValue);
        }

        $formattedValue = $this->formatValue($decodedValue);

        return "{$field} {$v2Operator} {$formattedValue}";
    }

    private function convertIn(string $field, array $values): string
    {
        $parts = [];

        foreach ($values as $v) {
            $formatted = $this->formatValue($v);
            $parts[] = "{$field} = {$formatted}";
        }

        if (count($parts) === 1) {
            return $parts[0];
        }

        $this->warnings[] = "IN operator with multiple values expanded to OR chain on field \"{$field}\"";

        return implode(' OR ', $parts);
    }

    private function convertNotIn(string $field, array $values): string
    {
        $parts = [];

        foreach ($values as $v) {
            $formatted = $this->formatValue($v);
            $parts[] = "{$field} != {$formatted}";
        }

        if (count($parts) === 1) {
            return $parts[0];
        }

        $this->warnings[] = "NOT_IN operator with multiple values expanded to AND chain on field \"{$field}\"";

        return implode(' AND ', $parts);
    }

    private function groupByOrder(array $conditions): array
    {
        $grouped = [];

        foreach ($conditions as $condition) {
            $order = $condition['group_order'] ?? 0;
            $grouped[$order][] = $condition;
        }

        ksort($grouped);

        return $grouped;
    }

    private function decodeValue(string $value): mixed
    {
        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    private function formatValue(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_numeric($value)) {
            return (string) $value;
        }

        return '"'.$value.'"';
    }
}
