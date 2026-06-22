<?php

use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalStep;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowAction;
use App\Models\CrmWorkflowCondition;
use App\Models\CrmWorkflowTrigger;
use App\Models\User;
use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowOperatorCatalog;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

function adminUser(): User
{
    return User::factory()->create()->assignRole('admin');
}

function regularUser(): User
{
    return User::factory()->create();
}

function createWorkflow(?User $user = null): CrmWorkflow
{
    $user ??= adminUser();

    return CrmWorkflow::factory()->create(['created_by' => $user->id]);
}

// ─── WorkflowController Tests ─────────────────────────────────

describe('WorkflowController', function () {

    it('lists workflows', function () {
        $user = adminUser();
        createWorkflow($user);
        createWorkflow($user);

        $response = $this->actingAs($user)->getJson(route('crm.workflows.index'));

        $response->assertOk();
        $response->assertJsonStructure(['data', 'meta']);
    });

    it('shows a single workflow with relations', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        CrmWorkflowTrigger::factory()->create(['workflow_id' => $workflow->id]);
        CrmWorkflowCondition::factory()->create(['workflow_id' => $workflow->id]);
        CrmWorkflowAction::factory()->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->getJson(route('crm.workflows.show', $workflow));

        $response->assertOk();
        $response->assertJsonStructure(['workflow' => ['id', 'name', 'entityType', 'isActive']]);
    });

    it('creates a workflow', function () {
        $user = adminUser();

        $response = $this->actingAs($user)->postJson(route('crm.workflows.store'), [
            'name' => 'Test Workflow',
            'description' => 'A test workflow',
            'entity_type' => 'project',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['workflow' => ['id', 'name', 'slug', 'version']]);
        expect($response->json('workflow.version'))->toBe(1);
        expect($response->json('workflow.isActive'))->toBeTrue();
    });

    it('creates a workflow with inactive state', function () {
        $user = adminUser();

        $response = $this->actingAs($user)->postJson(route('crm.workflows.store'), [
            'name' => 'Inactive Workflow',
            'entity_type' => 'risk',
            'is_active' => false,
        ]);

        $response->assertCreated();
        expect($response->json('workflow.isActive'))->toBeFalse();
    });

    it('validates required fields on store', function () {
        $user = adminUser();

        $response = $this->actingAs($user)->postJson(route('crm.workflows.store'), [
            'name' => 'Only Name Provided',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['entity_type']);
    });

    it('updates a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $response = $this->actingAs($user)->patchJson(route('crm.workflows.update', $workflow), [
            'description' => 'Updated description',
        ]);

        $response->assertOk();
        expect($response->json('workflow.description'))->toBe('Updated description');
    });

    it('increments version on update', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $this->actingAs($user)->patchJson(route('crm.workflows.update', $workflow), [
            'description' => 'Updated',
        ]);

        expect($workflow->fresh()->version)->toBe(2);
    });

    it('deletes a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $response = $this->actingAs($user)->deleteJson(route('crm.workflows.destroy', $workflow));

        $response->assertNoContent();
        expect(CrmWorkflow::count())->toBe(0);
    });

    it('deletes a workflow with cascade', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        CrmWorkflowTrigger::factory()->create(['workflow_id' => $workflow->id]);
        CrmWorkflowCondition::factory()->create(['workflow_id' => $workflow->id]);
        CrmWorkflowAction::factory()->create(['workflow_id' => $workflow->id]);

        $this->actingAs($user)->deleteJson(route('crm.workflows.destroy', $workflow));

        expect(CrmWorkflowTrigger::count())->toBe(0);
        expect(CrmWorkflowCondition::count())->toBe(0);
        expect(CrmWorkflowAction::count())->toBe(0);
    });

    it('duplicates a workflow with all relations', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        CrmWorkflowTrigger::factory()->create(['workflow_id' => $workflow->id]);
        CrmWorkflowCondition::factory()->count(2)->create(['workflow_id' => $workflow->id]);
        CrmWorkflowAction::factory()->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->postJson(route('crm.workflows.duplicate', $workflow));

        $response->assertCreated();
        expect(CrmWorkflow::count())->toBe(2);
        expect(CrmWorkflowTrigger::count())->toBe(2);
        expect(CrmWorkflowCondition::count())->toBe(4);
        expect(CrmWorkflowAction::count())->toBe(2);

        $copy = CrmWorkflow::orderBy('id', 'desc')->first();
        expect($copy->name)->toContain('(copy)');
        expect($copy->is_active)->toBeFalse();
        expect($copy->version)->toBe(1);
        expect($copy->slug)->not->toBe($workflow->slug);
    });

    it('toggles is_active', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        expect($workflow->is_active)->toBeTrue();

        $response = $this->actingAs($user)->postJson(route('crm.workflows.toggle', $workflow));

        $response->assertOk();
        expect($response->json('workflow.isActive'))->toBeFalse();

        $this->actingAs($user)->postJson(route('crm.workflows.toggle', $workflow));
        expect(CrmWorkflow::find($workflow->id)->is_active)->toBeTrue();
    });
});

// ─── TriggerBuilderController Tests ───────────────────────────

