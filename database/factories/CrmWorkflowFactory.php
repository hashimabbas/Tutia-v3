<?php

namespace Database\Factories;

use App\Models\CrmWorkflow;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CrmWorkflowFactory extends Factory
{
    protected $model = CrmWorkflow::class;

    public function definition(): array
    {
        $name = fake()->sentence(3);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'entity_type' => fake()->randomElement(['project', 'change_order', 'risk', 'issue', 'deal']),
            'is_active' => true,
            'version' => 1,
            'created_by' => User::factory(),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function forEntity(string $entityType): static
    {
        return $this->state(fn () => ['entity_type' => $entityType]);
    }
}
