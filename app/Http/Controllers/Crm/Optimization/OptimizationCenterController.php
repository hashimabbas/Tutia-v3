<?php

namespace App\Http\Controllers\Crm\Optimization;

use App\Http\Controllers\Controller;
use App\Services\Crm\Optimization\Center\Services\OptimizationCenterService;
use App\Services\Crm\Optimization\Center\Services\OptimizationDashboardService;
use App\Services\Crm\Optimization\Center\Services\OptimizationHealthService;
use App\Services\Crm\Optimization\Center\Services\OptimizationOpportunityService;
use App\Services\Crm\Optimization\Center\Services\OptimizationRoadmapService;
use Illuminate\Http\JsonResponse;

class OptimizationCenterController extends Controller
{
    public function index(): JsonResponse
    {
        $service = $this->buildCenterService();

        $lifecycleStats = $this->getDefaultLifecycleStats();
        $impactResults = $this->getDefaultImpactResults();
        $automationScore = $this->getDefaultAutomationScore();
        $trend = ['direction' => 'up', 'percentage' => 6.0, 'period' => '30d'];

        $stats = $lifecycleStats;
        $adoptionRate = $stats['total_viewed'] > 0
            ? $stats['total_accepted'] / $stats['total_viewed']
            : 0.0;
        $verificationRate = $stats['total_applied'] > 0
            ? $stats['total_verified'] / $stats['total_applied']
            : 0.0;

        $center = $service->build(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
            trend: $trend,
            adoptionRate: $adoptionRate,
            verificationRate: $verificationRate,
        );

        return response()->json($center->jsonSerialize());
    }

    public function dashboard(): JsonResponse
    {
        $service = new OptimizationDashboardService;
        $lifecycleStats = $this->getDefaultLifecycleStats();
        $impactResults = $this->getDefaultImpactResults();
        $automationScore = $this->getDefaultAutomationScore();
        $trend = ['direction' => 'up', 'percentage' => 6.0, 'period' => '30d'];

        $dashboard = $service->build(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
            trend: $trend,
        );

        return response()->json($dashboard->jsonSerialize());
    }

    public function opportunities(): JsonResponse
    {
        $service = new OptimizationOpportunityService;
        $lifecycleStats = $this->getDefaultLifecycleStats();
        $impactResults = $this->getDefaultImpactResults();
        $automationScore = $this->getDefaultAutomationScore();

        $opportunities = $service->rank(
            lifecycleEvents: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
        );

        return response()->json([
            'opportunities' => array_map(fn ($o) => $o->jsonSerialize(), $opportunities),
        ]);
    }

    public function roadmap(): JsonResponse
    {
        $service = new OptimizationOpportunityService;
        $lifecycleStats = $this->getDefaultLifecycleStats();
        $impactResults = $this->getDefaultImpactResults();
        $automationScore = $this->getDefaultAutomationScore();

        $opportunities = $service->rank(
            lifecycleEvents: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
        );

        $roadmapService = new OptimizationRoadmapService;
        $roadmap = $roadmapService->build($opportunities);

        return response()->json($roadmap->jsonSerialize());
    }

    public function health(): JsonResponse
    {
        $service = new OptimizationHealthService;
        $lifecycleStats = $this->getDefaultLifecycleStats();
        $impactResults = $this->getDefaultImpactResults();
        $automationScore = $this->getDefaultAutomationScore();

        $stats = $lifecycleStats;
        $adoptionRate = $stats['total_viewed'] > 0
            ? $stats['total_accepted'] / $stats['total_viewed']
            : 0.0;
        $verificationRate = $stats['total_applied'] > 0
            ? $stats['total_verified'] / $stats['total_applied']
            : 0.0;

        $health = $service->assess(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
            adoptionRate: $adoptionRate,
            verificationRate: $verificationRate,
        );

        return response()->json($health->jsonSerialize());
    }

    private function buildCenterService(): OptimizationCenterService
    {
        return new OptimizationCenterService(
            dashboardService: new OptimizationDashboardService,
            opportunityService: new OptimizationOpportunityService,
            roadmapService: new OptimizationRoadmapService,
            healthService: new OptimizationHealthService,
        );
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

    private function getDefaultAutomationScore(): array
    {
        return [
            'overall_score' => 72.5,
            'classification' => 'good',
            'breakdown' => [
                ['label' => 'Impact Success', 'score' => 72.0, 'weight' => 0.25],
                ['label' => 'Recommendation Adoption', 'score' => 71.4, 'weight' => 0.20],
                ['label' => 'Verification Rate', 'score' => 81.8, 'weight' => 0.20],
                ['label' => 'Lifecycle Completion', 'score' => 30.0, 'weight' => 0.15],
                ['label' => 'Average Improvement', 'score' => 18.7, 'weight' => 0.20],
            ],
        ];
    }
}
