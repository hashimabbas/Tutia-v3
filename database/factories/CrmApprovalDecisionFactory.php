<?php

namespace Database\Factories;

use App\Models\CrmApprovalDecision;
use App\Models\CrmApprovalRequest;
use App\Models\CrmApprovalStep;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmApprovalDecisionFactory extends Factory
{
    protected $model = CrmApprovalDecision::class;

    public function definition(): array
    {
        return [
            'approval_request_id' => CrmApprovalRequest::factory(),
            'approval_step_id' => CrmApprovalStep::factory(),
            'user_id' => User::factory(),
            'decision' => fake()->randomElement(['approved', 'rejected', 'abstained']),
            'comment' => fake()->optional()->sentence(),
            'decided_at' => now(),
        ];
    }

    public function approved(?string $comment = null): static
    {
        return $this->state(fn () => [
            'decision' => 'approved',
            'comment' => $comment ?? fake()->sentence(),
        ]);
    }

    public function rejected(string $comment = 'Not approved at this time'): static
    {
        return $this->state(fn () => [
            'decision' => 'rejected',
            'comment' => $comment,
        ]);
    }

    public function abstained(): static
    {
        return $this->state(fn () => ['decision' => 'abstained']);
    }
}
