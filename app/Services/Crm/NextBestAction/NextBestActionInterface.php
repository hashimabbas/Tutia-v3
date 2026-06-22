<?php

namespace App\Services\Crm\NextBestAction;

use Illuminate\Database\Eloquent\Model;

interface NextBestActionInterface
{
    /** @return RecommendedAction[] */
    public function collect(Model $entity, int $userId): array;
}
