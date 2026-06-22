<?php

namespace App\Services\Crm\Projects\Health\Contributors;

use App\Models\CrmProject;

interface ContributorInterface
{
    public function calculate(CrmProject $project): array;
}
