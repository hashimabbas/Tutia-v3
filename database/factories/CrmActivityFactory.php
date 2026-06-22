<?php

namespace Database\Factories;

use App\Models\CrmActivity;
use App\Models\CrmDeal;
use App\Models\CrmLead;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmActivityFactory extends Factory
{
    protected $model = CrmActivity::class;

    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['note', 'call', 'email', 'meeting', 'task']),
            'subject' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'created_by' => null,
        ];
    }

    public function forLead(int $leadId): static
    {
        return $this->state(fn () => [
            'activitable_type' => (new CrmLead)->getMorphClass(),
            'activitable_id' => $leadId,
        ]);
    }

    public function forDeal(int $dealId): static
    {
        return $this->state(fn () => [
            'activitable_type' => (new CrmDeal)->getMorphClass(),
            'activitable_id' => $dealId,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn () => ['completed_at' => now()]);
    }
}
