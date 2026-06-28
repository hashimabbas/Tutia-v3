<?php

namespace App\Services\Crm\Optimization;

use App\Models\CrmRecommendationLifecycleEvent;
use Carbon\Carbon;

class RecommendationSnapshotService
{
    public function createSnapshot(
        array $metrics,
        ?float $healthScore = null,
        ?string $trend = null,
        string $version = 'v1',
        array $context = [],
    ): RecommendationSnapshot {
        return new RecommendationSnapshot(
            metrics: $metrics,
            healthScore: $healthScore,
            trend: $trend,
            recommendationVersion: $version,
            generatedAt: Carbon::now()->toIso8601String(),
            context: $context,
        );
    }

    public function fromEvent(int $eventId): ?RecommendationSnapshot
    {
        $event = CrmRecommendationLifecycleEvent::find($eventId);

        if ($event === null || $event->snapshot === null) {
            return null;
        }

        $data = is_string($event->snapshot) ? json_decode($event->snapshot, true) : $event->snapshot;

        return new RecommendationSnapshot(
            metrics: $data['metrics'] ?? [],
            healthScore: $data['health_score'] ?? null,
            trend: $data['trend'] ?? null,
            recommendationVersion: $data['recommendation_version'] ?? 'v1',
            generatedAt: $data['generated_at'] ?? null,
            context: $data['context'] ?? [],
        );
    }
}
