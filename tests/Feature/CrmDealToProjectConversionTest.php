<?php

use App\Models\CrmActivity;
use App\Models\CrmContact;
use App\Models\CrmContactInfluenceType;
use App\Models\CrmDeal;
use App\Models\CrmMilestone;
use App\Models\CrmOrganization;
use App\Models\CrmProduct;
use App\Models\CrmProject;
use App\Models\CrmProjectTemplate;
use App\Models\CrmQuotation;
use App\Models\CrmQuotationItem;
use App\Models\User;
use App\Services\Crm\Conversion\CrmDealToProjectConversionService;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'CrmProjectTemplateSeeder']);
});

function createUser(): User
{
    return User::factory()->create()->assignRole('manager');
}

function createOrganization(User $user): CrmOrganization
{
    return CrmOrganization::factory()->create([
        'name' => 'Test Organization',
        'created_by' => $user->id,
    ]);
}

function createContact(User $user, CrmOrganization $org, string $influenceSlug = 'decision_maker'): CrmContact
{
    $influenceType = CrmContactInfluenceType::where('slug', $influenceSlug)->first();

    return CrmContact::create([
        'organization_id' => $org->id,
        'first_name' => 'Test',
        'last_name' => 'Contact',
        'email' => 'contact@test.com',
        'phone' => '123456789',
        'influence_type_id' => $influenceType?->id,
        'created_by' => $user->id,
    ]);
}

function createConversionTestDeal(?User $user = null, array $overrides = []): CrmDeal
{
    $user ??= createUser();
    $organization = createOrganization($user);
    $contact = createContact($user, $organization);

    $product = CrmProduct::create([
        'name' => 'ERP Implementation',
        'category' => 'erp',
        'type' => 'service',
        'unit_price' => 50000,
        'unit_type' => 'fixed',
        'is_active' => true,
    ]);

    $deal = CrmDeal::factory()->won()->create(array_merge([
        'title' => 'Enterprise ERP Deal',
        'value' => 50000,
        'organization_id' => $organization->id,
        'contact_id' => $contact->id,
        'owner_id' => $user->id,
    ], $overrides));

    $quotation = CrmQuotation::create([
        'deal_id' => $deal->id,
        'status' => 'accepted',
        'version' => 1,
        'subtotal' => 50000,
        'grand_total' => 57500,
        'created_by' => $user->id,
    ]);

    CrmQuotationItem::create([
        'quotation_id' => $quotation->id,
        'product_id' => $product->id,
        'product_name' => 'ERP Implementation',
        'quantity' => 1,
        'unit_price' => 50000,
        'net_price' => 50000,
        'total' => 50000,
        'sort_order' => 1,
    ]);

    return $deal->fresh();
}

it('converts a won deal to a project with template auto-selection', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $result = app(CrmDealToProjectConversionService::class)->convert($deal, $user);

    expect($result->project_id)->toBeGreaterThan(0);
    expect($result->milestones_created)->toBeGreaterThan(0);
    expect($result->deliverables_created)->toBeGreaterThan(0);
    expect($result->stakeholders_created)->toBeGreaterThan(0);
    expect($result->products_mapped)->toBe(1);
    expect($result->warnings)->toBeEmpty();

    $project = CrmProject::find($result->project_id);
    expect($project)->not->toBeNull();
    expect($project->deal_id)->toBe($deal->id);
    expect($project->organization_id)->toBe($deal->organization_id);
    expect($project->name)->toBe($deal->title);
    expect($project->status)->toBe('planned');
    expect($project->contract_value)->toEqual((float) $deal->value);
    expect($project->template_id)->not->toBeNull();

    $deal->refresh();
    expect($deal->converted_to_project_at)->not->toBeNull();

    expect($project->milestones->count())->toBe($result->milestones_created);
    expect($project->stakeholders->count())->toBe($result->stakeholders_created);

    $auditLog = $deal->auditLogs()->where('event', 'converted_to_project')->first();
    expect($auditLog)->not->toBeNull();
    expect($auditLog->new_values['project_id'])->toBe($project->id);

    $timelineEvent = $deal->activities()->where('type', 'deal_converted_to_project')->first();
    expect($timelineEvent)->not->toBeNull();
});

