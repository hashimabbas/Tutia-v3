<?php

namespace Database\Factories;

use App\Models\CrmPortalAccount;
use App\Models\CrmPortalNotificationPreference;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmPortalNotificationPreferenceFactory extends Factory
{
    protected $model = CrmPortalNotificationPreference::class;

    public function definition(): array
    {
        return [
            'portal_account_id' => CrmPortalAccount::factory(),
            'channel' => 'email',
            'frequency' => 'immediate',
            'event_filters' => null,
        ];
    }

    public function muted(): static
    {
        return $this->state(fn () => ['frequency' => 'muted']);
    }

    public function daily(): static
    {
        return $this->state(fn () => ['frequency' => 'daily']);
    }
}
