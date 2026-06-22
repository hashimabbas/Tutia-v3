<?php

namespace App\Services\Crm\NextBestAction\Rules;

use App\Models\CrmOrganization;
use App\Services\Crm\NextBestAction\Contracts\RuleInterface;
use App\Services\Crm\NextBestAction\RecommendedAction;
use Illuminate\Database\Eloquent\Model;

class MissingDecisionMakerRule implements RuleInterface
{
    public function supports(Model $entity): bool
    {
        return $entity instanceof CrmOrganization && $entity->contacts()->count() > 0;
    }

    public function evaluate(Model $entity, int $userId): ?RecommendedAction
    {
        $hasDM = $entity->contacts()->whereHas('influenceType', fn ($q) => $q->where('slug', 'decision_maker'))->exists();

        if ($hasDM) {
            return null;
        }

        return new RecommendedAction(
            ruleKey: 'missing_decision_maker',
            priority: 'medium',
            title: "Identify the decision maker at {$entity->name}",
            context: 'Knowing who decides is critical for deal progression',
            entityType: 'organization',
            entityId: $entity->id,
            suggestedAction: 'identify_decision_maker',
        );
    }
}
