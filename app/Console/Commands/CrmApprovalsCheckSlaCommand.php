<?php

namespace App\Console\Commands;

use App\Jobs\CheckApprovalSlaJob;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('crm:approvals:check-sla {--request-id=}')]
#[Description('Check pending approval requests for SLA warnings and breaches')]
class CrmApprovalsCheckSlaCommand extends Command
{
    public function handle(): int
    {
        $requestId = $this->option('request-id')
            ? (int) $this->option('request-id')
            : null;

        CheckApprovalSlaJob::dispatch($requestId);

        $this->info('SLA check job dispatched successfully.');

        return self::SUCCESS;
    }
}
