<?php

use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreBreakdown;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreSnapshot;
use App\Services\Crm\Optimization\Automation\DTO\ScoreHistory;
use App\Services\Crm\Optimization\Automation\DTO\ScoreTrend;

describe('AutomationScoreSnapshot', function () {
    it('creates a snapshot with date and score', function () {
        $b = new AutomationScoreBreakdown('Impact', 80, 0.25, 'Test');
        $s = new AutomationScoreSnapshot('2026-06-25', 86.5, 'excellent', [$b]);

        expect($s->date)->toBe('2026-06-25');
        expect($s->overallScore)->toBe(86.5);
        expect($s->classification)->toBe('excellent');
        expect($s->breakdown)->toHaveCount(1);
    });

    it('serializes to JSON', function () {
        $b = new AutomationScoreBreakdown('Impact', 80, 0.25, 'Test');
        $s = new AutomationScoreSnapshot('2026-06-25', 86.5, 'excellent', [$b]);

        $json = $s->jsonSerialize();

        expect($json['date'])->toBe('2026-06-25');
        expect($json['overall_score'])->toBe(86.5);
        expect($json['classification'])->toBe('excellent');
        expect($json['breakdown'])->toHaveCount(1);
    });
});

describe('ScoreHistory (Aggregate Root)', function () {
    it('creates history with snapshots', function () {
        $snapshots = [
            new AutomationScoreSnapshot('2026-06-01', 74.0, 'good', []),
            new AutomationScoreSnapshot('2026-06-25', 86.5, 'excellent', []),
        ];

        $h = new ScoreHistory(snapshots: $snapshots);

        expect($h->snapshots)->toHaveCount(2);
    });

    it('returns earliest and latest snapshot', function () {
        $s1 = new AutomationScoreSnapshot('2026-06-01', 74.0, 'good', []);
        $s2 = new AutomationScoreSnapshot('2026-06-25', 86.5, 'excellent', []);
        $h = new ScoreHistory(snapshots: [$s1, $s2]);

        expect($h->earliest()->overallScore)->toBe(74.0);
        expect($h->latest()->overallScore)->toBe(86.5);
    });

    it('computes overall change', function () {
        $s1 = new AutomationScoreSnapshot('2026-06-01', 74.0, 'good', []);
        $s2 = new AutomationScoreSnapshot('2026-06-25', 86.5, 'excellent', []);
        $h = new ScoreHistory(snapshots: [$s1, $s2]);

        expect($h->overallChange())->toBe(12.5);
    });

    it('returns null for empty history', function () {
        $h = new ScoreHistory(snapshots: []);

        expect($h->earliest())->toBeNull();
        expect($h->latest())->toBeNull();
        expect($h->overallChange())->toBe(0.0);
    });

    it('serializes with regression events and milestones', function () {
        $h = new ScoreHistory(
            snapshots: [new AutomationScoreSnapshot('2026-06-25', 86.5, 'excellent', [])],
            trend: new ScoreTrend('up', 0.06),
            regressionEvents: [['date' => '2026-06-18', 'score_drop' => 3.0]],
            milestones: [['date' => '2026-06-25', 'type' => 'excellent_score']],
        );

        $json = $h->jsonSerialize();

        expect($json['snapshots'])->toHaveCount(1);
        expect($json['regression_events'])->toHaveCount(1);
        expect($json['milestones'])->toHaveCount(1);
        expect($json['trend']['direction'])->toBe('up');
        expect($json['overall_change'])->toBe(0.0);
    });
});
