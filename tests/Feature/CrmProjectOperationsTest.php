<?php

use App\Events\Crm\ChangeOrderApproved;
use App\Events\Crm\DeliverableCompleted;
use App\Events\Crm\MilestoneCompleted;
use App\Models\CrmChangeOrder;
use App\Models\CrmDeliverable;
use App\Models\CrmMilestone;
use App\Models\CrmProject;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

function opsManager(): User
{
    return User::factory()->create()->assignRole('manager');
}

function opsViewer(): User
{
    return User::factory()->create()->assignRole('viewer');
}

function opsProject(User $user): CrmProject
{
    return CrmProject::factory()->create(['created_by' => $user->id]);
}

// ─── Project Tests ────────────────────────────────────────────

describe('CrmProject', function () {

    it('lists all projects', function () {
        $user = opsManager();
        opsProject($user);

        $response = $this->actingAs($user)->get(route('crm.projects.index'));

        $response->assertOk();
    });

    it('shows a single project with relations', function () {
        $user = opsManager();
        $project = opsProject($user);
        CrmMilestone::factory()->count(2)->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)->get(route('crm.projects.show', $project));

        $response->assertOk();
    });

    it('updates project fields', function () {
        $user = opsManager();
        $project = opsProject($user);

        $this->actingAs($user)->patch(route('crm.projects.update', $project), [
            'name' => 'Updated Name',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('crm_projects', [
            'id' => $project->id,
            'name' => 'Updated Name',
            'status' => 'active',
        ]);
    });

    it('archives and restores a project', function () {
        $user = opsManager();
        $project = opsProject($user);

        $this->actingAs($user)->post(route('crm.projects.archive', $project));
        $this->assertDatabaseHas('crm_projects', ['id' => $project->id, 'status' => 'archived']);

        $this->actingAs($user)->post(route('crm.projects.restore', $project));
        $this->assertDatabaseHas('crm_projects', ['id' => $project->id, 'status' => 'active']);
    });

    it('filters projects by status', function () {
        $user = opsManager();
        opsProject($user)->update(['status' => 'active']);
        opsProject($user)->update(['status' => 'completed']);

        $response = $this->actingAs($user)->get(route('crm.projects.index', ['status' => 'active']));
        $response->assertOk();
    });

    it('viewer can list projects', function () {
        $user = opsViewer();
        $this->actingAs($user)->get(route('crm.projects.index'))->assertOk();
    });
});

// ─── Milestone Tests ──────────────────────────────────────────

describe('CrmMilestone', function () {

    it('manager can create a milestone', function () {
        $user = opsManager();
        $project = opsProject($user);

        $this->actingAs($user)->post(route('crm.projects.milestones.store', $project), [
            'name' => 'Design Phase',
            'description' => 'Complete the design documents',
        ]);

        $this->assertDatabaseHas('crm_milestones', [
            'project_id' => $project->id,
            'name' => 'Design Phase',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'milestone_created',
        ]);
    });

    it('manager can complete a milestone', function () {
        Event::fake();
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->inProgress()->create([
            'project_id' => $project->id,
        ]);

        $this->actingAs($user)->post(route('crm.projects.milestones.complete', [$project, $milestone]));

        $this->assertDatabaseHas('crm_milestones', [
            'id' => $milestone->id,
            'status' => 'completed',
        ]);
        $this->assertNotNull($milestone->fresh()->actual_end_date);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'milestone_completed',
        ]);

        Event::assertDispatched(MilestoneCompleted::class);
    });

    it('manager can reopen a milestone', function () {
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->completed()->create([
            'project_id' => $project->id,
        ]);

        $this->actingAs($user)->post(route('crm.projects.milestones.reopen', [$project, $milestone]));

        $this->assertDatabaseHas('crm_milestones', [
            'id' => $milestone->id,
            'status' => 'in_progress',
        ]);
        $this->assertNull($milestone->fresh()->actual_end_date);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'milestone_reopened',
        ]);
    });

    it('manager can update a milestone', function () {
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user)->patch(route('crm.projects.milestones.update', [$project, $milestone]), [
            'name' => 'Updated Phase',
        ]);

        $this->assertDatabaseHas('crm_milestones', ['id' => $milestone->id, 'name' => 'Updated Phase']);
    });

    it('manager can delete a milestone', function () {
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user)->delete(route('crm.projects.milestones.destroy', [$project, $milestone]));

        $this->assertDatabaseMissing('crm_milestones', ['id' => $milestone->id]);
    });

    it('viewer can list milestones but not create them', function () {
        $user = opsViewer();
        $project = opsProject(User::factory()->create()->assignRole('manager'));

        $this->actingAs($user)->get(route('crm.projects.milestones.index', $project))->assertOk();
        $this->actingAs($user)->post(route('crm.projects.milestones.store', $project), [
            'name' => 'Should fail',
        ])->assertForbidden();
    });

    it('filters milestones by status', function () {
        $user = opsManager();
        $project = opsProject($user);
        CrmMilestone::factory()->count(2)->pending()->create(['project_id' => $project->id]);
        CrmMilestone::factory()->completed()->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)->get(route('crm.projects.milestones.index', [$project, 'status' => 'pending']));
        $response->assertOk();
    });
});

