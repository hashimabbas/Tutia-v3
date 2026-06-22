<?php

namespace App\Services\Crm\Analytics;

use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowRun;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Support\Collection;

class WorkflowRiskPredictionService
{
    private const RECENT_RUN_LIMIT = 30;

    private const TREND_DAYS = 60;

    public function allWorkflowRisks(): Collection
    {
        $workflows = CrmWorkflow::whereHas('runs')->get();

        $overallRuns = CrmWorkflowRun::select('workflow_id', 'status', 'created_at')
            ->get()
            ->groupBy('workflow_id');

        $actionRuns = CrmWorkflowActionRun::select('workflow_run_id', 'status', 'action_type')
            ->whereIn('workflow_run_id', function ($q) {
                $q->select('id')->from('crm_workflow_runs');
            })
            ->get()
            ->groupBy('workflow_run_id');

        return $workflows->map(function (CrmWorkflow $w) use ($overallRuns, $actionRuns) {
            $runs = $overallRuns->get($w->id, collect());

            return $this->predict(
                workflow: $w,
                runs: $runs,
                actionRuns: $actionRuns,
            );
        })->sortByDesc('riskScore')->values();
    }

    public function predict(
        ?CrmWorkflow $workflow = null,
        ?Collection $runs = null,
        ?Collection $actionRuns = null,
    ): array {
        if ($workflow === null || $runs === null) {
            return [
                'workflowId' => null,
                'workflowName' => null,
                'riskScore' => null,
                'riskLevel' => 'unknown',
                'probability' => null,
                'factors' => [],
            ];
        }

        $total = $runs->count();

        if ($total === 0) {
            return [
                'workflowId' => $workflow->id,
                'workflowName' => $workflow->name,
                'riskScore' => 0,
                'riskLevel' => 'low',
                'probability' => 0,
                'factors' => ['insufficient_data' => true],
            ];
        }

        $recent = $runs->sortByDesc('created_at')->take(self::RECENT_RUN_LIMIT);
        $recentTotal = $recent->count();
        $recentFailed = $recent->where('status', WorkflowStatusCatalog::RUN_FAILED)->count();
        $recentFailureRate = $recentTotal > 0 ? $recentFailed / $recentTotal : 0;

        $overallFailed = $runs->where('status', WorkflowStatusCatalog::RUN_FAILED)->count();
        $overallFailureRate = $total > 0 ? $overallFailed / $total : 0;

        $workflowActionRuns = collect();
        $runIds = $runs->pluck('id');
        if ($actionRuns !== null) {
            $workflowActionRuns = $actionRuns->filter(fn ($group, $runId) => $runIds->contains($runId))->flatten(1);
        }

        $actionFailed = $workflowActionRuns->where('status', WorkflowStatusCatalog::ACTION_FAILED)->count();
        $actionTotal = $workflowActionRuns->count();
        $actionFailureRate = $actionTotal > 0 ? $actionFailed / $actionTotal : 0;

        $olderPeriod = $runs->filter(fn ($r) => $r->created_at < now()->subDays(self::TREND_DAYS));
        $recentPeriod = $runs->filter(fn ($r) => $r->created_at >= now()->subDays(self::TREND_DAYS));

        $trendScore = 50;
        if ($olderPeriod->count() >= 5 && $recentPeriod->count() >= 5) {
            $olderFailureRate = $olderPeriod->where('status', WorkflowStatusCatalog::RUN_FAILED)->count() / $olderPeriod->count();
            $recentFailureRatePeriod = $recentPeriod->where('status', WorkflowStatusCatalog::RUN_FAILED)->count() / $recentPeriod->count();

            if ($recentFailureRatePeriod > $olderFailureRate * 1.2) {
                $trendScore = 100;
            } elseif ($recentFailureRatePeriod < $olderFailureRate * 0.8) {
                $trendScore = 0;
            }
        }

        $riskScore = (int) round(
            ($recentFailureRate * 40)
            + ($overallFailureRate * 20)
            + ($actionFailureRate * 20)
            + ($trendScore * 0.15)
            + (min(1, $recentFailed / max(1, $recentTotal)) * 5)
        );

        $riskScore = min(100, max(0, $riskScore));

        $riskLevel = $this->classifyRisk($riskScore);

        return [
            'workflowId' => $workflow->id,
            'workflowName' => $workflow->name,
            'riskScore' => $riskScore,
            'riskLevel' => $riskLevel,
            'probability' => round($riskScore / 100, 2),
            'factors' => [
                'recentFailureRate' => round($recentFailureRate * 100, 1),
                'overallFailureRate' => round($overallFailureRate * 100, 1),
                'actionFailureRate' => round($actionFailureRate * 100, 1),
                'trend' => $trendScore >= 70 ? 'increasing' : ($trendScore <= 30 ? 'decreasing' : 'stable'),
                'totalRuns' => $total,
                'recentRuns' => $recentTotal,
            ],
        ];
    }

    private function classifyRisk(int $score): string
    {
        if ($score >= 70) {
            return 'very_high';
        }
        if ($score >= 45) {
            return 'high';
        }
        if ($score >= 20) {
            return 'moderate';
        }

        return 'low';
    }
}
