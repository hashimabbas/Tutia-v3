<?php

use App\Http\Controllers\Crm\ActivityController;
use App\Http\Controllers\Crm\ChangeOrderController;
use App\Http\Controllers\Crm\ContactController;
use App\Http\Controllers\Crm\CrmDashboardController;
use App\Http\Controllers\Crm\CrmIssueController;
use App\Http\Controllers\Crm\CrmProjectRiskController;
use App\Http\Controllers\Crm\DealController;
use App\Http\Controllers\Crm\DeliverableController;
use App\Http\Controllers\Crm\ForecastController;
use App\Http\Controllers\Crm\ImportController;
use App\Http\Controllers\Crm\LeadController as CrmLeadController;
use App\Http\Controllers\Crm\MilestoneController;
use App\Http\Controllers\Crm\OrganizationController;
use App\Http\Controllers\Crm\PipelineController;
use App\Http\Controllers\Crm\ProductCatalogController;
use App\Http\Controllers\Crm\ProjectController;
use App\Http\Controllers\Crm\QuotationController;
use App\Http\Controllers\Crm\TimelineController;
use App\Http\Controllers\CrmController;
use App\Http\Controllers\PlatformController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — TUTIA Website
|--------------------------------------------------------------------------
*/

// Core Pages
Route::inertia('/', 'home')->name('home');
Route::inertia('/about', 'about/index')->name('about');
Route::inertia('/about/leadership', 'about/leadership')->name('about.leadership');
Route::inertia('/about/team', 'about/team')->name('about.team');
Route::inertia('/about/values', 'about/values')->name('about.values');
Route::inertia('/about/culture', 'about/culture')->name('about.culture');

// Services Overview
Route::inertia('/services', 'services/index')->name('services');

// Service Categories
Route::inertia('/services/commerce', 'services/categories/commerce')->name('services.commerce');
Route::inertia('/services/enterprise', 'services/categories/enterprise')->name('services.enterprise');
Route::inertia('/services/digital', 'services/categories/digital')->name('services.digital');
Route::inertia('/services/infrastructure', 'services/categories/infrastructure')->name('services.infrastructure');

// Individual Services
Route::inertia('/services/ecommerce', 'services/ecommerce')->name('services.ecommerce');
Route::inertia('/services/payment-gateway', 'services/payment-gateway')->name('services.payment-gateway');
Route::inertia('/services/bulk-sms', 'services/bulk-sms')->name('services.bulk-sms');
Route::inertia('/services/erp', 'services/erp')->name('services.erp');
Route::inertia('/services/ticketing', 'services/ticketing')->name('services.ticketing');
Route::inertia('/services/call-center', 'services/call-center')->name('services.call-center');
Route::inertia('/services/web-development', 'services/web-development')->name('services.web-development');
Route::inertia('/services/mobile-apps', 'services/mobile-apps')->name('services.mobile-apps');
Route::inertia('/services/connectivity', 'services/connectivity')->name('services.connectivity');
Route::inertia('/services/vpn', 'services/vpn')->name('services.vpn');
Route::inertia('/services/consulting', 'services/consulting')->name('services.consulting');

// Platform — Matger-TUTIA
Route::inertia('/platform', 'platform/index')->name('platform');
Route::inertia('/platform/sellers', 'platform/sellers')->name('platform.sellers');
Route::inertia('/platform/buyers', 'platform/buyers')->name('platform.buyers');
Route::inertia('/platform/apps', 'platform/apps')->name('platform.apps');

// Work — Case Studies
Route::inertia('/work', 'work/index')->name('work');
Route::inertia('/work/matger-tutia', 'work/matger-tutia')->name('work.matger-tutia');
Route::inertia('/work/erp-implementation', 'work/erp-implementation')->name('work.erp');
Route::inertia('/work/connectivity-project', 'work/connectivity-project')->name('work.connectivity');
Route::inertia('/work/web-platform', 'work/web-platform')->name('work.web');
Route::inertia('/work/mobile-app', 'work/mobile-app')->name('work.mobile');
Route::inertia('/work/ticketing-system', 'work/ticketing-system')->name('work.ticketing');

