<?php

use App\Services\Crm\Optimization\Impact\DTO\ImpactResult;
use App\Services\Crm\Optimization\Impact\DTO\MetricImpact;

describe('MetricImpact', function () {
    it('creates with higher_is_better improvement', function () {
        $impact = MetricImpact::compare(
            metric: 'success_rate',
            before: 0.75,
            after: 0.90,
            weight: 0.5,
            direction: 'higher_is_better',
        );

        expect($impact->metric)->toBe('success_rate');
        expect($impact->before)->toBe(0.75);
        expect($impact->after)->toBe(0.90);
        expect($impact->delta)->toBe(0.15);
        expect($impact->percentage)->toBe(20.0);
        expect($impact->isImprovement())->toBeTrue();
    });

    it('creates with lower_is_better improvement', function () {
        $impact = MetricImpact::compare(
            metric: 'failure_rate',
            before: 0.31,
            after: 0.11,
            weight: 0.4,
            direction: 'lower_is_better',
        );

        expect($impact->metric)->toBe('failure_rate');
        expect($impact->delta)->toBe(-0.2);
        expect($impact->isImprovement())->toBeTrue();
        expect($impact->direction)->toBe('decreased');
    });

    it('detects regression for lower_is_better', function () {
        $impact = MetricImpact::compare(
            metric: 'failure_rate',
            before: 0.11,
            after: 0.31,
            weight: 0.4,
            direction: 'lower_is_better',
        );

        expect($impact->isImprovement())->toBeFalse();
        expect($impact->direction)->toBe('increased');
    });

    it('detects regression for higher_is_better', function () {
        $impact = MetricImpact::compare(
            metric: 'success_rate',
            before: 0.90,
            after: 0.75,
            weight: 0.5,
            direction: 'higher_is_better',
        );

        expect($impact->isImprovement())->toBeFalse();
        expect($impact->direction)->toBe('decreased');
    });

    it('handles zero before value', function () {
        $impact = MetricImpact::compare(
            metric: 'failure_rate',
            before: 0.0,
            after: 0.1,
            weight: 0.4,
            direction: 'lower_is_better',
        );

        expect($impact->percentage)->toBe(0.0);
        expect($impact->isImprovement())->toBeFalse();
    });

    it('handles unchanged values', function () {
        $impact = MetricImpact::compare(
            metric: 'failure_rate',
            before: 0.31,
            after: 0.31,
            weight: 0.4,
            direction: 'lower_is_better',
        );

        expect($impact->delta)->toBe(0.0);
        expect($impact->percentage)->toBe(0.0);
        expect($impact->direction)->toBe('unchanged');
        expect($impact->isImprovement())->toBeFalse();
    });

    it('calculates score correctly', function () {
        $impact = MetricImpact::compare(
            metric: 'failure_rate',
            before: 0.31,
            after: 0.11,
            weight: 0.4,
            direction: 'lower_is_better',
        );

        expect($impact->score)->toBeGreaterThan(0);
        expect($impact->score)->toBeLessThanOrEqual(40.0);
    });

    it('serializes to JSON', function () {
        $impact = MetricImpact::compare(
            metric: 'failure_rate',
            before: 0.31,
            after: 0.11,
            weight: 0.4,
            direction: 'lower_is_better',
        );

        $json = $impact->jsonSerialize();
        expect($json['metric'])->toBe('failure_rate');
        expect($json['is_improvement'])->toBeTrue();
        expect($json['direction'])->toBe('decreased');
    });

    it('is immutable', function () {
        $impact = MetricImpact::compare('failure_rate', 0.31, 0.11, 0.4, 'lower_is_better');
        expect(fn () => $impact->metric = 'other')->toThrow(Error::class);
    });
});

describe('ImpactResult', function () {
    it('creates with all fields', function () {
        $metric = MetricImpact::compare('failure_rate', 0.31, 0.11, 0.4, 'lower_is_better');

        $result = new ImpactResult(
            overallScore: 31.2,
            healthDelta: 14.0,
            metrics: [$metric],
            improvements: [['metric' => 'failure_rate', 'delta' => -0.2]],
            regressions: [],
            summary: 'Overall impact score: 31.2/100 (good).',
            classification: 'good',
            totalWeight: 0.4,
        );

        expect($result->overallScore)->toBe(31.2);
        expect($result->classification)->toBe('good');
        expect($result->metrics)->toHaveCount(1);
    });

    it('serializes to JSON', function () {
        $metric = MetricImpact::compare('failure_rate', 0.31, 0.11, 0.4, 'lower_is_better');

        $result = new ImpactResult(
            overallScore: 31.2,
            healthDelta: 14.0,
            metrics: [$metric],
            improvements: [['metric' => 'failure_rate', 'delta' => -0.2]],
            regressions: [],
            summary: 'Good improvement.',
            classification: 'good',
            totalWeight: 0.4,
        );

        $json = $result->jsonSerialize();
        expect($json['overall_score'])->toBe(31.2);
        expect($json['classification'])->toBe('good');
        expect($json['metrics'])->toHaveCount(1);
    });

    it('is immutable', function () {
        $metric = MetricImpact::compare('failure_rate', 0.31, 0.11, 0.4, 'lower_is_better');
        $result = new ImpactResult(0, 0, [$metric], [], [], '', 'neutral', 0);

        expect(fn () => $result->overallScore = 50)->toThrow(Error::class);
    });
});
