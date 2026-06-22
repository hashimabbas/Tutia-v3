<?php

namespace Database\Factories;

use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmProjectRiskFactory extends Factory
{
    protected $model = CrmProjectRisk::class;

    public function definition(): array
    {
        return [
            'description' => fake()->sentence(),
            'severity' => fake()->randomElement(['critical', 'high', 'medium', 'low']),
            'probability' => fake()->randomElement(['high', 'medium', 'low']),
            'status' => 'identified',
            'impact' => fake()->paragraph(),
            'project_id' => CrmProject::factory(),
        ];
    }

    public function identified(): static
    {
        return $this->state(fn () => ['status' => 'identified']);
    }

    public function beingMitigated(): static
    {
        return $this->state(fn () => ['status' => 'being_mitigated']);
    }

    public function closed(): static
    {
        return $this->state(fn () => ['status' => 'closed']);
    }

    public function highSeverity(): static
    {
        return $this->state(fn () => ['severity' => 'high']);
    }

    public function criticalSeverity(): static
    {
        return $this->state(fn () => ['severity' => 'critical']);
    }
}
