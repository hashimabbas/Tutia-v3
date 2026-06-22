<?php

namespace App\Services\Crm\Health;

use App\Models\CrmHealthSnapshot;
use Illuminate\Database\Eloquent\Model;

class CrmHealthService
{
    public function __construct(
        private HealthScorerInterface $scorer,
    ) {}

    public function recalculate(Model $entity): HealthResult
    {
        $result = $this->scorer->calculate($entity);

        CrmHealthSnapshot::create([
            'healthable_type' => $entity->getMorphClass(),
            'healthable_id' => $entity->getKey(),
            'scorer' => class_basename($this->scorer),
            'score' => $result->score,
            'tier' => $result->tier,
            'factors' => $result->factors,
            'trend' => $result->trend,
        ]);

        return $result;
    }

    public function latest(Model $entity): ?HealthResult
    {
        $snapshot = CrmHealthSnapshot::where('healthable_type', $entity->getMorphClass())
            ->where('healthable_id', $entity->getKey())
            ->latest()
            ->first();

        if (! $snapshot) {
            return null;
        }

        return new HealthResult(
            score: $snapshot->score,
            tier: $snapshot->tier,
            factors: $snapshot->factors,
            trend: $snapshot->trend,
        );
    }

    public function history(Model $entity, int $limit = 6): array
    {
        return CrmHealthSnapshot::where('healthable_type', $entity->getMorphClass())
            ->where('healthable_id', $entity->getKey())
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($s) => new HealthResult(
                score: $s->score,
                tier: $s->tier,
                factors: $s->factors,
                trend: $s->trend,
            ))
            ->all();
    }
}
