<?php

use App\Models\CrmIssue;
use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

function createManager(): User
{
    return User::factory()->create()->assignRole('manager');
}

function createViewer(): User
{
    return User::factory()->create()->assignRole('viewer');
}

function createProject(User $user): CrmProject
{
    return CrmProject::factory()->create(['created_by' => $user->id]);
}

// ─── Risk Tests ───────────────────────────────────────────────

describe('CrmProjectRisk', function () {

    it('manager can create a risk', function () {
        $user = createManager();
        $project = createProject($user);

        $response = $this->actingAs($user)->post(route('crm.projects.risks.store', $project), [
            'description' => 'Server outage risk',
            'severity' => 'high',
            'probability' => 'medium',
            'impact' => 'Would cause 4h downtime',
            'mitigation_plan' => 'Deploy secondary replica',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('crm_project_risks', [
            'project_id' => $project->id,
            'description' => 'Server outage risk',
            'severity' => 'high',
            'status' => 'identified',
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'activitable_type' => $project->getMorphClass(),
            'type' => 'risk_created',
        ]);
    });

    it('manager can update risk status to being mitigated', function () {
        $user = createManager();
        $project = createProject($user);
        $risk = CrmProjectRisk::factory()->identified()->create([
            'project_id' => $project->id,
            'description' => 'Vendor delay risk',
        ]);

        $response = $this->actingAs($user)->patch(route('crm.projects.risks.update', [$project, $risk]), [
            'status' => 'being_mitigated',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('crm_project_risks', [
            'id' => $risk->id,
            'status' => 'being_mitigated',
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'risk_mitigated',
        ]);
    });

    it('manager can close a risk', function () {
        $user = createManager();
        $project = createProject($user);
        $risk = CrmProjectRisk::factory()->beingMitigated()->create([
            'project_id' => $project->id,
        ]);

        $this->actingAs($user)->patch(route('crm.projects.risks.update', [$project, $risk]), [
            'status' => 'closed',
        ]);

        $this->assertDatabaseHas('crm_project_risks', ['id' => $risk->id, 'status' => 'closed']);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'risk_closed',
        ]);
    });

    it('viewer can list risks but not create them', function () {
        $user = createViewer();
        $project = createProject(User::factory()->create()->assignRole('manager'));

        $this->actingAs($user)->get(route('crm.projects.risks.index', $project))
            ->assertOk();

        $this->actingAs($user)->post(route('crm.projects.risks.store', $project), [
            'description' => 'Should fail',
            'severity' => 'low',
            'probability' => 'low',
        ])->assertForbidden();
    });

    it('index filters by severity and status', function () {
        $user = createManager();
        $project = createProject($user);
        CrmProjectRisk::factory()->count(3)->create(['project_id' => $project->id, 'severity' => 'low', 'status' => 'identified']);
        CrmProjectRisk::factory()->criticalSeverity()->create(['project_id' => $project->id, 'status' => 'identified']);
        CrmProjectRisk::factory()->highSeverity()->beingMitigated()->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)->get(route('crm.projects.risks.index', [$project, 'severity' => 'critical']));
        $response->assertOk();
    });

    it('manager can delete a risk', function () {
        $user = createManager();
        $project = createProject($user);
        $risk = CrmProjectRisk::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user)->delete(route('crm.projects.risks.destroy', [$project, $risk]))
            ->assertRedirect();

        $this->assertDatabaseMissing('crm_project_risks', ['id' => $risk->id]);
    });
});

// ─── Issue Tests ──────────────────────────────────────────────

