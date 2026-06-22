<?php

namespace Database\Factories;

use App\Models\CrmLead;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmLeadFactory extends Factory
{
    protected $model = CrmLead::class;

    public function definition(): array
    {
        return [
            'source' => fake()->randomElement(['consultation', 'proposal', 'quote', 'contact', 'seller_registration', 'newsletter']),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'company' => fake()->company(),
            'service' => fake()->randomElement(['ecommerce', 'payment-gateway', 'bulk-sms', 'erp', 'ticketing', 'call-center', 'web-development', 'mobile-apps', 'connectivity', 'vpn', 'consulting']),
            'message' => fake()->sentence(),
            'stage' => fake()->randomElement(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost']),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
        ];
    }

    public function asNew(): static
    {
        return $this->state(fn () => ['stage' => 'new', 'priority' => 'medium']);
    }

    public function converted(): static
    {
        return $this->state(fn () => [
            'stage' => 'converted',
            'priority' => 'high',
            'converted_at' => now(),
        ]);
    }

    public function assigned(int $userId): static
    {
        return $this->state(fn () => ['assigned_to' => $userId]);
    }
}