it('prevents duplicate conversion of the same deal', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $service = app(CrmDealToProjectConversionService::class);
    $service->convert($deal, $user);

    expect(fn () => $service->convert($deal->fresh(), $user))
        ->toThrow(ValidationException::class, 'already been converted');
});

it('prevents conversion of non-won deals', function () {
    $deal = createConversionTestDeal(null, ['stage' => 'negotiation', 'probability' => 80, 'closed_at' => null]);

    expect(fn () => app(CrmDealToProjectConversionService::class)->convert($deal->fresh(), createUser()))
        ->toThrow(ValidationException::class, 'Only won deals');
});

it('prevents conversion of deals without organization', function () {
    $user = createUser();
    $organization = createOrganization($user);
    $contact = createContact($user, $organization);
    $deal = CrmDeal::factory()->won()->create([
        'organization_id' => null,
        'contact_id' => $contact->id,
        'owner_id' => $user->id,
    ]);

    expect(fn () => app(CrmDealToProjectConversionService::class)->convert($deal->fresh(), $user))
        ->toThrow(ValidationException::class, 'must have an organization');
});

it('auto-selects ERP template for ERP product category', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $result = app(CrmDealToProjectConversionService::class)->convert($deal, $user);

    $project = CrmProject::find($result->project_id);
    expect($project->template->category)->toBe('erp');

    $milestoneNames = $project->milestones->pluck('name')->toArray();
    expect($milestoneNames)->toContain('Discovery');
    expect($milestoneNames)->toContain('Go Live');
});

it('uses explicit template when template_id is provided', function () {
    $deal = createConversionTestDeal();
    $user = createUser();
    $vpnTemplate = CrmProjectTemplate::where('category', 'vpn')->first();

    $result = app(CrmDealToProjectConversionService::class)->convert($deal, $user, $vpnTemplate->id);

    $project = CrmProject::find($result->project_id);
    expect($project->template_id)->toBe($vpnTemplate->id);

    $milestoneNames = $project->milestones->pluck('name')->toArray();
    expect($milestoneNames)->toContain('Provisioning');
    expect($milestoneNames)->not->toContain('Discovery');
});

it('creates project members from deal owner', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $result = app(CrmDealToProjectConversionService::class)->convert($deal, $user);

    $project = CrmProject::find($result->project_id);
    $member = $project->members()->where('user_id', $deal->owner_id)->first();
    expect($member)->not->toBeNull();
    expect($member->role)->toBe('project_manager');
});

it('wraps conversion in an atomic database transaction', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $service = app(CrmDealToProjectConversionService::class);
    $result = $service->convert($deal, $user);

    expect(CrmProject::find($result->project_id))->not->toBeNull();

    DB::beginTransaction();
    $deal2 = createConversionTestDeal(null, ['title' => 'Rollback Deal']);
    $result2 = $service->convert($deal2->fresh(), $user);
    DB::rollBack();

    expect(CrmProject::where('deal_id', $deal2->id)->count())->toBe(0);
    expect(CrmMilestone::where('project_id', $result2->project_id)->count())->toBe(0);
});

it('creates timeline events for each milestone', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $result = app(CrmDealToProjectConversionService::class)->convert($deal, $user);

    $project = CrmProject::find($result->project_id);

    $milestoneEvents = CrmActivity::where('activitable_type', $project->getMorphClass())
        ->where('activitable_id', $project->id)
        ->where('type', 'milestone_created')
        ->get();

    expect($milestoneEvents)->toHaveCount($result->milestones_created);
});

