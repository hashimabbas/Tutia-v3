<?php

namespace App\Services\Crm\Optimization\Impact\Services;

class ImpactClassificationService
{
    public function classify(float $overallScore): string
    {
        return match (true) {
            $overallScore >= 80 => 'excellent',
            $overallScore >= 50 => 'good',
            $overallScore >= 20 => 'neutral',
            $overallScore >= 1 => 'negative',
            default => 'critical',
        };
    }

    public function classifyDelta(float $delta, string $direction): string
    {
        $normalized = $direction === 'lower_is_better' ? -$delta : $delta;

        return match (true) {
            $normalized > 0.2 => 'significant_improvement',
            $normalized > 0.05 => 'moderate_improvement',
            $normalized >= -0.05 => 'stable',
            $normalized >= -0.2 => 'moderate_regression',
            default => 'significant_regression',
        };
    }
}
