<?php

namespace App\Services\Crm\Health;

use App\Models\CrmDeal;
use App\Models\CrmOrganization;
use Illuminate\Database\Eloquent\Model;

class RuleBasedScorer implements HealthScorerInterface
{
    public function calculate(Model $entity): HealthResult
    {
        return match ($entity::class) {
            CrmOrganization::class => $this->scoreOrganization($entity),
            CrmDeal::class => $this->scoreDeal($entity),
            default => new HealthResult(50, 'at_risk', [], 'stable'),
        };
    }

    private function scoreOrganization(CrmOrganization $org): HealthResult
    {
        $factors = [];
        $total = 0;

        $recentActivities = $org->activities()
            ->where('created_at', '>=', now()->subDays(14))
            ->count();

        if ($recentActivities >= 3) {
            $factors[] = ['name' => 'Recent activity', 'weight' => 25, 'score' => 25];
            $total += 25;
        } elseif ($recentActivities >= 1) {
            $factors[] = ['name' => 'Recent activity', 'weight' => 25, 'score' => 15];
            $total += 15;
        } else {
            $factors[] = ['name' => 'Recent activity', 'weight' => 25, 'score' => 0];
        }

        $activeDeals = $org->deals()->whereNotIn('stage', ['closed_won', 'closed_lost'])->count();
        $recentWon = $org->deals()->where('stage', 'closed_won')->where('closed_at', '>=', now()->subDays(90))->count();

        if ($activeDeals > 0) {
            $total += 15;
            $factors[] = ['name' => 'Active deals', 'weight' => 15, 'score' => 15];
        } else {
            $factors[] = ['name' => 'Active deals', 'weight' => 15, 'score' => 0];
        }
        if ($recentWon > 0) {
            $total += 10;
            $factors[] = ['name' => 'Recent wins', 'weight' => 10, 'score' => 10];
        } else {
            $factors[] = ['name' => 'Recent wins', 'weight' => 10, 'score' => 0];
        }

        $contactCount = $org->contacts()->count();
        if ($contactCount >= 3) {
            $factors[] = ['name' => 'Contact coverage', 'weight' => 20, 'score' => 20];
            $total += 20;
        } elseif ($contactCount >= 1) {
            $factors[] = ['name' => 'Contact coverage', 'weight' => 20, 'score' => 10];
            $total += 10;
        } else {
            $factors[] = ['name' => 'Contact coverage', 'weight' => 20, 'score' => 0];
        }

        $hasDM = $org->contacts()->whereHas('influenceType', fn ($q) => $q->where('slug', 'decision_maker'))->exists();
        if ($hasDM) {
            $factors[] = ['name' => 'Decision maker identified', 'weight' => 15, 'score' => 15];
            $total += 15;
        } else {
            $factors[] = ['name' => 'Decision maker identified', 'weight' => 15, 'score' => 0];
        }

        $lastActivity = $org->activities()->latest('created_at')->first();
        if ($lastActivity) {
            $daysSince = $lastActivity->created_at->diffInDays(now());
            if ($daysSince < 7) {
                $factors[] = ['name' => 'Engagement recency', 'weight' => 15, 'score' => 15];
                $total += 15;
            } elseif ($daysSince < 30) {
                $factors[] = ['name' => 'Engagement recency', 'weight' => 15, 'score' => 10];
                $total += 10;
            } else {
                $factors[] = ['name' => 'Engagement recency', 'weight' => 15, 'score' => 5];
                $total += 5;
            }
        } else {
            $factors[] = ['name' => 'Engagement recency', 'weight' => 15, 'score' => 0];
        }

        return new HealthResult(
            score: min($total, 100),
            tier: $this->determineTier(min($total, 100)),
            factors: $factors,
            trend: 'stable',
        );
    }

