<?php

namespace App\Http\Controllers\Crm\Optimization;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OptimizationPageController extends Controller
{
    public function center(Request $request)
    {
        if ($request->wantsJson()) {
            return app(OptimizationCenterController::class)->index($request);
        }

        return inertia('crm/optimization/optimization-center');
    }

    public function automationScore(Request $request)
    {
        if ($request->wantsJson()) {
            return app(AutomationScoreController::class)->show($request);
        }

        return inertia('crm/optimization/automation-score');
    }

    public function history(Request $request)
    {
        if ($request->wantsJson()) {
            return app(AutomationHistoryController::class)->history($request);
        }

        return inertia('crm/optimization/automation-score/history');
    }

    public function impact(Request $request, string $recommendation)
    {
        if ($request->wantsJson()) {
            return app(ImpactController::class)->show($request, $recommendation);
        }

        return inertia('crm/optimization/impact', [
            'recommendationId' => $recommendation,
        ]);
    }

    public function recommendations(Request $request)
    {
        if ($request->wantsJson()) {
            return app(RecommendationLifecycleController::class)->index($request);
        }

        return inertia('crm/optimization/recommendations', []);
    }
}
