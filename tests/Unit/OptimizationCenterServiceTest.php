<?php

use App\Services\Crm\Optimization\Center\DTO\OptimizationDashboard;
use App\Services\Crm\Optimization\Center\DTO\OptimizationHealth;
use App\Services\Crm\Optimization\Center\DTO\OptimizationOpportunity;
use App\Services\Crm\Optimization\Center\DTO\OptimizationRoadmap;
use App\Services\Crm\Optimization\Center\Services\OptimizationCenterService;
use App\Services\Crm\Optimization\Center\Services\OptimizationDashboardService;
use App\Services\Crm\Optimization\Center\Services\OptimizationHealthService;
use App\Services\Crm\Optimization\Center\Services\OptimizationOpportunityService;
use App\Services\Crm\Optimization\Center\Services\OptimizationRoadmapService;

describe('OptimizationDashboardService', function () {
    it('builds dashboard from lifecycle stats', function () {
        $service = new OptimizationDashboardService;

        $lifecycleStats = ['total_events' => 50, 'total_viewed' => 42, 'total_completed' => 15];
        $dashboard = $service->build($lifecycleStats);

        expect($dashboard->overallStats['total_recommendations'])->toBe(50);
        expect($dashboard->overallStats['active_recommendations'])->toBe(27);
        expect($dashboard->overallStats['completed_recommendations'])->toBe(15);
    });

    it('computes avg impact score', function () {
        $service = new OptimizationDashboardService;

        $lifecycleStats = ['total_events' => 50, 'total_viewed' => 42, 'total_completed' => 15];
        $impactResults = [['overallScore' => 80], ['overallScore' => 60]];
        $dashboard = $service->build($lifecycleStats, $impactResults);

        expect($dashboard->overallStats['avg_impact_score'])->toBe(70.0);
    });

    it('builds recent activity with improvements', function () {
        $service = new OptimizationDashboardService;

        $lifecycleStats = ['total_verified' => 18, 'total_completed' => 15];
        $impactResults = [['improvements' => [['pct' => 10], ['pct' => 20]]]];

        $dashboard = $service->build($lifecycleStats, $impactResults);

        $activity = $dashboard->recentActivity;
        $types = array_map(fn ($a) => $a['type'], $activity);
        expect($types)->toContain('verification');
        expect($types)->toContain('improvement');
    });
});

describe('OptimizationOpportunityService', function () {
    it('ranks low-impact results as opportunities', function () {
        $service = new OptimizationOpportunityService;

        $impactResults = [['overallScore' => 45, 'improvements' => [['pct' => 10]]]];
        $opportunities = $service->rank([], $impactResults);

        expect($opportunities)->not->toBeEmpty();
        expect($opportunities[0]->expectedGain)->toBeGreaterThan(0);
    });

    it('creates component opportunities from automation score breakdown', function () {
        $service = new OptimizationOpportunityService;

        $automationScore = [
            'overall_score' => 60,
            'breakdown' => [
                ['label' => 'Lifecycle Completion', 'score' => 30, 'weight' => 0.15],
            ],
        ];

        $opportunities = $service->rank([], null, $automationScore);

        $titles = array_map(fn ($o) => $o->title, $opportunities);
        expect($titles)->toContain('Boost Lifecycle Completion');
    });

    it('returns default opportunity when none found', function () {
        $service = new OptimizationOpportunityService;

        $automationScore = [
            'overall_score' => 95,
            'breakdown' => [
                ['label' => 'All', 'score' => 90, 'weight' => 0.5],
            ],
        ];

        $opportunities = $service->rank([], [], $automationScore);

        expect($opportunities[0]->title)->toContain('No current');
    });

    it('sorts opportunities by expected gain descending', function () {
        $service = new OptimizationOpportunityService;

        $impactResults = [
            ['overallScore' => 30, 'improvements' => [['pct' => 5]]],
            ['overallScore' => 60, 'improvements' => [['pct' => 10]]],
        ];

        $opportunities = $service->rank([], $impactResults);

        expect($opportunities[0]->expectedGain)->toBeGreaterThanOrEqual($opportunities[1]->expectedGain ?? 0);
    });
});

