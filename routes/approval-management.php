<?php

use App\Http\Controllers\Crm\Approvals\ApprovalController;
use App\Http\Controllers\Crm\Approvals\ApprovalPageController;
use Illuminate\Support\Facades\Route;

// Inertia page routes
Route::get('/crm/approvals', [ApprovalPageController::class, 'index'])->name('crm.approvals.index');

// JSON API — must be before {request} to avoid 'api' matching as request ID
Route::get('/crm/approvals/api/metrics', [ApprovalController::class, 'metrics'])->name('crm.approvals.metrics');
Route::get('/crm/approvals/api', [ApprovalController::class, 'index'])->name('crm.approvals.api.index');
Route::get('/crm/approvals/api/{request}', [ApprovalController::class, 'show'])->name('crm.approvals.api.show');
Route::post('/crm/approvals/api/{request}/decide', [ApprovalController::class, 'decide'])->name('crm.approvals.api.decide');

Route::get('/crm/approvals/{request}', [ApprovalPageController::class, 'show'])->name('crm.approvals.show');
