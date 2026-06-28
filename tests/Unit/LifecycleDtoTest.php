<?php

use App\Services\Crm\Optimization\LifecycleStatus;
use App\Services\Crm\Optimization\RecommendationLifecycleEvent;
use App\Services\Crm\Optimization\RecommendationSnapshot;
use App\Services\Crm\Optimization\RecommendationTarget;
use App\Services\Crm\Optimization\RecommendationVersion;

describe('LifecycleStatus', function () {
    it('has 11 cases', function () {
        expect(LifecycleStatus::cases())->toHaveCount(11);
    });

    it('has generated status', function () {
        expect(LifecycleStatus::Generated->value)->toBe('generated');
    });

    it('has viewed status', function () {
        expect(LifecycleStatus::Viewed->value)->toBe('viewed');
    });

    it('has dismissed status', function () {
        expect(LifecycleStatus::Dismissed->value)->toBe('dismissed');
    });

    it('has accepted status', function () {
        expect(LifecycleStatus::Accepted->value)->toBe('accepted');
    });

    it('has rejected status', function () {
        expect(LifecycleStatus::Rejected->value)->toBe('rejected');
    });

    it('has applied status', function () {
        expect(LifecycleStatus::Applied->value)->toBe('applied');
    });

    it('has verified status', function () {
        expect(LifecycleStatus::Verified->value)->toBe('verified');
    });

    it('has completed status', function () {
        expect(LifecycleStatus::Completed->value)->toBe('completed');
    });

    it('has failed status', function () {
        expect(LifecycleStatus::Failed->value)->toBe('failed');
    });

    it('has expired status', function () {
        expect(LifecycleStatus::Expired->value)->toBe('expired');
    });

    it('has cancelled status', function () {
        expect(LifecycleStatus::Cancelled->value)->toBe('cancelled');
    });

    it('provides human-readable labels', function () {
        expect(LifecycleStatus::Generated->label())->toBe('Generated');
        expect(LifecycleStatus::Viewed->label())->toBe('Viewed');
        expect(LifecycleStatus::Dismissed->label())->toBe('Dismissed');
        expect(LifecycleStatus::Accepted->label())->toBe('Accepted');
        expect(LifecycleStatus::Rejected->label())->toBe('Rejected');
        expect(LifecycleStatus::Applied->label())->toBe('Applied');
        expect(LifecycleStatus::Verified->label())->toBe('Verified');
        expect(LifecycleStatus::Completed->label())->toBe('Completed');
        expect(LifecycleStatus::Failed->label())->toBe('Failed');
        expect(LifecycleStatus::Expired->label())->toBe('Expired');
        expect(LifecycleStatus::Cancelled->label())->toBe('Cancelled');
    });

    it('can be created from string', function () {
        $status = LifecycleStatus::from('generated');
        expect($status)->toBe(LifecycleStatus::Generated);
    });

    it('can attempt creation from invalid string', function () {
        $status = LifecycleStatus::tryFrom('unknown');
        expect($status)->toBeNull();
    });
});

describe('RecommendationTarget', function () {
    it('creates with type and id', function () {
        $target = new RecommendationTarget(
            targetType: 'workflow',
            targetId: 1,
        );

        expect($target->targetType)->toBe('workflow');
        expect($target->targetId)->toBe(1);
        expect($target->targetLabel)->toBeNull();
    });

    it('creates with optional label', function () {
        $target = new RecommendationTarget(
            targetType: 'project',
            targetId: 42,
            targetLabel: 'Acme Migration',
        );

        expect($target->targetLabel)->toBe('Acme Migration');
    });

    it('serializes to JSON', function () {
        $target = new RecommendationTarget(
            targetType: 'workflow',
            targetId: 5,
            targetLabel: 'Escalation Flow',
        );

        $json = $target->jsonSerialize();

        expect($json['target_type'])->toBe('workflow');
        expect($json['target_id'])->toBe(5);
        expect($json['target_label'])->toBe('Escalation Flow');
    });

    it('is immutable', function () {
        $target = new RecommendationTarget(
            targetType: 'approval',
            targetId: 10,
        );

        expect(fn () => $target->targetType = 'workflow')->toThrow(Error::class);
    });
});

