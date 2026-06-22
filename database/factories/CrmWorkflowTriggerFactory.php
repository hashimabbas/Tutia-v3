<?php

namespace Database\Factories;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowTrigger;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmWorkflowTriggerFactory extends Factory
{
    protected $model = CrmWorkflowTrigger::class;

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
        ];
    }

    public function forEvent(string $eventKey): static
    {
        return $this->state(fn () => ['event_key' => $eventKey]);
    }
}
