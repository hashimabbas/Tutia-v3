<?php

use App\Services\Crm\Optimization\Automation\DTO\AutomationScore;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreBreakdown;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreSnapshot;
use App\Services\Crm\Optimization\Automation\DTO\ScoreHistory;
use App\Services\Crm\Optimization\Automation\DTO\ScoreTrend;

describe('AutomationScoreBreakdown', function () {
    it('creates a breakdown with weighted score', function () {
        $b = new AutomationScoreBreakdown(label: 'Impact Success', score: 80, weight: 0.25, description: 'Test metric');

        expect($b->label)->toBe('Impact Success');
        expect($b->score)->toBe(80.0);
        expect($b->weight)->toBe(0.25);
        expect($b->weightedScore())->toBe(20.0);
    });

    it('serializes to JSON', function () {
        $b = new AutomationScoreBreakdown(label: 'Adoption', score: 60, weight: 0.20, description: 'Adoption rate');

        $json = $b->jsonSerialize();

        expect($json['label'])->toBe('Adoption');
        expect($json['score'])->toBe(60.0);
        expect($json['weighted_score'])->toBe(12.0);
    });
});

describe('ScoreTrend', function () {
    it('creates a trend with percentage', function () {
        $t = new ScoreTrend(direction: 'up', magnitude: 0.06, period: '30d');

        expect($t->direction)->toBe('up');
        expect($t->magnitude)->toBe(0.06);
        expect($t->percentage())->toBe(6.0);
    });

    it('defaults period to 30d', function () {
        $t = new ScoreTrend(direction: 'up', magnitude: 0.10);

        expect($t->period)->toBe('30d');
    });

    it('serializes to JSON', function () {
        $t = new ScoreTrend(direction: 'down', magnitude: 0.03);

        $json = $t->jsonSerialize();

        expect($json['direction'])->toBe('down');
        expect($json['percentage'])->toBe(3.0);
    });
});

describe('ScoreHistory', function () {
    it('creates history with snapshots', function () {
        $h = new ScoreHistory(snapshots: []);

        expect($h->snapshots)->toBeEmpty();
    });

    it('serializes with optional trend', function () {
        $snapshot = new AutomationScoreSnapshot(
            date: '2026-01-01',
            overallScore: 70.0,
            classification: 'good',
            breakdown: [],
        );
        $trend = new ScoreTrend(direction: 'up', magnitude: 0.05);
        $h = new ScoreHistory(
            snapshots: [$snapshot],
            trend: $trend,
        );

        $json = $h->jsonSerialize();

        expect($json['trend']['direction'])->toBe('up');
        expect($json['snapshots'])->toHaveCount(1);
    });
});

describe('AutomationScore', function () {
    it('creates a score with breakdown', function () {
        $breakdown = [
            new AutomationScoreBreakdown(label: 'Impact', score: 80, weight: 0.25, description: 'Impact'),
        ];

        $score = new AutomationScore(
            overallScore: 80.0,
            breakdown: $breakdown,
            classification: 'excellent',
            summary: 'Test summary',
        );

        expect($score->overallScore)->toBe(80.0);
        expect($score->classification)->toBe('excellent');
        expect($score->breakdown)->toHaveCount(1);
    });

    it('serializes to JSON with optional trend', function () {
        $trend = new ScoreTrend(direction: 'up', magnitude: 0.06);
        $score = new AutomationScore(
            overallScore: 72.5,
            breakdown: [],
            classification: 'good',
            summary: 'Summary',
            trend: $trend,
            metadata: ['target_type' => 'workflow', 'target_id' => 1],
        );

        $json = $score->jsonSerialize();

        expect($json['overall_score'])->toBe(72.5);
        expect($json['classification'])->toBe('good');
        expect($json['trend']['direction'])->toBe('up');
        expect($json['metadata']['target_type'])->toBe('workflow');
    });

    it('serializes without trend', function () {
        $score = new AutomationScore(
            overallScore: 50.0,
            breakdown: [],
            classification: 'fair',
            summary: 'No trend',
        );

        $json = $score->jsonSerialize();

        expect($json['overall_score'])->toBe(50.0);
        expect($json['trend'])->toBeNull();
    });
});
