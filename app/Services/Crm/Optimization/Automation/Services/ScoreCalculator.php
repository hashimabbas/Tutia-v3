<?php

namespace App\Services\Crm\Optimization\Automation\Services;

use App\Services\Crm\Optimization\Automation\Registries\AutomationScoreRegistryInterface;

class ScoreCalculator
{
    public function calculate(array $componentScores, AutomationScoreRegistryInterface $registry): float
    {
        if (empty($componentScores)) {
            return 0.0;
        }

        $totalWeight = 0.0;
        $weightedSum = 0.0;

        foreach ($componentScores as $metric => $score) {
            if (! $registry->supports($metric)) {
                continue;
            }

            $weight = $registry->weight($metric);
            $normalized = max(0, min(100, $score));

            $weightedSum += $normalized * $weight;
            $totalWeight += $weight;
        }

        if ($totalWeight === 0.0) {
            return 0.0;
        }

        return round($weightedSum / $totalWeight, 2);
    }
}