// ─── Deliverable Tests ────────────────────────────────────────

describe('CrmDeliverable', function () {

    it('manager can create a deliverable', function () {
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user)->post(route('crm.projects.milestones.deliverables.store', [$project, $milestone]), [
            'name' => 'API Documentation',
            'description' => 'Write API docs',
            'is_visible_to_customer' => true,
        ]);

        $this->assertDatabaseHas('crm_deliverables', [
            'milestone_id' => $milestone->id,
            'name' => 'API Documentation',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'deliverable_created',
        ]);
    });

    it('manager can complete a deliverable', function () {
        Event::fake();
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);
        $deliverable = CrmDeliverable::factory()->pending()->create(['milestone_id' => $milestone->id]);

        $this->actingAs($user)->post(
            route('crm.projects.milestones.deliverables.complete', [$project, $milestone, $deliverable])
        );

        $this->assertDatabaseHas('crm_deliverables', ['id' => $deliverable->id, 'status' => 'completed']);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'deliverable_completed',
        ]);

        Event::assertDispatched(DeliverableCompleted::class);
    });

    it('manager can approve a deliverable', function () {
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);
        $deliverable = CrmDeliverable::factory()->completed()->create(['milestone_id' => $milestone->id]);

        $this->actingAs($user)->post(
            route('crm.projects.milestones.deliverables.approve', [$project, $milestone, $deliverable])
        );

        $this->assertDatabaseHas('crm_deliverables', [
            'id' => $deliverable->id,
            'status' => 'approved',
        ]);
        $this->assertNotNull($deliverable->fresh()->customer_approved_at);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'deliverable_approved',
        ]);
    });

    it('manager can update a deliverable', function () {
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);
        $deliverable = CrmDeliverable::factory()->create(['milestone_id' => $milestone->id]);

        $this->actingAs($user)->patch(
            route('crm.projects.milestones.deliverables.update', [$project, $milestone, $deliverable]),
            ['name' => 'Updated Doc']
        );

        $this->assertDatabaseHas('crm_deliverables', ['id' => $deliverable->id, 'name' => 'Updated Doc']);
    });

    it('manager can delete a deliverable', function () {
        $user = opsManager();
        $project = opsProject($user);
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);
        $deliverable = CrmDeliverable::factory()->create(['milestone_id' => $milestone->id]);

        $this->actingAs($user)->delete(
            route('crm.projects.milestones.deliverables.destroy', [$project, $milestone, $deliverable])
        );

        $this->assertDatabaseMissing('crm_deliverables', ['id' => $deliverable->id]);
    });

    it('viewer can list deliverables but not create them', function () {
        $user = opsViewer();
        $project = opsProject(User::factory()->create()->assignRole('manager'));
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user)->get(
            route('crm.projects.milestones.deliverables.index', [$project, $milestone])
        )->assertOk();

        $this->actingAs($user)->post(
            route('crm.projects.milestones.deliverables.store', [$project, $milestone]),
            ['name' => 'Should fail']
        )->assertForbidden();
    });
});

// ─── Change Order Tests ───────────────────────────────────────

