<?php

namespace App\Services\Crm\Projects\Health;

use App\Events\Crm\HealthDegraded;
use App\Events\Crm\ProjectAtRisk;
use App\Models\CrmHealthSnapshot;
use App\Models\CrmProject;

class DeliveryHealthService
{
    public function __construct(
        private DeliveryHealthScorerInterface $scorer,
    ) {}

    public function calculate(CrmProject $project): DeliveryHealthResult
    {
        $project->loadMissing(['milestones', 'risks', 'issues', 'changeOrders']);

        return $this->scorer->calculate($project);
    }

    public function recalculate(CrmProject $project): DeliveryHealthResult
    {
        $project->loadMissing(['milestones', 'risks', 'issues', 'changeOrders']);

        $result = $this->scorer->calculate($project);

        $previous = $this->latest($project);

        CrmHealthSnapshot::create([
            'healthable_type' => $project->getMorphClass(),
            'healthable_id' => $project->getKey(),
            'scorer' => class_basename($this->scorer),
            'score' => $result->score,
            'tier' => $result->tier,
            'factors' => $result->factors,
            'trend' => $result->trend,
        ]);

        if ($previous !== null) {
            if ($result->score < 50 && $result->score < $previous->score) {
                ProjectAtRisk::dispatch($project, $result->score, $previous->score);
            }

            $drop = $previous->score - $result->score;
            if ($drop >= 15) {
                HealthDegraded::dispatch($project, $result->score, $previous->score, $drop);
            }
        } elseif ($result->score < 50) {
            ProjectAtRisk::dispatch($project, $result->score, $result->score);
        }

        return $result;
    }

    public function latest(CrmProject $project): ?DeliveryHealthResult
    {
        $snapshot = CrmHealthSnapshot::where('healthable_type', $project->getMorphClass())
            ->where('healthable_id', $project->getKey())
            ->latest()
            ->first();

        if ($snapshot === null) {
            return null;
        }

        return new DeliveryHealthResult(
            score: $snapshot->score,
            tier: $snapshot->tier,
            factors: $snapshot->factors,
            trend: $snapshot->trend,
        );
    }

    public function history(CrmProject $project, int $limit = 6): array
    {
        return CrmHealthSnapshot::where('healthable_type', $project->getMorphClass())
            ->where('healthable_id', $project->getKey())
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($s) => new DeliveryHealthResult(
                score: $s->score,
                tier: $s->tier,
                factors: $s->factors,
                trend: $s->trend,
            ))
            ->all();
    }
}
