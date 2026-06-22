<?php

namespace App\Http\Controllers\Crm\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Crm\Analytics\ApprovalAnalyticsExamplesCatalog;
use App\Services\Crm\Analytics\ApprovalAnalyticsService;
use App\Services\Crm\Analytics\HealthScoreService;
use App\Services\Crm\Analytics\Segmentation\AnalyticsSegmentationService;
use App\Services\Crm\Analytics\WorkflowAnalyticsExamplesCatalog;
use App\Services\Crm\Analytics\WorkflowAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SegmentationController extends Controller
{
    public function __construct(
        private readonly WorkflowAnalyticsService $workflowAnalytics,
        private readonly ApprovalAnalyticsService $approvalAnalytics,
        private readonly HealthScoreService $healthScores,
        private readonly AnalyticsSegmentationService $segmentation,
    ) {}

    public function segment(Request $request): JsonResponse
    {
        $start = microtime(true);

        $request->validate([
            'tab' => 'required|in:workflows,approvals',
            'expression' => 'nullable|string|max:500',
        ]);

        $tab = $request->input('tab');
        $expression = $request->input('expression', '');

        $items = match ($tab) {
            'workflows' => $this->workflowAnalytics->byWorkflow(),
            'approvals' => $this->approvalAnalytics->byFlow(),
            default => collect(),
        };

        $result = $this->segmentation->segment($items, $tab, $expression);

        $durationMs = (int) round((microtime(true) - $start) * 1000);

        return response()->json([
            'count' => $result->count,
            'total' => $result->total,
            'percentage' => $result->percentage,
            'items' => $result->items,
            'metadata' => [
                'expression' => $expression,
                'evaluated' => $result->evaluated,
                'matched' => $result->count,
                'executionTimeMs' => $durationMs,
            ],
        ]);
    }

    public function examples(Request $request): JsonResponse
    {
        $tab = $request->query('tab', 'workflows');

        $examples = match ($tab) {
            'workflows' => WorkflowAnalyticsExamplesCatalog::all(),
            'approvals' => ApprovalAnalyticsExamplesCatalog::all(),
            default => [],
        };

        return response()->json(['examples' => $examples]);
    }

    public function validateExpression(Request $request): JsonResponse
    {
        $request->validate([
            'tab' => 'required|in:workflows,approvals',
            'expression' => 'required|string|max:500',
        ]);

        $result = $this->segmentation->validateExpression(
            $request->input('tab'),
            $request->input('expression'),
        );

        return response()->json([
            'valid' => $result->valid,
            'errors' => $result->errors,
            'warnings' => $result->warnings,
        ]);
    }
}
