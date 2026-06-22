<?php

namespace Database\Factories;

use App\Models\CrmOrganization;
use App\Models\CrmProject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrmProjectFactory extends Factory
{
    protected $model = CrmProject::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company().' Project',
            'status' => 'planned',
            'contract_value' => fake()->randomFloat(2, 10000, 500000),
            'start_date' => fake()->date(),
            'target_end_date' => fake()->date(),
            'organization_id' => CrmOrganization::factory(),
            'created_by' => User::factory(),
        ];
    }
}
