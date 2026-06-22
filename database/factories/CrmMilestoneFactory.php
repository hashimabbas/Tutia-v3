<?php

namespace Database\Factories;

use App\Models\CrmMilestone;
use App\Models\CrmProject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmMilestoneFactory extends Factory
{
    protected $model = CrmMilestone::class;

    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'status' => 'pending',
            'sort_order' => fake()->numberBetween(1, 20),
            'project_id' => CrmProject::factory(),
            'owner_id' => User::factory(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending']);
    }

    public function inProgress(): static
    {
        return $this->state(fn () => ['status' => 'in_progress']);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'actual_end_date' => now(),
        ]);
    }
}
