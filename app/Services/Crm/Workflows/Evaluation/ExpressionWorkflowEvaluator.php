<?php

namespace App\Services\Crm\Workflows\Evaluation;

use App\Models\CrmWorkflow;
use App\Services\Crm\Expressions\Contracts\ExpressionEvaluatorInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionParserInterface;
use App\Services\Crm\Expressions\DTOs\ExpressionContext as ExpressionEngineContext;
use App\Services\Crm\Expressions\Parser\ExpressionParseException;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionEvaluatorInterface;
use App\Services\Crm\Workflows\DTOs\WorkflowConditionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;

class ExpressionWorkflowEvaluator implements WorkflowConditionEvaluatorInterface
{
    public function __construct(
        private readonly ExpressionParserInterface $parser,
        private readonly ExpressionEvaluatorInterface $evaluator,
    ) {}

    public function evaluate(CrmWorkflow $workflow, WorkflowContext $context): array
    {
        $expression = $workflow->expression;

        if (empty($expression)) {
            return [new WorkflowConditionResult(
                conditionId: 0,
                field: '',
                operator: '',
                expectedValue: '',
                actualValue: null,
                passed: true,
                groupOrder: 0,
            )];
        }

        $exprContext = new ExpressionEngineContext($context->eventPayload);

        try {
            $ast = $this->parser->parse($expression);
        } catch (ExpressionParseException $e) {
            return [new WorkflowConditionResult(
                conditionId: 0,
                field: $expression,
                operator: 'expression',
                expectedValue: $expression,
                actualValue: null,
                passed: false,
                groupOrder: 0,
            )];
        }

        $result = $this->evaluator->evaluate($ast, $exprContext);

        return [new WorkflowConditionResult(
            conditionId: 0,
            field: $expression,
            operator: 'expression',
            expectedValue: $expression,
            actualValue: [
                'matchedRules' => $result->matchedRules,
                'trace' => $result->trace,
                'evaluatedRules' => $result->evaluatedRules,
                'passedRules' => $result->passedRules,
            ],
            passed: $result->passed,
            groupOrder: 0,
        )];
    }

    public function conditionsPassed(array $results): bool
    {
        if (empty($results)) {
            return true;
        }

        return collect($results)->every(fn (WorkflowConditionResult $r) => $r->passed);
    }
}
