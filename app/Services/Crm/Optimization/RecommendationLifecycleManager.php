<?php

namespace App\Services\Crm\Optimization;

use InvalidArgumentException;

class RecommendationLifecycleManager
{
    private const array TRANSITIONS = [
        LifecycleStatus::Generated->value => [
            LifecycleStatus::Viewed->value,
            LifecycleStatus::Dismissed->value,
            LifecycleStatus::Cancelled->value,
        ],
        LifecycleStatus::Viewed->value => [
            LifecycleStatus::Accepted->value,
            LifecycleStatus::Dismissed->value,
            LifecycleStatus::Cancelled->value,
        ],
        LifecycleStatus::Accepted->value => [
            LifecycleStatus::Applied->value,
            LifecycleStatus::Rejected->value,
            LifecycleStatus::Expired->value,
        ],
        LifecycleStatus::Applied->value => [
            LifecycleStatus::Verified->value,
            LifecycleStatus::Expired->value,
        ],
        LifecycleStatus::Verified->value => [
            LifecycleStatus::Completed->value,
            LifecycleStatus::Failed->value,
        ],
    ];

    public function canTransition(LifecycleStatus $from, LifecycleStatus $to): bool
    {
        $allowed = self::TRANSITIONS[$from->value] ?? [];

        return in_array($to->value, $allowed, true);
    }

    public function transition(LifecycleStatus $from, LifecycleStatus $to): void
    {
        if (! $this->canTransition($from, $to)) {
            throw new InvalidArgumentException(sprintf(
                'Cannot transition from "%s" to "%s". Allowed: [%s]',
                $from->value,
                $to->value,
                implode(', ', array_map(fn (LifecycleStatus $s) => $s->value, $this->allowedTransitions($from))),
            ));
        }
    }

    public function allowedTransitions(LifecycleStatus $from): array
    {
        $allowed = self::TRANSITIONS[$from->value] ?? [];

        return array_map(
            fn (string $status) => LifecycleStatus::from($status),
            $allowed,
        );
    }

    public function isTerminal(LifecycleStatus $status): bool
    {
        return in_array($status, [
            LifecycleStatus::Completed,
            LifecycleStatus::Failed,
            LifecycleStatus::Dismissed,
            LifecycleStatus::Rejected,
            LifecycleStatus::Expired,
            LifecycleStatus::Cancelled,
        ], true);
    }

    public function activeStatuses(): array
    {
        return [
            LifecycleStatus::Generated,
            LifecycleStatus::Viewed,
            LifecycleStatus::Accepted,
            LifecycleStatus::Applied,
            LifecycleStatus::Verified,
        ];
    }
}
