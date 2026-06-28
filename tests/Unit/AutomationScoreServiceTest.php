<?php

use App\Services\Crm\Optimization\Automation\DTO\AutomationScore;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreBreakdown;
use App\Services\Crm\Optimization\Automation\DTO\ScoreTrend;
use App\Services\Crm\Optimization\Automation\Registries\WorkflowAutomationScoreRegistry;
use App\Services\Crm\Optimization\Automation\Services\AutomationScoreService;
use App\Services\Crm\Optimization\Automation\Services\ScoreCalculator;
use App\Services\Crm\Optimization\Automation\Services\ScoreClassificationService;
use App\Services\Crm\Optimization\Automation\Services\ScoreExplainabilityService;

beforeEach(function () {
    $registry = new WorkflowAutomationScoreRegistry;
    $this->service = new AutomationScoreService(
        calculator: new ScoreCalculator,
        classificationService: new ScoreClassificationService,
        explainabilityService: new ScoreExplainabilityService($registry),
        registry: $registry,
    );
});

describe('AutomationScoreService', function () {
    it('computes overall score from lifecycle stats', function () {
        $lifecycleStats = [
            'total_events' => 100,
            'total_generated' => 100,
            'total_viewed' => 80,
            'total_accepted' => 60,
            'total_applied' => 45,
            'total_verified' => 35,
            'total_completed' => 30,
        ];

        $score = $this->service->score(lifecycleStats: $lifecycleStats);

        expect($score->overallScore)->toBeGreaterThan(0);
        expect($score->overallScore)->toBeLessThanOrEqual(100);
        expect($score->classification)->toBeString();
        expect($score->breakdown)->toHaveCount(5);
    });

    it('returns critical for zero lifecycle stats', function () {
        $score = $this->service->score(lifecycleStats: []);

        expect($score->overallScore)->toBe(0.0);
        expect($score->classification)->toBe('critical');
    });

    it('includes impact results in scoring', function () {
        $lifecycleStats = [
            'total_events' => 100,
            'total_generated' => 100,
            'total_viewed' => 80,
            'total_accepted' => 60,
            'total_applied' => 45,
            'total_verified' => 35,
            'total_completed' => 30,
        ];
        $impactResults = [
            ['overallScore' => 85.0, 'improvements' => [['percentage' => 25], ['percentage' => 30]]],
            ['overallScore' => 75.0, 'improvements' => [['percentage' => 15]]],
        ];

        $score = $this->service->score(
            lifecycleStats: $lifecycleStats,
            impactResults: $impactResults,
        );

        expect($score->overallScore)->toBeGreaterThan(0);
        expect($score->breakdown[0]->label)->toBe('Impact Success');
        expect($score->breakdown[0]->score)->toBeGreaterThan(0);
    });

    it('includes trend in result when provided', function () {
        $trend = new ScoreTrend(direction: 'up', magnitude: 0.06, period: '30d');

        $score = $this->service->score(
            lifecycleStats: ['total_events' => 50, 'total_generated' => 50, 'total_viewed' => 40, 'total_accepted' => 30, 'total_applied' => 20, 'total_verified' => 15, 'total_completed' => 10],
            trend: $trend,
        );

        expect($score->trend)->not->toBeNull();
        expect($score->trend->direction)->toBe('up');
        expect($score->trend->percentage())->toBe(6.0);
    });

    it('generates a human-readable summary', function () {
        $score = $this->service->score(lifecycleStats: [
            'total_events' => 100,
            'total_generated' => 100,
            'total_viewed' => 80,
            'total_accepted' => 60,
            'total_applied' => 45,
            'total_verified' => 35,
            'total_completed' => 30,
        ]);

        expect($score->summary)->toBeString();
        expect($score->summary)->not->toBeEmpty();
        expect($score->summary)->toContain('Overall automation score');
    });

    it('serializes score to JSON', function () {
        $score = $this->service->score(lifecycleStats: [
            'total_events' => 100,
            'total_generated' => 100,
            'total_viewed' => 80,
            'total_accepted' => 60,
            'total_applied' => 45,
            'total_verified' => 35,
            'total_completed' => 30,
        ]);

        $json = $score->jsonSerialize();

        expect($json['overall_score'])->toBeGreaterThan(0);
        expect($json['classification'])->toBeString();
        expect($json['breakdown'])->toHaveCount(5);
        expect($json['summary'])->toBeString();
    });

    it('handles scoreById method', function () {
        $score = $this->service->scoreById(
            targetId: 1,
            targetType: 'workflow',
            lifecycleStats: [
                'total_events' => 50,
                'total_generated' => 50,
                'total_viewed' => 40,
                'total_accepted' => 30,
                'total_applied' => 20,
                'total_verified' => 15,
                'total_completed' => 10,
            ],
        );

        expect($score->overallScore)->toBeGreaterThan(0);
    });

    it('computes adoption rate correctly', function () {
        $lifecycleStats = [
            'total_events' => 100,
            'total_generated' => 100,
            'total_viewed' => 80,
            'total_accepted' => 80,
            'total_applied' => 60,
            'total_verified' => 50,
            'total_completed' => 40,
        ];

        $score = $this->service->score(lifecycleStats: $lifecycleStats);

        $adoption = collect($score->breakdown)->firstWhere('label', 'Recommendation Adoption');
        expect($adoption->score)->toBeGreaterThan(60);
    });
});

