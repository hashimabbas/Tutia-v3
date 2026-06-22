<?php

namespace Database\Factories;

use App\Models\CrmPortalAccount;
use App\Models\CrmPortalSession;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmPortalSessionFactory extends Factory
{
    protected $model = CrmPortalSession::class;

    public function definition(): array
    {
        return [
            'portal_account_id' => CrmPortalAccount::factory(),
            'token_hash' => hash('sha256', fake()->uuid()),
            'expires_at' => now()->addDays(30),
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn () => [
            'revoked_at' => now(),
            'revoked_reason' => 'logout',
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn () => ['expires_at' => now()->subDay()]);
    }
}
