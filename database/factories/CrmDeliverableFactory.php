<?php

namespace Database\Factories;

use App\Models\CrmDeliverable;
use App\Models\CrmMilestone;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmDeliverableFactory extends Factory
{
    protected $model = CrmDeliverable::class;

    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'status' => 'pending',
            'sort_order' => fake()->numberBetween(1, 20),
            'is_visible_to_customer' => true,
            'milestone_id' => CrmMilestone::factory(),
            'owner_id' => User::factory(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending']);
    }

    public function completed(): static
    {
        return $this->state(fn () => ['status' => 'completed']);
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => 'approved',
            'customer_approved_at' => now(),
        ]);
    }
}