describe('ScoreCalculator', function () {
    it('computes weighted aggregate', function () {
        $calculator = new ScoreCalculator;
        $registry = new WorkflowAutomationScoreRegistry;

        $scores = ['impact_success' => 80, 'adoption_rate' => 60];
        $result = $calculator->calculate($scores, $registry);

        $expected = (80 * 0.25 + 60 * 0.20) / (0.25 + 0.20);
        expect($result)->toBe(round($expected, 2));
    });

    it('returns zero for empty scores', function () {
        $calculator = new ScoreCalculator;
        $registry = new WorkflowAutomationScoreRegistry;

        expect($calculator->calculate([], $registry))->toBe(0.0);
    });

    it('skips unknown metrics', function () {
        $calculator = new ScoreCalculator;
        $registry = new WorkflowAutomationScoreRegistry;

        $result = $calculator->calculate(['unknown' => 100], $registry);

        expect($result)->toBe(0.0);
    });

    it('clamps scores to 0-100 range', function () {
        $calculator = new ScoreCalculator;
        $registry = new WorkflowAutomationScoreRegistry;

        $result = $calculator->calculate(['impact_success' => 150], $registry);

        expect($result)->toBe(100.0);
    });
});

describe('ScoreClassificationService', function () {
    it('classifies excellent scores', function () {
        $service = new ScoreClassificationService;

        expect($service->classify(95))->toBe('excellent');
        expect($service->classify(80))->toBe('excellent');
    });

    it('classifies good scores', function () {
        $service = new ScoreClassificationService;

        expect($service->classify(79))->toBe('good');
        expect($service->classify(60))->toBe('good');
    });

    it('classifies fair scores', function () {
        $service = new ScoreClassificationService;

        expect($service->classify(59))->toBe('fair');
        expect($service->classify(40))->toBe('fair');
    });

    it('classifies poor scores', function () {
        $service = new ScoreClassificationService;

        expect($service->classify(39))->toBe('poor');
        expect($service->classify(20))->toBe('poor');
    });

    it('classifies critical scores', function () {
        $service = new ScoreClassificationService;

        expect($service->classify(19))->toBe('critical');
        expect($service->classify(0))->toBe('critical');
    });
});

describe('ScoreExplainabilityService', function () {
    it('generates summary with breakdown', function () {
        $registry = new WorkflowAutomationScoreRegistry;
        $explainability = new ScoreExplainabilityService($registry);

        $breakdown = [
            new AutomationScoreBreakdown('Impact', 80, 0.25, 'Test'),
        ];
        $score = new AutomationScore(
            overallScore: 80.0,
            breakdown: $breakdown,
            classification: 'excellent',
            summary: '',
        );

        $summary = $explainability->generateSummary($score);
        expect($summary)->toContain('80');
        expect($summary)->toContain('Component breakdown');
    });

    it('includes trend in summary', function () {
        $explainability = new ScoreExplainabilityService;

        $trend = new ScoreTrend(direction: 'up', magnitude: 0.06);
        $score = new AutomationScore(
            overallScore: 72.0,
            breakdown: [],
            classification: 'good',
            summary: '',
            trend: $trend,
        );

        $summary = $explainability->generateSummary($score);
        expect($summary)->toContain('Trend');
        expect($summary)->toContain('up');
    });

    it('works without registry', function () {
        $explainability = new ScoreExplainabilityService;

        $score = new AutomationScore(
            overallScore: 50.0,
            breakdown: [],
            classification: 'fair',
            summary: '',
        );

        $summary = $explainability->generateSummary($score);
        expect($summary)->toBeString();
        expect($summary)->toContain('50');
    });

    it('highlights lowest component as improvement opportunity', function () {
        $explainability = new ScoreExplainabilityService;

        $breakdown = [
            new AutomationScoreBreakdown('A', 80, 0.25, 'Good'),
            new AutomationScoreBreakdown('B', 30, 0.25, 'Bad'),
        ];
        $score = new AutomationScore(
            overallScore: 55.0,
            breakdown: $breakdown,
            classification: 'fair',
            summary: '',
        );

        $summary = $explainability->generateSummary($score);
        expect($summary)->toContain('B');
        expect($summary)->toContain('improvement opportunity');
    });
});
