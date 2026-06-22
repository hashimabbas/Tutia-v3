<?php

namespace App\Events\Crm;

use App\Models\CrmApprovalRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ApprovalEscalated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmApprovalRequest $request,
    ) {}
}
