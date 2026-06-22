<?php

namespace Database\Factories;

use App\Models\CrmPortalAccount;
use App\Models\CrmPortalToken;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmPortalTokenFactory extends Factory
{
    protected $model = CrmPortalToken::class;

    public function definition(): array
    {
        return [
            'portal_account_id' => CrmPortalAccount::factory(),
            'token_hash' => hash('sha256', fake()->uuid()),
            'type' => 'magic_link',
            'expires_at' => now()->addHours(48),
        ];
    }

    public function used(): static
    {
        return $this->state(fn () => ['used_at' => now()]);
    }

    public function expired(): static
    {
        return $this->state(fn () => ['expires_at' => now()->subHour()]);
    }
}