describe('CrmChangeOrder', function () {

    it('manager can create a change order', function () {
        $user = opsManager();
        $project = opsProject($user);

        $this->actingAs($user)->post(route('crm.projects.change-orders.store', $project), [
            'title' => 'Extra server',
            'description' => 'Additional server required',
            'cost_impact' => 5000,
            'timeline_impact_days' => 14,
        ]);

        $this->assertDatabaseHas('crm_change_orders', [
            'project_id' => $project->id,
            'title' => 'Extra server',
            'status' => 'identified',
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'change_order_created',
        ]);
    });

    it('manager can approve a change order and update project financials', function () {
        Event::fake();
        $user = opsManager();
        $project = opsProject($user);
        $project->update(['contract_value' => 100000, 'change_order_total' => 0]);
        $changeOrder = CrmChangeOrder::factory()->identified()->create([
            'project_id' => $project->id,
            'cost_impact' => 15000,
            'timeline_impact_days' => 10,
        ]);

        $this->actingAs($user)->post(
            route('crm.projects.change-orders.approve', [$project, $changeOrder])
        );

        $this->assertDatabaseHas('crm_change_orders', [
            'id' => $changeOrder->id,
            'status' => 'approved',
        ]);
        $this->assertNotNull($changeOrder->fresh()->approved_at);

        $this->assertDatabaseHas('crm_projects', [
            'id' => $project->id,
            'change_order_total' => 15000,
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'change_order_approved',
        ]);

        Event::assertDispatched(ChangeOrderApproved::class);
    });

    it('manager can reject a change order', function () {
        $user = opsManager();
        $project = opsProject($user);
        $changeOrder = CrmChangeOrder::factory()->identified()->create([
            'project_id' => $project->id,
        ]);

        $this->actingAs($user)->post(
            route('crm.projects.change-orders.reject', [$project, $changeOrder]),
            ['rejection_reason' => 'Out of scope']
        );

        $this->assertDatabaseHas('crm_change_orders', [
            'id' => $changeOrder->id,
            'status' => 'rejected',
            'rejection_reason' => 'Out of scope',
        ]);
    });

    it('manager can update a change order', function () {
        $user = opsManager();
        $project = opsProject($user);
        $changeOrder = CrmChangeOrder::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user)->patch(
            route('crm.projects.change-orders.update', [$project, $changeOrder]),
            ['title' => 'Updated CO']
        );

        $this->assertDatabaseHas('crm_change_orders', ['id' => $changeOrder->id, 'title' => 'Updated CO']);
    });

    it('manager can delete a change order', function () {
        $user = opsManager();
        $project = opsProject($user);
        $changeOrder = CrmChangeOrder::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user)->delete(
            route('crm.projects.change-orders.destroy', [$project, $changeOrder])
        );

        $this->assertDatabaseMissing('crm_change_orders', ['id' => $changeOrder->id]);
    });

    it('filters change orders by status', function () {
        $user = opsManager();
        $project = opsProject($user);
        CrmChangeOrder::factory()->identified()->create(['project_id' => $project->id]);
        CrmChangeOrder::factory()->approved()->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)->get(
            route('crm.projects.change-orders.index', [$project, 'status' => 'approved'])
        );
        $response->assertOk();
    });

    it('approving a change order accumulates to project total', function () {
        $user = opsManager();
        $project = opsProject($user);
        $project->update(['contract_value' => 50000, 'change_order_total' => 0]);

        $co1 = CrmChangeOrder::factory()->create(['project_id' => $project->id, 'cost_impact' => 5000, 'status' => 'identified']);
        $co2 = CrmChangeOrder::factory()->create(['project_id' => $project->id, 'cost_impact' => 3000, 'status' => 'identified']);

        $this->actingAs($user)->post(route('crm.projects.change-orders.approve', [$project, $co1]));
        $this->assertDatabaseHas('crm_projects', ['id' => $project->id, 'change_order_total' => 5000]);

        $this->actingAs($user)->post(route('crm.projects.change-orders.approve', [$project, $co2]));
        $this->assertDatabaseHas('crm_projects', ['id' => $project->id, 'change_order_total' => 8000]);
    });

    it('viewer can list change orders but not create them', function () {
        $user = opsViewer();
        $project = opsProject(User::factory()->create()->assignRole('manager'));

        $this->actingAs($user)->get(route('crm.projects.change-orders.index', $project))->assertOk();
        $this->actingAs($user)->post(route('crm.projects.change-orders.store', $project), [
            'title' => 'Should fail',
            'cost_impact' => 1000,
            'timeline_impact_days' => 5,
        ])->assertForbidden();
    });
});

// ─── Permission Tests ─────────────────────────────────────────

describe('Phase 3C permissions', function () {

    it('seeded permissions include milestones, deliverables, change_orders', function () {
        $expected = [
            'crm.milestones.view', 'crm.milestones.create', 'crm.milestones.edit', 'crm.milestones.delete',
            'crm.deliverables.view', 'crm.deliverables.create', 'crm.deliverables.edit', 'crm.deliverables.delete',
            'crm.change_orders.view', 'crm.change_orders.create', 'crm.change_orders.edit', 'crm.change_orders.delete',
        ];

        foreach ($expected as $perm) {
            expect(Permission::where('name', $perm)->exists())
                ->toBeTrue("Permission {$perm} does not exist");
        }
    });

    it('viewer has view-only for all project entities', function () {
        $viewer = Role::where('name', 'viewer')->first();
        expect($viewer->hasPermissionTo('crm.milestones.view'))->toBeTrue();
        expect($viewer->hasPermissionTo('crm.milestones.create'))->toBeFalse();
        expect($viewer->hasPermissionTo('crm.deliverables.view'))->toBeTrue();
        expect($viewer->hasPermissionTo('crm.deliverables.create'))->toBeFalse();
        expect($viewer->hasPermissionTo('crm.change_orders.view'))->toBeTrue();
        expect($viewer->hasPermissionTo('crm.change_orders.create'))->toBeFalse();
    });

    it('manager has full CRUD for all project entities', function () {
        $manager = Role::where('name', 'manager')->first();
        foreach (['milestones', 'deliverables', 'change_orders'] as $entity) {
            expect($manager->hasPermissionTo("crm.{$entity}.view"))->toBeTrue();
            expect($manager->hasPermissionTo("crm.{$entity}.create"))->toBeTrue();
            expect($manager->hasPermissionTo("crm.{$entity}.edit"))->toBeTrue();
            expect($manager->hasPermissionTo("crm.{$entity}.delete"))->toBeTrue();
        }
    });
});
