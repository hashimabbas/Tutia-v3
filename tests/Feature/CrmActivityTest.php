<?php

use App\Models\CrmActivity;
use App\Models\CrmLead;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

it('can log activity on a lead', function () {
    $user = User::factory()->create()->assignRole('sales_rep');
    $lead = CrmLead::factory()->create();

    $response = $this->actingAs($user)->post('/crm/activities', [
        'activitable_type' => $lead->getMorphClass(),
        'activitable_id' => $lead->id,
        'type' => 'note',
        'subject' => 'Called client',
    ]);

    $response->assertSessionHas('success');
    expect(CrmActivity::where('subject', 'Called client')->exists())->toBeTrue();
});

it('prevents viewer from creating activities', function () {
    $user = User::factory()->create()->assignRole('viewer');
    $lead = CrmLead::factory()->create();

    $response = $this->actingAs($user)->post('/crm/activities', [
        'activitable_type' => $lead->getMorphClass(),
        'activitable_id' => $lead->id,
        'type' => 'note',
        'subject' => 'Test',
    ]);

    $response->assertForbidden();
});
