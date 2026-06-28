<?php

use App\Services\Crm\Optimization\Center\DTO\OptimizationCenter;
use App\Services\Crm\Optimization\Center\DTO\OptimizationDashboard;
use App\Services\Crm\Optimization\Center\DTO\OptimizationHealth;
use App\Services\Crm\Optimization\Center\DTO\OptimizationOpportunity;
use App\Services\Crm\Optimization\Center\DTO\OptimizationRoadmap;

describe('OptimizationDashboard', function () {
    it('creates dashboard with stats', function () {
        $d = new OptimizationDashboard(
            overallStats: ['total' => 50, 'active' => 10, 'completed' => 15, 'avg_impact' => 72.0],
            automationScore: ['score' => 72.5],
            health: ['maturity' => 65.0],
            trend: ['direction' => 'up'],
            recentActivity: [['type' => 'verification', 'count' => 18]],
        );

        expect($d->overallStats['total'])->toBe(50);
        expect($d->automationScore['score'])->toBe(72.5);
    });

    it('serializes to JSON', function () {
        $d = new OptimizationDashboard(
            overallStats: [],
            automationScore: [],
            health: [],
            trend: [],
            recentActivity: [],
        );

        $json = $d->jsonSerialize();
        expect($json)->toHaveKeys(['overall_stats', 'automation_score', 'health', 'trend', 'recent_activity']);
    });
});

describe('OptimizationOpportunity', function () {
    it('creates an opportunity', function () {
        $o = new OptimizationOpportunity(
            id: 'opp_1',
            title: 'Improve impact',
            priority: 'high',
            expectedGain: 15.0,
            confidence: 72.0,
            estimatedEffort: 'medium',
            category: 'impact',
            dependencies: [],
            recommendationType: 'workflow',
            targetId: 1,
        );

        expect($o->expectedGain)->toBe(15.0);
        expect($o->priority)->toBe('high');
    });

    it('serializes to JSON', function () {
        $o = new OptimizationOpportunity('a', 'Test', 'low', 5.0, 50.0, 'low', 'test', [], 'workflow', 0);
        $json = $o->jsonSerialize();

        expect($json['expected_gain'])->toBe(5.0);
        expect($json['priority'])->toBe('low');
    });
});

describe('OptimizationRoadmap', function () {
    it('creates roadmap with phases', function () {
        $r = new OptimizationRoadmap(phases: [
            ['phase' => 'now', 'title' => 'Now', 'items' => []],
            ['phase' => 'next', 'title' => 'Next', 'items' => []],
        ]);

        expect($r->phases)->toHaveCount(2);
    });
});

describe('OptimizationHealth', function () {
    it('creates health with maturity', function () {
        $h = new OptimizationHealth(
            maturity: 68.5,
            components: [],
            statusDistribution: ['healthy' => 3, 'warning' => 1, 'critical' => 1],
            recentChanges: [],
        );

        expect($h->maturity)->toBe(68.5);
    });
});

describe('OptimizationCenter', function () {
    it('creates center from all components', function () {
        $dashboard = new OptimizationDashboard([], [], [], [], []);
        $opportunities = [
            new OptimizationOpportunity('a', 'Test', 'low', 5.0, 50.0, 'low', 'test', [], 'workflow', 0),
        ];
        $roadmap = new OptimizationRoadmap([]);
        $health = new OptimizationHealth(0.0, [], [], []);

        $center = new OptimizationCenter(
            dashboard: $dashboard,
            opportunities: $opportunities,
            roadmap: $roadmap,
            health: $health,
        );

        expect($center->opportunities)->toHaveCount(1);
    });

    it('serializes to JSON', function () {
        $dashboard = new OptimizationDashboard([], [], [], [], []);
        $roadmap = new OptimizationRoadmap([]);
        $health = new OptimizationHealth(0.0, [], [], []);

        $center = new OptimizationCenter($dashboard, [], $roadmap, $health);
        $json = $center->jsonSerialize();

        expect($json)->toHaveKeys(['dashboard', 'opportunities', 'roadmap', 'health']);
    });
});
