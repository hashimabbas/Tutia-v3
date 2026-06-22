<?php

namespace App\Services\Crm\Stakeholder;

class StakeholderCoverageResult
{
    public function __construct(
        public readonly int $score,
        public readonly bool $hasDecisionMaker,
        public readonly bool $hasChampion,
        public readonly bool $hasInfluencer,
        public readonly bool $hasBlocker,
        public readonly array $factors,
    ) {}
}
