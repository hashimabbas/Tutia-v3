<?php

namespace App\Services;

use App\Models\CrmNotification;
use App\Models\CrmNotificationPreference;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class CrmNotificationService
{
    public function send(
        User $user,
        string $type,
        string $title,
        ?string $body = null,
        ?string $link = null,
        ?Model $notifiable = null,
    ): ?CrmNotification {
        $preferences = CrmNotificationPreference::where('user_id', $user->id)
            ->where('channel', 'in-app')
            ->where('event', $type)
            ->first();

        if ($preferences && ! $preferences->enabled) {
            return null;
        }

        return CrmNotification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'link' => $link,
            'notifiable_type' => $notifiable?->getMorphClass(),
            'notifiable_id' => $notifiable?->getKey(),
        ]);
    }

    public function notifyLeadAssigned(User $assignee, Model $lead): ?CrmNotification
    {
        return $this->send(
            $assignee,
            'lead.assigned',
            'New lead assigned',
            "Lead {$lead->name} has been assigned to you.",
            "/crm/leads/{$lead->getKey()}",
            $lead,
        );
    }

    public function notifyDealStageChanged(User $owner, Model $deal, string $oldStage, string $newStage): ?CrmNotification
    {
        return $this->send(
            $owner,
            'deal.stage_changed',
            'Deal stage changed',
            "{$deal->title} moved from {$oldStage} to {$newStage}.",
            "/crm/deals/{$deal->getKey()}",
            $deal,
        );
    }

    public function notifyLeadStageChanged(User $assignee, Model $lead, string $oldStage, string $newStage): ?CrmNotification
    {
        return $this->send(
            $assignee,
            'lead.stage_changed',
            'Lead stage changed',
            "{$lead->name} moved from {$oldStage} to {$newStage}.",
            "/crm/leads/{$lead->getKey()}",
            $lead,
        );
    }
}
