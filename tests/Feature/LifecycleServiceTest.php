<?php

use App\Models\CrmRecommendationLifecycleEvent;
use App\Services\Crm\Optimization\LifecycleStatus;
use App\Services\Crm\Optimization\RecommendationLifecycleManager;
use App\Services\Crm\Optimization\RecommendationLifecycleService;
use App\Services\Crm\Optimization\RecommendationSnapshot;
use App\Services\Crm\Optimization\RecommendationSnapshotService;
use App\Services\Crm\Optimization\RecommendationTarget;
use App\Services\Crm\Optimization\RecommendationVersion;

beforeEach(function () {
    $this->manager = new RecommendationLifecycleManager;
    $this->snapshotService = new RecommendationSnapshotService;
    $this->service = new RecommendationLifecycleService(
        $this->manager,
        $this->snapshotService,
    );

    $this->target = new RecommendationTarget('workflow', 1, 'Test Flow');
    $this->snapshot = new RecommendationSnapshot(
        metrics: ['failure_rate' => 0.31],
        healthScore: 72.0,
        trend: 'degrading',
    );
});

describe('RecommendationLifecycleService', function () {
    it('tracks a generated event', function () {
        $event = $this->service->track(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Generated,
            target: $this->target,
            snapshot: $this->snapshot,
        );

        expect($event->recommendationType)->toBe('reduce_retries');
        expect($event->status)->toBe(LifecycleStatus::Generated);
        expect($event->target->targetType)->toBe('workflow');
        expect($event->target->targetId)->toBe(1);
    });

    it('tracks an event with version', function () {
        $version = new RecommendationVersion(
            type: 'reduce_retries',
            versionNumber: 1,
            priority: 80,
            parameters: ['retry_limit' => 3],
        );

        $event = $this->service->track(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Generated,
            target: $this->target,
            snapshot: $this->snapshot,
            version: $version,
        );

        expect($event->version)->not->toBeNull();
        expect($event->version?->priority)->toBe(80);
    });

    it('persists event to database', function () {
        $this->service->track(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Generated,
            target: $this->target,
            snapshot: $this->snapshot,
        );

        $record = CrmRecommendationLifecycleEvent::first();
        expect($record)->not->toBeNull();
        expect($record->recommendation_type)->toBe('reduce_retries');
        expect($record->status)->toBe('generated');
        expect($record->target_type)->toBe('workflow');
        expect($record->target_id)->toBe(1);
    });

    it('tracks multiple events in sequence', function () {
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Viewed, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Accepted, $this->target, $this->snapshot);

        $status = $this->service->getCurrentStatusForTarget($this->target, 'reduce_retries');
        expect($status)->toBe(LifecycleStatus::Accepted);
    });

    it('returns null for unknown target status', function () {
        $unknownTarget = new RecommendationTarget('workflow', 999);
        $status = $this->service->getCurrentStatusForTarget($unknownTarget, 'reduce_retries');

        expect($status)->toBeNull();
    });

    it('returns null for unknown recommendation type', function () {
        $status = $this->service->getCurrentStatusForTarget($this->target, 'unknown_type');

        expect($status)->toBeNull();
    });

    it('throws on invalid transition', function () {
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $this->target, $this->snapshot);

        expect(fn () => $this->service->track(
            'reduce_retries',
            LifecycleStatus::Completed,
            $this->target,
            $this->snapshot,
        ))->toThrow(InvalidArgumentException::class);
    });

    it('retrieves history by type', function () {
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $this->target, $this->snapshot);
        $this->service->track('increase_sla', LifecycleStatus::Generated, $this->target, $this->snapshot);

        $history = $this->service->getHistory(recommendationType: 'reduce_retries');
        expect($history)->toHaveCount(1);
        expect($history->first()->recommendation_type)->toBe('reduce_retries');
    });

    it('retrieves history by status', function () {
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Viewed, $this->target, $this->snapshot);

        $history = $this->service->getHistory(status: LifecycleStatus::Generated);
        expect($history)->toHaveCount(1);
    });

    it('retrieves all history when no filters', function () {
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $this->target, $this->snapshot);
        $this->service->track('increase_sla', LifecycleStatus::Viewed, $this->target, $this->snapshot);

        $history = $this->service->getHistory();
        expect($history)->toHaveCount(2);
    });

    it('retrieves events by target', function () {
        $targetA = new RecommendationTarget('workflow', 1);
        $targetB = new RecommendationTarget('workflow', 2);

        $this->service->track('reduce_retries', LifecycleStatus::Generated, $targetA, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $targetB, $this->snapshot);

        $events = $this->service->getEventsByTarget($targetA);
        expect($events)->toHaveCount(1);
    });

    it('retrieves event by id', function () {
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $this->target, $this->snapshot);

        $record = CrmRecommendationLifecycleEvent::first();
        $found = $this->service->getEventById((int) $record->id);

        expect($found)->not->toBeNull();
        expect((int) $found->id)->toBe((int) $record->id);
    });

    it('returns null for non-existent event id', function () {
        $found = $this->service->getEventById(99999);
        expect($found)->toBeNull();
    });

    it('persists snapshot data in database', function () {
        $this->service->track(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Generated,
            target: $this->target,
            snapshot: $this->snapshot,
        );

        $record = CrmRecommendationLifecycleEvent::first();
        expect($record->snapshot)->toBeArray();
        expect($record->snapshot['metrics']['failure_rate'])->toBe(0.31);
        expect($record->snapshot['health_score'])->toBe(72.0);
    });

    it('persists metadata', function () {
        $this->service->track(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Viewed,
            target: $this->target,
            snapshot: $this->snapshot,
            metadata: ['user_id' => 42, 'source' => 'dashboard'],
        );

        $record = CrmRecommendationLifecycleEvent::first();
        expect($record->metadata['user_id'])->toBe(42);
        expect($record->metadata['source'])->toBe('dashboard');
    });

    it('tracks full lifecycle sequence', function () {
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Viewed, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Accepted, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Applied, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Verified, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Completed, $this->target, $this->snapshot);

        $status = $this->service->getCurrentStatusForTarget($this->target, 'reduce_retries');
        expect($status)->toBe(LifecycleStatus::Completed);

        $history = $this->service->getHistory(recommendationType: 'reduce_retries');
        expect($history)->toHaveCount(6);
    });

    it('tracks rejected lifecycle', function () {
        $this->service->track('reduce_retries', LifecycleStatus::Generated, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Viewed, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Accepted, $this->target, $this->snapshot);
        $this->service->track('reduce_retries', LifecycleStatus::Rejected, $this->target, $this->snapshot);

        $status = $this->service->getCurrentStatusForTarget($this->target, 'reduce_retries');
        expect($status)->toBe(LifecycleStatus::Rejected);
    });
});

describe('RecommendationSnapshotService (DB)', function () {
    it('reconstructs snapshot from event', function () {
        $this->service->track(
            recommendationType: 'reduce_retries',
            status: LifecycleStatus::Generated,
            target: $this->target,
            snapshot: $this->snapshot,
        );

        $record = CrmRecommendationLifecycleEvent::first();
        $reconstructed = $this->snapshotService->fromEvent((int) $record->id);

        expect($reconstructed)->not->toBeNull();
        expect($reconstructed->metrics['failure_rate'])->toBe(0.31);
        expect($reconstructed->healthScore)->toBe(72.0);
        expect($reconstructed->trend)->toBe('degrading');
    });

    it('returns null for non-existent event', function () {
        $snapshot = $this->snapshotService->fromEvent(99999);
        expect($snapshot)->toBeNull();
    });
});
