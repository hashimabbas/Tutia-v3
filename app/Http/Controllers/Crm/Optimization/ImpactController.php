<?php

namespace App\Http\Controllers\Crm\Optimization;

use App\Http\Controllers\Controller;
use App\Models\CrmRecommendationLifecycleEvent;
use App\Services\Crm\Optimization\Impact\Registries\ImpactMetricRegistryInterface;
use App\Services\Crm\Optimization\Impact\Registries\WorkflowImpactMetricRegistry;
use App\Services\Crm\Optimization\Impact\Services\ImpactClassificationService;
use App\Services\Crm\Optimization\Impact\Services\ImpactExplainabilityService;
use App\Services\Crm\Optimization\Impact\Services\RecommendationImpactService;
use App\Services\Crm\Optimization\Impact\Services\SnapshotComparisonService;
use App\Services\Crm\Optimization\RecommendationSnapshot;
use App\Services\Crm\Optimization\RecommendationSnapshotService;
use Illuminate\Http\JsonResponse;

class ImpactController extends Controller
{
    private ImpactMetricRegistryInterface $registry;

    public function __construct(
        private RecommendationImpactService $impactService,
        private SnapshotComparisonService $comparisonService,
        private ImpactClassificationService $classificationService,
        private ImpactExplainabilityService $explainabilityService,
        private RecommendationSnapshotService $snapshotService,
    ) {
        $this->registry = new WorkflowImpactMetricRegistry;
    }

    public function measure(int $recommendation): JsonResponse
    {
        $event = CrmRecommendationLifecycleEvent::find($recommendation);

        if ($event === null) {
            return response()->json(['error' => 'Recommendation event not found'], 404);
        }

        if ($event->status !== 'applied' && $event->status !== 'verified') {
            return response()->json([
                'error' => 'Cannot measure impact for recommendations with status: '.$event->status.'. Must be "applied" or "verified".',
            ], 422);
        }

        $beforeSnapshot = $this->snapshotService->fromEvent($event->id);

        if ($beforeSnapshot === null) {
            return response()->json(['error' => 'No snapshot available for this event'], 422);
        }

        $afterSnapshot = new RecommendationSnapshot(
            metrics: $beforeSnapshot->metrics,
            healthScore: $beforeSnapshot->healthScore,
            trend: $beforeSnapshot->trend,
        );

        $result = $this->impactService->measure($beforeSnapshot, $afterSnapshot);

        return response()->json($result);
    }

    public function show(int $recommendation): JsonResponse
    {
        $event = CrmRecommendationLifecycleEvent::find($recommendation);

        if ($event === null) {
            return response()->json(['error' => 'Recommendation event not found'], 404);
        }

        $snapshot = $this->snapshotService->fromEvent($event->id);

        if ($snapshot === null) {
            return response()->json(['error' => 'No snapshot available'], 422);
        }

        $afterSnapshot = new RecommendationSnapshot(
            metrics: $snapshot->metrics,
            healthScore: $snapshot->healthScore,
            trend: $snapshot->trend,
        );

        $result = $this->impactService->measure($snapshot, $afterSnapshot);

        return response()->json($result);
    }

    public function comparison(int $recommendation): JsonResponse
    {
        $event = CrmRecommendationLifecycleEvent::find($recommendation);

        if ($event === null) {
            return response()->json(['error' => 'Recommendation event not found'], 404);
        }

        $snapshot = $this->snapshotService->fromEvent($event->id);

        if ($snapshot === null) {
            return response()->json(['error' => 'No snapshot available'], 422);
        }

        return response()->json([
            'snapshot' => $snapshot,
            'status' => $event->status,
            'recommendation_type' => $event->recommendation_type,
            'target' => [
                'target_type' => $event->target_type,
                'target_id' => $event->target_id,
            ],
        ]);
    }

    public function metrics(int $recommendation): JsonResponse
    {
        $event = CrmRecommendationLifecycleEvent::find($recommendation);

        if ($event === null) {
            return response()->json(['error' => 'Recommendation event not found'], 404);
        }

        $snapshot = $this->snapshotService->fromEvent($event->id);

        if ($snapshot === null) {
            return response()->json(['error' => 'No snapshot available'], 422);
        }

        $metricKeys = $this->registry->metrics();
        $availableMetrics = [];

        foreach ($metricKeys as $metric) {
            $value = $snapshot->metrics[$metric] ?? null;

            $availableMetrics[] = [
                'key' => $metric,
                'label' => $this->registry->label($metric),
                'value' => $value,
                'weight' => $this->registry->weight($metric),
                'direction' => $this->registry->direction($metric),
                'available' => $value !== null,
            ];
        }

        return response()->json([
            'metrics' => $availableMetrics,
            'count' => count($availableMetrics),
            'available_count' => count(array_filter($availableMetrics, fn ($m) => $m['available'])),
        ]);
    }
}