// Insights
Route::inertia('/insights', 'insights/index')->name('insights');
Route::inertia('/insights/blog', 'insights/blog')->name('insights.blog');
Route::inertia('/insights/case-studies', 'insights/case-studies')->name('insights.case-studies');
Route::inertia('/insights/resources', 'insights/resources')->name('insights.resources');

// Contact — CRM
Route::inertia('/contact', 'contact/index')->name('contact');
Route::inertia('/contact/consultation', 'contact/consultation')->name('contact.consultation');
Route::inertia('/contact/proposal', 'contact/proposal')->name('contact.proposal');
Route::inertia('/contact/sales', 'contact/sales')->name('contact.sales');
Route::inertia('/contact/quote', 'contact/quote')->name('contact.quote');
Route::inertia('/contact/thank-you', 'contact/thank-you')->name('contact.thank-you');

// Legal
Route::inertia('/legal/privacy', 'legal/privacy')->name('legal.privacy');
Route::inertia('/legal/terms', 'legal/terms')->name('legal.terms');
Route::inertia('/legal/cookies', 'legal/cookies')->name('legal.cookies');

// Industries
Route::inertia('/industries', 'industries/index')->name('industries');
Route::inertia('/industries/retail-ecommerce', 'industries/retail-ecommerce')->name('industries.retail');
Route::inertia('/industries/travel-tourism', 'industries/travel-tourism')->name('industries.travel');
Route::inertia('/industries/telecommunications', 'industries/telecommunications')->name('industries.telecom');
Route::inertia('/industries/banking-finance', 'industries/banking-finance')->name('industries.finance');
Route::inertia('/industries/government', 'industries/government')->name('industries.government');

// CRM Form Submissions
Route::post('/platform/register', [PlatformController::class, 'register'])->name('platform.register');
Route::post('/contact/submit', [CrmController::class, 'submit'])->name('contact.submit');
Route::post('/contact/consultation', [CrmController::class, 'consultation'])->name('contact.consultation.book');
Route::post('/contact/proposal', [CrmController::class, 'proposal'])->name('contact.proposal.submit');
Route::post('/contact/quote', [CrmController::class, 'quote'])->name('contact.quote.submit');
Route::post('/newsletter/subscribe', [CrmController::class, 'subscribe'])->name('newsletter.subscribe');

