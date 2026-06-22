<?php

namespace Database\Factories;

use App\Models\CrmContact;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmContactFactory extends Factory
{
    protected $model = CrmContact::class;

    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'mobile' => fake()->phoneNumber(),
            'job_title' => fake()->jobTitle(),
            'department' => fake()->word(),
            'created_by' => User::factory(),
        ];
    }
}
