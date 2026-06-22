<?php

use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowRun;
use App\Models\User;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Carbon\CarbonImmutable;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

// ─── WorkflowRunController Tests ───────────────────────────────

describe('WorkflowRunController', function () {

    it('lists runs with pagination', function () {
        $user = User::factory()->create()->assignRole('admin');
        CrmWorkflowRun::factory()->count(3)->create();

        $this->actingAs($user)
            ->getJson('/crm/workflows/runs/api')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'status', 'workflowId', 'startedAt']],
                'meta' => ['current_page', 'last_page', 'total'],
            ]);
    });

    it('filters runs by status', function () {
        $user = User::factory()->create()->assignRole('admin');
        CrmWorkflowRun::factory()->count(2)->create(['status' => 'completed']);
        CrmWorkflowRun::factory()->create(['status' => 'failed']);

        $this->actingAs($user)
            ->getJson('/crm/workflows/runs/api?status=completed')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    });

    it('filters runs by date range', function () {
        $user = User::factory()->create()->assignRole('admin');
        $this->travelTo(CarbonImmutable::parse('2026-06-15'));
        CrmWorkflowRun::factory()->create(['started_at' => now()]);

        $this->travelTo(CarbonImmutable::parse('2026-06-20'));
        CrmWorkflowRun::factory()->create(['started_at' => now()]);

        $this->actingAs($user)
            ->getJson('/crm/workflows/runs/api?date_from=2026-06-16&date_to=2026-06-25')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('shows single run with details', function () {
        $user = User::factory()->create()->assignRole('admin');
        $run = CrmWorkflowRun::factory()->create();
        CrmWorkflowActionRun::factory()->count(2)->create(['workflow_run_id' => $run->id]);

        $this->actingAs($user)
            ->getJson("/crm/workflows/runs/api/{$run->id}")
            ->assertOk()
            ->assertJsonStructure([
                'run' => ['id', 'status', 'workflow', 'actions', 'startedAt'],
            ]);
    });

    it('shows run with approval requests', function () {
        $user = User::factory()->create()->assignRole('admin');
        $run = CrmWorkflowRun::factory()->create();
        $flow = CrmApprovalFlow::factory()->create();
        CrmApprovalRequest::factory()->create([
            'workflow_run_id' => $run->id,
            'approval_flow_id' => $flow->id,
        ]);

        $this->actingAs($user)
            ->getJson("/crm/workflows/runs/api/{$run->id}")
            ->assertOk()
            ->assertJsonPath('run.approvalRequests.0.approval_flow_id', $flow->id);
    });

    it('returns metrics', function () {
        $user = User::factory()->create()->assignRole('admin');
        CrmWorkflowRun::factory()->count(3)->completed()->create();
        CrmWorkflowRun::factory()->failed()->create();
        CrmWorkflowRun::factory()->create(['status' => WorkflowStatusCatalog::RUN_PAUSED]);

        $this->actingAs($user)
            ->getJson('/crm/workflows/runs/api/metrics')
            ->assertOk()
            ->assertJsonStructure(['total', 'completed', 'failed', 'paused', 'averageDurationSeconds']);
    });

    it('denies access to unauthenticated users', function () {
        $this->getJson('/crm/workflows/runs/api')->assertUnauthorized();
    });

    it('allows regular users to view runs', function () {
        CrmWorkflowRun::factory()->create();

        $this->actingAs(User::factory()->create())
            ->getJson('/crm/workflows/runs/api')
            ->assertOk();
    });

});

// ─── WorkflowRunPageController Tests ───────────────────────────

describe('WorkflowRunPageController', function () {

    it('renders runs index page', function () {
        $user = User::factory()->create()->assignRole('admin');
        CrmWorkflowRun::factory()->create();

        $this->actingAs($user)
            ->get('/crm/workflows/runs')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('crm/workflows/runs/index')
                ->has('runs.data')
                ->has('metrics')
                ->has('workflows')
                ->has('statuses')
                ->has('filters')
            );
    });

    it('renders runs index page for regular users', function () {
        CrmWorkflowRun::factory()->create();

        $this->actingAs(User::factory()->create())
            ->get('/crm/workflows/runs')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('crm/workflows/runs/index'));
    });

    it('renders run details page', function () {
        $user = User::factory()->create()->assignRole('admin');
        $run = CrmWorkflowRun::factory()->completed()->create();
        CrmWorkflowActionRun::factory()->count(2)->completed()->create(['workflow_run_id' => $run->id]);

        $this->actingAs($user)
            ->get("/crm/workflows/runs/{$run->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('crm/workflows/runs/show')
                ->has('run')
                ->where('run.id', $run->id)
            );
    });

    it('returns 404 for non-existent run', function () {
        $user = User::factory()->create()->assignRole('admin');

        $this->actingAs($user)
            ->get('/crm/workflows/runs/99999')
            ->assertNotFound();
    });

    it('delegates to JSON API when wantsJson', function () {
        $user = User::factory()->create()->assignRole('admin');
        $run = CrmWorkflowRun::factory()->create();

        $this->actingAs($user)
            ->getJson("/crm/workflows/runs/{$run->id}")
            ->assertOk()
            ->assertJsonStructure(['run' => ['id', 'status', 'workflow', 'actions', 'startedAt']]);
    });

});
