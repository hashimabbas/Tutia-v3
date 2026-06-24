<?php

use App\Services\Crm\Analytics\Segmentation\AnalyticsSegmentationService;
use App\Services\Crm\Analytics\Segmentation\SegmentationResult;
use App\Services\Crm\Expressions\Contracts\ExpressionEvaluatorInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionParserInterface;
use App\Services\Crm\Expressions\Contracts\ExpressionValidatorInterface;
use App\Services\Crm\Expressions\DTOs\ExpressionResult;
use App\Services\Crm\Expressions\DTOs\ValidationResult;
use App\Services\Crm\Expressions\Nodes\ComparisonNode;
use App\Services\Crm\Expressions\Nodes\FieldNode;
use App\Services\Crm\Expressions\Nodes\ValueNode;

beforeEach(function () {
    $this->parser = Mockery::mock(ExpressionParserInterface::class);
    $this->evaluator = Mockery::mock(ExpressionEvaluatorInterface::class);
    $this->validator = Mockery::mock(ExpressionValidatorInterface::class);

    $this->service = new AnalyticsSegmentationService(
        $this->parser,
        $this->evaluator,
        $this->validator,
    );

    $this->workflowItems = collect([
        [
            'name' => 'Wf A',
            'totalRuns' => 100,
            'successRate' => 95.0,
            'failureRate' => 5.0,
            'score' => 85,
            'status' => 'active',
        ],
        [
            'name' => 'Wf B',
            'totalRuns' => 50,
            'successRate' => 40.0,
            'failureRate' => 60.0,
            'score' => 30,
            'status' => 'active',
        ],
        [
            'name' => 'Wf C',
            'totalRuns' => 200,
            'successRate' => 98.0,
            'failureRate' => 2.0,
            'score' => 92,
            'status' => 'active',
        ],
    ]);

    $this->approvalItems = collect([
        [
            'name' => 'Flow A',
            'total' => 50,
            'approvalRate' => 90.0,
            'escalationRate' => 5.0,
            'score' => 88,
            'slaCompliance' => 95.0,
        ],
        [
            'name' => 'Flow B',
            'total' => 30,
            'approvalRate' => 40.0,
            'escalationRate' => 25.0,
            'score' => 45,
            'slaCompliance' => 60.0,
        ],
    ]);
});

describe('AnalyticsSegmentationService::segment', function () {
    it('returns all items when expression is empty', function () {
        $result = $this->service->segment($this->workflowItems, 'workflows', '');

        expect($result)->toBeInstanceOf(SegmentationResult::class)
            ->and($result->count)->toBe(3)
            ->and($result->total)->toBe(3)
            ->and($result->percentage)->toBe(100.0)
            ->and($result->items)->toHaveCount(3);
    });

    it('returns all items for unknown tab', function () {
        $result = $this->service->segment($this->workflowItems, 'unknown', 'workflow.health_score < 50');

        expect($result)->toBeInstanceOf(SegmentationResult::class)
            ->and($result->count)->toBe(3)
            ->and($result->total)->toBe(3)
            ->and($result->percentage)->toBe(100.0);
    });

    it('filters workflows by expression', function () {
        $ast = new ComparisonNode(new FieldNode('workflow.health_score'), '<', new ValueNode(50));

        $this->parser->shouldReceive('parse')
            ->with('workflow.health_score < 50')
            ->andReturn($ast);

        $this->evaluator->shouldReceive('evaluate')
            ->andReturn(
                new ExpressionResult(passed: false),  // Wf A: health_score=85
                new ExpressionResult(passed: true),   // Wf B: health_score=30
                new ExpressionResult(passed: false),  // Wf C: health_score=92
            );

        $result = $this->service->segment($this->workflowItems, 'workflows', 'workflow.health_score < 50');

        expect($result->count)->toBe(1)
            ->and($result->total)->toBe(3)
            ->and($result->percentage)->toBe(33.3)
            ->and($result->evaluated)->toBe(3)
            ->and($result->items)->toHaveCount(1)
            ->and($result->items->first()['name'])->toBe('Wf B');
    });

    it('filters approvals by expression', function () {
        $ast = new ComparisonNode(new FieldNode('approval.escalation_rate'), '>', new ValueNode(15));

        $this->parser->shouldReceive('parse')
            ->with('approval.escalation_rate > 15')
            ->andReturn($ast);

        $this->evaluator->shouldReceive('evaluate')
            ->andReturn(
                new ExpressionResult(passed: false),  // Flow A: escalation_rate=5
                new ExpressionResult(passed: true),   // Flow B: escalation_rate=25
            );

        $result = $this->service->segment($this->approvalItems, 'approvals', 'approval.escalation_rate > 15');

        expect($result->count)->toBe(1)
            ->and($result->total)->toBe(2)
            ->and($result->percentage)->toBe(50.0)
            ->and($result->items)->toHaveCount(1)
            ->and($result->items->first()['name'])->toBe('Flow B');
    });

    it('keeps items that throw during evaluation', function () {
        $ast = new ComparisonNode(new FieldNode('workflow.health_score'), '>', new ValueNode(100));

        $this->parser->shouldReceive('parse')
            ->with('workflow.health_score > 100')
            ->andReturn($ast);

        $this->evaluator->shouldReceive('evaluate')
            ->zeroOrMoreTimes()
            ->andThrow(new RuntimeException('Evaluation failed'));

        $result = $this->service->segment($this->workflowItems, 'workflows', 'workflow.health_score > 100');

        expect($result->count)->toBe(0)
            ->and($result->evaluated)->toBe(0)
            ->and($result->items)->toHaveCount(3);
    });
});

describe('AnalyticsSegmentationService::validateExpression', function () {
    it('returns valid for a correct expression', function () {
        $ast = new ComparisonNode(new FieldNode('workflow.health_score'), '<', new ValueNode(50));

        $this->parser->shouldReceive('parse')
            ->with('workflow.health_score < 50')
            ->andReturn($ast);

        $this->validator->shouldReceive('validate')
            ->with('workflow.health_score < 50', Mockery::type('array'))
            ->andReturn(new ValidationResult(valid: true, errors: [], warnings: []));

        $result = $this->service->validateExpression('workflows', 'workflow.health_score < 50');

        expect($result->valid)->toBeTrue()
            ->and($result->errors)->toBeEmpty();
    });

    it('returns invalid for unknown tab', function () {
        $result = $this->service->validateExpression('unknown', 'workflow.health_score < 50');

        expect($result->valid)->toBeFalse()
            ->and($result->errors)->not->toBeEmpty();
    });

    it('catches parser exceptions', function () {
        $this->parser->shouldReceive('parse')
            ->with('invalid syntax')
            ->andThrow(new RuntimeException('Parse error'));

        $result = $this->service->validateExpression('workflows', 'invalid syntax');

        expect($result->valid)->toBeFalse()
            ->and($result->errors)->toHaveCount(1);
    });
});
