<?php

namespace App\Events\Crm;

use App\Models\CrmChangeOrder;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChangeOrderApproved
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmChangeOrder $changeOrder,
        public readonly User $approvedBy,
    ) {}
}
