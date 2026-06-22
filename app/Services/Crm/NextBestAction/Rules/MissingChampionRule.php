<?php

namespace App\Services\Crm\NextBestAction\Rules;

use App\Models\CrmDeal;
use App\Models\CrmOrganization;
use App\Services\Crm\NextBestAction\Contracts\RuleInterface;
use App\Services\Crm\NextBestAction\RecommendedAction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;

class MissingChampionRule implements RuleInterface
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

        $hasChampion = $contacts instanceof Relation
            ? $contacts->whereHas('influenceType', fn ($q) => $q->where('slug', 'champion'))->exists()
            : false;

        if ($hasChampion) {
            return null;
        }

        if ($entity instanceof CrmOrganization && $entity->contacts()->count() === 0) {
            return null;
        }

        $name = $entity instanceof CrmOrganization ? $entity->name : $entity->title;

        return new RecommendedAction(
            ruleKey: 'missing_champion',
            priority: 'medium',
            title: "Find a champion for {$name}",
            context: 'Deals with a champion are 3x more likely to close',
            entityType: $entity instanceof CrmOrganization ? 'organization' : 'deal',
            entityId: $entity->id,
            suggestedAction: 'identify_champion',
        );
    }
}
