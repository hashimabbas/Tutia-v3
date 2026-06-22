<?php

namespace App\Events\Crm;

use App\Models\CrmIssue;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IssueEscalated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmIssue $issue,
        public readonly User $escalatedBy,
        public readonly string $previousSeverity,
    ) {}
}
