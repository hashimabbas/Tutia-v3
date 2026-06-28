<?php

use App\Http\Controllers\Crm\Blog\BlogArticleController;
use App\Http\Controllers\Crm\Blog\BlogAuthorController;
use App\Http\Controllers\Crm\Blog\BlogCategoryController;
use App\Http\Controllers\Crm\Blog\BlogDashboardController;
use App\Http\Controllers\Crm\Blog\BlogTagController;
use Illuminate\Support\Facades\Route;

// Inertia Pages
Route::get('/crm/blog', BlogDashboardController::class)->name('crm.blog.dashboard');

Route::get('/crm/blog/articles', [BlogArticleController::class, 'index'])->name('crm.blog.articles.index');
Route::get('/crm/blog/articles/create', [BlogArticleController::class, 'create'])->name('crm.blog.articles.create');
Route::post('/crm/blog/articles', [BlogArticleController::class, 'store'])->name('crm.blog.articles.store');
Route::get('/crm/blog/articles/{article}/edit', [BlogArticleController::class, 'edit'])->name('crm.blog.articles.edit');
Route::patch('/crm/blog/articles/{article}', [BlogArticleController::class, 'update'])->name('crm.blog.articles.update');
Route::delete('/crm/blog/articles/{article}', [BlogArticleController::class, 'destroy'])->name('crm.blog.articles.destroy');
Route::post('/crm/blog/articles/{article}/duplicate', [BlogArticleController::class, 'duplicate'])->name('crm.blog.articles.duplicate');
Route::post('/crm/blog/articles/{article}/toggle-published', [BlogArticleController::class, 'togglePublished'])->name('crm.blog.articles.toggle-published');
Route::post('/crm/blog/articles/{article}/status', [BlogArticleController::class, 'updateStatus'])->name('crm.blog.articles.status');
Route::post('/crm/blog/articles/bulk-delete', [BlogArticleController::class, 'bulkDelete'])->name('crm.blog.articles.bulk-delete');
Route::post('/crm/blog/articles/bulk-status', [BlogArticleController::class, 'bulkStatus'])->name('crm.blog.articles.bulk-status');
Route::post('/crm/blog/upload-image', [BlogArticleController::class, 'uploadImage'])->name('crm.blog.upload-image');

// Categories
Route::get('/crm/blog/categories', [BlogCategoryController::class, 'index'])->name('crm.blog.categories.index');
Route::post('/crm/blog/categories', [BlogCategoryController::class, 'store'])->name('crm.blog.categories.store');
Route::patch('/crm/blog/categories/{category}', [BlogCategoryController::class, 'update'])->name('crm.blog.categories.update');
Route::delete('/crm/blog/categories/{category}', [BlogCategoryController::class, 'destroy'])->name('crm.blog.categories.destroy');

// Tags
Route::get('/crm/blog/tags', [BlogTagController::class, 'index'])->name('crm.blog.tags.index');
Route::post('/crm/blog/tags', [BlogTagController::class, 'store'])->name('crm.blog.tags.store');
Route::patch('/crm/blog/tags/{tag}', [BlogTagController::class, 'update'])->name('crm.blog.tags.update');
Route::delete('/crm/blog/tags/{tag}', [BlogTagController::class, 'destroy'])->name('crm.blog.tags.destroy');

// Authors
Route::get('/crm/blog/authors', [BlogAuthorController::class, 'index'])->name('crm.blog.authors.index');
Route::post('/crm/blog/authors', [BlogAuthorController::class, 'store'])->name('crm.blog.authors.store');
Route::patch('/crm/blog/authors/{author}', [BlogAuthorController::class, 'update'])->name('crm.blog.authors.update');
Route::delete('/crm/blog/authors/{author}', [BlogAuthorController::class, 'destroy'])->name('crm.blog.authors.destroy');
