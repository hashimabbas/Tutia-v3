<?php

use App\Services\Crm\Optimization\Impact\DTO\ImpactResult;
use App\Services\Crm\Optimization\Impact\DTO\MetricImpact;
use App\Services\Crm\Optimization\Impact\Registries\WorkflowImpactMetricRegistry;
use App\Services\Crm\Optimization\Impact\Services\ImpactClassificationService;
use App\Services\Crm\Optimization\Impact\Services\ImpactExplainabilityService;
use App\Services\Crm\Optimization\Impact\Services\SnapshotComparisonService;
use App\Services\Crm\Optimization\RecommendationSnapshot;

describe('SnapshotComparisonService', function () {
    it('compares two snapshots', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31, 'success_rate' => 0.75],
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11, 'success_rate' => 0.90],
        );

        $service = new SnapshotComparisonService;
        $registry = new WorkflowImpactMetricRegistry;
        $impacts = $service->compare($before, $after, $registry);

        expect($impacts)->not->toBeEmpty();
        foreach ($impacts as $impact) {
            expect($impact)->toBeInstanceOf(MetricImpact::class);
        }
    });

    it('skips metrics not in snapshot', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11],
        );

        $service = new SnapshotComparisonService;
        $registry = new WorkflowImpactMetricRegistry;
        $impacts = $service->compare($before, $after, $registry);

        $metrics = array_map(fn ($m) => $m->metric, $impacts);
        expect($metrics)->not->toContain('avg_retries');
    });

    it('handles empty snapshots', function () {
        $before = new RecommendationSnapshot(metrics: []);
        $after = new RecommendationSnapshot(metrics: []);

        $service = new SnapshotComparisonService;
        $registry = new WorkflowImpactMetricRegistry;
        $impacts = $service->compare($before, $after, $registry);

        expect($impacts)->toBeEmpty();
    });

    it('returns improvement for lower_is_better decreases', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11],
        );

        $service = new SnapshotComparisonService;
        $registry = new WorkflowImpactMetricRegistry;
        $impacts = $service->compare($before, $after, $registry);

        expect($impacts[0]->isImprovement())->toBeTrue();
    });

    it('detects regression for lower_is_better increases', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11],
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );

        $service = new SnapshotComparisonService;
        $registry = new WorkflowImpactMetricRegistry;
        $impacts = $service->compare($before, $after, $registry);

        expect($impacts[0]->isImprovement())->toBeFalse();
    });
});

describe('ImpactClassificationService', function () {
    it('classifies excellent scores', function () {
        $service = new ImpactClassificationService;
        expect($service->classify(95))->toBe('excellent');
        expect($service->classify(80))->toBe('excellent');
    });

    it('classifies good scores', function () {
        $service = new ImpactClassificationService;
        expect($service->classify(79))->toBe('good');
        expect($service->classify(50))->toBe('good');
    });

    it('classifies neutral scores', function () {
        $service = new ImpactClassificationService;
        expect($service->classify(49))->toBe('neutral');
        expect($service->classify(20))->toBe('neutral');
    });

    it('classifies negative scores', function () {
        $service = new ImpactClassificationService;
        expect($service->classify(19))->toBe('negative');
        expect($service->classify(1))->toBe('negative');
    });

    it('classifies critical scores (zero or below)', function () {
        $service = new ImpactClassificationService;
        expect($service->classify(0))->toBe('critical');
    });

    it('classifies delta as significant improvement', function () {
        $service = new ImpactClassificationService;
        expect($service->classifyDelta(0.30, 'higher_is_better'))->toBe('significant_improvement');
        expect($service->classifyDelta(-0.30, 'lower_is_better'))->toBe('significant_improvement');
    });

    it('classifies delta as moderate improvement', function () {
        $service = new ImpactClassificationService;
        expect($service->classifyDelta(0.10, 'higher_is_better'))->toBe('moderate_improvement');
        expect($service->classifyDelta(-0.10, 'lower_is_better'))->toBe('moderate_improvement');
    });

    it('classifies delta as stable', function () {
        $service = new ImpactClassificationService;
        expect($service->classifyDelta(0.0, 'higher_is_better'))->toBe('stable');
        expect($service->classifyDelta(0.04, 'higher_is_better'))->toBe('stable');
    });

    it('classifies delta as moderate regression', function () {
        $service = new ImpactClassificationService;
        expect($service->classifyDelta(-0.10, 'higher_is_better'))->toBe('moderate_regression');
        expect($service->classifyDelta(0.10, 'lower_is_better'))->toBe('moderate_regression');
    });

    it('classifies delta as significant regression', function () {
        $service = new ImpactClassificationService;
        expect($service->classifyDelta(-0.30, 'higher_is_better'))->toBe('significant_regression');
        expect($service->classifyDelta(0.30, 'lower_is_better'))->toBe('significant_regression');
    });
});

describe('ImpactExplainabilityService', function () {
    it('generates summary lines from impact result', function () {
        $explainability = new ImpactExplainabilityService(new WorkflowImpactMetricRegistry);

        $metric = MetricImpact::compare('failure_rate', 0.31, 0.11, 0.35, 'lower_is_better');
        $result = new ImpactResult(
            overallScore: 31.2,
            healthDelta: 14.0,
            metrics: [$metric],
            improvements: [['metric' => 'failure_rate', 'delta' => -0.2, 'direction' => 'decreased', 'percentage' => -64.5]],
            regressions: [],
            summary: 'Impact',
            classification: 'good',
            totalWeight: 0.35,
        );

        $summary = $explainability->generateSummary($result);
        expect($summary)->toHaveCount(3);
        expect($summary[0])->toContain('31.2');
        expect($summary[1])->toBe('Improvements:');
    });

    it('generates summary with regressions', function () {
        $explainability = new ImpactExplainabilityService(new WorkflowImpactMetricRegistry);

        $result = new ImpactResult(
            overallScore: 10.0,
            healthDelta: -5.0,
            metrics: [],
            improvements: [],
            regressions: [['metric' => 'failure_rate', 'delta' => 0.2, 'direction' => 'increased', 'percentage' => 64.5]],
            summary: 'Impact',
            classification: 'negative',
            totalWeight: 0.35,
        );

        $summary = $explainability->generateSummary($result);
        expect($summary[1])->toBe('Regressions:');
        expect($summary[2])->toContain('Failure Rate');
    });

    it('handles empty improvements and regressions', function () {
        $explainability = new ImpactExplainabilityService(new WorkflowImpactMetricRegistry);

        $result = new ImpactResult(0, 0, [], [], [], '', 'neutral', 0);
        $summary = $explainability->generateSummary($result);

        expect($summary)->toHaveCount(2);
        expect($summary[1])->toBe('No significant metric changes detected.');
    });

    it('generates human readable text', function () {
        $explainability = new ImpactExplainabilityService(new WorkflowImpactMetricRegistry);

        $result = new ImpactResult(50, 10, [], [], [], '', 'good', 0);
        $text = $explainability->generateHumanReadable($result);

        expect($text)->toBeString();
        expect($text)->toContain('50');
    });

    it('works without registry', function () {
        $explainability = new ImpactExplainabilityService;

        $result = new ImpactResult(
            50, 10, [],
            [['metric' => 'custom_metric', 'delta' => 5, 'direction' => 'increased', 'percentage' => 10]],
            [], '', 'good', 0
        );

        $summary = $explainability->generateSummary($result);
        expect($summary[2])->toContain('custom_metric');
    });
});