it('migrates stakeholders with correct project roles', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $result = app(CrmDealToProjectConversionService::class)->convert($deal, $user);

    $project = CrmProject::find($result->project_id);

    $stakeholder = $project->stakeholders()->first();
    expect($stakeholder)->not->toBeNull();
    expect($stakeholder->derived_from_deal_id)->toBe($deal->id);
    expect($stakeholder->influence_type_at_conversion)->toBe('decision_maker');
    expect($stakeholder->project_role)->toBe('sponsor');
    expect($stakeholder->is_active)->toBeTrue();
});

it('falls back to consulting template when no product category matches', function () {
    $user = createUser();
    $organization = createOrganization($user);
    $contact = createContact($user, $organization);

    CrmProduct::create([
        'name' => 'Unknown Service',
        'category' => 'unknown_category',
        'type' => 'service',
        'unit_price' => 10000,
        'unit_type' => 'fixed',
        'is_active' => true,
    ]);

    $deal = CrmDeal::factory()->won()->create([
        'title' => 'Generic Deal',
        'value' => 10000,
        'organization_id' => $organization->id,
        'contact_id' => $contact->id,
        'owner_id' => $user->id,
    ]);

    $quotation = CrmQuotation::create([
        'deal_id' => $deal->id,
        'status' => 'accepted',
        'version' => 1,
        'subtotal' => 10000,
        'grand_total' => 11500,
        'created_by' => $user->id,
    ]);

    $product = CrmProduct::where('name', 'Unknown Service')->first();
    CrmQuotationItem::create([
        'quotation_id' => $quotation->id,
        'product_id' => $product->id,
        'product_name' => 'Unknown Service',
        'quantity' => 1,
        'unit_price' => 10000,
        'net_price' => 10000,
        'total' => 10000,
        'sort_order' => 1,
    ]);

    $result = app(CrmDealToProjectConversionService::class)->convert($deal->fresh(), $user);

    $project = CrmProject::find($result->project_id);
    expect($project->template->category)->toBe('consulting');
});

it('creates deliverables for each template deliverable definition', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $result = app(CrmDealToProjectConversionService::class)->convert($deal, $user);

    $project = CrmProject::find($result->project_id);
    $totalDeliverables = $project->milestones->sum(fn ($m) => $m->deliverables->count());
    expect($totalDeliverables)->toBe($result->deliverables_created);
    expect($totalDeliverables)->toBeGreaterThan(0);
});

it('sets start_date and target_end_date when provided', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $result = app(CrmDealToProjectConversionService::class)->convert($deal, $user, null, '2026-07-01', '2026-09-01');

    $project = CrmProject::find($result->project_id);
    expect($project->start_date->format('Y-m-d'))->toBe('2026-07-01');
    expect($project->target_end_date->format('Y-m-d'))->toBe('2026-09-01');

    $firstMilestone = $project->milestones()->orderBy('sort_order')->first();
    expect($firstMilestone->start_date->format('Y-m-d'))->toBe('2026-07-01');
});

it('counts products from accepted quotation', function () {
    $deal = createConversionTestDeal();
    $user = createUser();

    $quotation = $deal->quotations()->where('status', 'accepted')->first();
    CrmProduct::create([
        'name' => 'VPN Setup',
        'category' => 'vpn',
        'type' => 'service',
        'unit_price' => 15000,
        'unit_type' => 'fixed',
        'is_active' => true,
    ]);

    $secondProduct = CrmProduct::where('name', 'VPN Setup')->first();
    CrmQuotationItem::create([
        'quotation_id' => $quotation->id,
        'product_id' => $secondProduct->id,
        'product_name' => 'VPN Setup',
        'quantity' => 1,
        'unit_price' => 15000,
        'net_price' => 15000,
        'total' => 15000,
        'sort_order' => 2,
    ]);

    $result = app(CrmDealToProjectConversionService::class)->convert($deal->fresh(), $user);

    expect($result->products_mapped)->toBe(2);
});
