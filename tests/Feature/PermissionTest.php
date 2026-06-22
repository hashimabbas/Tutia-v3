<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

it('has all expected permissions', function () {
    $expected = [
        'crm.leads.view',
        'crm.leads.create',
        'crm.leads.edit',
        'crm.leads.delete',
        'crm.deals.view',
        'crm.deals.create',
        'crm.deals.edit',
        'crm.deals.delete',
        'crm.activities.view',
        'crm.activities.create',
        'crm.activities.delete',
        'crm.reports.view',
        'crm.settings.manage',
        'crm.team.manage',
        'crm.audit_log.view',
    ];

    foreach ($expected as $perm) {
        expect(Permission::where('name', $perm)->exists())->toBeTrue("Permission {$perm} does not exist");
    }
});

it('assigns correct permissions to admin role', function () {
    $admin = Role::where('name', 'admin')->first();
    expect($admin->permissions)->toHaveCount(Permission::count());
});

it('assigns correct permissions to manager role', function () {
    $manager = Role::where('name', 'manager')->first();
    expect($manager->hasPermissionTo('crm.leads.delete'))->toBeTrue();
    expect($manager->hasPermissionTo('crm.deals.delete'))->toBeTrue();
});

it('assigns limited permissions to viewer role', function () {
    $viewer = Role::where('name', 'viewer')->first();
    expect($viewer->hasPermissionTo('crm.leads.view'))->toBeTrue();
    expect($viewer->hasPermissionTo('crm.leads.create'))->toBeFalse();
    expect($viewer->hasPermissionTo('crm.deals.create'))->toBeFalse();
});

it('admin can access dashboard', function () {
    $user = User::factory()->create()->assignRole('admin');

    $response = $this->actingAs($user)->get('/crm/dashboard');

    $response->assertOk();
});

it('viewer can access dashboard but not create content', function () {
    $user = User::factory()->create()->assignRole('viewer');

    $response = $this->actingAs($user)->get('/crm/dashboard');

    $response->assertOk();
});
