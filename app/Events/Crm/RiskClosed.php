<?php

namespace App\Events\Crm;

use App\Models\CrmProjectRisk;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RiskClosed
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmProjectRisk $risk,
        public readonly User $closedBy,
    ) {}
}
