<?php

namespace Database\Factories;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowCondition;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmWorkflowConditionFactory extends Factory
{
    protected $model = CrmWorkflowCondition::class;

    public function definition(): array
    {
        return [
            'workflow_id' => CrmWorkflow::factory(),
            'field' => fake()->randomElement(['severity', 'status', 'priority', 'health_score']),
            'operator' => fake()->randomElement(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains']),
            'value' => fake()->randomElement(['blocker', 'critical', 'closed', 'escalated', '50']),
            'group_order' => 0,
        ];
    }

    public function forGroup(int $groupOrder): static
    {
        return $this->state(fn () => ['group_order' => $groupOrder]);
    }

    public function withOperator(string $operator, string $value): static
    {
        return $this->state(fn () => ['operator' => $operator, 'value' => $value]);
    }
}
