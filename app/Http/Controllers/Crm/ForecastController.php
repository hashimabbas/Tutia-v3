<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmDeal;
use App\Models\CrmQuota;
use App\Models\User;
use App\Services\Crm\Forecast\ForecastConfidenceService;
use Inertia\Inertia;
use Inertia\Response;

class ForecastController extends Controller
{
    public function __construct(
        private readonly ForecastConfidenceService $confidenceService,
    ) {}

    public function index(): Response
    {
        $period = request('period', now()->format('Y-').'Q'.ceil(now()->month / 3));

        $user = auth()->user();
        $isManager = $user->hasPermissionTo('crm.team.manage');

        $deals = CrmDeal::query()
            ->whereIn('stage', ['qualification', 'meeting', 'proposal', 'negotiation'])
            ->when(! $isManager, fn ($q) => $q->where('owner_id', $user->id))
            ->with(['owner', 'organization', 'contact'])
            ->get();

        $commitTotal = $deals->where('forecast_category', 'commit')->sum('value');
        $bestCaseTotal = $deals->where('forecast_category', 'best_case')->sum('value');
        $pipelineTotal = $deals->where('forecast_category', 'pipeline')->sum('value');
        $uncategorizedTotal = $deals->whereNull('forecast_category')->sum('value');

        $quota = CrmQuota::where('period', $period)
            ->when(! $isManager, fn ($q) => $q->where('user_id', $user->id))
            ->sum('amount');

        $dealsWithConfidence = $deals->map(function ($deal) {
            $confidence = $this->confidenceService->calculate($deal);

            return [
                'id' => $deal->id,
                'title' => $deal->title,
                'value' => $deal->value,
                'stage' => $deal->stage,
                'forecast_category' => $deal->forecast_category,
                'owner' => $deal->owner?->only(['id', 'name']),
                'organization' => $deal->organization?->only(['id', 'name']),
                'confidence' => $confidence->confidence,
                'suggested_category' => $confidence->suggestedCategory,
                'mismatch' => $confidence->mismatch,
            ];
        });

        $teamBreakdown = [];
        if ($isManager) {
            $teamBreakdown = User::whereHas('permissions', fn ($q) => $q->where('name', 'crm.deals.view'))
                ->get()
                ->map(fn ($rep) => [
                    'name' => $rep->name,
                    'commit' => $deals->where('owner_id', $rep->id)->where('forecast_category', 'commit')->sum('value'),
                    'best_case' => $deals->where('owner_id', $rep->id)->where('forecast_category', 'best_case')->sum('value'),
                    'pipeline' => $deals->where('owner_id', $rep->id)->where('forecast_category', 'pipeline')->sum('value'),
                    'total' => $deals->where('owner_id', $rep->id)->sum('value'),
                ]);
        }

        $healthDistribution = [
            'healthy' => $deals->filter(fn ($d) => $d->healthScore()?->tier === 'healthy')->count(),
            'at_risk' => $deals->filter(fn ($d) => $d->healthScore()?->tier === 'at_risk')->count(),
            'critical' => $deals->filter(fn ($d) => $d->healthScore()?->tier === 'critical')->count(),
        ];

        return Inertia::render('crm/forecast/index', [
            'period' => $period,
            'summary' => [
                'commit' => $commitTotal,
                'best_case' => $bestCaseTotal,
                'pipeline' => $pipelineTotal,
                'uncategorized' => $uncategorizedTotal,
                'weighted' => $deals->sum(fn ($d) => $d->value * ($d->probability / 100)),
            ],
            'quota' => $quota,
            'deals' => $dealsWithConfidence,
            'team_breakdown' => $teamBreakdown,
            'health_distribution' => $healthDistribution,
            'is_manager' => $isManager,
        ]);
    }
}
