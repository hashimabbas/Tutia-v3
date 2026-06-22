<?php

use App\Services\Crm\Analytics\Catalogs\ApprovalAnalyticsExamplesCatalog;
use App\Services\Crm\Analytics\Catalogs\WorkflowAnalyticsExamplesCatalog;

describe('WorkflowAnalyticsExamplesCatalog', function () {
    it('returns all workflow examples', function () {
        $examples = WorkflowAnalyticsExamplesCatalog::all();

        expect($examples)->toBeArray()
            ->and($examples)->not->toBeEmpty();
    });

    it('each example has required keys', function () {
        $examples = WorkflowAnalyticsExamplesCatalog::all();

        foreach ($examples as $example) {
            expect($example)->toHaveKeys(['expression', 'label', 'description']);
        }
    });

    it('each expression references valid workflow fields', function () {
        $examples = WorkflowAnalyticsExamplesCatalog::all();

        foreach ($examples as $example) {
            expect($example['expression'])->toMatch('/^workflow\./');
        }
    });

    it('contains failure and health expressions', function () {
        $examples = WorkflowAnalyticsExamplesCatalog::all();
        $expressions = array_map(fn ($e) => $e['expression'], $examples);

        expect($expressions)->toContain('workflow.health_score < 50')
            ->and($expressions)->toContain('workflow.failure_rate > 20');
    });
});

describe('ApprovalAnalyticsExamplesCatalog', function () {
    it('returns all approval examples', function () {
        $examples = ApprovalAnalyticsExamplesCatalog::all();

        expect($examples)->toBeArray()
            ->and($examples)->not->toBeEmpty();
    });

    it('each example has required keys', function () {
        $examples = ApprovalAnalyticsExamplesCatalog::all();

        foreach ($examples as $example) {
            expect($example)->toHaveKeys(['expression', 'label', 'description']);
        }
    });

    it('each expression references valid approval fields', function () {
        $examples = ApprovalAnalyticsExamplesCatalog::all();

        foreach ($examples as $example) {
            expect($example['expression'])->toMatch('/^approval\./');
        }
    });

    it('contains SLA and escalation expressions', function () {
        $examples = ApprovalAnalyticsExamplesCatalog::all();
        $expressions = array_map(fn ($e) => $e['expression'], $examples);

        expect($expressions)->toContain('approval.sla_compliance < 80')
            ->and($expressions)->toContain('approval.escalation_rate > 15');
    });
});
