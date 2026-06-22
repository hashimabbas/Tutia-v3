<?php

namespace App\Observers;

use App\Models\CrmLead;
use App\Services\CrmAuditLogService;
use App\Services\CrmNotificationService;

class CrmLeadObserver
{
    public function __construct(
        private readonly CrmAuditLogService $audit,
        private readonly CrmNotificationService $notifications,
    ) {}

    public function created(CrmLead $lead): void
    {
        $this->audit->logCreated($lead);

        if ($lead->assigned_to) {
            $assignee = $lead->assignedTo;
            if ($assignee) {
                $this->notifications->notifyLeadAssigned($assignee, $lead);
            }
        }
    }

    public function updated(CrmLead $lead): void
    {
        $changed = $lead->getDirty();

        if (isset($changed['stage'])) {
            $original = $lead->getOriginal('stage');
            $this->audit->logStageChanged($lead, $original, $changed['stage']);

            if ($lead->assigned_to) {
                $assignee = $lead->assignedTo;
                if ($assignee) {
                    $this->notifications->notifyLeadStageChanged($assignee, $lead, $original, $changed['stage']);
                }
            }

            return;
        }

        if (isset($changed['assigned_to'])) {
            $this->audit->logAssigned($lead, $lead->getOriginal('assigned_to'), $changed['assigned_to']);

            if ($changed['assigned_to']) {
                $assignee = $lead->assignedTo;
                if ($assignee) {
                    $this->notifications->notifyLeadAssigned($assignee, $lead);
                }
            }

            return;
        }

        if (! empty($changed)) {
            $oldValues = collect($changed)->keys()->mapWithKeys(fn ($key) => [$key => $lead->getOriginal($key)])->toArray();
            $this->audit->logUpdated($lead, $oldValues);
        }
    }

    public function deleted(CrmLead $lead): void
    {
        $this->audit->logDeleted($lead);
    }
}
