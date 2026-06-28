<?php

namespace App\Services\Crm\Optimization\Automation\Registries;

use InvalidArgumentException;

class ApprovalAutomationScoreRegistry implements AutomationScoreRegistryInterface
{
    private const array METRICS = [
        'impact_success' => ['weight' => 0.20, 'direction' => 'higher_is_better', 'threshold' => 50, 'label' => 'Impact Success', 'description' => 'Average impact score across all approval recommendations'],
        'adoption_rate' => ['weight' => 0.20, 'direction' => 'higher_is_better', 'threshold' => 40, 'label' => 'Approval Adoption', 'description' => 'Rate of accepted vs viewed approval recommendations'],
        'verification_rate' => ['weight' => 0.20, 'direction' => 'higher_is_better', 'threshold' => 60, 'label' => 'Verification Rate', 'description' => 'Rate of verified vs applied approval recommendations'],
        'lifecycle_completion' => ['weight' => 0.15, 'direction' => 'higher_is_better', 'threshold' => 40, 'label' => 'Lifecycle Completion', 'description' => 'Rate of completed approval lifecycle events'],
        'cycle_time' => ['weight' => 0.15, 'direction' => 'lower_is_better', 'threshold' => 30, 'label' => 'Cycle Time', 'description' => 'Average time from generated to applied'],
        'sla_compliance' => ['weight' => 0.10, 'direction' => 'higher_is_better', 'threshold' => 70, 'label' => 'SLA Compliance', 'description' => 'Rate of approvals meeting SLA targets'],
    ];

    public function metrics(): array
    {
        return array_keys(self::METRICS);
    }

    public function weight(string $metric): float
    {
        return $this->get($metric)['weight'];
    }

    public function direction(string $metric): string
    {
        return $this->get($metric)['direction'];
    }

    public function label(string $metric): string
    {
        return $this->get($metric)['label'];
    }

    public function threshold(string $metric): float
    {
        return $this->get($metric)['threshold'];
    }

    public function description(string $metric): string
    {
        return $this->get($metric)['description'];
    }

    public function supports(string $metric): bool
    {
        return isset(self::METRICS[$metric]);
    }

    private function get(string $metric): array
    {
        if (! $this->supports($metric)) {
            throw new InvalidArgumentException("Unknown metric: {$metric}");
        }

        return self::METRICS[$metric];
    }
}
