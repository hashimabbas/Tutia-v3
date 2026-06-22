<?php

namespace Database\Factories;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowAction;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmWorkflowActionFactory extends Factory
{
    protected $model = CrmWorkflowAction::class;

    public function definition(): array
    {
        return [
            'workflow_id' => CrmWorkflow::factory(),
            'action_type' => fake()->randomElement([
                'send_email', 'send_whatsapp', 'send_sms', 'send_portal_notification',
                'create_activity', 'create_task', 'assign_user', 'update_field', 'add_tag',
                'escalate_risk', 'escalate_issue', 'request_change_approval',
            ]),
            'configuration_json' => ['template_key' => 'issue.escalated'],
            'sort_order' => 0,
            'stop_on_fail' => false,
        ];
    }

    public function communicationAction(string $channel): static
    {
        return $this->state(fn () => [
            'action_type' => "send_{$channel}",
            'configuration_json' => ['template_key' => 'issue.escalated'],
        ]);
    }

    public function atOrder(int $order): static
    {
        return $this->state(fn () => ['sort_order' => $order]);
    }
}
