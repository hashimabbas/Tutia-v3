<?php

namespace App\Events\Crm;

use App\Models\CrmChangeOrder;
use App\Models\CrmPortalAccount;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChangeOrderRejected
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmChangeOrder $changeOrder,
        public readonly CrmPortalAccount $rejectedBy,
        public readonly string $reason,
    ) {}
}
