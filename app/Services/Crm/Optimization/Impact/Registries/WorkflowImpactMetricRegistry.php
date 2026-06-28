<?php

namespace App\Services\Crm\Optimization\Impact\Registries;

use InvalidArgumentException;

class WorkflowImpactMetricRegistry implements ImpactMetricRegistryInterface
{
    private const array METRICS = [
        'failure_rate' => ['weight' => 0.35, 'direction' => 'lower_is_better', 'label' => 'Failure Rate'],
        'avg_retries' => ['weight' => 0.15, 'direction' => 'lower_is_better', 'label' => 'Avg Retries'],
        'sla_breach_rate' => ['weight' => 0.25, 'direction' => 'lower_is_better', 'label' => 'SLA Breach Rate'],
        'human_intervention' => ['weight' => 0.10, 'direction' => 'lower_is_better', 'label' => 'Human Intervention'],
        'success_rate' => ['weight' => 0.15, 'direction' => 'higher_is_better', 'label' => 'Success Rate'],
    ];

    public function metrics(): array
    {
        return array_keys(self::METRICS);
    }

    public function weight(string $metric): float
    {
        if (! $this->supports($metric)) {
            throw new InvalidArgumentException("Unknown metric: {$metric}");
        }

        return self::METRICS[$metric]['weight'];
    }

    public function direction(string $metric): string
    {
        if (! $this->supports($metric)) {
            throw new InvalidArgumentException("Unknown metric: {$metric}");
        }

        return self::METRICS[$metric]['direction'];
    }

    public function label(string $metric): string
    {
        if (! $this->supports($metric)) {
            throw new InvalidArgumentException("Unknown metric: {$metric}");
        }

        return self::METRICS[$metric]['label'];
    }

    public function supports(string $metric): bool
    {
        return isset(self::METRICS[$metric]);
    }
}
