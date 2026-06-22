<?php

use App\Services\Crm\Workflows\Debug\WorkflowFailureExplainer;

describe('WorkflowFailureExplainer', function () {
    it('generates success summary when all pass', function () {
        $explainer = new WorkflowFailureExplainer(
            expression: 'amount > 100',
            trace: [
                ['field' => 'amount', 'operator' => '>', 'expected' => 100, 'actual' => 200, 'passed' => true, 'rule' => 'amount > 100', 'ruleId' => 'amount::>'],
            ],
            evaluatedRules: 1,
            passedRules: 1,
            passed: true,
        );

        expect($explainer->summary())->toBe('All expression rules passed.');
    });

    it('generates single failure summary', function () {
        $explainer = new WorkflowFailureExplainer(
            expression: 'amount > 100',
            trace: [
                ['field' => 'amount', 'operator' => '>', 'expected' => 100, 'actual' => 50, 'passed' => false, 'rule' => 'amount > 100', 'ruleId' => 'amount::>'],
            ],
            evaluatedRules: 1,
            passedRules: 0,
            passed: false,
        );

        expect($explainer->summary())->toContain('expected', 'but actual value was');
    });

    it('generates multi-failure summary', function () {
        $explainer = new WorkflowFailureExplainer(
            expression: 'amount > 100 AND status = "open"',
            trace: [
                ['field' => 'amount', 'operator' => '>', 'expected' => 100, 'actual' => 50, 'passed' => false, 'rule' => 'amount > 100', 'ruleId' => 'amount::>'],
                ['field' => 'status', 'operator' => '=', 'expected' => 'open', 'actual' => 'closed', 'passed' => false, 'rule' => 'status = "open"', 'ruleId' => 'status::='],
            ],
            evaluatedRules: 2,
            passedRules: 0,
            passed: false,
        );

        expect($explainer->summary())->toContain('and 1 more rule failed');
    });

    it('returns failed rules with explanations', function () {
        $explainer = new WorkflowFailureExplainer(
            expression: 'amount > 100',
            trace: [
                ['field' => 'amount', 'operator' => '>', 'expected' => 100, 'actual' => 50, 'passed' => false, 'rule' => 'amount > 100', 'ruleId' => 'amount::>'],
            ],
            evaluatedRules: 1,
            passedRules: 0,
            passed: false,
        );

        $failed = $explainer->failedRules();

        expect($failed)->toHaveCount(1);
        expect($failed[0]['rule'])->toBe('amount > 100');
        expect($failed[0]['ruleId'])->toBe('amount::>');
        expect($failed[0]['explanation'])->toContain('Expected', 'but received');
    });

    it('identifies skipped rules from expression', function () {
        $explainer = new WorkflowFailureExplainer(
            expression: 'customer.tier = "gold" AND score > 80',
            trace: [
                ['field' => 'customer.tier', 'operator' => '=', 'expected' => 'gold', 'actual' => 'bronze', 'passed' => false, 'rule' => 'customer.tier = "gold"', 'ruleId' => 'customer.tier::='],
            ],
            evaluatedRules: 1,
            passedRules: 0,
            passed: false,
        );

        $skipped = $explainer->skippedRules();

        expect($skipped)->toHaveCount(1);
        expect($skipped[0]['rule'])->toBe('score > 80');
        expect($skipped[0]['reason'])->toContain('Short-circuit');
    });

    it('handles empty expression', function () {
        $explainer = new WorkflowFailureExplainer(
            expression: '',
            trace: [],
            evaluatedRules: 0,
            passedRules: 0,
            passed: true,
        );

        expect($explainer->summary())->toBe('All expression rules passed.');
        expect($explainer->failedRules())->toBe([]);
        expect($explainer->skippedRules())->toBe([]);
    });

    it('handles no failures', function () {
        $explainer = new WorkflowFailureExplainer(
            expression: 'amount > 100',
            trace: [
                ['field' => 'amount', 'operator' => '>', 'expected' => 100, 'actual' => 200, 'passed' => true, 'rule' => 'amount > 100', 'ruleId' => 'amount::>'],
            ],
            evaluatedRules: 1,
            passedRules: 1,
            passed: true,
        );

        expect($explainer->failedRules())->toBe([]);
        expect($explainer->skippedRules())->toHaveCount(0);
    });
});