describe('TriggerBuilderController', function () {

    it('lists triggers', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        CrmWorkflowTrigger::factory()->count(2)->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->getJson(route('crm.workflows.triggers.index', $workflow));

        $response->assertOk();
        $response->assertJsonStructure(['triggers']);
    });

    it('creates a trigger', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $response = $this->actingAs($user)->postJson(route('crm.workflows.triggers.store', $workflow), [
            'event_key' => 'deal.converted',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['trigger' => ['id', 'eventKey']]);
        expect($response->json('trigger.eventKey'))->toBe('deal.converted');
    });

    it('rejects invalid event_key', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $response = $this->actingAs($user)->postJson(route('crm.workflows.triggers.store', $workflow), [
            'event_key' => 'nonexistent.event',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['event_key']);
    });

    it('updates a trigger', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $trigger = CrmWorkflowTrigger::factory()->create(['workflow_id' => $workflow->id, 'event_key' => 'deal.converted']);

        $response = $this->actingAs($user)->patchJson(route('crm.workflows.triggers.update', [$workflow, $trigger]), [
            'event_key' => 'project.created',
        ]);

        $response->assertOk();
        expect($response->json('trigger.eventKey'))->toBe('project.created');
    });

    it('deletes a trigger', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $trigger = CrmWorkflowTrigger::factory()->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->deleteJson(route('crm.workflows.triggers.destroy', [$workflow, $trigger]));

        $response->assertNoContent();
        expect(CrmWorkflowTrigger::count())->toBe(0);
    });
});

// ─── ConditionBuilderController Tests ─────────────────────────

describe('ConditionBuilderController', function () {

    it('lists conditions', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        CrmWorkflowCondition::factory()->count(3)->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->getJson(route('crm.workflows.conditions.index', $workflow));

        $response->assertOk();
        $response->assertJsonStructure(['conditions']);
    });

    it('creates a condition', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $response = $this->actingAs($user)->postJson(route('crm.workflows.conditions.store', $workflow), [
            'field' => 'severity',
            'operator' => 'eq',
            'value' => 'critical',
            'group_order' => 0,
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['condition' => ['id', 'field', 'operator', 'value', 'groupOrder']]);
        expect($response->json('condition.operator'))->toBe('eq');
    });

    it('rejects invalid operator', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $response = $this->actingAs($user)->postJson(route('crm.workflows.conditions.store', $workflow), [
            'field' => 'severity',
            'operator' => 'regex',
            'value' => 'critical',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['operator']);
    });

    it('updates a condition', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $condition = CrmWorkflowCondition::factory()->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->patchJson(route('crm.workflows.conditions.update', [$workflow, $condition]), [
            'operator' => 'neq',
            'value' => 'low',
        ]);

        $response->assertOk();
        expect($response->json('condition.operator'))->toBe('neq');
        expect($response->json('condition.value'))->toBe('low');
    });

    it('deletes a condition', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $condition = CrmWorkflowCondition::factory()->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->deleteJson(route('crm.workflows.conditions.destroy', [$workflow, $condition]));

        $response->assertNoContent();
        expect(CrmWorkflowCondition::count())->toBe(0);
    });
});

// ─── ActionBuilderController Tests ────────────────────────────

describe('ActionBuilderController', function () {

    it('lists actions', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        CrmWorkflowAction::factory()->count(2)->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->getJson(route('crm.workflows.actions.index', $workflow));

        $response->assertOk();
        $response->assertJsonStructure(['actions']);
    });

    it('creates an action', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $response = $this->actingAs($user)->postJson(route('crm.workflows.actions.store', $workflow), [
            'action_type' => 'send_email',
            'configuration_json' => ['template_key' => 'issue.escalated'],
            'sort_order' => 0,
            'stop_on_fail' => true,
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['action' => ['id', 'actionType', 'configuration', 'sortOrder', 'stopOnFail']]);
        expect($response->json('action.actionType'))->toBe('send_email');
        expect($response->json('action.stopOnFail'))->toBeTrue();
    });

    it('rejects invalid action_type', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $response = $this->actingAs($user)->postJson(route('crm.workflows.actions.store', $workflow), [
            'action_type' => 'nonexistent_action',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['action_type']);
    });

    it('updates an action', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $action = CrmWorkflowAction::factory()->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->patchJson(route('crm.workflows.actions.update', [$workflow, $action]), [
            'stop_on_fail' => true,
            'sort_order' => 5,
        ]);

        $response->assertOk();
        expect($response->json('action.stopOnFail'))->toBeTrue();
        expect($response->json('action.sortOrder'))->toBe(5);
    });

    it('deletes an action', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $action = CrmWorkflowAction::factory()->create(['workflow_id' => $workflow->id]);

        $response = $this->actingAs($user)->deleteJson(route('crm.workflows.actions.destroy', [$workflow, $action]));

        $response->assertNoContent();
        expect(CrmWorkflowAction::count())->toBe(0);
    });
});

// ─── MetadataController Tests ─────────────────────────────────

