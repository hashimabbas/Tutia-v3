<?php

namespace App\Events\Crm;

use App\Models\CrmDeliverable;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliverableCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmDeliverable $deliverable,
        public readonly User $completedBy,
    ) {}
}
