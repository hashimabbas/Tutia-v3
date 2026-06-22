<?php

namespace App\Services\Crm\Forecast;

use App\Models\CrmDeal;
use App\Services\Crm\Health\CrmHealthService;
use App\Services\Crm\Stakeholder\StakeholderCoverageService;

class ForecastConfidenceService
{
    public function __construct(
        private readonly CrmHealthService $healthService,
        private readonly StakeholderCoverageService $stakeholderService,
    ) {}

    private const STAGE_WEIGHTS = [
        'qualification' => 10,
        'meeting' => 20,
        'proposal' => 40,
        'negotiation' => 70,
        'closed_won' => 100,
        'closed_lost' => 0,
    ];

    public function calculate(CrmDeal $deal): ForecastConfidenceResult
    {
        $factors = [];
        $totalWeight = 0;
        $weightedSum = 0;

        // 1. Deal stage probability (30%)
        $stageWeight = 30;
        $stageScore = self::STAGE_WEIGHTS[$deal->stage] ?? 10;
        $weightedSum += $stageWeight * $stageScore;
        $totalWeight += $stageWeight;
        $factors[] = ['name' => 'Deal stage', 'weight' => $stageWeight, 'score' => $stageScore];

        // 2. Health score (25%)
        $healthResult = $this->healthService->calculate($deal);
        $healthWeight = 25;
        $healthScore = $healthResult->score;
        $weightedSum += $healthWeight * $healthScore;
        $totalWeight += $healthWeight;
        $factors[] = ['name' => 'Health score', 'weight' => $healthWeight, 'score' => $healthScore];

        // 3. Activity recency (15%)
        $activityWeight = 15;
        $lastActivity = $deal->activities()->latest('created_at')->first();
        if ($lastActivity) {
            $daysSince = $lastActivity->created_at->diffInDays(now());
            $activityScore = match (true) {
                $daysSince <= 3 => 100,
                $daysSince <= 7 => 80,
                $daysSince <= 14 => 50,
                $daysSince <= 30 => 20,
                default => 0,
            };
        } else {
            $activityScore = 0;
        }
        $weightedSum += $activityWeight * $activityScore;
        $totalWeight += $activityWeight;
        $factors[] = ['name' => 'Recent activity', 'weight' => $activityWeight, 'score' => $activityScore];

        // 4. Stakeholder coverage (20%)
        $coverageResult = $this->stakeholderService->calculateForDeal($deal);
        $coverageWeight = 20;
        $coverageScore = $coverageResult->score;
        $weightedSum += $coverageWeight * $coverageScore;
        $totalWeight += $coverageWeight;
        $factors[] = ['name' => 'Stakeholder coverage', 'weight' => $coverageWeight, 'score' => $coverageScore];

        // 5. Stage stall penalty (10%)
        $stallWeight = 10;
        $lastChange = $deal->auditLogs()
            ->where('event', 'stage_changed')
            ->latest('created_at')
            ->first();
        if ($lastChange) {
            $daysStalled = $lastChange->created_at->diffInDays(now());
            $stallScore = match (true) {
                $daysStalled <= 7 => 100,
                $daysStalled <= 14 => 70,
                $daysStalled <= 30 => 30,
                default => 0,
            };
        } else {
            $stallScore = 50;
        }
        $weightedSum += $stallWeight * $stallScore;
        $totalWeight += $stallWeight;
        $factors[] = ['name' => 'Stage progression', 'weight' => $stallWeight, 'score' => $stallScore];

        $confidence = $totalWeight > 0 ? (int) round($weightedSum / $totalWeight) : 0;

        $suggestedCategory = match (true) {
            $confidence >= 80 => 'commit',
            $confidence >= 50 => 'best_case',
            default => 'pipeline',
        };

        $mismatch = $deal->forecast_category
            && $deal->forecast_category !== $suggestedCategory
            && abs($confidence - $this->categoryConfidence($deal->forecast_category)) > 20;

        return new ForecastConfidenceResult(
            confidence: $confidence,
            suggestedCategory: $suggestedCategory,
            mismatch: $mismatch,
            factors: $factors,
        );
    }

    private function categoryConfidence(string $category): int
    {
        return match ($category) {
            'commit' => 90,
            'best_case' => 65,
            'pipeline' => 30,
            default => 50,
        };
    }
}
