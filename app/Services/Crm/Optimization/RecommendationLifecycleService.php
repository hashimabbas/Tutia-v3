<?php

namespace App\Services\Crm\Optimization;

use App\Models\CrmRecommendationLifecycleEvent;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class RecommendationLifecycleService
{
    public function __construct(
        private RecommendationLifecycleManager $manager,
        private RecommendationSnapshotService $snapshotService,
    ) {}

    public function track(
        string $recommendationType,
        LifecycleStatus $status,
        RecommendationTarget $target,
        RecommendationSnapshot $snapshot,
        ?RecommendationVersion $version = null,
        array $metadata = [],
    ): RecommendationLifecycleEvent {
        $latest = $this->getCurrentStatusForTarget($target, $recommendationType);

        if ($latest !== null) {
            $this->manager->transition($latest, $status);
        }

        $now = Carbon::now();

        $event = new RecommendationLifecycleEvent(
            recommendationType: $recommendationType,
            status: $status,
            target: $target,
            snapshot: $snapshot,
            version: $version,
            metadata: $metadata,
            statusChangedAt: $now->toIso8601String(),
        );

        CrmRecommendationLifecycleEvent::create([
            'recommendation_type' => $recommendationType,
            'status' => $status->value,
            'target_type' => $target->targetType,
            'target_id' => $target->targetId,
            'snapshot' => $snapshot->jsonSerialize(),
            'version' => $version?->jsonSerialize(),
            'metadata' => $metadata,
            'status_changed_at' => $now,
        ]);

        return $event;
    }

    public function getHistory(
        ?string $recommendationType = null,
        ?LifecycleStatus $status = null,
    ): Collection {
        $query = CrmRecommendationLifecycleEvent::query();

        if ($recommendationType !== null) {
            $query->where('recommendation_type', $recommendationType);
        }

        if ($status !== null) {
            $query->where('status', $status->value);
        }

        return $query->orderBy('status_changed_at', 'desc')->get();
    }

    public function getCurrentStatusForTarget(RecommendationTarget $target, string $recommendationType): ?LifecycleStatus
    {
        $latest = CrmRecommendationLifecycleEvent::where('target_type', $target->targetType)
            ->where('target_id', $target->targetId)
            ->where('recommendation_type', $recommendationType)
            ->orderBy('status_changed_at', 'desc')
            ->first();

        if ($latest === null) {
            return null;
        }

        return LifecycleStatus::from($latest->status);
    }

    public function getEventsByTarget(RecommendationTarget $target): Collection
    {
        return CrmRecommendationLifecycleEvent::where('target_type', $target->targetType)
            ->where('target_id', $target->targetId)
            ->orderBy('status_changed_at', 'desc')
            ->get();
    }

    public function getEventById(int $id): ?CrmRecommendationLifecycleEvent
    {
        return CrmRecommendationLifecycleEvent::find($id);
    }
}
