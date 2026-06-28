<?php

namespace App\Services\Crm\Optimization\Automation\Services;

use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreBreakdown;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreSnapshot;

class AutomationHistoryService
{
    public function timeline(array $snapshots): array
    {
        $sorted = $this->sortByDate($snapshots);

        return array_map(fn (AutomationScoreSnapshot $s) => [
            'date' => $s->date,
            'score' => $s->overallScore,
            'classification' => $s->classification,
        ], $sorted);
    }

    public function diff(AutomationScoreSnapshot $before, AutomationScoreSnapshot $after): array
    {
        $changes = [];
        $scoreDelta = round($after->overallScore - $before->overallScore, 2);

        $beforeMap = $this->breakdownMap($before->breakdown);
        $afterMap = $this->breakdownMap($after->breakdown);

        foreach ($afterMap as $label => $component) {
            $beforeScore = $beforeMap[$label]->score ?? null;
            $afterScore = $component->score;

            if ($beforeScore !== null) {
                $delta = round($afterScore - $beforeScore, 2);
                if ($delta !== 0.0) {
                    $changes[] = [
                        'label' => $label,
                        'before' => $beforeScore,
                        'after' => $afterScore,
                        'delta' => $delta,
                        'direction' => $delta > 0 ? 'improved' : 'declined',
                    ];
                }
            }
        }

        return [
            'period' => ['from' => $before->date, 'to' => $after->date],
            'score_delta' => $scoreDelta,
            'classification_change' => $before->classification !== $after->classification
                ? ['from' => $before->classification, 'to' => $after->classification]
                : null,
            'component_changes' => $changes,
        ];
    }

    public function detectRegressions(array $snapshots): array
    {
        $sorted = $this->sortByDate($snapshots);
        $regressions = [];

        for ($i = 1; $i < count($sorted); $i++) {
            $diff = $this->diff($sorted[$i - 1], $sorted[$i]);
            $scoreDelta = $diff['score_delta'];

            if ($scoreDelta < -5) {
                $regressions[] = [
                    'date' => $sorted[$i]->date,
                    'score_drop' => abs($scoreDelta),
                    'from' => $sorted[$i - 1]->overallScore,
                    'to' => $sorted[$i]->overallScore,
                    'classification' => $sorted[$i]->classification,
                    'contributing_factors' => array_filter(
                        $diff['component_changes'],
                        fn ($c) => $c['direction'] === 'declined',
                    ),
                ];
            }
        }

        return $regressions;
    }

    public function milestones(array $snapshots): array
    {
        $sorted = $this->sortByDate($snapshots);
        $events = [];

        for ($i = 0; $i < count($sorted); $i++) {
            $snapshot = $sorted[$i];

            if ($snapshot->classification === 'excellent' && $snapshot->overallScore >= 90) {
                $events[] = [
                    'date' => $snapshot->date,
                    'type' => 'excellent_score',
                    'label' => 'Reached excellent automation score',
                    'score' => $snapshot->overallScore,
                ];
            }

            if ($i > 0) {
                $change = $snapshot->overallScore - $sorted[$i - 1]->overallScore;
                if ($change >= 10) {
                    $events[] = [
                        'date' => $snapshot->date,
                        'type' => 'significant_improvement',
                        'label' => "Significant improvement: +{$change} points",
                        'score' => $snapshot->overallScore,
                    ];
                } elseif ($change <= -10) {
                    $events[] = [
                        'date' => $snapshot->date,
                        'type' => 'significant_regression',
                        'label' => 'Significant regression',
                        'score' => $snapshot->overallScore,
                    ];
                }
            }

            if ($i === 0) {
                $events[] = [
                    'date' => $snapshot->date,
                    'type' => 'first_snapshot',
                    'label' => 'First automation score recorded',
                    'score' => $snapshot->overallScore,
                ];
            }
        }

        return $events;
    }

    private function breakdownMap(array $breakdown): array
    {
        $map = [];
        foreach ($breakdown as $b) {
            if ($b instanceof AutomationScoreBreakdown) {
                $map[$b->label] = $b;
            }
        }

        return $map;
    }

    private function sortByDate(array $snapshots): array
    {
        $sorted = $snapshots;
        usort($sorted, fn (AutomationScoreSnapshot $a, AutomationScoreSnapshot $b) => strcmp($a->date, $b->date));

        return $sorted;
    }
}
