<?php

namespace Database\Factories;

use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalStep;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmApprovalStepFactory extends Factory
{
    protected $model = CrmApprovalStep::class;

    public function definition(): array
    {
        return [
            'approval_flow_id' => CrmApprovalFlow::factory(),
            'step_order' => fake()->numberBetween(1, 5),
            'approver_type' => 'user',
            'approver_id' => User::factory(),
            'required' => true,
        ];
    }

    public function roleStep(string $role, int $roleId): static
    {
        return $this->state(fn () => [
            'approver_type' => 'role',
            'approver_id' => $roleId,
        ]);
    }

    public function managerOfStep(): static
    {
        return $this->state(fn () => ['approver_type' => 'manager_of']);
    }

    public function notRequired(): static
    {
        return $this->state(fn () => ['required' => false]);
    }

    public function atOrder(int $order): static
    {
        return $this->state(fn () => ['step_order' => $order]);
    }
}
