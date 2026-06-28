<?php

namespace App\Http\Controllers\Crm\Optimization;

use App\Http\Controllers\Controller;
use App\Services\Crm\Optimization\LifecycleStatus;
use App\Services\Crm\Optimization\RecommendationLifecycleManager;
use App\Services\Crm\Optimization\RecommendationLifecycleService;
use App\Services\Crm\Optimization\RecommendationSnapshot;
use App\Services\Crm\Optimization\RecommendationSnapshotService;
use App\Services\Crm\Optimization\RecommendationTarget;
use App\Services\Crm\Optimization\RecommendationVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecommendationLifecycleController extends Controller
{
    public function __construct(
        private RecommendationLifecycleService $lifecycleService,
        private RecommendationLifecycleManager $lifecycleManager,
        private RecommendationSnapshotService $snapshotService,
    ) {}

    public function track(Request $request): JsonResponse
    {
        $data = $request->validate([
            'recommendation_type' => ['required', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:'.implode(',', array_map(fn ($case) => $case->value, LifecycleStatus::cases()))],
            'target_type' => ['required', 'string', 'max:50'],
            'target_id' => ['required', 'integer', 'min:1'],
            'target_label' => ['nullable', 'string', 'max:200'],
            'snapshot' => ['required', 'array'],
            'snapshot.metrics' => ['required', 'array'],
            'version' => ['nullable', 'array'],
            'version.type' => ['required_with:version', 'string'],
            'version.version_number' => ['required_with:version', 'integer', 'min:1'],
            'version.priority' => ['required_with:version', 'integer', 'min:0', 'max:100'],
            'metadata' => ['nullable', 'array'],
        ]);

        $status = LifecycleStatus::from($data['status']);
        $target = new RecommendationTarget(
            targetType: $data['target_type'],
            targetId: $data['target_id'],
            targetLabel: $data['target_label'] ?? null,
        );

        $snapshot = new RecommendationSnapshot(
            metrics: $data['snapshot']['metrics'],
            healthScore: $data['snapshot']['health_score'] ?? null,
            trend: $data['snapshot']['trend'] ?? null,
            recommendationVersion: $data['snapshot']['recommendation_version'] ?? 'v1',
            context: $data['snapshot']['context'] ?? [],
        );

        $version = null;
        if (isset($data['version'])) {
            $version = new RecommendationVersion(
                type: $data['version']['type'],
                versionNumber: $data['version']['version_number'],
                priority: $data['version']['priority'],
                parameters: $data['version']['parameters'] ?? [],
            );
        }

        $event = $this->lifecycleService->track(
            recommendationType: $data['recommendation_type'],
            status: $status,
            target: $target,
            snapshot: $snapshot,
            version: $version,
            metadata: $data['metadata'] ?? [],
        );

        return response()->json($event, 201);
    }

    public function index(Request $request): JsonResponse
    {
        $type = $request->query('recommendation_type');
        $status = $request->query('status');

        $statusEnum = $status !== null ? LifecycleStatus::tryFrom($status) : null;

        $history = $this->lifecycleService->getHistory(
            recommendationType: $type,
            status: $statusEnum,
        );

        return response()->json([
            'data' => $history->map(function ($event) {
                return [
                    'id' => $event->id,
                    'recommendation_type' => $event->recommendation_type,
                    'status' => $event->status,
                    'target' => [
                        'target_type' => $event->target_type,
                        'target_id' => $event->target_id,
                    ],
                    'snapshot' => $event->snapshot,
                    'version' => $event->version,
                    'metadata' => $event->metadata,
                    'status_changed_at' => $event->status_changed_at?->toIso8601String(),
                    'created_at' => $event->created_at?->toIso8601String(),
                ];
            }),
        ]);
    }

    public function status(Request $request, string $recommendationType): JsonResponse
    {
        $targetType = $request->query('target_type');
        $targetId = $request->query('target_id');

        if ($targetType === null || $targetId === null) {
            return response()->json(['error' => 'target_type and target_id are required'], 422);
        }

        $target = new RecommendationTarget(
            targetType: $targetType,
            targetId: (int) $targetId,
        );

        $currentStatus = $this->lifecycleService->getCurrentStatusForTarget($target, $recommendationType);

        $history = $this->lifecycleService->getEventsByTarget($target)
            ->where('recommendation_type', $recommendationType)
            ->values();

        return response()->json([
            'current_status' => $currentStatus?->value,
            'current_status_label' => $currentStatus?->label(),
            'is_terminal' => $currentStatus !== null ? $this->lifecycleManager->isTerminal($currentStatus) : false,
            'allowed_transitions' => $currentStatus !== null
                ? array_map(fn ($s) => ['status' => $s->value, 'label' => $s->label()], $this->lifecycleManager->allowedTransitions($currentStatus))
                : [],
            'history' => $history->map(function ($event) {
                return [
                    'id' => $event->id,
                    'status' => $event->status,
                    'status_changed_at' => $event->status_changed_at?->toIso8601String(),
                ];
            }),
        ]);
    }

    public function snapshot(int $event): JsonResponse
    {
        $snapshot = $this->snapshotService->fromEvent($event);

        if ($snapshot === null) {
            return response()->json(['error' => 'Event not found or has no snapshot'], 404);
        }

        return response()->json($snapshot);
    }
}
