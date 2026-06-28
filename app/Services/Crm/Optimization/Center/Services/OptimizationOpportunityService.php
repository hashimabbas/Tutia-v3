<?php

namespace App\Services\Crm\Optimization\Center\Services;

use App\Services\Crm\Optimization\Center\DTO\OptimizationOpportunity;

class OptimizationOpportunityService
{
    public function rank(
        array $lifecycleEvents,
        ?array $impactResults = null,
        ?array $automationScore = null,
    ): array {
        $opportunities = [];

        if ($impactResults !== null) {
            foreach ($impactResults as $i => $result) {
                $score = $result['overallScore'] ?? 0;
                $improvements = $result['improvements'] ?? [];

                if ($score < 80 && ! empty($improvements)) {
                    $gain = round((80 - $score) * 0.7, 2);
                    $confidence = round(min(90, 50 + $score * 0.4), 2);

                    $opportunities[] = new OptimizationOpportunity(
                        id: "opportunity_impact_{$i}",
                        title: "Improve impact score from {$score} to 80",
                        priority: $score < 50 ? 'critical' : ($score < 70 ? 'high' : 'medium'),
                        expectedGain: $gain,
                        confidence: $confidence,
                        estimatedEffort: $score < 50 ? 'high' : 'medium',
                        category: 'impact',
                        dependencies: [],
                        recommendationType: 'workflow',
                        targetId: $i + 1,
                    );
                }
            }
        }

        if ($automationScore !== null && isset($automationScore['breakdown'])) {
            foreach ($automationScore['breakdown'] as $component) {
                $label = $component['label'] ?? '';
                $score = $component['score'] ?? 0;
                $weight = $component['weight'] ?? 0;

                if ($score < 70 && $weight > 0) {
                    $gain = round((70 - $score) * $weight, 2);
                    $confidence = round(min(85, 60 + $score * 0.3), 2);

                    $opportunities[] = new OptimizationOpportunity(
                        id: 'opportunity_component_'.str_replace(' ', '_', strtolower($label)),
                        title: "Boost {$label}",
                        priority: $score < 40 ? 'critical' : ($score < 60 ? 'high' : 'medium'),
                        expectedGain: $gain,
                        confidence: $confidence,
                        estimatedEffort: $score < 40 ? 'high' : 'medium',
                        category: 'automation_score',
                        dependencies: [],
                        recommendationType: 'workflow',
                        targetId: 0,
                    );
                }
            }
        }

        if (empty($opportunities)) {
            $opportunities[] = new OptimizationOpportunity(
                id: 'opportunity_none',
                title: 'No current improvement opportunities',
                priority: 'low',
                expectedGain: 0.0,
                confidence: 0.0,
                estimatedEffort: 'low',
                category: 'maintenance',
                dependencies: [],
                recommendationType: 'workflow',
                targetId: 0,
            );
        }

        usort($opportunities, fn (OptimizationOpportunity $a, OptimizationOpportunity $b) => $b->expectedGain <=> $a->expectedGain);

        return $opportunities;
    }
}
