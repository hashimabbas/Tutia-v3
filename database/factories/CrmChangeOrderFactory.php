<?php

namespace Database\Factories;

use App\Models\CrmChangeOrder;
use App\Models\CrmProject;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmChangeOrderFactory extends Factory
{
    protected $model = CrmChangeOrder::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'status' => 'identified',
            'cost_impact' => fake()->randomFloat(2, 1000, 50000),
            'timeline_impact_days' => fake()->numberBetween(1, 30),
            'project_id' => CrmProject::factory(),
        ];
    }

    public function identified(): static
    {
        return $this->state(fn () => ['status' => 'identified']);
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => 'approved']);
    }

    public function rejected(): static
    {
        return $this->state(fn () => ['status' => 'rejected']);
    }
}
