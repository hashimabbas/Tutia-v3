<?php

namespace App\Http\Controllers\Crm\Optimization;

use App\Http\Controllers\Controller;
use App\Services\Crm\Optimization\Automation\DTO\ScoreTrend;
use App\Services\Crm\Optimization\Automation\Registries\ApprovalAutomationScoreRegistry;
use App\Services\Crm\Optimization\Automation\Registries\AutomationScoreRegistryInterface;
use App\Services\Crm\Optimization\Automation\Registries\WorkflowAutomationScoreRegistry;
use App\Services\Crm\Optimization\Automation\Services\AutomationScoreService;
use App\Services\Crm\Optimization\Automation\Services\ScoreCalculator;
use App\Services\Crm\Optimization\Automation\Services\ScoreClassificationService;
use App\Services\Crm\Optimization\Automation\Services\ScoreExplainabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationScoreController extends Controller
{
    private AutomationScoreService $service;

    public function __construct()
    {
        $registry = $this->resolveRegistry(request()->input('target_type', 'workflow'));
        $explainability = new ScoreExplainabilityService($registry);

        $this->service = new AutomationScoreService(
            calculator: new ScoreCalculator,
            classificationService: new ScoreClassificationService,
            explainabilityService: $explainability,
            registry: $registry,
        );
    }

    public function show(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target_type' => 'sometimes|string|in:workflow,approval',
            'target_id' => 'sometimes|integer',
        ]);

        $trend = new ScoreTrend(
            direction: 'up',
            magnitude: 0.06,
            period: '30d',
        );

        $lifecycleStats = $this->getDefaultLifecycleStats();
        $impactResults = $this->getDefaultImpactResults();

        $score = $this->service->score(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            trend: $trend,
        );

        return response()->json($score->jsonSerialize());
    }

    public function breakdown(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target_type' => 'sometimes|string|in:workflow,approval',
            'target_id' => 'sometimes|integer',
        ]);

        $lifecycleStats = $this->getDefaultLifecycleStats();
        $impactResults = $this->getDefaultImpactResults();

        $score = $this->service->score(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
        );

        return response()->json([
            'overall_score' => $score->overallScore,
            'classification' => $score->classification,
            'breakdown' => array_map(fn ($b) => $b->jsonSerialize(), $score->breakdown),
        ]);
    }

    private function resolveRegistry(string $targetType): AutomationScoreRegistryInterface
    {
        if ($targetType === 'approval') {
            return new ApprovalAutomationScoreRegistry;
        }

        return new WorkflowAutomationScoreRegistry;
    }

    private function getDefaultLifecycleStats(): array
    {
        return [
            'total_events' => 50,
            'total_generated' => 50,
            'total_viewed' => 42,
            'total_accepted' => 30,
            'total_applied' => 22,
            'total_verified' => 18,
            'total_completed' => 15,
            'avg_cycle_hours' => 48,
            'sla_compliance_pct' => 85.0,
        ];
    }

    private function getDefaultImpactResults(): array
    {
        return [
            ['overallScore' => 72.0, 'improvements' => [['percentage' => 15], ['percentage' => 25]]],
            ['overallScore' => 65.0, 'improvements' => [['percentage' => 10]]],
            ['overallScore' => 81.0, 'improvements' => [['percentage' => 30], ['percentage' => 20], ['percentage' => 12]]],
        ];
    }
}
