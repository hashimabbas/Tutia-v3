<?php

namespace App\Services\Crm\NextBestAction\Rules;

use App\Models\CrmDeal;
use App\Models\CrmOrganization;
use App\Services\Crm\NextBestAction\Contracts\RuleInterface;
use App\Services\Crm\NextBestAction\RecommendedAction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;

class BlockerDetectedRule implements RuleInterface
{
    public function supports(Model $entity): bool
    {
        return $entity instanceof CrmOrganization || $entity instanceof CrmDeal;
    }

    public function evaluate(Model $entity, int $userId): ?RecommendedAction
    {
        $contacts = $entity instanceof CrmDeal && $entity->organization
            ? $entity->organization->contacts()
            : ($entity instanceof CrmOrganization ? $entity->contacts() : collect());

        $blocker = $contacts instanceof Relation
            ? $contacts->whereHas('influenceType', fn ($q) => $q->where('slug', 'blocker'))->first()
            : null;

        if (! $blocker) {
            return null;
        }

        $name = $entity instanceof CrmOrganization ? $entity->name : $entity->title;

        return new RecommendedAction(
            ruleKey: 'blocker_detected',
            priority: 'medium',
            title: "Address blocker {$blocker->getNameAttribute()} at {$name}",
            context: 'Schedule a meeting with them and the champion to address concerns',
            entityType: $entity instanceof CrmOrganization ? 'organization' : 'deal',
            entityId: $entity->id,
            suggestedAction: 'schedule_meeting',
        );
    }
}
