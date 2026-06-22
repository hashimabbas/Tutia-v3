<?php

namespace Database\Factories;

use App\Models\CrmPortalAccount;
use App\Models\CrmPortalNotification;
use App\Models\CrmProject;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmPortalNotificationFactory extends Factory
{
    protected $model = CrmPortalNotification::class;

    public function definition(): array
    {
        return [
            'portal_account_id' => CrmPortalAccount::factory(),
            'type' => 'milestone_completed',
            'title' => fake()->sentence(),
            'body' => fake()->paragraph(),
            'notifiable_type' => (new CrmProject)->getMorphClass(),
            'notifiable_id' => CrmProject::factory(),
            'idempotency_key' => fake()->uuid(),
        ];
    }

    public function read(): static
    {
        return $this->state(fn () => ['read_at' => now()]);
    }
}
