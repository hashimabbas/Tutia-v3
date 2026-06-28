<?php

namespace App\Services\Crm\Optimization\Impact\Registries;

use InvalidArgumentException;

class ApprovalImpactMetricRegistry implements ImpactMetricRegistryInterface
{
    private const array METRICS = [
        'approval_cycle_time' => ['weight' => 0.35, 'direction' => 'lower_is_better', 'label' => 'Approval Cycle Time'],
        'rejection_rate' => ['weight' => 0.25, 'direction' => 'lower_is_better', 'label' => 'Rejection Rate'],
        'sla_compliance' => ['weight' => 0.25, 'direction' => 'higher_is_better', 'label' => 'SLA Compliance'],
        'escalation_rate' => ['weight' => 0.15, 'direction' => 'lower_is_better', 'label' => 'Escalation Rate'],
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
