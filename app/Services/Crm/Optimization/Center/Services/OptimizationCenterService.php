<?php

namespace App\Services\Crm\Optimization\Center\Services;

use App\Services\Crm\Optimization\Center\DTO\OptimizationCenter;

class OptimizationCenterService
{
    public function __construct(
        private OptimizationDashboardService $dashboardService,
        private OptimizationOpportunityService $opportunityService,
        private OptimizationRoadmapService $roadmapService,
        private OptimizationHealthService $healthService,
    ) {}

    public function build(
        array $lifecycleStats,
        ?array $impactResults = null,
        ?array $automationScore = null,
        ?array $trend = null,
        ?float $adoptionRate = null,
        ?float $verificationRate = null,
    ): OptimizationCenter {
        $dashboard = $this->dashboardService->build(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
            trend: $trend,
        );

        $opportunities = $this->opportunityService->rank(
            lifecycleEvents: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
        );

        $roadmap = $this->roadmapService->build($opportunities);

        $health = $this->healthService->assess(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
            adoptionRate: $adoptionRate,
            verificationRate: $verificationRate,
        );

        return new OptimizationCenter(
            dashboard: $dashboard,
            opportunities: $opportunities,
            roadmap: $roadmap,
            health: $health,
        );
    }
}
