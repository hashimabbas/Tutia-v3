<?php

namespace App\Console\Commands;

use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Approvals\Contracts\ApprovalEngineInterface;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('crm:approvals:escalate {--request-id=}')]
#[Description('Escalate pending approval requests (override for specific request)')]
class CrmApprovalsEscalateCommand extends Command
{
    public function handle(ApprovalEngineInterface $approvalEngine): int
    {
        $query = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_PENDING)
            ->whereHas('flow', fn ($q) => $q->where('escalation_model', '!=', 'none'));

        if ($this->option('request-id')) {
            $query->where('id', (int) $this->option('request-id'));
        }

        $count = 0;

        $query->chunk(100, function ($requests) use ($approvalEngine, &$count) {
            foreach ($requests as $request) {
                $approvalEngine->escalateRequest($request);
                $count++;
            }
        });

        $this->info("Escalated {$count} approval request(s).");

        return self::SUCCESS;
    }
}
