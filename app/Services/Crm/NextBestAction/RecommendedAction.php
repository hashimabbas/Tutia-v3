<?php

namespace App\Services\Crm\NextBestAction;

class RecommendedAction
{
    public function __construct(
        public readonly string $ruleKey,
        public readonly string $priority,
        public readonly string $title,
        public readonly string $context,
        public readonly string $entityType,
        public readonly int $entityId,
        public readonly string $suggestedAction,
        public readonly array $actionData = [],
        public readonly string $origin = 'rule',
    ) {}
}
