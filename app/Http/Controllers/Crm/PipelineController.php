<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmDeal;
use App\Services\Crm\Forecast\ForecastConfidenceService;
use Inertia\Inertia;
use Inertia\Response;

class PipelineController extends Controller
{
    public function __construct(
        private readonly ForecastConfidenceService $confidenceService,
    ) {}

    public function index(): Response
    {
        $user = auth()->user();
        $isManager = $user->hasPermissionTo('crm.team.manage');

        $deals = CrmDeal::query()
            ->whereNotIn('stage', ['closed_won', 'closed_lost'])
            ->when(! $isManager, fn ($q) => $q->where('owner_id', $user->id))
            ->with(['owner', 'organization', 'contact'])
            ->get();

        // Stage funnel
        $stages = ['qualification', 'meeting', 'proposal', 'negotiation'];
        $funnel = collect($stages)->map(fn ($stage) => [
            'stage' => $stage,
            'count' => $deals->where('stage', $stage)->count(),
            'value' => $deals->where('stage', $stage)->sum('value'),
        ]);

        // Velocity — average days in current stage
        $velocity = [];
        foreach ($stages as $stage) {
            $stageDeals = $deals->where('stage', $stage);
            if ($stageDeals->isEmpty()) {
                $velocity[$stage] = 0;

                continue;
            }
            $totalDays = $stageDeals->sum(function ($deal) {
                $lastChange = $deal->auditLogs()
                    ->where('event', 'stage_changed')
                    ->latest('created_at')
                    ->first();
                if ($lastChange) {
                    return $lastChange->created_at->diffInDays(now());
                }

                return $deal->created_at->diffInDays(now());
            });
            $velocity[$stage] = round($totalDays / $stageDeals->count());
        }

        // Bottleneck detection
        $maxVelocity = max($velocity);
        $bottleneckStage = $maxVelocity > 0 ? array_search($maxVelocity, $velocity) : null;

        // Health distribution
        $healthDistribution = [
            'healthy' => $deals->filter(fn ($d) => $d->healthScore()?->tier === 'healthy')->count(),
            'at_risk' => $deals->filter(fn ($d) => $d->healthScore()?->tier === 'at_risk')->count(),
            'critical' => $deals->filter(fn ($d) => $d->healthScore()?->tier === 'critical')->count(),
        ];

        // Stale deals (no activity in 14 days)
        $staleDeals = $deals->filter(function ($deal) {
            $lastActivity = $deal->activities()->latest('created_at')->first();

            return ! $lastActivity || $lastActivity->created_at->diffInDays(now()) >= 14;
        });

        // Missing stakeholder deals
        $missingStakeholder = $deals->filter(function ($deal) {
            if (! $deal->organization) {
                return true;
            }
            $hasDM = $deal->organization->contacts()
                ->whereHas('influenceType', fn ($q) => $q->where('slug', 'decision_maker'))
                ->exists();
            $hasChampion = $deal->organization->contacts()
                ->whereHas('influenceType', fn ($q) => $q->where('slug', 'champion'))
                ->exists();

            return ! $hasDM || ! $hasChampion;
        });

        // Stuck stages (no movement in 14 days)
        $stuckDeals = $deals->filter(function ($deal) {
            $lastChange = $deal->auditLogs()
                ->where('event', 'stage_changed')
                ->latest('created_at')
                ->first();
            if (! $lastChange) {
                return false;
            }

            return $lastChange->created_at->diffInDays(now()) >= 14;
        });

        // Win rate (closed deals)
        $closedWon = CrmDeal::where('stage', 'closed_won')->count();
        $closedLost = CrmDeal::where('stage', 'closed_lost')->count();
        $winRate = ($closedWon + $closedLost) > 0
            ? round(($closedWon / ($closedWon + $closedLost)) * 100)
            : 0;

        // Average deal size (won)
        $avgDealSize = CrmDeal::where('stage', 'closed_won')->avg('value') ?? 0;

        return Inertia::render('crm/pipeline/index', [
            'funnel' => $funnel,
            'velocity' => $velocity,
            'bottleneck_stage' => $bottleneckStage,
            'health_distribution' => $healthDistribution,
            'stale_deals_count' => $staleDeals->count(),
            'missing_stakeholder_count' => $missingStakeholder->count(),
            'stuck_deals_count' => $stuckDeals->count(),
            'win_rate' => $winRate,
            'avg_deal_size' => $avgDealSize,
            'total_active_deals' => $deals->count(),
            'total_pipeline_value' => $deals->sum('value'),
            'is_manager' => $isManager,
        ]);
    }
}
