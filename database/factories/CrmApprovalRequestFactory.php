<?php

namespace Database\Factories;

use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Models\CrmWorkflowRun;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmApprovalRequestFactory extends Factory
{
    protected $model = CrmApprovalRequest::class;

    public function definition(): array
    {
        return [
            'approval_flow_id' => CrmApprovalFlow::factory(),
            'workflow_run_id' => CrmWorkflowRun::factory(),
            'entity_type' => 'change_order',
            'entity_id' => fake()->numberBetween(1, 1000),
            'status' => 'pending',
            'requested_by' => User::factory(),
            'requested_at' => now(),
            'sla_warning_sent_at' => null,
            'sla_breach_at' => null,
            'escalated_at' => null,
            'completed_at' => null,
            'notes' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => 'approved',
            'completed_at' => now(),
            'first_response_at' => $attrs['first_response_at'] ?? now(),
            'approved_at' => now(),
            'resolution_time_minutes' => $attrs['requested_at']?->diffInMinutes(now(), true) ?? 0,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => 'rejected',
            'completed_at' => now(),
            'first_response_at' => $attrs['first_response_at'] ?? now(),
            'rejected_at' => now(),
            'resolution_time_minutes' => $attrs['requested_at']?->diffInMinutes(now(), true) ?? 0,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => 'expired',
            'resolution_time_minutes' => $attrs['requested_at']?->diffInMinutes(now(), true) ?? 0,
        ]);
    }

    public function escalated(): static
    {
        return $this->state(fn () => [
            'status' => 'escalated',
            'escalated_at' => now(),
            'escalation_count' => 1,
        ]);
    }

    public function firstResponseAt(string $timestamp): static
    {
        return $this->state(fn () => [
            'first_response_at' => $timestamp,
        ]);
    }
}
