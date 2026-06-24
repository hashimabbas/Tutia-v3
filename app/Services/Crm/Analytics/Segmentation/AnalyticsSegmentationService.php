<?php

namespace App\Services\Crm\Analytics\Segmentation;

use App\Services\Crm\Analytics\Catalogs\ApprovalAnalyticsFieldCatalog;
use App\Services\Crm\Analytics\Catalogs\WorkflowAnalyticsFieldCatalog;
use App\Services\Crm\Expressions\Contracts\ExpressionEvaluatorInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionParserInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionValidatorInterface;
use App\Services\Crm\Expressions\DTOs\ExpressionContext;
use App\Services\Crm\Expressions\DTOs\ValidationResult;
use Illuminate\Support\Collection;
use Throwable;

class AnalyticsSegmentationService
{
    private const CATALOG_MAP = [
        'workflows' => WorkflowAnalyticsFieldCatalog::class,
        'approvals' => ApprovalAnalyticsFieldCatalog::class,
    ];

    public function __construct(
        private readonly ExpressionParserInterface $parser,
        private readonly ExpressionEvaluatorInterface $evaluator,
        private readonly ExpressionValidatorInterface $validator,
    ) {}

    public function segment(Collection $items, string $tab, string $expression): SegmentationResult
    {
        $total = $items->count();

        if (empty(trim($expression))) {
            return new SegmentationResult(
                count: $total,
                total: $total,
                percentage: $total > 0 ? 100.0 : 0.0,
                evaluated: $total,
                items: $items,
            );
        }

        $catalogClass = self::CATALOG_MAP[$tab] ?? null;

        if ($catalogClass === null) {
            return new SegmentationResult(
                count: $total,
                total: $total,
                percentage: $total > 0 ? 100.0 : 0.0,
                evaluated: $total,
                items: $items,
            );
        }

        $normalizer = [$catalogClass, 'normalizeData'];
        $evaluated = 0;
        $matched = 0;

        try {
            $ast = $this->parser->parse($expression);
        } catch (Throwable) {
            return new SegmentationResult(
                count: 0, total: $total, percentage: 0.0, evaluated: 0, items: $items,
            );
        }

        $filtered = $items->filter(function (mixed $item) use ($ast, $normalizer, &$evaluated, &$matched) {
            $data = is_array($item) ? $normalizer($item) : [];

            try {
                $context = new ExpressionContext($data);
                $result = $this->evaluator->evaluate($ast, $context);
                $evaluated++;

                if ($result->passed) {
                    $matched++;

                    return true;
                }

                return false;
            } catch (Throwable) {
                return true;
            }
        })->values();

        return new SegmentationResult(
            count: $matched,
            total: $total,
            percentage: $total > 0 ? round(($matched / $total) * 100, 1) : 0.0,
            evaluated: $evaluated,
            items: $filtered,
        );
    }

    public function validateExpression(string $tab, string $expression): ValidationResult
    {
        $catalogClass = self::CATALOG_MAP[$tab] ?? null;

        if ($catalogClass === null) {
            return new ValidationResult(valid: false, errors: ["Unknown tab: {$tab}"], warnings: []);
        }

        try {
            $this->parser->parse($expression);

            return $this->validator->validate($expression, $catalogClass::all());
        } catch (Throwable $e) {
            return new ValidationResult(valid: false, errors: [$e->getMessage()], warnings: []);
        }
    }
}
