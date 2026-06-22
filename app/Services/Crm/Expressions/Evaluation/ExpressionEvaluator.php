<?php

namespace App\Services\Crm\Expressions\Evaluation;

use App\Services\Crm\Expressions\Contracts\ExpressionEvaluatorInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionParserInterface;
use App\Services\Crm\Expressions\DTOs\ExpressionContext;
use App\Services\Crm\Expressions\DTOs\ExpressionResult;
use App\Services\Crm\Expressions\Nodes\ExpressionNode;
use App\Services\Crm\Expressions\Parser\ExpressionParseException;

class ExpressionEvaluator implements ExpressionEvaluatorInterface
{
    public function __construct(
        private ExpressionParserInterface $parser,
    ) {}

    public function evaluate(ExpressionNode $node, ExpressionContext $context): ExpressionResult
    {
        $visitor = new EvaluationVisitor($context);
        $passed = $node->accept($visitor) === true;

        return new ExpressionResult(
            passed: $passed,
            matchedRules: $visitor->matchedRules,
            errors: $visitor->errors,
            trace: $visitor->trace,
            evaluatedRules: $visitor->evaluatedRules,
            passedRules: $visitor->passedRules,
        );
    }

    public function evaluateExpression(string $expression, ExpressionContext $context): ExpressionResult
    {
        try {
            $ast = $this->parser->parse($expression);
        } catch (ExpressionParseException $e) {
            return new ExpressionResult(
                passed: false,
                errors: [$e->getMessage()],
            );
        }

        return $this->evaluate($ast, $context);
    }
}
