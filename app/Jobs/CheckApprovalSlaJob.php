<?php

namespace App\Jobs;

use App\Models\CrmApprovalRequest;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Approvals\Contracts\ApprovalEngineInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckApprovalSlaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public string $queue = 'crm-workflows';

    public function __construct(
        public readonly ?int $requestId = null,
    ) {}

    public function handle(ApprovalEngineInterface $approvalEngine): void
    {
        $query = CrmApprovalRequest::where('status', ApprovalStatusCatalog::REQUEST_PENDING)
            ->whereHas('flow', fn ($q) => $q->whereNotNull('sla_breach_minutes'));

        if ($this->requestId !== null) {
            $query->where('id', $this->requestId);
        }

        $query->chunk(100, function ($requests) use ($approvalEngine) {
            foreach ($requests as $request) {
                $approvalEngine->checkSla($request);
            }
        });
    }
}
