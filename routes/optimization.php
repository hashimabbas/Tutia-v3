<?php

use App\Http\Controllers\Crm\Optimization\AutomationHistoryController;
use App\Http\Controllers\Crm\Optimization\AutomationScoreController;
use App\Http\Controllers\Crm\Optimization\ImpactController;
use App\Http\Controllers\Crm\Optimization\OptimizationCenterController;
use App\Http\Controllers\Crm\Optimization\OptimizationPageController;
use App\Http\Controllers\Crm\Optimization\RecommendationLifecycleController;
use Illuminate\Support\Facades\Route;

// --- Inertia Pages ---

Route::get('/crm/optimization/center', [OptimizationPageController::class, 'center'])->name('crm.optimization.center');
Route::get('/crm/optimization/automation-score', [OptimizationPageController::class, 'automationScore'])->name('crm.optimization.automation-score');
Route::get('/crm/optimization/automation-score/history', [OptimizationPageController::class, 'history'])->name('crm.optimization.automation-score.history');
Route::get('/crm/optimization/recommendations', [OptimizationPageController::class, 'recommendations'])->name('crm.optimization.recommendations');
Route::get('/crm/optimization/recommendations/{recommendation}/impact', [OptimizationPageController::class, 'impact'])->name('crm.optimization.impact');

// --- API Routes (for client-side fetch) ---

Route::get('/api/crm/optimization/recommendations', [RecommendationLifecycleController::class, 'index']);
Route::post('/api/crm/optimization/recommendations/track', [RecommendationLifecycleController::class, 'track']);
Route::get('/api/crm/optimization/recommendations/{recommendationType}/status', [RecommendationLifecycleController::class, 'status']);
Route::get('/api/crm/optimization/recommendations/{event}/snapshot', [RecommendationLifecycleController::class, 'snapshot']);

Route::get('/api/crm/optimization/recommendations/{recommendation}/comparison', [ImpactController::class, 'comparison']);
Route::get('/api/crm/optimization/recommendations/{recommendation}/metrics', [ImpactController::class, 'metrics']);
Route::post('/api/crm/optimization/recommendations/{recommendation}/measure', [ImpactController::class, 'measure']);

Route::get('/api/crm/optimization/automation-score', [AutomationScoreController::class, 'show']);
Route::get('/api/crm/optimization/automation-score/breakdown', [AutomationScoreController::class, 'breakdown']);

Route::get('/api/crm/optimization/automation-score/history', [AutomationHistoryController::class, 'history']);
Route::get('/api/crm/optimization/automation-score/timeline', [AutomationHistoryController::class, 'timeline']);
Route::get('/api/crm/optimization/automation-score/trends', [AutomationHistoryController::class, 'trends']);
Route::get('/api/crm/optimization/automation-score/insights', [AutomationHistoryController::class, 'insights']);

Route::get('/api/crm/optimization/center', [OptimizationCenterController::class, 'index']);
Route::get('/api/crm/optimization/center/dashboard', [OptimizationCenterController::class, 'dashboard']);
Route::get('/api/crm/optimization/center/opportunities', [OptimizationCenterController::class, 'opportunities']);
Route::get('/api/crm/optimization/center/roadmap', [OptimizationCenterController::class, 'roadmap']);
Route::get('/api/crm/optimization/center/health', [OptimizationCenterController::class, 'health']);
