<?php

use App\Http\Controllers\Crm\Workflows\ActionBuilderController;
use App\Http\Controllers\Crm\Workflows\ConditionBuilderController;
use App\Http\Controllers\Crm\Workflows\ExpressionBuilderController;
use App\Http\Controllers\Crm\Workflows\MetadataController;
use App\Http\Controllers\Crm\Workflows\TriggerBuilderController;
use App\Http\Controllers\Crm\Workflows\WorkflowController;
use App\Http\Controllers\Crm\Workflows\WorkflowPageController;
use App\Http\Controllers\Crm\Workflows\WorkflowRunController;
use App\Http\Controllers\Crm\Workflows\WorkflowRunPageController;
use Illuminate\Support\Facades\Route;

// Metadata endpoints — must be before resourceful routes to avoid matching 'meta' as a workflow ID
Route::get('/crm/workflows/meta/events', [MetadataController::class, 'events'])->name('crm.workflows.meta.events');
Route::get('/crm/workflows/meta/operators', [MetadataController::class, 'operators'])->name('crm.workflows.meta.operators');
Route::get('/crm/workflows/meta/actions', [MetadataController::class, 'actions'])->name('crm.workflows.meta.actions');
Route::get('/crm/workflows/meta/approval-flows', [MetadataController::class, 'approvalFlows'])->name('crm.workflows.meta.approval-flows');

// Expression Builder API (Phase 4F)
Route::get('/crm/workflows/expression/fields', [ExpressionBuilderController::class, 'fields'])->name('crm.workflows.expression.fields');
Route::get('/crm/workflows/expression/operators', [ExpressionBuilderController::class, 'operators'])->name('crm.workflows.expression.operators');
Route::post('/crm/workflows/expression/validate', [ExpressionBuilderController::class, 'validateExpression'])->name('crm.workflows.expression.validate');
Route::post('/crm/workflows/expression/convert', [ExpressionBuilderController::class, 'convert'])->name('crm.workflows.expression.convert');

// Inertia page routes
Route::get('/crm/workflows', [WorkflowPageController::class, 'index'])->name('crm.workflows.index');
Route::get('/crm/workflows/runs', [WorkflowRunPageController::class, 'index'])->name('crm.workflows.runs.index');

// Workflow runs API — must be before {run} to avoid 'api' matching as a run ID
Route::get('/crm/workflows/runs/api/metrics', [WorkflowRunController::class, 'metrics'])->name('crm.workflows.runs.metrics');
Route::get('/crm/workflows/runs/api', [WorkflowRunController::class, 'index'])->name('crm.workflows.runs.api.index');
Route::get('/crm/workflows/runs/api/{run}', [WorkflowRunController::class, 'show'])->name('crm.workflows.runs.api.show');

Route::get('/crm/workflows/runs/{run}', [WorkflowRunPageController::class, 'show'])->name('crm.workflows.runs.show');
Route::get('/crm/workflows/{workflow}', [WorkflowPageController::class, 'show'])->name('crm.workflows.show');

// Workflow CRUD (JSON API)
Route::post('/crm/workflows', [WorkflowController::class, 'store'])->name('crm.workflows.store');
Route::patch('/crm/workflows/{workflow}', [WorkflowController::class, 'update'])->name('crm.workflows.update');
Route::delete('/crm/workflows/{workflow}', [WorkflowController::class, 'destroy'])->name('crm.workflows.destroy');
Route::post('/crm/workflows/{workflow}/duplicate', [WorkflowController::class, 'duplicate'])->name('crm.workflows.duplicate');
Route::post('/crm/workflows/{workflow}/toggle', [WorkflowController::class, 'toggle'])->name('crm.workflows.toggle');

// Triggers
Route::get('/crm/workflows/{workflow}/triggers', [TriggerBuilderController::class, 'index'])->name('crm.workflows.triggers.index');
Route::post('/crm/workflows/{workflow}/triggers', [TriggerBuilderController::class, 'store'])->name('crm.workflows.triggers.store');
Route::patch('/crm/workflows/{workflow}/triggers/{trigger}', [TriggerBuilderController::class, 'update'])->name('crm.workflows.triggers.update');
Route::delete('/crm/workflows/{workflow}/triggers/{trigger}', [TriggerBuilderController::class, 'destroy'])->name('crm.workflows.triggers.destroy');

// Conditions
Route::get('/crm/workflows/{workflow}/conditions', [ConditionBuilderController::class, 'index'])->name('crm.workflows.conditions.index');
Route::post('/crm/workflows/{workflow}/conditions', [ConditionBuilderController::class, 'store'])->name('crm.workflows.conditions.store');
Route::patch('/crm/workflows/{workflow}/conditions/{condition}', [ConditionBuilderController::class, 'update'])->name('crm.workflows.conditions.update');
Route::delete('/crm/workflows/{workflow}/conditions/{condition}', [ConditionBuilderController::class, 'destroy'])->name('crm.workflows.conditions.destroy');

// Actions
Route::get('/crm/workflows/{workflow}/actions', [ActionBuilderController::class, 'index'])->name('crm.workflows.actions.index');
Route::post('/crm/workflows/{workflow}/actions', [ActionBuilderController::class, 'store'])->name('crm.workflows.actions.store');
Route::patch('/crm/workflows/{workflow}/actions/{action}', [ActionBuilderController::class, 'update'])->name('crm.workflows.actions.update');
Route::delete('/crm/workflows/{workflow}/actions/{action}', [ActionBuilderController::class, 'destroy'])->name('crm.workflows.actions.destroy');
