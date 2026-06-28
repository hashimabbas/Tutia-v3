<?php

namespace App\Services\Crm\Optimization\Automation\Services;

use App\Services\Crm\Optimization\Automation\DTO\AutomationScore;
use App\Services\Crm\Optimization\Automation\Registries\AutomationScoreRegistryInterface;

class ScoreExplainabilityService
{
    private ?AutomationScoreRegistryInterface $registry = null;

    public function __construct(?AutomationScoreRegistryInterface $registry = null)
    {
        $this->registry = $registry;
    }

    public function generateSummary(AutomationScore $score): string
    {
        $lines = [];
        $lines[] = "Overall automation score: {$score->overallScore}/100 ({$score->classification}).";

        if (count($score->breakdown) > 0) {
            $lines[] = 'Component breakdown:';
            foreach ($score->breakdown as $component) {
                $status = match (true) {
                    $component->score >= 80 => 'strong',
                    $component->score >= 50 => 'moderate',
                    default => 'needs improvement',
                };
                $lines[] = "- {$component->label}: {$component->score}/100 ({$status})";
            }
        }

        if ($score->trend !== null) {
            $lines[] = "Trend: {$score->trend->direction} by {$score->trend->percentage()}% over {$score->trend->period}.";
        }

        if (count($score->breakdown) > 0) {
            $lowest = $score->breakdown[0];
            foreach ($score->breakdown as $component) {
                if ($component->score < $lowest->score) {
                    $lowest = $component;
                }
            }
            $lines[] = "Primary improvement opportunity: {$lowest->label} ({$lowest->score}/100).";
        }

        return implode("\n", $lines);
    }

    public function generateHumanReadable(AutomationScore $score): string
    {
        return $this->generateSummary($score);
    }
}