    private function scoreDeal(CrmDeal $deal): HealthResult
    {
        $factors = [];
        $total = 0;

        $lastStageChange = $deal->auditLogs()
            ->where('event', 'stage_changed')
            ->latest('created_at')
            ->first();

        if ($lastStageChange) {
            $daysSince = $lastStageChange->created_at->diffInDays(now());
            if ($daysSince <= 7) {
                $factors[] = ['name' => 'Stage recency', 'weight' => 30, 'score' => 30];
                $total += 30;
            } elseif ($daysSince <= 14) {
                $factors[] = ['name' => 'Stage recency', 'weight' => 30, 'score' => 20];
                $total += 20;
            } elseif ($daysSince <= 30) {
                $factors[] = ['name' => 'Stage recency', 'weight' => 30, 'score' => 10];
                $total += 10;
            } else {
                $factors[] = ['name' => 'Stage recency', 'weight' => 30, 'score' => 0];
            }
        } else {
            $factors[] = ['name' => 'Stage recency', 'weight' => 30, 'score' => 0];
        }

        $weekActivities = $deal->activities()
            ->where('created_at', '>=', now()->subWeek())
            ->count();
        if ($weekActivities >= 2) {
            $factors[] = ['name' => 'Activity momentum', 'weight' => 25, 'score' => 25];
            $total += 25;
        } elseif ($weekActivities >= 1) {
            $factors[] = ['name' => 'Activity momentum', 'weight' => 25, 'score' => 15];
            $total += 15;
        } else {
            $factors[] = ['name' => 'Activity momentum', 'weight' => 25, 'score' => 0];
        }

        $closeDate = $deal->expected_close_date;
        if ($closeDate) {
            $daysUntilClose = now()->diffInDays($closeDate, false);
            if ($daysUntilClose > 30) {
                $factors[] = ['name' => 'Close date proximity', 'weight' => 20, 'score' => 20];
                $total += 20;
            } elseif ($daysUntilClose >= 15) {
                $factors[] = ['name' => 'Close date proximity', 'weight' => 20, 'score' => 15];
                $total += 15;
            } elseif ($daysUntilClose >= 0) {
                $factors[] = ['name' => 'Close date proximity', 'weight' => 20, 'score' => 5];
                $total += 5;
            } else {
                $factors[] = ['name' => 'Close date proximity', 'weight' => 20, 'score' => 0];
                $total += 0;
            }
        } else {
            $factors[] = ['name' => 'Close date proximity', 'weight' => 20, 'score' => 10];
            $total += 10;
        }

        $hasChampion = false;
        if ($deal->contact && $deal->contact->influenceType?->slug === 'champion') {
            $hasChampion = true;
        } elseif ($deal->organization) {
            $hasChampion = $deal->organization->contacts()
                ->whereHas('influenceType', fn ($q) => $q->where('slug', 'champion'))
                ->exists();
        }
        if ($hasChampion) {
            $factors[] = ['name' => 'Champion identified', 'weight' => 15, 'score' => 15];
            $total += 15;
        } else {
            $factors[] = ['name' => 'Champion identified', 'weight' => 15, 'score' => 0];
        }

        $hasBlocker = false;
        if ($deal->contact && $deal->contact->influenceType?->slug === 'blocker') {
            $hasBlocker = true;
        } elseif ($deal->organization) {
            $hasBlocker = $deal->organization->contacts()
                ->whereHas('influenceType', fn ($q) => $q->where('slug', 'blocker'))
                ->exists();
        }
        if ($hasBlocker) {
            $factors[] = ['name' => 'Blocker detected', 'weight' => 10, 'score' => -10];
            $total -= 10;
        } else {
            $factors[] = ['name' => 'Blocker detected', 'weight' => 10, 'score' => 0];
        }

        return new HealthResult(
            score: max(min($total, 100), 0),
            tier: $this->determineTier(max(min($total, 100), 0)),
            factors: $factors,
            trend: 'stable',
        );
    }

    private function determineTier(int $score): string
    {
        return match (true) {
            $score >= 80 => 'healthy',
            $score >= 50 => 'at_risk',
            default => 'critical',
        };
    }
}
