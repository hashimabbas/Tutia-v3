<?php

use App\Services\Crm\Optimization\RecommendationSnapshot;
use App\Services\Crm\Optimization\RecommendationSnapshotService;

describe('RecommendationSnapshotService', function () {
    beforeEach(function () {
        $this->service = new RecommendationSnapshotService;
    });

    it('creates a snapshot', function () {
        $snapshot = $this->service->createSnapshot(
            metrics: ['failure_rate' => 0.31],
            healthScore: 72.0,
            trend: 'degrading',
        );

        expect($snapshot)->toBeInstanceOf(RecommendationSnapshot::class);
        expect($snapshot->metrics['failure_rate'])->toBe(0.31);
        expect($snapshot->healthScore)->toBe(72.0);
        expect($snapshot->trend)->toBe('degrading');
    });

    it('creates snapshot without optional fields', function () {
        $snapshot = $this->service->createSnapshot(
            metrics: ['failure_rate' => 0.31],
        );

        expect($snapshot->healthScore)->toBeNull();
        expect($snapshot->trend)->toBeNull();
        expect($snapshot->recommendationVersion)->toBe('v1');
    });

    it('creates snapshot with custom version', function () {
        $snapshot = $this->service->createSnapshot(
            metrics: ['failure_rate' => 0.31],
            version: 'reduce_retries.v2',
        );

        expect($snapshot->recommendationVersion)->toBe('reduce_retries.v2');
    });

    it('provides context to snapshot', function () {
        $snapshot = $this->service->createSnapshot(
            metrics: ['failure_rate' => 0.31],
            context: ['user_id' => 5, 'workflow_name' => 'Test'],
        );

        expect($snapshot->context['user_id'])->toBe(5);
    });
});
