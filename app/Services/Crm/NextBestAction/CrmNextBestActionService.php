<?php

namespace App\Services\Crm\NextBestAction;

use App\Models\CrmActionEvent;
use App\Models\CrmDismissedAction;
use App\Services\Crm\NextBestAction\Contracts\RuleInterface;
use Illuminate\Database\Eloquent\Model;

class CrmNextBestActionService
{
    /** @var RuleInterface[] */
    private array $rules = [];

    public function addRule(RuleInterface $rule): void
    {
        $this->rules[] = $rule;
    }

    /** @return RecommendedAction[] */
    public function collect(Model $entity, int $userId, int $limit = 3): array
    {
        $dismissed = CrmDismissedAction::where('user_id', $userId)
            ->where('dismissable_type', $entity->getMorphClass())
            ->where('dismissable_id', $entity->getKey())
            ->where('dismissed_until', '>', now())
            ->pluck('rule_key')
            ->flip();

        $actions = [];

        foreach ($this->rules as $rule) {
            if (! $rule->supports($entity)) {
                continue;
            }

            $action = $rule->evaluate($entity, $userId);
            if ($action && ! isset($dismissed[$action->ruleKey])) {
                $actions[] = $action;
            }
        }

        usort($actions, fn (RecommendedAction $a, RecommendedAction $b) => match (true) {
            $a->priority === 'high' && $b->priority !== 'high' => -1,
            $a->priority !== 'high' && $b->priority === 'high' => 1,
            $a->priority === 'medium' && $b->priority === 'low' => -1,
            $a->priority === 'low' && $b->priority === 'medium' => 1,
            default => 0,
        });

        foreach (array_slice($actions, 0, $limit) as $action) {
            CrmActionEvent::create([
                'user_id' => $userId,
                'actionable_type' => $entity->getMorphClass(),
                'actionable_id' => $entity->getKey(),
                'rule_key' => $action->ruleKey,
                'origin' => $action->origin,
                'status' => 'shown',
            ]);
        }

        return array_slice($actions, 0, $limit);
    }

    public function dismiss(Model $entity, int $userId, string $ruleKey, int $days = 7): void
    {
        CrmDismissedAction::updateOrCreate(
            [
                'user_id' => $userId,
                'dismissable_type' => $entity->getMorphClass(),
                'dismissable_id' => $entity->getKey(),
                'rule_key' => $ruleKey,
            ],
            ['dismissed_until' => now()->addDays($days)],
        );

        CrmActionEvent::create([
            'user_id' => $userId,
            'actionable_type' => $entity->getMorphClass(),
            'actionable_id' => $entity->getKey(),
            'rule_key' => $ruleKey,
            'origin' => 'rule',
            'status' => 'dismissed',
        ]);
    }
}
