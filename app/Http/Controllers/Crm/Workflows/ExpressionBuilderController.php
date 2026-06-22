<?php

namespace App\Http\Controllers\Crm\Workflows;

use App\Http\Controllers\Controller;
use App\Services\Crm\Expressions\Catalogs\ExpressionFieldCatalog;
use App\Services\Crm\Expressions\Contracts\ExpressionValidatorInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpressionBuilderController extends Controller
{
    public function fields(): JsonResponse
    {
        $catalog = ExpressionFieldCatalog::all();

        $fields = array_map(fn (string $path) => [
            'path' => $path,
            'type' => ExpressionFieldCatalog::find($path)?->type,
            'operators' => ExpressionFieldCatalog::find($path)?->supportedOperators,
            'suggested_min' => ExpressionFieldCatalog::find($path)?->suggestedMin,
            'suggested_max' => ExpressionFieldCatalog::find($path)?->suggestedMax,
        ], $catalog);

        return response()->json(['fields' => array_values($fields)]);
    }

    public function operators(): JsonResponse
    {
        $operatorLabels = [
            '=' => 'Equals',
            '!=' => 'Not Equals',
            '>' => 'Greater Than',
            '>=' => 'Greater Than Or Equal',
            '<' => 'Less Than',
            '<=' => 'Less Than Or Equal',
            'in' => 'In',
            'not_in' => 'Not In',
            'contains' => 'Contains',
            'starts_with' => 'Starts With',
            'ends_with' => 'Ends With',
        ];

        return response()->json([
            'operators' => collect(ExpressionFieldCatalog::stringOperators())
                ->merge(ExpressionFieldCatalog::numericOperators())
                ->merge(ExpressionFieldCatalog::booleanOperators())
                ->unique()
                ->values()
                ->map(fn (string $op) => [
                    'key' => $op,
                    'label' => $operatorLabels[$op] ?? $op,
                ]),
        ]);
    }

    public function validateExpression(Request $request, ExpressionValidatorInterface $validator): JsonResponse
    {
        $data = $request->validate([
            'expression' => ['required', 'string'],
        ]);

        $result = $validator->validate($data['expression'], ExpressionFieldCatalog::all());

        return response()->json([
            'valid' => $result->valid,
            'errors' => $result->errors,
            'warnings' => $result->warnings,
        ]);
    }

    public function convert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rows' => ['required', 'array'],
            'rows.*.field' => ['required', 'string'],
            'rows.*.operator' => ['required', 'string'],
            'rows.*.value' => ['present'],
            'rows.*.negate' => ['sometimes', 'boolean'],
            'rows.*.connector' => ['nullable', 'string', 'in:AND,OR'],
        ]);

        $parts = [];

        foreach ($data['rows'] as $i => $row) {
            $value = $row['value'];
            $field = $row['field'];
            $operator = $row['operator'];
            $negate = $row['negate'] ?? false;

            $formattedValue = match (true) {
                is_bool($value) => $value ? 'true' : 'false',
                is_numeric($value) => $value,
                default => '"'.$value.'"',
            };

            $condition = "{$field} {$operator} {$formattedValue}";

            if ($negate) {
                $condition = "NOT ({$condition})";
            }

            $parts[] = $condition;
        }

        $expression = implode(' ', $parts);

        return response()->json([
            'expression' => $expression,
        ]);
    }
}
