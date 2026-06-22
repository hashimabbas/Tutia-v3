<?php

namespace App\Events\Crm;

use App\Models\CrmDeal;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DealConvertedToProject
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CrmDeal $deal,
        public readonly int $projectId,
        public readonly User $convertedBy,
        public readonly ?int $templateId,
    ) {}
}