describe('CrmIssue', function () {

    it('manager can log an issue', function () {
        $user = createManager();
        $project = createProject($user);

        $response = $this->actingAs($user)->post(route('crm.projects.issues.store', $project), [
            'description' => 'API not responding',
            'severity' => 'critical',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('crm_issues', [
            'project_id' => $project->id,
            'description' => 'API not responding',
            'severity' => 'critical',
            'status' => 'open',
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'issue_created',
        ]);
    });

    it('blocker issue creates escalated event', function () {
        $user = createManager();
        $project = createProject($user);

        $this->actingAs($user)->post(route('crm.projects.issues.store', $project), [
            'description' => 'Production down',
            'severity' => 'blocker',
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'issue_escalated',
            'subject' => 'Blocker issue escalated',
        ]);
    });

    it('manager can resolve an issue', function () {
        $user = createManager();
        $project = createProject($user);
        $issue = CrmIssue::factory()->open()->create([
            'project_id' => $project->id,
        ]);

        $this->actingAs($user)->patch(route('crm.projects.issues.update', [$project, $issue]), [
            'status' => 'resolved',
        ]);

        $this->assertDatabaseHas('crm_issues', ['id' => $issue->id, 'status' => 'resolved']);
        $this->assertNotNull($issue->fresh()->resolved_at);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'issue_resolved',
        ]);
    });

    it('manager can close an issue', function () {
        $user = createManager();
        $project = createProject($user);
        $issue = CrmIssue::factory()->resolved()->create([
            'project_id' => $project->id,
        ]);

        $this->actingAs($user)->patch(route('crm.projects.issues.update', [$project, $issue]), [
            'status' => 'closed',
        ]);

        $this->assertDatabaseHas('crm_issues', ['id' => $issue->id, 'status' => 'closed']);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'issue_closed',
        ]);
    });

    it('viewer can list issues but not create them', function () {
        $user = createViewer();
        $project = createProject(User::factory()->create()->assignRole('manager'));

        $this->actingAs($user)->get(route('crm.projects.issues.index', $project))
            ->assertOk();

        $this->actingAs($user)->post(route('crm.projects.issues.store', $project), [
            'description' => 'Should fail',
            'severity' => 'minor',
        ])->assertForbidden();
    });

    it('index filters by status', function () {
        $user = createManager();
        $project = createProject($user);
        CrmIssue::factory()->count(3)->open()->create(['project_id' => $project->id]);
        CrmIssue::factory()->resolved()->create(['project_id' => $project->id]);
        CrmIssue::factory()->closed()->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)->get(route('crm.projects.issues.index', [$project, 'status' => 'open']));
        $response->assertOk();
    });

    it('severity escalation creates issue_escalated event', function () {
        $user = createManager();
        $project = createProject($user);
        $issue = CrmIssue::factory()->open()->create([
            'project_id' => $project->id,
            'severity' => 'minor',
        ]);

        $this->actingAs($user)->patch(route('crm.projects.issues.update', [$project, $issue]), [
            'severity' => 'blocker',
        ]);

        $this->assertDatabaseHas('crm_activities', [
            'activitable_id' => $project->id,
            'type' => 'issue_escalated',
        ]);
    });

    it('manager can delete an issue', function () {
        $user = createManager();
        $project = createProject($user);
        $issue = CrmIssue::factory()->create(['project_id' => $project->id]);

        $this->actingAs($user)->delete(route('crm.projects.issues.destroy', [$project, $issue]))
            ->assertRedirect();

        $this->assertDatabaseMissing('crm_issues', ['id' => $issue->id]);
    });
});

// ─── Permission Tests ─────────────────────────────────────────

describe('CrmRiskIssue permissions', function () {

    it('seeded permissions include risks and issues', function () {
        $expected = [
            'crm.risks.view',
            'crm.risks.create',
            'crm.risks.edit',
            'crm.risks.delete',
            'crm.issues.view',
            'crm.issues.create',
            'crm.issues.edit',
            'crm.issues.delete',
        ];

        foreach ($expected as $perm) {
            expect(Permission::where('name', $perm)->exists())
                ->toBeTrue("Permission {$perm} does not exist");
        }
    });

    it('admin has all risk and issue permissions', function () {
        $admin = Role::where('name', 'admin')->first();
        expect($admin->hasPermissionTo('crm.risks.view'))->toBeTrue();
        expect($admin->hasPermissionTo('crm.risks.delete'))->toBeTrue();
        expect($admin->hasPermissionTo('crm.issues.view'))->toBeTrue();
        expect($admin->hasPermissionTo('crm.issues.delete'))->toBeTrue();
    });

    it('viewer has view-only permissions for risks and issues', function () {
        $viewer = Role::where('name', 'viewer')->first();
        expect($viewer->hasPermissionTo('crm.risks.view'))->toBeTrue();
        expect($viewer->hasPermissionTo('crm.risks.create'))->toBeFalse();
        expect($viewer->hasPermissionTo('crm.issues.view'))->toBeTrue();
        expect($viewer->hasPermissionTo('crm.issues.create'))->toBeFalse();
    });
});
