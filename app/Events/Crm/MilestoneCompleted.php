<?php

namespace App\Events\Crm;

use App\Models\CrmMilestone;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MilestoneCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmMilestone $milestone,
        public readonly User $completedBy,
    ) {}
}