describe('RecommendationSnapshot', function () {
    it('creates with metrics', function () {
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31, 'avg_retries' => 2.4],
        );

        expect($snapshot->metrics['failure_rate'])->toBe(0.31);
        expect($snapshot->metrics['avg_retries'])->toBe(2.4);
        expect($snapshot->healthScore)->toBeNull();
        expect($snapshot->trend)->toBeNull();
        expect($snapshot->recommendationVersion)->toBe('v1');
    });

    it('creates with all fields', function () {
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.15],
            healthScore: 82.5,
            trend: 'improving',
            recommendationVersion: 'reduce_retries.v2',
            generatedAt: '2026-06-26T00:00:00+00:00',
            context: ['workflow_id' => 3],
        );

        expect($snapshot->healthScore)->toBe(82.5);
        expect($snapshot->trend)->toBe('improving');
        expect($snapshot->recommendationVersion)->toBe('reduce_retries.v2');
        expect($snapshot->generatedAt)->toBe('2026-06-26T00:00:00+00:00');
    });

    it('serializes to JSON', function () {
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
            healthScore: 75.0,
            trend: 'degrading',
        );

        $json = $snapshot->jsonSerialize();

        expect($json['metrics']['failure_rate'])->toBe(0.31);
        expect($json['health_score'])->toBe(75.0);
        expect($json['trend'])->toBe('degrading');
        expect($json['recommendation_version'])->toBe('v1');
    });

    it('is immutable', function () {
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );

        expect(fn () => $snapshot->metrics = [])->toThrow(Error::class);
    });
});

describe('RecommendationVersion', function () {
    it('creates with required fields', function () {
        $version = new RecommendationVersion(
            type: 'reduce_retries',
            versionNumber: 1,
            priority: 80,
        );

        expect($version->type)->toBe('reduce_retries');
        expect($version->versionNumber)->toBe(1);
        expect($version->priority)->toBe(80);
        expect($version->parameters)->toBe([]);
    });

    it('creates with parameters', function () {
        $version = new RecommendationVersion(
            type: 'reduce_retries',
            versionNumber: 2,
            priority: 65,
            parameters: ['retry_limit' => 5],
            generatedAt: '2026-06-26T00:00:00+00:00',
        );

        expect($version->parameters['retry_limit'])->toBe(5);
        expect($version->generatedAt)->not->toBeNull();
    });

    it('serializes to JSON', function () {
        $version = new RecommendationVersion(
            type: 'reduce_retries',
            versionNumber: 1,
            priority: 80,
            parameters: ['retry_limit' => 3],
        );

        $json = $version->jsonSerialize();

        expect($json['type'])->toBe('reduce_retries');
        expect($json['version_number'])->toBe(1);
        expect($json['priority'])->toBe(80);
        expect($json['parameters']['retry_limit'])->toBe(3);
    });

    it('is immutable', function () {
        $version = new RecommendationVersion(
            type: 'reduce_retries',
            versionNumber: 1,
            priority: 80,
        );

        expect(fn () => $version->priority = 90)->toThrow(Error::class);
    });
});

describe('RecommendationLifecycleEvent', function () {
    it('creates with event data', function () {
        $target = new RecommendationTarget('workflow', 1);
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );

        $event = new RecommendationLifecycleEvent(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Generated,
            target: $target,
            snapshot: $snapshot,
            statusChangedAt: '2026-06-26T00:00:00+00:00',
        );

        expect($event->recommendationType)->toBe('reduce_retries');
        expect($event->status)->toBe(LifecycleStatus::Generated);
        expect($event->target->targetType)->toBe('workflow');
        expect($event->snapshot->metrics['failure_rate'])->toBe(0.31);
    });

    it('creates with version', function () {
        $target = new RecommendationTarget('workflow', 1);
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );
        $version = new RecommendationVersion(
            type: 'reduce_retries',
            versionNumber: 1,
            priority: 80,
        );

        $event = new RecommendationLifecycleEvent(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Generated,
            target: $target,
            snapshot: $snapshot,
            version: $version,
        );

        expect($event->version)->not->toBeNull();
        expect($event->version?->priority)->toBe(80);
    });

    it('serializes to JSON', function () {
        $target = new RecommendationTarget('workflow', 1);
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );

        $event = new RecommendationLifecycleEvent(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Accepted,
            target: $target,
            snapshot: $snapshot,
            metadata: ['user_id' => 5],
        );

        $json = $event->jsonSerialize();

        expect($json['recommendation_type'])->toBe('reduce_retries');
        expect($json['status'])->toBe('accepted');
        expect($json['status_label'])->toBe('Accepted');
        expect($json['target']['target_type'])->toBe('workflow');
        expect($json['metadata']['user_id'])->toBe(5);
    });

    it('is immutable', function () {
        $target = new RecommendationTarget('workflow', 1);
        $snapshot = new RecommendationSnapshot(
            metrics: ['failure_rate' => 0.31],
        );

        $event = new RecommendationLifecycleEvent(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Generated,
            target: $target,
            snapshot: $snapshot,
        );

        expect(fn () => $event->status = LifecycleStatus::Viewed)->toThrow(Error::class);
    });
});
