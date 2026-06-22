<?php

namespace App\Events\Crm;

use App\Models\CrmApprovalRequest;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ApprovalRequested
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmApprovalRequest $request,
        public readonly User $requestedBy,
    ) {}
}
