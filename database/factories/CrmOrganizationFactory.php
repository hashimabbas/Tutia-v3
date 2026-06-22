<?php

namespace Database\Factories;

use App\Models\CrmOrganization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmOrganizationFactory extends Factory
{
    protected $model = CrmOrganization::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'created_by' => User::factory(),
        ];
    }
}
