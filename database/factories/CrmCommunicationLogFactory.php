<?php

namespace Database\Factories;

use App\Models\CrmCommunicationLog;
use App\Models\CrmPortalAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmCommunicationLogFactory extends Factory
{
    protected $model = CrmCommunicationLog::class;

    public function definition(): array
    {
        return [
            'portal_account_id' => CrmPortalAccount::factory(),
            'correlation_id' => fake()->uuid(),
            'event_id' => null,
            'channel' => 'email',
            'template' => 'milestone_completed',
            'status' => 'sent',
        ];
    }

    public function delivered(): static
    {
        return $this->state(fn () => [
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => 'failed',
            'error_message' => fake()->sentence(),
        ]);
    }
}
