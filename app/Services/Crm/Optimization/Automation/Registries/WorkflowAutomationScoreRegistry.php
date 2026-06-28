<?php

namespace App\Services\Crm\Optimization\Automation\Registries;

use InvalidArgumentException;

class WorkflowAutomationScoreRegistry implements AutomationScoreRegistryInterface
{
    private const array METRICS = [
        'impact_success' => ['weight' => 0.25, 'direction' => 'higher_is_better', 'threshold' => 50, 'label' => 'Impact Success', 'description' => 'Average impact score across all recommendations'],
        'adoption_rate' => ['weight' => 0.20, 'direction' => 'higher_is_better', 'threshold' => 30, 'label' => 'Recommendation Adoption', 'description' => 'Rate of accepted vs viewed recommendations'],
        'verification_rate' => ['weight' => 0.20, 'direction' => 'higher_is_better', 'threshold' => 60, 'label' => 'Verification Rate', 'description' => 'Rate of verified vs applied recommendations'],
        'lifecycle_completion' => ['weight' => 0.15, 'direction' => 'higher_is_better', 'threshold' => 40, 'label' => 'Lifecycle Completion', 'description' => 'Rate of completed lifecycle events'],
        'avg_improvement' => ['weight' => 0.20, 'direction' => 'higher_is_better', 'threshold' => 20, 'label' => 'Average Improvement', 'description' => 'Average metric improvement across recommendations'],
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
