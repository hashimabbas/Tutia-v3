<?php

namespace App\Events\Crm;

use App\Models\CrmProject;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HealthDegraded
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmProject $project,
        public readonly int $healthScore,
        public readonly int $previousScore,
        public readonly int $drop,
    ) {}
}
