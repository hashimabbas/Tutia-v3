<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmDeal;
use App\Models\CrmLead;
use Illuminate\Http\Request;

class CrmDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $leadQuery = CrmLead::query();
        $dealQuery = CrmDeal::query();

        if ($user->hasRole('sales_rep')) {
            $leadQuery->where('assigned_to', $user->id);
            $dealQuery->where('owner_id', $user->id);
        }

        $totalLeads = (clone $leadQuery)->count();
        $newLeads = (clone $leadQuery)->where('stage', 'new')->count();
        $qualifiedLeads = (clone $leadQuery)->whereIn('stage', ['qualified', 'proposal'])->count();

        $totalPipeline = (clone $dealQuery)->whereNotIn('stage', ['closed_won', 'closed_lost'])->sum('value');
        $wonThisMonth = (clone $dealQuery)
            ->where('stage', 'closed_won')
            ->whereMonth('closed_at', now()->month)
            ->sum('value');

        $byStage = (clone $dealQuery)
            ->selectRaw('stage, count(*) as count, sum(value) as total')
            ->groupBy('stage')
            ->get();

        $recentLeads = (clone $leadQuery)->latest()->take(10)->get();
        $recentDeals = (clone $dealQuery)->latest()->take(10)->get();

        $leadTrend = (clone $leadQuery)
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(fn ($lead) => $lead->created_at->format('Y-m'))
            ->map(fn ($group, $month) => ['month' => $month, 'count' => $group->count()])
            ->sortBy('month')
            ->values();

        return inertia('crm/dashboard', [
            'stats' => [
                'total_leads' => $totalLeads,
                'new_leads' => $newLeads,
                'qualified_leads' => $qualifiedLeads,
                'total_pipeline' => $totalPipeline,
                'won_this_month' => $wonThisMonth,
            ],
            'pipeline_by_stage' => $byStage,
            'recent_leads' => $recentLeads,
            'recent_deals' => $recentDeals,
            'lead_trend' => $leadTrend,
        ]);
    }
}
