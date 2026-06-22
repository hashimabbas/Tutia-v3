<?php

use App\Http\Controllers\Crm\Analytics\AnalyticsController;
use App\Http\Controllers\Crm\Analytics\AnalyticsPageController;
use App\Http\Controllers\Crm\Analytics\SegmentationController;
use Illuminate\Support\Facades\Route;

Route::get('/crm/analytics', [AnalyticsPageController::class, 'index'])->name('crm.analytics.index');
Route::get('/crm/analytics/api', [AnalyticsController::class, 'index'])->name('crm.analytics.api');

Route::post('/crm/analytics/api/segment', [SegmentationController::class, 'segment'])->name('crm.analytics.segment');
Route::post('/crm/analytics/api/segment/validate', [SegmentationController::class, 'validateExpression'])->name('crm.analytics.segment.validate');
Route::get('/crm/analytics/api/segment/examples', [SegmentationController::class, 'examples'])->name('crm.analytics.segment.examples');
