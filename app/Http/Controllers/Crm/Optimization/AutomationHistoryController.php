<?php

namespace App\Http\Controllers\Crm\Optimization;

use App\Http\Controllers\Controller;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreBreakdown;
use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreSnapshot;
use App\Services\Crm\Optimization\Automation\DTO\ScoreHistory;
use App\Services\Crm\Optimization\Automation\DTO\ScoreTrend;
use App\Services\Crm\Optimization\Automation\Services\AutomationHistoryService;
use App\Services\Crm\Optimization\Automation\Services\AutomationInsightService;
use App\Services\Crm\Optimization\Automation\Services\AutomationTrendService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationHistoryController extends Controller
{
    private const array SAMPLE_SNAPSHOTS = [
        ['date' => '2026-05-28', 'score' => 74.0, 'class' => 'good', 'breakdown' => ['Impact Success' => 65, 'Recommendation Adoption' => 55, 'Verification Rate' => 70, 'Lifecycle Completion' => 50, 'Average Improvement' => 60]],
        ['date' => '2026-06-04', 'score' => 78.5, 'class' => 'good', 'breakdown' => ['Impact Success' => 68, 'Recommendation Adoption' => 58, 'Verification Rate' => 72, 'Lifecycle Completion' => 55, 'Average Improvement' => 62]],
        ['date' => '2026-06-11', 'score' => 82.0, 'class' => 'excellent', 'breakdown' => ['Impact Success' => 72, 'Recommendation Adoption' => 60, 'Verification Rate' => 75, 'Lifecycle Completion' => 60, 'Average Improvement' => 65]],
        ['date' => '2026-06-18', 'score' => 79.0, 'class' => 'good', 'breakdown' => ['Impact Success' => 70, 'Recommendation Adoption' => 62, 'Verification Rate' => 68, 'Lifecycle Completion' => 58, 'Average Improvement' => 63]],
        ['date' => '2026-06-25', 'score' => 86.5, 'class' => 'excellent', 'breakdown' => ['Impact Success' => 75, 'Recommendation Adoption' => 68, 'Verification Rate' => 78, 'Lifecycle Completion' => 65, 'Average Improvement' => 70]],
    ];

    public function history(Request $request): JsonResponse
    {
        $snapshots = $this->buildSampleSnapshots();
        $trend = new ScoreTrend(direction: 'up', magnitude: 0.17, period: '30d');
        $historyService = new AutomationHistoryService;

        $regressions = $historyService->detectRegressions($snapshots);
        $milestones = $historyService->milestones($snapshots);

        $history = new ScoreHistory(
            snapshots: $snapshots,
            trend: $trend,
            regressionEvents: $regressions,
            milestones: $milestones,
        );

        return response()->json($history->jsonSerialize());
    }

    public function timeline(Request $request): JsonResponse
    {
        $snapshots = $this->buildSampleSnapshots();
        $historyService = new AutomationHistoryService;

        return response()->json([
            'timeline' => $historyService->timeline($snapshots),
        ]);
    }

    public function trends(Request $request): JsonResponse
    {
        $snapshots = $this->buildSampleSnapshots();
        $trendService = new AutomationTrendService;

        return response()->json([
            'daily' => $trendService->daily($snapshots),
            'weekly' => $trendService->weekly($snapshots),
            'monthly' => $trendService->monthly($snapshots),
            'rolling_7day' => $trendService->rollingAverage($snapshots, 7),
        ]);
    }

    public function insights(Request $request): JsonResponse
    {
        $snapshots = $this->buildSampleSnapshots();
        $historyService = new AutomationHistoryService;
        $insightService = new AutomationInsightService;

        $insights = [];

        for ($i = 1; $i < count($snapshots); $i++) {
            $diff = $historyService->diff($snapshots[$i - 1], $snapshots[$i]);
            $periodInsights = $insightService->generateTrendInsights(
                $snapshots[$i - 1],
                $snapshots[$i],
                $diff,
            );
            $insights[] = [
                'period' => ['from' => $snapshots[$i - 1]->date, 'to' => $snapshots[$i]->date],
                'insights' => $periodInsights,
            ];
        }

        return response()->json(['periods' => $insights]);
    }

    private function buildSampleSnapshots(): array
    {
        $snapshots = [];

        foreach (self::SAMPLE_SNAPSHOTS as $data) {
            $breakdown = [];

            foreach ($data['breakdown'] as $label => $score) {
                $breakdown[] = new AutomationScoreBreakdown(
                    label: $label,
                    score: $score,
                    weight: 0.20,
                    description: '',
                );
            }

            $snapshots[] = new AutomationScoreSnapshot(
                date: $data['date'],
                overallScore: $data['score'],
                classification: $data['class'],
                breakdown: $breakdown,
            );
        }

        return $snapshots;
    }
}
