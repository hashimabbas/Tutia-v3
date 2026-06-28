<?php

use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreBreakdown;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreSnapshot;
use App\Services\Crm\Optimization\Automation\Services\AutomationHistoryService;
use App\Services\Crm\Optimization\Automation\Services\AutomationInsightService;
use App\Services\Crm\Optimization\Automation\Services\AutomationTrendService;

function makeSnapshot(string $date, float $score, string $class, array $breakdownScores = []): AutomationScoreSnapshot
{
    $breakdown = [];
    foreach ($breakdownScores as $label => $s) {
        $breakdown[] = new AutomationScoreBreakdown($label, $s, 0.20, '');
    }

    return new AutomationScoreSnapshot($date, $score, $class, $breakdown);
}

describe('AutomationTrendService', function () {
    it('computes daily trends', function () {
        $service = new AutomationTrendService;
        $snapshots = [
            makeSnapshot('2026-06-01', 74.0, 'good'),
            makeSnapshot('2026-06-02', 76.0, 'good'),
        ];

        $daily = $service->daily($snapshots);

        expect($daily)->toHaveCount(2);
        expect($daily[0]['date'])->toBe('2026-06-01');
        expect($daily[1]['score'])->toBe(76.0);
    });

    it('computes weekly averages', function () {
        $service = new AutomationTrendService;
        $snapshots = [
            makeSnapshot('2026-06-01', 74.0, 'good'),
            makeSnapshot('2026-06-02', 76.0, 'good'),
            makeSnapshot('2026-06-08', 80.0, 'excellent'),
        ];

        $weekly = $service->weekly($snapshots);

        expect($weekly)->not->toBeEmpty();
        foreach ($weekly as $w) {
            expect($w)->toHaveKeys(['week', 'avg_score', 'sample_count']);
        }
    });

    it('computes monthly averages', function () {
        $service = new AutomationTrendService;
        $snapshots = [
            makeSnapshot('2026-06-01', 74.0, 'good'),
            makeSnapshot('2026-07-01', 82.0, 'excellent'),
        ];

        $monthly = $service->monthly($snapshots);

        expect($monthly)->toHaveCount(2);
        expect($monthly[0]['month'])->toBe('2026-06');
        expect($monthly[1]['month'])->toBe('2026-07');
    });

    it('computes rolling average', function () {
        $service = new AutomationTrendService;
        $snapshots = [
            makeSnapshot('2026-06-01', 70.0, 'good'),
            makeSnapshot('2026-06-02', 80.0, 'good'),
            makeSnapshot('2026-06-03', 90.0, 'excellent'),
        ];

        $rolling = $service->rollingAverage($snapshots, 2);

        expect($rolling)->toHaveCount(3);
        expect($rolling[0]['rolling_avg'])->toBe(70.0);
        expect($rolling[2]['rolling_avg'])->toBe(85.0);
    });

    it('sorts snapshots by date', function () {
        $service = new AutomationTrendService;
        $snapshots = [
            makeSnapshot('2026-06-03', 90.0, 'excellent'),
            makeSnapshot('2026-06-01', 70.0, 'good'),
        ];

        $daily = $service->daily($snapshots);

        expect($daily[0]['date'])->toBe('2026-06-01');
        expect($daily[1]['date'])->toBe('2026-06-03');
    });
});

