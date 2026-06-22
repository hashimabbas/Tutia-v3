<?php

namespace Database\Factories;

use App\Models\CrmContact;
use App\Models\CrmPortalAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmPortalAccountFactory extends Factory
{
    protected $model = CrmPortalAccount::class;

    public function definition(): array
    {
        return [
            'contact_id' => CrmContact::factory(),
            'enabled_at' => now(),
            'login_count' => 0,
            'locale' => 'ar',
        ];
    }

    public function disabled(): static
    {
        return $this->state(fn () => [
            'disabled_at' => now(),
            'disabled_reason' => 'Test disable',
        ]);
    }
}
