<?php

namespace App\Services\Crm\NextBestAction\Contracts;

use App\Services\Crm\NextBestAction\RecommendedAction;
use Illuminate\Database\Eloquent\Model;

interface RuleInterface
{
    public function evaluate(Model $entity, int $userId): ?RecommendedAction;

    public function supports(Model $entity): bool;
}
