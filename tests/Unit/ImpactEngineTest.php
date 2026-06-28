<?php

use App\Services\Crm\Optimization\Impact\Registries\WorkflowImpactMetricRegistry;
use App\Services\Crm\Optimization\Impact\Services\ImpactClassificationService;
use App\Services\Crm\Optimization\Impact\Services\ImpactExplainabilityService;
use App\Services\Crm\Optimization\Impact\Services\RecommendationImpactService;
use App\Services\Crm\Optimization\Impact\Services\SnapshotComparisonService;
use App\Services\Crm\Optimization\RecommendationSnapshot;

beforeEach(function () {
    $registry = new WorkflowImpactMetricRegistry;
    $this->service = new RecommendationImpactService(
        comparisonService: new SnapshotComparisonService,
        classificationService: new ImpactClassificationService,
        explainabilityService: new ImpactExplainabilityService($registry),
        registry: $registry,
    );
});

describe('RecommendationImpactService', function () {
    it('measures impact with improvement', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31, 'success_rate' => 0.75],
            healthScore: 72.0,
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11, 'success_rate' => 0.90],
            healthScore: 86.0,
        );

        $result = $this->service->measure($before, $after);

        expect($result->overallScore)->toBeGreaterThan(0);
        expect($result->healthDelta)->toBe(14.0);
        expect($result->classification)->toBeIn(['excellent', 'good', 'neutral', 'negative', 'critical']);
        expect($result->improvements)->not->toBeEmpty();
    });

    it('measures impact with regression', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11, 'success_rate' => 0.90],
            healthScore: 86.0,
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31, 'success_rate' => 0.75],
            healthScore: 72.0,
        );

        $result = $this->service->measure($before, $after);

        expect($result->overallScore)->toBeLessThan(50);
        expect($result->regressions)->not->toBeEmpty();
    });

    it('handles unchanged metrics', function () {
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
            healthScore: 72.0,
        );

        $result = $this->service->measure($snapshot, $snapshot);

        expect($result->overallScore)->toBe(0.0);
        expect($result->improvements)->toBeEmpty();
        expect($result->regressions)->toBeEmpty();
    });

    it('handles partial metrics', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
            healthScore: 72.0,
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11, 'success_rate' => 0.90],
            healthScore: 86.0,
        );

        $result = $this->service->measure($before, $after);

        expect($result->metrics)->toHaveLength(1);
        expect($result->metrics[0]->metric)->toBe('failure_rate');
    });

    it('builds summary string', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
            healthScore: 72.0,
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11],
            healthScore: 86.0,
        );

        $result = $this->service->measure($before, $after);

        expect($result->summary)->toBeString();
        expect($result->summary)->not->toBeEmpty();
        expect($result->summary)->toContain('Overall impact score');
    });

    it('serializes result to JSON', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
            healthScore: 72.0,
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11],
            healthScore: 86.0,
        );

        $result = $this->service->measure($before, $after);
        $json = $result->jsonSerialize();

        expect($json['overall_score'])->toBeGreaterThan(0);
        expect($json['classification'])->toBeString();
        expect($json['health_delta'])->toBe(14.0);
        expect($json['metrics'])->toHaveLength(1);
    });

    it('handles empty metrics in both snapshots', function () {
        $before = new RecommendationSnapshot(metrics: []);
        $after = new RecommendationSnapshot(metrics: []);

        $result = $this->service->measure($before, $after);

        expect($result->overallScore)->toBe(0.0);
        expect($result->metrics)->toBeEmpty();
    });

    it('includes per-metric scores in result', function () {
        $before = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );
        $after = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.11],
        );

        $result = $this->service->measure($before, $after);

        expect($result->metrics[0]->score)->toBeGreaterThan(0);
        expect($result->metrics[0]->weight)->toBe(0.35);
    });
});
