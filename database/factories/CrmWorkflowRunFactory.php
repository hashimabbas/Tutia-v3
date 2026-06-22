<?php

namespace Database\Factories;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowRun;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmWorkflowRunFactory extends Factory
{
    protected $model = CrmWorkflowRun::class;

    public function definition(): array
    {
        return [
            'workflow_id' => CrmWorkflow::factory(),
            'event_key' => fake()->randomElement([
                'deal.converted', 'project.created', 'milestone.completed',
                'deliverable.completed', 'risk.closed', 'issue.resolved',
                'issue.escalated', 'project.at_risk', 'health.degraded',
                'change_order.approved', 'change_order.rejected',
            ]),
            'entity_type' => fake()->randomElement(['project', 'change_order', 'risk', 'issue']),
            'entity_id' => fake()->numberBetween(1, 1000),
            'status' => fake()->randomElement(['pending', 'running', 'completed', 'failed', 'skipped']),
            'context_snapshot' => ['project_id' => fake()->numberBetween(1, 100)],
            'correlation_id' => fake()->uuid(),
            'started_at' => fake()->dateTimeBetween('-1 day', 'now'),
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'completed_at' => fake()->dateTimeBetween('-1 hour', 'now'),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => 'failed',
            'completed_at' => fake()->dateTimeBetween('-1 hour', 'now'),
        ]);
    }

    public function skipped(): static
    {
        return $this->state(fn () => ['status' => 'skipped']);
    }
}
