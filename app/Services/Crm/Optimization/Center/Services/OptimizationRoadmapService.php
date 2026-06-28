<?php

namespace App\Services\Crm\Optimization\Center\Services;

use App\Services\Crm\Optimization\Center\DTO\OptimizationOpportunity;
use App\Services\Crm\Optimization\Center\DTO\OptimizationRoadmap;

class OptimizationRoadmapService
{
    public function build(array $opportunities): OptimizationRoadmap
    {
        $sorted = $opportunities;
        usort($sorted, fn (OptimizationOpportunity $a, OptimizationOpportunity $b) => $b->expectedGain <=> $a->expectedGain);

        $phases = [];

        $nowItems = array_slice($sorted, 0, min(2, count($sorted)));
        $nextItems = array_slice($sorted, 2, 2);
        $laterItems = array_slice($sorted, 4);

        if (! empty($nowItems)) {
            $phases[] = [
                'phase' => 'now',
                'title' => 'Now — Immediate Actions',
                'items' => array_map(fn (OptimizationOpportunity $o) => [
                    'opportunity_id' => $o->id,
                    'title' => $o->title,
                    'expected_gain' => $o->expectedGain,
                    'effort' => $o->estimatedEffort,
                    'steps' => ['Apply', 'Verify', 'Measure'],
                ], $nowItems),
            ];
        }

        if (! empty($nextItems)) {
            $phases[] = [
                'phase' => 'next',
                'title' => 'Next — Short Term',
                'items' => array_map(fn (OptimizationOpportunity $o) => [
                    'opportunity_id' => $o->id,
                    'title' => $o->title,
                    'expected_gain' => $o->expectedGain,
                    'effort' => $o->estimatedEffort,
                    'steps' => ['Apply', 'Verify', 'Measure'],
                ], $nextItems),
            ];
        }

        if (! empty($laterItems)) {
            $phases[] = [
                'phase' => 'later',
                'title' => 'Later — Future Opportunities',
                'items' => array_map(fn (OptimizationOpportunity $o) => [
                    'opportunity_id' => $o->id,
                    'title' => $o->title,
                    'expected_gain' => $o->expectedGain,
                    'effort' => $o->estimatedEffort,
                    'steps' => ['Apply', 'Verify', 'Measure'],
                ], $laterItems),
            ];
        }

        return new OptimizationRoadmap(phases: $phases);
    }
}