describe('MetadataController', function () {

    it('returns events as key/label array', function () {
        $user = regularUser();

        $response = $this->actingAs($user)->getJson(route('crm.workflows.meta.events'));

        $response->assertOk();
        $response->assertJsonStructure(['events']);
        expect($response->json('events'))->toBeArray();
        expect($response->json('events.0'))->toHaveKeys(['key', 'label']);
    });

    it('returns operators as key/label array', function () {
        $user = regularUser();

        $response = $this->actingAs($user)->getJson(route('crm.workflows.meta.operators'));

        $response->assertOk();
        $response->assertJsonStructure(['operators']);
        expect($response->json('operators'))->toHaveCount(count(WorkflowOperatorCatalog::ALL));
    });

    it('returns actions as key/label array', function () {
        $user = regularUser();

        $response = $this->actingAs($user)->getJson(route('crm.workflows.meta.actions'));

        $response->assertOk();
        $response->assertJsonStructure(['actions']);
        expect($response->json('actions'))->toHaveCount(count(WorkflowActionCatalog::ALL));
    });

    it('returns approval flows with strategy and steps_count', function () {
        $user = regularUser();
        $flow = CrmApprovalFlow::factory()->create(['is_active' => true]);
        CrmApprovalStep::factory()->count(3)->create(['approval_flow_id' => $flow->id]);

        $response = $this->actingAs($user)->getJson(route('crm.workflows.meta.approval-flows'));

        $response->assertOk();
        $response->assertJsonStructure(['approvalFlows']);
        expect($response->json('approvalFlows'))->toHaveCount(1);
        expect($response->json('approvalFlows.0'))->toHaveKeys(['id', 'name', 'strategy', 'steps_count']);
        expect($response->json('approvalFlows.0.steps_count'))->toBe(3);
    });

    it('only returns active approval flows', function () {
        $user = regularUser();
        CrmApprovalFlow::factory()->create(['is_active' => true]);
        CrmApprovalFlow::factory()->inactive()->create();

        $response = $this->actingAs($user)->getJson(route('crm.workflows.meta.approval-flows'));

        expect($response->json('approvalFlows'))->toHaveCount(1);
    });
});

// ─── Policy Tests ─────────────────────────────────────────────

describe('Workflow Policy', function () {

    it('admin can view any workflow', function () {
        $user = adminUser();
        $this->actingAs($user)->getJson(route('crm.workflows.index'))->assertOk();
    });

    it('regular user can view any workflow (viewAny)', function () {
        $user = regularUser();
        $this->actingAs($user)->getJson(route('crm.workflows.index'))->assertOk();
    });

    it('admin can view a single workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $this->actingAs($user)->getJson(route('crm.workflows.show', $workflow))->assertOk();
    });

    it('regular user cannot view a single workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $regular = regularUser();

        $response = $this->actingAs($regular)->getJson(route('crm.workflows.show', $workflow));

        $response->assertForbidden();
    });

    it('admin can create a workflow', function () {
        $user = adminUser();
        $this->actingAs($user)->postJson(route('crm.workflows.store'), [
            'name' => 'Admin Workflow',
            'entity_type' => 'project',
        ])->assertCreated();
    });

    it('regular user cannot create a workflow', function () {
        $user = regularUser();

        $response = $this->actingAs($user)->postJson(route('crm.workflows.store'), [
            'name' => 'Unauthorized',
            'entity_type' => 'project',
        ]);

        $response->assertForbidden();
    });

    it('admin can update a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $this->actingAs($user)->patchJson(route('crm.workflows.update', $workflow), [
            'description' => 'Admin update',
        ])->assertOk();
    });

    it('regular user cannot update a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $regular = regularUser();

        $response = $this->actingAs($regular)->patchJson(route('crm.workflows.update', $workflow), [
            'description' => 'Should fail',
        ]);

        $response->assertForbidden();
    });

    it('admin can delete a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $this->actingAs($user)->deleteJson(route('crm.workflows.destroy', $workflow))->assertNoContent();
    });

    it('regular user cannot delete a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $regular = regularUser();

        $response = $this->actingAs($regular)->deleteJson(route('crm.workflows.destroy', $workflow));

        $response->assertForbidden();
    });

    it('admin can duplicate a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $this->actingAs($user)->postJson(route('crm.workflows.duplicate', $workflow))->assertCreated();
    });

    it('regular user cannot duplicate a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $regular = regularUser();

        $response = $this->actingAs($regular)->postJson(route('crm.workflows.duplicate', $workflow));

        $response->assertForbidden();
    });

    it('admin can toggle a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);

        $this->actingAs($user)->postJson(route('crm.workflows.toggle', $workflow))->assertOk();
    });

    it('regular user cannot toggle a workflow', function () {
        $user = adminUser();
        $workflow = createWorkflow($user);
        $regular = regularUser();

        $response = $this->actingAs($regular)->postJson(route('crm.workflows.toggle', $workflow));

        $response->assertForbidden();
    });

    it('manager cannot create a workflow', function () {
        $user = User::factory()->create()->assignRole('manager');

        $response = $this->actingAs($user)->postJson(route('crm.workflows.store'), [
            'name' => 'Manager attempt',
            'entity_type' => 'project',
        ]);

        $response->assertForbidden();
    });
});
