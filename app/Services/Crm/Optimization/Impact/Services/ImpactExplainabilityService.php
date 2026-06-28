<?php

namespace App\Services\Crm\Optimization\Impact\Services;

use App\Services\Crm\Optimization\Impact\DTO\ImpactResult;
use App\Services\Crm\Optimization\Impact\Registries\ImpactMetricRegistryInterface;

class ImpactExplainabilityService
{
    private ?ImpactMetricRegistryInterface $registry = null;

    public function __construct(?ImpactMetricRegistryInterface $registry = null)
    {
        $this->registry = $registry;
    }

    public function generateSummary(ImpactResult $result): array
    {
        $lines = [];
        $lines[] = "Overall impact score: {$result->overallScore}/100 ({$result->classification}).";

        $improvements = $result->improvements;
        $regressions = $result->regressions;

        if (count($improvements) > 0) {
            $lines[] = 'Improvements:';
            foreach ($improvements as $metric) {
                $label = $this->registry?->label($metric['metric']) ?? $metric['metric'];
                $lines[] = "- {$label}: {$metric['direction']} by {$metric['delta']} ({$metric['percentage']}%).";
            }
        }

        if (count($regressions) > 0) {
            $lines[] = 'Regressions:';
            foreach ($regressions as $metric) {
                $label = $this->registry?->label($metric['metric']) ?? $metric['metric'];
                $lines[] = "- {$label}: {$metric['direction']} by {$metric['delta']} ({$metric['percentage']}%).";
            }
        }

        if (empty($improvements) && empty($regressions)) {
            $lines[] = 'No significant metric changes detected.';
        }

        return $lines;
    }

    public function generateHumanReadable(ImpactResult $result): string
    {
        return implode("\n", $this->generateSummary($result));
    }
}