/*
|--------------------------------------------------------------------------
| Auth Routes (Keep existing)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    require __DIR__.'/workflow-management.php';
    require __DIR__.'/approval-management.php';
    require __DIR__.'/analytics.php';

    // --- CRM Routes ---
    Route::prefix('crm')->name('crm.')->group(function () {
        Route::get('/', function () {
            return redirect()->route('crm.dashboard');
        });
        Route::get('/dashboard', CrmDashboardController::class)->name('dashboard');

        // Leads
        Route::get('/leads', [CrmLeadController::class, 'index'])->name('leads.index');
        Route::get('/leads/create', [CrmLeadController::class, 'create'])->name('leads.create');
        Route::get('/leads/{lead}/edit', [CrmLeadController::class, 'edit'])->name('leads.edit');
        Route::post('/leads', [CrmLeadController::class, 'store'])->name('leads.store');
        Route::get('/leads/{lead}', [CrmLeadController::class, 'show'])->name('leads.show');
        Route::patch('/leads/{lead}', [CrmLeadController::class, 'update'])->name('leads.update');
        Route::delete('/leads/{lead}', [CrmLeadController::class, 'destroy'])->name('leads.destroy');
        Route::post('/leads/bulk-update', [CrmLeadController::class, 'bulkUpdate'])->name('leads.bulk-update');

        // Deals
        Route::get('/deals', [DealController::class, 'index'])->name('deals.index');
        Route::get('/deals/create', [DealController::class, 'create'])->name('deals.create');
        Route::get('/deals/{deal}/edit', [DealController::class, 'edit'])->name('deals.edit');
        Route::get('/deals/{deal}', [DealController::class, 'show'])->name('deals.show');
        Route::post('/deals', [DealController::class, 'store'])->name('deals.store');
        Route::patch('/deals/{deal}', [DealController::class, 'update'])->name('deals.update');
        Route::delete('/deals/{deal}', [DealController::class, 'destroy'])->name('deals.destroy');

        // Activities
        Route::post('/activities', [ActivityController::class, 'store'])->name('activities.store');
        Route::post('/activities/{activity}/complete', [ActivityController::class, 'complete'])->name('activities.complete');
        Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');

        // Organizations
        Route::get('/organizations', [OrganizationController::class, 'index'])->name('organizations.index');
        Route::get('/organizations/create', [OrganizationController::class, 'create'])->name('organizations.create');
        Route::get('/organizations/{organization}/edit', [OrganizationController::class, 'edit'])->name('organizations.edit');
        Route::get('/organizations/{organization}', [OrganizationController::class, 'show'])->name('organizations.show');
        Route::post('/organizations', [OrganizationController::class, 'store'])->name('organizations.store');
        Route::patch('/organizations/{organization}', [OrganizationController::class, 'update'])->name('organizations.update');
        Route::delete('/organizations/{organization}', [OrganizationController::class, 'destroy'])->name('organizations.destroy');

        // Contacts
        Route::get('/contacts', [ContactController::class, 'index'])->name('contacts.index');
        Route::get('/contacts/create', [ContactController::class, 'create'])->name('contacts.create');
        Route::get('/contacts/{contact}/edit', [ContactController::class, 'edit'])->name('contacts.edit');
        Route::get('/contacts/{contact}', [ContactController::class, 'show'])->name('contacts.show');
        Route::post('/contacts', [ContactController::class, 'store'])->name('contacts.store');
        Route::patch('/contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
        Route::delete('/contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');

        // Imports
        Route::get('/imports', [ImportController::class, 'index'])->name('imports.index');
        Route::get('/imports/{import}', [ImportController::class, 'show'])->name('imports.show');
        Route::post('/imports', [ImportController::class, 'store'])->name('imports.store');

        // Timeline (API JSON)
        Route::get('/timeline', TimelineController::class)->name('timeline');

        // CRM-3: Products Catalog
        Route::get('/products', [ProductCatalogController::class, 'index'])->name('products.index');
        Route::get('/products/create', [ProductCatalogController::class, 'create'])->name('products.create');
        Route::get('/products/{product}/edit', [ProductCatalogController::class, 'edit'])->name('products.edit');
        Route::get('/products/{product}', [ProductCatalogController::class, 'show'])->name('products.show');
        Route::post('/products', [ProductCatalogController::class, 'store'])->name('products.store');
        Route::patch('/products/{product}', [ProductCatalogController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductCatalogController::class, 'destroy'])->name('products.destroy');

        // CRM-3: Quotations
        Route::get('/deals/{deal}/quotations', [QuotationController::class, 'index'])->name('quotations.index');
        Route::get('/quotations/{quotation}', [QuotationController::class, 'show'])->name('quotations.show');
        Route::post('/deals/{deal}/quotations', [QuotationController::class, 'store'])->name('quotations.store');
        Route::post('/quotations/{quotation}/clone', [QuotationController::class, 'clone'])->name('quotations.clone');
        Route::patch('/quotations/{quotation}', [QuotationController::class, 'update'])->name('quotations.update');

        // CRM-3: Forecast
        Route::get('/forecast', [ForecastController::class, 'index'])->name('forecast.index');

        // CRM-3: Pipeline
        Route::get('/pipeline', [PipelineController::class, 'index'])->name('pipeline.index');

        // CRM-4: Project Risks
        Route::get('/projects/{project}/risks', [CrmProjectRiskController::class, 'index'])->name('projects.risks.index');
        Route::post('/projects/{project}/risks', [CrmProjectRiskController::class, 'store'])->name('projects.risks.store');
        Route::patch('/projects/{project}/risks/{risk}', [CrmProjectRiskController::class, 'update'])->name('projects.risks.update');
        Route::delete('/projects/{project}/risks/{risk}', [CrmProjectRiskController::class, 'destroy'])->name('projects.risks.destroy');

        // CRM-4: Project Issues
        Route::get('/projects/{project}/issues', [CrmIssueController::class, 'index'])->name('projects.issues.index');
        Route::post('/projects/{project}/issues', [CrmIssueController::class, 'store'])->name('projects.issues.store');
        Route::patch('/projects/{project}/issues/{issue}', [CrmIssueController::class, 'update'])->name('projects.issues.update');
        Route::delete('/projects/{project}/issues/{issue}', [CrmIssueController::class, 'destroy'])->name('projects.issues.destroy');

        // CRM-4: Projects
        Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
        Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
        Route::patch('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
        Route::post('/projects/{project}/archive', [ProjectController::class, 'archive'])->name('projects.archive');
        Route::post('/projects/{project}/restore', [ProjectController::class, 'restore'])->name('projects.restore');

        // CRM-4: Milestones
        Route::get('/projects/{project}/milestones', [MilestoneController::class, 'index'])->name('projects.milestones.index');
        Route::post('/projects/{project}/milestones', [MilestoneController::class, 'store'])->name('projects.milestones.store');
        Route::patch('/projects/{project}/milestones/{milestone}', [MilestoneController::class, 'update'])->name('projects.milestones.update');
        Route::post('/projects/{project}/milestones/{milestone}/complete', [MilestoneController::class, 'complete'])->name('projects.milestones.complete');
        Route::post('/projects/{project}/milestones/{milestone}/reopen', [MilestoneController::class, 'reopen'])->name('projects.milestones.reopen');
        Route::delete('/projects/{project}/milestones/{milestone}', [MilestoneController::class, 'destroy'])->name('projects.milestones.destroy');

        // CRM-4: Deliverables
        Route::get('/projects/{project}/milestones/{milestone}/deliverables', [DeliverableController::class, 'index'])->name('projects.milestones.deliverables.index');
        Route::post('/projects/{project}/milestones/{milestone}/deliverables', [DeliverableController::class, 'store'])->name('projects.milestones.deliverables.store');
        Route::patch('/projects/{project}/milestones/{milestone}/deliverables/{deliverable}', [DeliverableController::class, 'update'])->name('projects.milestones.deliverables.update');
        Route::post('/projects/{project}/milestones/{milestone}/deliverables/{deliverable}/complete', [DeliverableController::class, 'complete'])->name('projects.milestones.deliverables.complete');
        Route::post('/projects/{project}/milestones/{milestone}/deliverables/{deliverable}/approve', [DeliverableController::class, 'approve'])->name('projects.milestones.deliverables.approve');
        Route::delete('/projects/{project}/milestones/{milestone}/deliverables/{deliverable}', [DeliverableController::class, 'destroy'])->name('projects.milestones.deliverables.destroy');

        // CRM-4: Change Orders
        Route::get('/projects/{project}/change-orders', [ChangeOrderController::class, 'index'])->name('projects.change-orders.index');
        Route::post('/projects/{project}/change-orders', [ChangeOrderController::class, 'store'])->name('projects.change-orders.store');
        Route::patch('/projects/{project}/change-orders/{changeOrder}', [ChangeOrderController::class, 'update'])->name('projects.change-orders.update');
        Route::post('/projects/{project}/change-orders/{changeOrder}/approve', [ChangeOrderController::class, 'approve'])->name('projects.change-orders.approve');
        Route::post('/projects/{project}/change-orders/{changeOrder}/reject', [ChangeOrderController::class, 'reject'])->name('projects.change-orders.reject');
        Route::delete('/projects/{project}/change-orders/{changeOrder}', [ChangeOrderController::class, 'destroy'])->name('projects.change-orders.destroy');
    });
});

require __DIR__.'/settings.php';
