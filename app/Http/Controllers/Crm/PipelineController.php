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
            ->with(['owner', 'organization'])
            ->get();

        $stages = ['qualification', 'meeting', 'proposal', 'negotiation'];
        $totalPipelineValue = $deals->sum('value');

        // Stage funnel
        $funnel = collect($stages)->map(fn ($stage) => [
            'stage' => $stage,
            'count' => $deals->where('stage', $stage)->count(),
            'value' => $deals->where('stage', $stage)->sum('value'),
            'percentage' => $totalPipelineValue > 0
                ? round(($deals->where('stage', $stage)->sum('value') / $totalPipelineValue) * 100, 1)
                : 0,
        ]);

        // Velocity & days in stage per deal
        $velocity = [];
        $dealsData = $deals->map(function ($deal) use (&$velocity) {
            $lastChange = $deal->auditLogs()
                ->where('event', 'stage_changed')
                ->latest('created_at')
                ->first();

            $daysInStage = $lastChange
                ? $lastChange->created_at->diffInDays(now())
                : $deal->created_at->diffInDays(now());

            $confidence = $this->confidenceService->calculate($deal);

            return [
                'id' => $deal->id,
                'title' => $deal->title,
                'value' => $deal->value,
                'stage' => $deal->stage,
                'forecast_category' => $deal->forecast_category,
                'owner' => $deal->owner?->only(['id', 'name']),
                'organization' => $deal->organization?->only(['id', 'name']),
                'days_in_stage' => $daysInStage,
                'confidence' => $confidence->confidence,
                'suggested_category' => $confidence->suggestedCategory,
                'health_tier' => $deal->healthScore()?->tier,
                'expected_close_date' => $deal->expected_close_date?->toDateString(),
            ];
        });

        // Compute velocity per stage
        foreach ($stages as $stage) {
            $stageDeals = $dealsData->where('stage', $stage);
            if ($stageDeals->isEmpty()) {
                $velocity[$stage] = 0;

                continue;
            }
            $velocity[$stage] = round($stageDeals->avg('days_in_stage'));
        }

        // Bottleneck detection
        $maxVelocity = max($velocity);
        $bottleneckStage = $maxVelocity > 0 ? array_search($maxVelocity, $velocity) : null;

        // Health distribution
        $healthDistribution = [
            'healthy' => $dealsData->filter(fn ($d) => ($d['health_tier'] ?? null) === 'healthy')->count(),
            'at_risk' => $dealsData->filter(fn ($d) => ($d['health_tier'] ?? null) === 'at_risk')->count(),
            'critical' => $dealsData->filter(fn ($d) => ($d['health_tier'] ?? null) === 'critical')->count(),
        ];

        // Stale deals (no activity in 14 days)
        $staleDealIds = $deals->filter(function ($deal) {
            $lastActivity = $deal->activities()->latest('created_at')->first();

            return ! $lastActivity || $lastActivity->created_at->diffInDays(now()) >= 14;
        })->pluck('id');

        // Missing stakeholder deals
        $missingStakeholderIds = $deals->filter(function ($deal) {
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
        })->pluck('id');

        // Stuck stages (no movement in 14 days)
        $stuckDealIds = $deals->filter(function ($deal) {
            $lastChange = $deal->auditLogs()
                ->where('event', 'stage_changed')
                ->latest('created_at')
                ->first();
            if (! $lastChange) {
                return false;
            }

            return $lastChange->created_at->diffInDays(now()) >= 14;
        })->pluck('id');

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
            'stale_deals_count' => $staleDealIds->count(),
            'stale_deal_ids' => $staleDealIds->values(),
            'missing_stakeholder_count' => $missingStakeholderIds->count(),
            'missing_stakeholder_ids' => $missingStakeholderIds->values(),
            'stuck_deals_count' => $stuckDealIds->count(),
            'stuck_deal_ids' => $stuckDealIds->values(),
            'win_rate' => $winRate,
            'avg_deal_size' => $avgDealSize,
            'total_active_deals' => $deals->count(),
            'total_pipeline_value' => $totalPipelineValue,
            'deals' => $dealsData->values(),
            'is_manager' => $isManager,
        ]);
    }
}
