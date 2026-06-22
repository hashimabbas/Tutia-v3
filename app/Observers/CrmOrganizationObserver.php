<?php

namespace App\Observers;

use App\Models\CrmOrganization;
use App\Services\CrmAuditLogService;

class CrmOrganizationObserver
{
    public function __construct(
        private readonly CrmAuditLogService $audit,
    ) {}

    public function created(CrmOrganization $org): void
    {
        $this->audit->logCreated($org);
    }

    public function updated(CrmOrganization $org): void
    {
        $changed = $org->getDirty();

        if (! empty($changed)) {
            $oldValues = collect($changed)->keys()->mapWithKeys(fn ($key) => [$key => $org->getOriginal($key)])->toArray();
            $this->audit->logUpdated($org, $oldValues);
        }
    }

    public function deleted(CrmOrganization $org): void
    {
        $this->audit->logDeleted($org);
    }
}
