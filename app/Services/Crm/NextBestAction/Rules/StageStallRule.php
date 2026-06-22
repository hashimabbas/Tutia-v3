<?php

namespace App\Services\Crm\NextBestAction\Rules;

use App\Models\CrmDeal;
use App\Services\Crm\NextBestAction\Contracts\RuleInterface;
use App\Services\Crm\NextBestAction\RecommendedAction;
use Illuminate\Database\Eloquent\Model;

class StageStallRule implements RuleInterface
{
    public function supports(Model $entity): bool
    {
        return $entity instanceof CrmDeal && ! in_array($entity->stage, ['closed_won', 'closed_lost']);
    }

    public function evaluate(Model $entity, int $userId): ?RecommendedAction
    {
        $lastChange = $entity->auditLogs()
            ->where('event', 'stage_changed')
            ->latest('created_at')
            ->first();

        if (! $lastChange) {
            return null;
        }

        $daysSince = $lastChange->created_at->diffInDays(now());

        if ($daysSince < 14) {
            return null;
        }

        return new RecommendedAction(
            ruleKey: 'stage_stall',
            priority: 'high',
            title: "Move {$entity->title} forward",
            context: "Stage unchanged for {$daysSince} days. Try scheduling a meeting or sending a proposal.",
            entityType: 'deal',
            entityId: $entity->id,
            suggestedAction: 'change_stage',
        );
    }
}
