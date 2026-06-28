<?php

namespace App\Services\Crm\Optimization\Automation\Services;

use App\Services\Crm\Optimization\Automation\DTO\AutomationScoreSnapshot;

class AutomationInsightService
{
    public function generateTrendInsights(
        AutomationScoreSnapshot $previous,
        AutomationScoreSnapshot $current,
        array $diffs,
    ): array {
        $insights = [];
        $scoreDelta = $current->overallScore - $previous->overallScore;

        if ($scoreDelta > 0) {
            $insights[] = [
                'type' => 'improvement',
                'message' => "Score improved by {$scoreDelta} points since {$previous->date}.",
                'magnitude' => $scoreDelta,
            ];
        } elseif ($scoreDelta < 0) {
            $insights[] = [
                'type' => 'regression',
                'message' => 'Score declined by '.abs($scoreDelta)." points since {$previous->date}.",
                'magnitude' => abs($scoreDelta),
            ];
        } else {
            $insights[] = [
                'type' => 'stable',
                'message' => 'Score remained stable.',
                'magnitude' => 0,
            ];
        }

        $improvedComponents = array_filter($diffs['component_changes'] ?? [], fn ($c) => $c['direction'] === 'improved');
        $declinedComponents = array_filter($diffs['component_changes'] ?? [], fn ($c) => $c['direction'] === 'declined');

        if (! empty($improvedComponents)) {
            $top = $improvedComponents[0];
            $insights[] = [
                'type' => 'driver',
                'message' => "Primary driver: {$top['label']} improved by {$top['delta']} points.",
                'component' => $top['label'],
                'delta' => $top['delta'],
            ];
        }

        if (! empty($declinedComponents)) {
            $top = $declinedComponents[0];
            $insights[] = [
                'type' => 'concern',
                'message' => "Primary concern: {$top['label']} declined by ".abs($top['delta']).' points.',
                'component' => $top['label'],
                'delta' => $top['delta'],
            ];
        }

        if ($current->classification !== $previous->classification) {
            $insights[] = [
                'type' => 'classification_change',
                'message' => "Classification changed from {$previous->classification} to {$current->classification}.",
                'from' => $previous->classification,
                'to' => $current->classification,
            ];
        }

        return $insights;
    }

    public function generateSummary(AutomationScoreSnapshot $current, array $insights): string
    {
        $lines = [];
        $lines[] = "Current score: {$current->overallScore}/100 ({$current->classification}).";

        foreach ($insights as $insight) {
            $lines[] = "- {$insight['message']}";
        }

        return implode("\n", $lines);
    }
}
