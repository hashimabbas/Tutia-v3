<?php

namespace App\Services\Crm\Health;

use Illuminate\Database\Eloquent\Model;

interface HealthScorerInterface
{
    public function calculate(Model $entity): HealthResult;
}
