<?php

namespace App\Services\Crm\Optimization\Center\DTO;

use JsonSerializable;

readonly class OptimizationCenter implements JsonSerializable
{
    public function __construct(
        public OptimizationDashboard $dashboard,
        public array $opportunities,
        public OptimizationRoadmap $roadmap,
        public OptimizationHealth $health,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'dashboard' => $this->dashboard->jsonSerialize(),
            'opportunities' => array_map(fn (OptimizationOpportunity $o) => $o->jsonSerialize(), $this->opportunities),
            'roadmap' => $this->roadmap->jsonSerialize(),
            'health' => $this->health->jsonSerialize(),
        ];
    }
}
