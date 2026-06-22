<?php

namespace App\Services\Crm\NextBestAction\Rules;

use App\Models\CrmContact;
use App\Models\CrmDeal;
use App\Models\CrmOrganization;
use App\Services\Crm\NextBestAction\Contracts\RuleInterface;
use App\Services\Crm\NextBestAction\RecommendedAction;
use Illuminate\Database\Eloquent\Model;

class ActivityStallRule implements RuleInterface
{
    public function supports(Model $entity): bool
    {
        return $entity instanceof CrmOrganization
            || $entity instanceof CrmContact
            || $entity instanceof CrmDeal;
    }

    public function evaluate(Model $entity, int $userId): ?RecommendedAction
    {
        $lastActivity = $entity->activities()->latest('created_at')->first();

        if (! $lastActivity) {
            return null;
        }

        $daysSince = $lastActivity->created_at->diffInDays(now());

        $name = $entity instanceof CrmOrganization ? $entity->name : $entity->getNameAttribute();
        $type = $entity instanceof CrmOrganization ? 'organization' : 'contact';

        $label = $entity instanceof CrmDeal ? $entity->title : $name;

        if ($entity instanceof CrmDeal && $daysSince >= 7) {
            return new RecommendedAction(
                ruleKey: 'activity_stall_deal',
                priority: 'high',
                title: "No activity on {$label} for {$daysSince} days",
                context: "Relationship cooling off — last update was {$daysSince} days ago",
                entityType: 'deal',
                entityId: $entity->id,
                suggestedAction: 'log_activity',
            );
        }

        if ($daysSince >= 14) {
            return new RecommendedAction(
                ruleKey: 'activity_stall',
                priority: 'high',
                title: "No activity with {$name} for {$daysSince} days",
                context: "Stakeholder engagement gap detected — {$daysSince} days since last contact",
                entityType: $type,
                entityId: $entity->id,
                suggestedAction: 'log_activity',
            );
        }

        return null;
    }
}
