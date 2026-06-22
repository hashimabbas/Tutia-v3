<?php

namespace App\Observers;

use App\Models\CrmDeal;
use App\Services\CrmAuditLogService;
use App\Services\CrmNotificationService;

class CrmDealObserver
{
    public function __construct(
        private readonly CrmAuditLogService $audit,
        private readonly CrmNotificationService $notifications,
    ) {}

    public function created(CrmDeal $deal): void
    {
        $this->audit->logCreated($deal);
    }

    public function updated(CrmDeal $deal): void
    {
        $changed = $deal->getDirty();

        if (isset($changed['stage'])) {
            $original = $deal->getOriginal('stage');
            $this->audit->logStageChanged($deal, $original, $changed['stage']);

            if ($deal->owner_id) {
                $owner = $deal->owner;
                if ($owner) {
                    $this->notifications->notifyDealStageChanged($owner, $deal, $original, $changed['stage']);
                }
            }

            if ($changed['stage'] === 'closed_won' && ! $deal->getOriginal('closed_at')) {
                $deal->closed_at = now();
                $deal->probability = 100;
                $deal->saveQuietly();
            }

            if ($changed['stage'] === 'closed_lost' && ! $deal->getOriginal('closed_at')) {
                $deal->closed_at = now();
                $deal->saveQuietly();
            }

            return;
        }

        if (isset($changed['owner_id'])) {
            $this->audit->logAssigned($deal, $deal->getOriginal('owner_id'), $changed['owner_id']);

            return;
        }

        if (! empty($changed)) {
            $oldValues = collect($changed)->keys()->mapWithKeys(fn ($key) => [$key => $deal->getOriginal($key)])->toArray();
            $this->audit->logUpdated($deal, $oldValues);
        }
    }

    public function deleted(CrmDeal $deal): void
    {
        $this->audit->logDeleted($deal);
    }
}
