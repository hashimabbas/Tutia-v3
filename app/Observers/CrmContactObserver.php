<?php

namespace App\Observers;

use App\Models\CrmContact;
use App\Services\CrmAuditLogService;

class CrmContactObserver
{
    public function __construct(
        private readonly CrmAuditLogService $audit,
    ) {}

    public function created(CrmContact $contact): void
    {
        $this->audit->logCreated($contact);
    }

    public function updated(CrmContact $contact): void
    {
        $changed = $contact->getDirty();

        if (! empty($changed)) {
            $oldValues = collect($changed)->keys()->mapWithKeys(fn ($key) => [$key => $contact->getOriginal($key)])->toArray();
            $this->audit->logUpdated($contact, $oldValues);
        }
    }

    public function deleted(CrmContact $contact): void
    {
        $this->audit->logDeleted($contact);
    }
}
