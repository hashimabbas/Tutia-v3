<?php

namespace Database\Factories;

use App\Models\CrmIssue;
use App\Models\CrmProject;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmIssueFactory extends Factory
{
    protected $model = CrmIssue::class;

    public function definition(): array
    {
        return [
            'description' => fake()->sentence(),
            'severity' => fake()->randomElement(['blocker', 'critical', 'major', 'minor']),
            'status' => 'open',
            'project_id' => CrmProject::factory(),
        ];
    }

    public function blocker(): static
    {
        return $this->state(fn () => ['severity' => 'blocker']);
    }

    public function open(): static
    {
        return $this->state(fn () => ['status' => 'open']);
    }

    public function inProgress(): static
    {
        return $this->state(fn () => ['status' => 'in_progress']);
    }

    public function resolved(): static
    {
        return $this->state(fn () => [
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn () => ['status' => 'closed']);
    }
}
