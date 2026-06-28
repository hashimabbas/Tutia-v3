<?php

namespace App\Services\Crm\Optimization\Automation\Services;

use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreSnapshot;

class AutomationTrendService
{
    public function daily(array $snapshots): array
    {
        $sorted = $this->sortByDate($snapshots);
        $daily = [];

        foreach ($sorted as $snapshot) {
            $daily[] = [
                'date' => $snapshot->date,
                'score' => $snapshot->overallScore,
                'classification' => $snapshot->classification,
            ];
        }

        return $daily;
    }

    public function weekly(array $snapshots): array
    {
        $sorted = $this->sortByDate($snapshots);
        $weekly = [];

        $weekMap = [];
        foreach ($sorted as $snapshot) {
            $week = date('o-W', strtotime($snapshot->date));
            $weekMap[$week][] = $snapshot->overallScore;
        }

        foreach ($weekMap as $week => $scores) {
            $weekly[] = [
                'week' => $week,
                'avg_score' => round(array_sum($scores) / count($scores), 2),
                'sample_count' => count($scores),
            ];
        }

        return $weekly;
    }

    public function monthly(array $snapshots): array
    {
        $sorted = $this->sortByDate($snapshots);
        $monthly = [];

        $monthMap = [];
        foreach ($sorted as $snapshot) {
            $month = date('Y-m', strtotime($snapshot->date));
            $monthMap[$month][] = $snapshot->overallScore;
        }

        foreach ($monthMap as $month => $scores) {
            $monthly[] = [
                'month' => $month,
                'avg_score' => round(array_sum($scores) / count($scores), 2),
                'sample_count' => count($scores),
            ];
        }

        return $monthly;
    }

    public function rollingAverage(array $snapshots, int $window = 7): array
    {
        $sorted = $this->sortByDate($snapshots);
        $rolling = [];

        for ($i = 0; $i < count($sorted); $i++) {
            $windowStart = max(0, $i - $window + 1);
            $windowScores = [];

            for ($j = $windowStart; $j <= $i; $j++) {
                $windowScores[] = $sorted[$j]->overallScore;
            }

            $rolling[] = [
                'date' => $sorted[$i]->date,
                'rolling_avg' => round(array_sum($windowScores) / count($windowScores), 2),
                'window' => count($windowScores),
            ];
        }

        return $rolling;
    }

    private function sortByDate(array $snapshots): array
    {
        $sorted = $snapshots;
        usort($sorted, fn (AutomationScoreSnapshot $a, AutomationScoreSnapshot $b) => strcmp($a->date, $b->date));

        return $sorted;
    }
}
