<?php

use App\Models\CrmAuditLog;
use App\Models\CrmLead;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

it('lists leads for authorized users', function () {
    $user = User::factory()->create()->assignRole('viewer');
    CrmLead::factory()->count(3)->create();

    $response = $this->actingAs($user)->get('/crm/leads');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('crm/leads/index'));
});

it('shows a single lead', function () {
    $user = User::factory()->create()->assignRole('viewer');
    $lead = CrmLead::factory()->create();

    $response = $this->actingAs($user)->get("/crm/leads/{$lead->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('crm/leads/show'));
});

it('can create leads via public form', function () {
    $response = $this->post('/contact/submit', [
        'name' => 'Test Person',
        'email' => 'test@example.com',
        'phone' => '1234567890',
        'message' => 'I need help with a project',
    ]);

    $response->assertRedirect(route('contact.thank-you'));
    expect(CrmLead::where('email', 'test@example.com')->exists())->toBeTrue();
});

it('can update leads with proper permission', function () {
    $user = User::factory()->create()->assignRole('manager');
    $lead = CrmLead::factory()->create();

    $response = $this->actingAs($user)->patch("/crm/leads/{$lead->id}", [
        'stage' => 'qualified',
    ]);

    $response->assertSessionHas('success');
    expect($lead->fresh()->stage)->toBe('qualified');
});

it('creates audit log on lead creation', function () {
    $lead = CrmLead::factory()->create();

    $this->assertCount(1, CrmAuditLog::where('auditable_type', $lead->getMorphClass())
        ->where('auditable_id', $lead->id)
        ->where('event', 'created')
        ->get());
});

it('creates audit log on lead stage change', function () {
    $user = User::factory()->create()->assignRole('manager');
    $lead = CrmLead::factory()->create(['stage' => 'new']);

    $this->actingAs($user)->patch("/crm/leads/{$lead->id}", ['stage' => 'qualified']);

    $this->assertCount(1, CrmAuditLog::where('auditable_type', $lead->getMorphClass())
        ->where('auditable_id', $lead->id)
        ->where('event', 'stage_changed')
        ->get());
});

it('enforces ownership isolation for sales_rep', function () {
    $otherUser = User::factory()->create();
    $rep = User::factory()->create()->assignRole('sales_rep');
    $assignedLead = CrmLead::factory()->assigned($rep->id)->create();
    $otherLead = CrmLead::factory()->assigned($otherUser->id)->create();

    $response = $this->actingAs($rep)->get('/crm/leads');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('leads.data', fn ($data) => count($data) === 1));
});

it('deletes lead with manager permission', function () {
    $user = User::factory()->create()->assignRole('manager');
    $lead = CrmLead::factory()->create();

    $response = $this->actingAs($user)->delete("/crm/leads/{$lead->id}");

    $response->assertRedirect();
    expect(CrmLead::withTrashed()->find($lead->id)->trashed())->toBeTrue();
});

it('prevents viewer from deleting leads', function () {
    $user = User::factory()->create()->assignRole('viewer');
    $lead = CrmLead::factory()->create();

    $response = $this->actingAs($user)->delete("/crm/leads/{$lead->id}");

    $response->assertForbidden();
});
