<?php

namespace App\Services\Crm\Optimization\Center\DTO;

use JsonSerializable;

readonly class OptimizationDashboard implements JsonSerializable
{
    public function __construct(
        public array $overallStats,
        public array $automationScore,
        public array $health,
        public array $trend,
        public array $recentActivity,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'overall_stats' => $this->overallStats,
            'automation_score' => $this->automationScore,
            'health' => $this->health,
            'trend' => $this->trend,
            'recent_activity' => $this->recentActivity,
        ];
    }
}