describe('AutomationHistoryService', function () {
    it('builds timeline', function () {
        $service = new AutomationHistoryService;
        $snapshots = [
            makeSnapshot('2026-06-01', 70.0, 'good'),
            makeSnapshot('2026-06-15', 80.0, 'excellent'),
        ];

        $timeline = $service->timeline($snapshots);

        expect($timeline)->toHaveCount(2);
        expect($timeline[0]['score'])->toBe(70.0);
        expect($timeline[1]['classification'])->toBe('excellent');
    });

    it('computes diff between two snapshots', function () {
        $service = new AutomationHistoryService;
        $before = makeSnapshot('2026-06-01', 70.0, 'good', ['Impact' => 60, 'Adoption' => 50]);
        $after = makeSnapshot('2026-06-15', 85.0, 'excellent', ['Impact' => 80, 'Adoption' => 50]);

        $diff = $service->diff($before, $after);

        expect($diff['score_delta'])->toBe(15.0);
        expect($diff['classification_change']['from'])->toBe('good');
        expect($diff['classification_change']['to'])->toBe('excellent');
        expect($diff['component_changes'])->toHaveCount(1);
        expect($diff['component_changes'][0]['label'])->toBe('Impact');
        expect($diff['component_changes'][0]['direction'])->toBe('improved');
    });

    it('detects regressions', function () {
        $service = new AutomationHistoryService;
        $snapshots = [
            makeSnapshot('2026-06-01', 80.0, 'excellent'),
            makeSnapshot('2026-06-02', 72.0, 'good'),
            makeSnapshot('2026-06-03', 85.0, 'excellent'),
        ];

        $regressions = $service->detectRegressions($snapshots);

        expect($regressions)->toHaveCount(1);
        expect($regressions[0]['score_drop'])->toBe(8.0);
        expect($regressions[0]['date'])->toBe('2026-06-02');
    });

    it('ignores small dips in regression detection', function () {
        $service = new AutomationHistoryService;
        $snapshots = [
            makeSnapshot('2026-06-01', 80.0, 'excellent'),
            makeSnapshot('2026-06-02', 77.0, 'good'),
        ];

        $regressions = $service->detectRegressions($snapshots);

        expect($regressions)->toBeEmpty();
    });

    it('detects milestones', function () {
        $service = new AutomationHistoryService;
        $snapshots = [
            makeSnapshot('2026-06-01', 70.0, 'good'),
            makeSnapshot('2026-06-15', 85.0, 'excellent'),
            makeSnapshot('2026-06-20', 92.0, 'excellent'),
        ];

        $milestones = $service->milestones($snapshots);

        $types = array_map(fn ($m) => $m['type'], $milestones);
        expect($types)->toContain('first_snapshot');
        expect($types)->toContain('excellent_score');
        expect($types)->toContain('significant_improvement');
    });
});

describe('AutomationInsightService', function () {
    it('generates improvement insight', function () {
        $service = new AutomationInsightService;
        $prev = makeSnapshot('2026-06-01', 70.0, 'good', ['Impact' => 60]);
        $curr = makeSnapshot('2026-06-15', 85.0, 'excellent', ['Impact' => 80]);

        $diff = (new AutomationHistoryService)->diff($prev, $curr);
        $insights = $service->generateTrendInsights($prev, $curr, $diff);

        $types = array_map(fn ($i) => $i['type'], $insights);
        expect($types)->toContain('improvement');
        expect($types)->toContain('classification_change');
    });

    it('generates regression insight', function () {
        $service = new AutomationInsightService;
        $prev = makeSnapshot('2026-06-01', 80.0, 'excellent', ['Impact' => 75]);
        $curr = makeSnapshot('2026-06-15', 65.0, 'good', ['Impact' => 50]);

        $diff = (new AutomationHistoryService)->diff($prev, $curr);
        $insights = $service->generateTrendInsights($prev, $curr, $diff);

        $types = array_map(fn ($i) => $i['type'], $insights);
        expect($types)->toContain('regression');
    });

    it('generates stable insight when unchanged', function () {
        $service = new AutomationInsightService;
        $snapshot = makeSnapshot('2026-06-01', 75.0, 'good');

        $diff = (new AutomationHistoryService)->diff($snapshot, $snapshot);
        $insights = $service->generateTrendInsights($snapshot, $snapshot, $diff);

        $types = array_map(fn ($i) => $i['type'], $insights);
        expect($types)->toContain('stable');
    });

    it('generates summary text', function () {
        $service = new AutomationInsightService;
        $curr = makeSnapshot('2026-06-15', 85.0, 'excellent');

        $diff = (new AutomationHistoryService)->diff(
            makeSnapshot('2026-06-01', 70.0, 'good'),
            $curr,
        );
        $insights = $service->generateTrendInsights(
            makeSnapshot('2026-06-01', 70.0, 'good'),
            $curr,
            $diff,
        );

        $summary = $service->generateSummary($curr, $insights);
        expect($summary)->toBeString();
        expect($summary)->toContain('85');
        expect($summary)->toContain('excellent');
    });
});
