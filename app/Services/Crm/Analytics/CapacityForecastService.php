<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmApprovalRequest;
use App\Models\CrmWorkflowRun;
use Illuminate\Support\Collection;

class CapacityForecastService
{
    public function workflowVolumeForecast(int $daysAhead = 7): Collection
    {
        $historical = CrmWorkflowRun::where('created_at', '>=', now()->subDays(30))
            ->get(['created_at'])
            ->groupBy(fn ($r) => $r->created_at->format('Y-m-d'));

        return $this->forecast($historical, $daysAhead, 'workflow');
    }

    public function approvalVolumeForecast(int $daysAhead = 7): Collection
    {
        $historical = CrmApprovalRequest::where('created_at', '>=', now()->subDays(30))
            ->get(['created_at'])
            ->groupBy(fn ($r) => $r->created_at->format('Y-m-d'));

        return $this->forecast($historical, $daysAhead, 'approval');
    }

    private function forecast(Collection $historicalByDate, int $daysAhead, string $type): Collection
    {
        $dailyCounts = collect();
        for ($i = 30; $i >= 1; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dailyCounts->push([
                'date' => $date,
                'count' => $historicalByDate->get($date, collect())->count(),
            ]);
        }

        $dailyAverage = $dailyCounts->avg('count');

        $weeklyAverages = collect();
        for ($w = 0; $w < 4; $w++) {
            $weekStart = now()->subWeeks($w + 1);
            $weekEnd = now()->subWeeks($w);
            $weekDays = $dailyCounts->filter(fn ($d) => $d['date'] >= $weekStart->format('Y-m-d') && $d['date'] < $weekEnd->format('Y-m-d'));
            $weeklyAverages->push($weekDays->avg('count') ?? $dailyAverage);
        }

        if ($weeklyAverages->count() >= 2) {
            $trend = $weeklyAverages->first() > 0
                ? ($weeklyAverages->last() - $weeklyAverages->first()) / $weeklyAverages->first()
                : 0;
        } else {
            $trend = 0;
        }

        $trend = max(-0.5, min(0.5, $trend));

        $projectedBase = $weeklyAverages->last();
        $forecasts = collect();

        $last30Count = $dailyCounts->sum('count');
        $last30Summary = $last30Count > 0
            ? "{$last30Count} {$type}s in the last 30 days"
            : 'No data in the last 30 days';

        for ($day = 1; $day <= $daysAhead; $day++) {
            $date = now()->addDays($day)->format('Y-m-d');
            $projectedCount = max(0, round($projectedBase * (1 + $trend * ($day / 7))));
            $forecasts->push([
                'date' => $date,
                'predictedCount' => $projectedCount,
                'lowerBound' => max(0, (int) round($projectedCount * 0.7)),
                'upperBound' => (int) round($projectedCount * 1.3),
            ]);
        }

        return collect([
            'type' => $type,
            'dailyAverage' => round($dailyAverage, 1),
            'weeklyTrend' => round($trend * 100, 1),
            'trendDirection' => $trend > 0.05 ? 'increasing' : ($trend < -0.05 ? 'decreasing' : 'stable'),
            'last30Summary' => $last30Summary,
            'forecasts' => $forecasts,
        ]);
    }
}
