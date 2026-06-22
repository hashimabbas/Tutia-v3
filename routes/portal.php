<?php

use App\Http\Controllers\Portal\PortalAuthController;
use App\Http\Controllers\Portal\PortalChangeOrderController;
use App\Http\Controllers\Portal\PortalDashboardController;
use App\Http\Controllers\Portal\PortalPreferencesController;
use App\Http\Controllers\Portal\PortalProfileController;
use App\Http\Controllers\Portal\PortalProjectController;
use App\Http\Controllers\Portal\PortalTimelineController;
use Illuminate\Support\Facades\Route;

Route::prefix('portal')->name('portal.')->group(function () {
    // Pre-auth
    Route::get('/auth/login', [PortalAuthController::class, 'loginForm'])->name('auth.login');
    Route::get('/auth/token/{token}', [PortalAuthController::class, 'consumeToken'])->name('auth.token');
    Route::post('/auth/logout', [PortalAuthController::class, 'logout'])->name('auth.logout');

    // Protected
    Route::middleware('portal.auth')->group(function () {
        Route::get('/dashboard', [PortalDashboardController::class, 'index'])->name('dashboard');

        Route::get('/projects/{project}', [PortalProjectController::class, 'show'])->name('projects.show');

        Route::post('/projects/{project}/change-orders/{changeOrder}/approve', [PortalChangeOrderController::class, 'approve'])->name('change-orders.approve');
        Route::post('/projects/{project}/change-orders/{changeOrder}/reject', [PortalChangeOrderController::class, 'reject'])->name('change-orders.reject');

        Route::get('/api/timeline', [PortalTimelineController::class, 'index'])->name('api.timeline');

        Route::get('/preferences', [PortalPreferencesController::class, 'index'])->name('preferences');
        Route::patch('/preferences', [PortalPreferencesController::class, 'update'])->name('preferences.update');

        Route::get('/profile', [PortalProfileController::class, 'show'])->name('profile');
    });
});
