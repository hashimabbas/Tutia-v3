<?php

namespace App\Services\Crm\Optimization\Automation\Registries;

interface AutomationScoreRegistryInterface
{
    public function metrics(): array;

    public function weight(string $metric): float;

    public function direction(string $metric): string;

    public function label(string $metric): string;

    public function threshold(string $metric): float;

    public function description(string $metric): string;

    public function supports(string $metric): bool;
}
