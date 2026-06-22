<?php

namespace Database\Factories;

use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowRun;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmWorkflowActionRunFactory extends Factory
{
    protected $model = CrmWorkflowActionRun::class;

    public function definition(): array
    {
        return [
            'workflow_run_id' => CrmWorkflowRun::factory(),
            'action_type' => fake()->randomElement([
                'send_email', 'send_whatsapp', 'send_sms', 'send_portal_notification',
                'create_activity', 'create_task', 'assign_user', 'update_field',
            ]),
            'status' => fake()->randomElement(['pending', 'running', 'completed', 'failed', 'skipped']),
            'configuration_json' => ['template_key' => 'issue.escalated'],
            'response_json' => null,
            'started_at' => fake()->dateTimeBetween('-1 day', 'now'),
            'completed_at' => null,
            'error_message' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'response_json' => ['correlation_id' => fake()->uuid()],
            'completed_at' => fake()->dateTimeBetween('-1 hour', 'now'),
        ]);
    }

    public function failed(?string $message = null): static
    {
        return $this->state(fn () => [
            'status' => 'failed',
            'completed_at' => fake()->dateTimeBetween('-1 hour', 'now'),
            'error_message' => $message ?? fake()->sentence(),
        ]);
    }
}
