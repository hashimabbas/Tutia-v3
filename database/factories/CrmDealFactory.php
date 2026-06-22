<?php

namespace Database\Factories;

use App\Models\CrmDeal;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmDealFactory extends Factory
{
    protected $model = CrmDeal::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'value' => fake()->randomFloat(2, 1000, 100000),
            'currency' => 'SDG',
            'stage' => fake()->randomElement(['qualification', 'meeting', 'proposal', 'negotiation']),
            'probability' => fake()->numberBetween(10, 90),
            'company' => fake()->company(),
            'contact_name' => fake()->name(),
            'contact_email' => fake()->safeEmail(),
            'contact_phone' => fake()->phoneNumber(),
            'expected_close_date' => fake()->dateTimeBetween('now', '+6 months'),
        ];
    }

    public function won(): static
    {
        return $this->state(fn () => [
            'stage' => 'closed_won',
            'probability' => 100,
            'closed_at' => now(),
        ]);
    }

    public function lost(): static
    {
        return $this->state(fn () => [
            'stage' => 'closed_lost',
            'probability' => 0,
            'closed_at' => now(),
            'lost_reason' => fake()->randomElement(['budget', 'timeline', 'competitor', 'other']),
        ]);
    }

    public function ownedBy(int $userId): static
    {
        return $this->state(fn () => ['owner_id' => $userId]);
    }
}
