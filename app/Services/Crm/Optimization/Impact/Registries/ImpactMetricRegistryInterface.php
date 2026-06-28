<?php

namespace App\Services\Crm\Optimization\Impact\Registries;

interface ImpactMetricRegistryInterface
{
    public function metrics(): array;

    public function weight(string $metric): float;

    public function direction(string $metric): string;

    public function label(string $metric): string;

    public function supports(string $metric): bool;
}
