<?php

namespace Database\Factories;

use App\Models\CrmApprovalFlow;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmApprovalFlowFactory extends Factory
{
    protected $model = CrmApprovalFlow::class;

    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'strategy' => 'all_must_approve',
            'escalation_model' => 'none',
            'escalation_config' => null,
            'sla_warning_minutes' => null,
            'sla_breach_minutes' => null,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function firstApproverWins(): static
    {
        return $this->state(fn () => ['strategy' => 'first_approver_wins']);
    }

    public function majorityVote(): static
    {
        return $this->state(fn () => ['strategy' => 'majority_vote']);
    }

    public function withSla(int $warningMinutes, int $breachMinutes): static
    {
        return $this->state(fn () => [
            'sla_warning_minutes' => $warningMinutes,
            'sla_breach_minutes' => $breachMinutes,
        ]);
    }

    public function managerEscalation(): static
    {
        return $this->state(fn () => ['escalation_model' => 'manager']);
    }
}
