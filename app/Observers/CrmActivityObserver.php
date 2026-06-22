<?php

namespace App\Observers;

use App\Models\CrmActivity;
use App\Services\CrmAuditLogService;

class CrmActivityObserver
{
    public function __construct(
        private readonly CrmAuditLogService $audit,
    ) {}

    public function created(CrmActivity $activity): void
    {
        $this->audit->logCreated($activity);
    }

    public function updated(CrmActivity $activity): void
    {
        $changed = $activity->getDirty();

        if (isset($changed['completed_at']) && $changed['completed_at'] !== null) {
            $this->audit->log($activity, 'completed', null, ['completed_at' => $changed['completed_at']]);

            return;
        }

        if (! empty($changed)) {
            $oldValues = collect($changed)->keys()->mapWithKeys(fn ($key) => [$key => $activity->getOriginal($key)])->toArray();
            $this->audit->logUpdated($activity, $oldValues);
        }
    }

    public function deleted(CrmActivity $activity): void
    {
        $this->audit->logDeleted($activity);
    }
}
