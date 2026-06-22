<?php

use App\Models\CrmAuditLog;
use App\Models\CrmDeal;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

it('lists deals for authorized users', function () {
    $user = User::factory()->create()->assignRole('viewer');
    CrmDeal::factory()->count(3)->create();

    $response = $this->actingAs($user)->get('/crm/deals');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('crm/deals/index'));
});

it('shows a single deal', function () {
    $user = User::factory()->create()->assignRole('viewer');
    $deal = CrmDeal::factory()->create();

    $response = $this->actingAs($user)->get("/crm/deals/{$deal->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('crm/deals/show'));
});

it('can create deals with proper permission', function () {
    $user = User::factory()->create()->assignRole('sales_rep');

    $response = $this->actingAs($user)->post('/crm/deals', [
        'title' => 'New Deal',
        'value' => 50000,
    ]);

    $response->assertRedirect();
    expect(CrmDeal::where('title', 'New Deal')->exists())->toBeTrue();
});

it('creates audit log on deal stage change to won', function () {
    $user = User::factory()->create()->assignRole('manager');
    $deal = CrmDeal::factory()->create(['stage' => 'negotiation', 'probability' => 80]);

    $this->actingAs($user)->patch("/crm/deals/{$deal->id}", ['stage' => 'closed_won']);

    $fresh = $deal->fresh();
    expect($fresh->closed_at)->not->toBeNull();
    expect($fresh->probability)->toBe(100);

    $this->assertCount(1, CrmAuditLog::where('auditable_type', $deal->getMorphClass())
        ->where('auditable_id', $deal->id)
        ->where('event', 'stage_changed')
        ->get());
});

it('enforces ownership isolation for deals', function () {
    $otherUser = User::factory()->create();
    $rep = User::factory()->create()->assignRole('sales_rep');
    CrmDeal::factory()->ownedBy($rep->id)->create();
    CrmDeal::factory()->ownedBy($otherUser->id)->create();

    $response = $this->actingAs($rep)->get('/crm/deals');

    $response->assertInertia(fn ($page) => $page->where('deals.data', fn ($data) => count($data) === 1));
});

it('prevents viewer from creating deals', function () {
    $user = User::factory()->create()->assignRole('viewer');

    $response = $this->actingAs($user)->post('/crm/deals', [
        'title' => 'Unauthorized',
        'value' => 1000,
    ]);

    $response->assertForbidden();
});

it('sets closed_at and probability 100 on won', function () {
    $deal = CrmDeal::factory()->create(['stage' => 'proposal', 'probability' => 50]);
    $user = User::factory()->create()->assignRole('manager');

    $this->actingAs($user)->patch("/crm/deals/{$deal->id}", ['stage' => 'closed_won']);

    $deal->refresh();
    expect($deal->closed_at)->not->toBeNull();
    expect($deal->probability)->toBe(100);
});
