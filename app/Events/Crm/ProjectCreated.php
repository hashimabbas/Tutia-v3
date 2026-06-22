<?php

namespace App\Events\Crm;

use App\Models\CrmProject;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmProject $project,
        public readonly User $convertedBy,
        public readonly int $milestoneCount,
        public readonly int $deliverableCount,
        public readonly int $stakeholderCount,
        public readonly int $productsMapped,
    ) {}
}