describe('OptimizationRoadmapService', function () {
    it('creates phases from opportunities', function () {
        $service = new OptimizationRoadmapService;

        $opportunities = [
            new OptimizationOpportunity('a', 'Top', 'high', 20.0, 80.0, 'medium', 'impact', [], 'workflow', 1),
            new OptimizationOpportunity('b', 'Second', 'high', 15.0, 70.0, 'medium', 'impact', [], 'workflow', 2),
            new OptimizationOpportunity('c', 'Third', 'medium', 10.0, 60.0, 'low', 'impact', [], 'workflow', 3),
            new OptimizationOpportunity('d', 'Fourth', 'medium', 5.0, 50.0, 'low', 'impact', [], 'workflow', 4),
            new OptimizationOpportunity('e', 'Fifth', 'low', 2.0, 30.0, 'low', 'impact', [], 'workflow', 5),
        ];

        $roadmap = $service->build($opportunities);

        $phaseNames = array_map(fn ($p) => $p['phase'], $roadmap->phases);
        expect($phaseNames)->toContain('now');
        expect($phaseNames)->toContain('next');
        expect($phaseNames)->toContain('later');
        expect($roadmap->phases[0]['items'])->toHaveCount(2);
        expect($roadmap->phases[1]['items'])->toHaveCount(2);
        expect($roadmap->phases[2]['items'])->toHaveCount(1);
    });

    it('handles empty opportunities', function () {
        $service = new OptimizationRoadmapService;
        $roadmap = $service->build([]);

        expect($roadmap->phases)->toBeEmpty();
    });
});

describe('OptimizationHealthService', function () {
    it('assesses health with all components', function () {
        $service = new OptimizationHealthService;

        $lifecycleStats = ['total_events' => 100, 'total_completed' => 40, 'total_verified' => 35, 'total_applied' => 50, 'total_viewed' => 80, 'total_accepted' => 60];
        $impactResults = [['overallScore' => 72], ['overallScore' => 65]];
        $automationScore = ['overall_score' => 72.5];

        $health = $service->assess(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
            adoptionRate: 0.75,
            verificationRate: 0.70,
        );

        expect($health->maturity)->toBeGreaterThan(0);
        expect($health->components)->toHaveCount(5);
        expect($health->statusDistribution)->toHaveKeys(['healthy', 'warning', 'critical']);
    });

    it('handles empty stats', function () {
        $service = new OptimizationHealthService;
        $health = $service->assess(lifecycleStats: []);

        expect($health->maturity)->toBe(0.0);
        expect($health->components)->toHaveCount(5);
    });
});

describe('OptimizationCenterService (Orchestrator)', function () {
    it('builds full center from all inputs', function () {
        $service = new OptimizationCenterService(
            dashboardService: new OptimizationDashboardService,
            opportunityService: new OptimizationOpportunityService,
            roadmapService: new OptimizationRoadmapService,
            healthService: new OptimizationHealthService,
        );

        $lifecycleStats = ['total_events' => 50, 'total_generated' => 50, 'total_viewed' => 42, 'total_accepted' => 30, 'total_applied' => 22, 'total_verified' => 18, 'total_completed' => 15];
        $impactResults = [['overallScore' => 72, 'improvements' => [['pct' => 15]]]];
        $automationScore = ['overall_score' => 72.5, 'breakdown' => [['label' => 'Test', 'score' => 50, 'weight' => 0.25]]];

        $center = $service->build(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
            automationScore: $automationScore,
            trend: ['direction' => 'up'],
            adoptionRate: 0.71,
            verificationRate: 0.82,
        );

        expect($center->dashboard)->toBeInstanceOf(OptimizationDashboard::class);
        expect($center->opportunities)->not->toBeEmpty();
        expect($center->roadmap)->toBeInstanceOf(OptimizationRoadmap::class);
        expect($center->health)->toBeInstanceOf(OptimizationHealth::class);
    });

    it('serializes to JSON without errors', function () {
        $service = new OptimizationCenterService(
            dashboardService: new OptimizationDashboardService,
            opportunityService: new OptimizationOpportunityService,
            roadmapService: new OptimizationRoadmapService,
            healthService: new OptimizationHealthService,
        );

        $center = $service->build(
            lifecycleStats: ['total_events' => 50, 'total_generated' => 50, 'total_viewed' => 42, 'total_accepted' => 30, 'total_applied' => 22, 'total_verified' => 18, 'total_completed' => 15],
        );

        $json = $center->jsonSerialize();
        expect($json)->toHaveKeys(['dashboard', 'opportunities', 'roadmap', 'health']);
    });
});
