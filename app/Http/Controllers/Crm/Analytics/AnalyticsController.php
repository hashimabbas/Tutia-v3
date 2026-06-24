<?php

namespace App\Http\Controllers\Crm\Analytics;

use App\Http\Controllers\Controller;
use App\Models\CrmWorkflowRun;
use App\Services\Crm\Analytics\ApprovalAnalyticsService;
use App\Services\Crm\Analytics\ApprovalDelayForecastService;
use App\Services\Crm\Analytics\ApprovalIntelligenceService;
use App\Services\Crm\Analytics\ApprovalRecommendationService;
use App\Services\Crm\Analytics\AutomationInsightService;
use App\Services\Crm\Analytics\CapacityForecastService;
use App\Services\Crm\Analytics\Explainability\RecommendationExplanationFactory;
use App\Services\Crm\Analytics\HealthScoreService;
use App\Services\Crm\Analytics\SlaBreachPredictionService;
use App\Services\Crm\Analytics\WorkflowAnalyticsService;
use App\Services\Crm\Analytics\WorkflowIntelligenceService;
use App\Services\Crm\Analytics\WorkflowRecommendationService;
use App\Services\Crm\Analytics\WorkflowRiskPredictionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private readonly WorkflowAnalyticsService $workflowAnalytics,
        private readonly ApprovalAnalyticsService $approvalAnalytics,
        private readonly WorkflowIntelligenceService $workflowIntelligence,
        private readonly ApprovalIntelligenceService $approvalIntelligence,
        private readonly WorkflowRecommendationService $workflowRecommendations,
        private readonly ApprovalRecommendationService $approvalRecommendations,
        private readonly HealthScoreService $healthScores,
        private readonly AutomationInsightService $automationInsights,
        private readonly RecommendationExplanationFactory $explanationFactory,
        private readonly WorkflowRiskPredictionService $workflowRiskPrediction,
        private readonly SlaBreachPredictionService $slaBreachPrediction,
        private readonly ApprovalDelayForecastService $approvalDelayForecast,
        private readonly CapacityForecastService $capacityForecast,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CrmWorkflowRun::class);

        return response()->json([
            'workflow' => [
                'metrics' => $this->workflowAnalytics->overview(),
                'topTriggeredWorkflows' => $this->workflowAnalytics->topTriggeredWorkflows(),
                'topFailedActions' => $this->workflowAnalytics->topFailedActions(),
                'dailyTrends' => $this->workflowAnalytics->dailyTrends(),
                'byWorkflow' => $this->workflowAnalytics->byWorkflow(),
                'actionPerformance' => $this->workflowAnalytics->actionPerformance(),
            ],
            'approval' => [
                'metrics' => $this->approvalAnalytics->overview(),
                'byFlow' => $this->approvalAnalytics->byFlow(),
                'dailyTrends' => $this->approvalAnalytics->dailyTrends(),
                'approverPerformance' => $this->approvalAnalytics->approverPerformance(),
            ],
            'workflowIntelligence' => [
                'topFailureReasons' => $this->workflowIntelligence->topFailureReasons(),
                'failureHeatmap' => $this->workflowIntelligence->failureHeatmap(),
                'successTrends' => $this->workflowIntelligence->successTrends(),
                'slowestWorkflows' => $this->workflowIntelligence->slowestWorkflows(),
                'slowestActions' => $this->workflowIntelligence->slowestActions(),
                'retryCandidates' => $this->workflowIntelligence->retryCandidates(),
            ],
            'approvalIntelligence' => [
                'bottleneckSteps' => $this->approvalIntelligence->bottleneckSteps(),
                'slowestApprovers' => $this->approvalIntelligence->slowestApprovers(),
                'slaRiskFlows' => $this->approvalIntelligence->slaRiskFlows(),
                'escalationHotspots' => $this->approvalIntelligence->escalationHotspots(),
                'approvalThroughput' => $this->approvalIntelligence->approvalThroughput(),
            ],
            'recommendations' => $this->workflowRecommendations->recommendations()
                ->concat($this->approvalRecommendations->recommendations())
                ->sortByDesc('priority')
                ->values()
                ->map(fn (array $r) => array_merge($r, [
                    'explanation' => $this->explanationFactory->explain($r),
                ])),
            'healthScores' => [
                'workflows' => $this->healthScores->workflowHealth(),
                'approvals' => $this->healthScores->approvalHealth(),
            ],
            'insights' => $this->automationInsights->insights(),
            'predictions' => [
                'workflowRisks' => $this->workflowRiskPrediction->allWorkflowRisks(),
                'slaBreaches' => $this->slaBreachPrediction->pendingBreachRisks(),
                'delayForecasts' => $this->approvalDelayForecast->pendingForecasts(),
                'workflowVolume' => $this->capacityForecast->workflowVolumeForecast(),
                'approvalVolume' => $this->capacityForecast->approvalVolumeForecast(),
            ],
        ]);
    }
}
