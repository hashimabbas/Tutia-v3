<?php

namespace App\Services\Crm\Projects\Health;

use App\Models\CrmProject;

interface DeliveryHealthScorerInterface
{
    public function calculate(CrmProject $project): DeliveryHealthResult;
}
