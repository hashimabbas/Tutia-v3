<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CrmRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()->make(PermissionRegistrar::class)->forgetCachedPermissions();

        $entities = ['leads', 'deals', 'activities', 'organizations', 'contacts', 'risks', 'issues', 'milestones', 'deliverables', 'change_orders'];
        $actions = ['view', 'create', 'edit', 'delete'];

        foreach ($entities as $entity) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "crm.{$entity}.{$action}", 'guard_name' => 'web']);
            }
        }

        Permission::firstOrCreate(['name' => 'crm.reports.view', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'crm.settings.manage', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'crm.team.manage', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'crm.audit_log.view', 'guard_name' => 'web']);

        $viewer = Role::firstOrCreate(['name' => 'viewer', 'guard_name' => 'web']);
        $viewer->syncPermissions([
            'crm.leads.view',
            'crm.deals.view',
            'crm.activities.view',
            'crm.organizations.view',
            'crm.contacts.view',
            'crm.risks.view',
            'crm.issues.view',
            'crm.milestones.view',
            'crm.deliverables.view',
            'crm.change_orders.view',
            'crm.reports.view',
        ]);

        $salesRep = Role::firstOrCreate(['name' => 'sales_rep', 'guard_name' => 'web']);
        $salesRep->syncPermissions([
            'crm.leads.view',
            'crm.leads.create',
            'crm.leads.edit',
            'crm.deals.view',
            'crm.deals.create',
            'crm.deals.edit',
            'crm.organizations.view',
            'crm.organizations.create',
            'crm.contacts.view',
            'crm.contacts.create',
            'crm.activities.view',
            'crm.activities.create',
            'crm.risks.view',
            'crm.risks.create',
            'crm.issues.view',
            'crm.issues.create',
            'crm.milestones.view',
            'crm.milestones.create',
            'crm.deliverables.view',
            'crm.deliverables.create',
            'crm.change_orders.view',
            'crm.change_orders.create',
            'crm.reports.view',
        ]);

        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $manager->syncPermissions([
            'crm.leads.view',
            'crm.leads.create',
            'crm.leads.edit',
            'crm.leads.delete',
            'crm.deals.view',
            'crm.deals.create',
            'crm.deals.edit',
            'crm.deals.delete',
            'crm.organizations.view',
            'crm.organizations.create',
            'crm.organizations.edit',
            'crm.organizations.delete',
            'crm.contacts.view',
            'crm.contacts.create',
            'crm.contacts.edit',
            'crm.contacts.delete',
            'crm.activities.view',
            'crm.activities.create',
            'crm.activities.delete',
            'crm.risks.view',
            'crm.risks.create',
            'crm.risks.edit',
            'crm.risks.delete',
            'crm.issues.view',
            'crm.issues.create',
            'crm.issues.edit',
            'crm.issues.delete',
            'crm.milestones.view',
            'crm.milestones.create',
            'crm.milestones.edit',
            'crm.milestones.delete',
            'crm.deliverables.view',
            'crm.deliverables.create',
            'crm.deliverables.edit',
            'crm.deliverables.delete',
            'crm.change_orders.view',
            'crm.change_orders.create',
            'crm.change_orders.edit',
            'crm.change_orders.delete',
            'crm.reports.view',
        ]);

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(Permission::all());
    }
}
