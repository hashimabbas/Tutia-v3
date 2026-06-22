<?php

use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Models\CrmApprovalStep;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

// ─── ApprovalController Tests ──────────────────────────────────

describe('ApprovalController', function () {

    it('lists approval requests', function () {
        $user = User::factory()->create()->assignRole('admin');
        CrmApprovalRequest::factory()->count(3)->create();

        $this->actingAs($user)
            ->getJson('/crm/approvals/api')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    });

    it('filters by status', function () {
        $user = User::factory()->create()->assignRole('admin');
        CrmApprovalRequest::factory()->count(2)->create(['status' => 'pending']);
        CrmApprovalRequest::factory()->create(['status' => 'approved']);

        $this->actingAs($user)
            ->getJson('/crm/approvals/api?status=pending')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    });

    it('shows single request with details', function () {
        $user = User::factory()->create()->assignRole('admin');
        $flow = CrmApprovalFlow::factory()->has(CrmApprovalStep::factory()->count(2), 'steps')->create();
        $req = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $this->actingAs($user)
            ->getJson("/crm/approvals/api/{$req->id}")
            ->assertOk()
            ->assertJsonStructure(['request' => ['id', 'status', 'flow', 'decisions']]);
    });

    it('returns metrics', function () {
        $user = User::factory()->create()->assignRole('admin');

        $this->actingAs($user)
            ->getJson('/crm/approvals/api/metrics')
            ->assertOk()
            ->assertJsonStructure(['pending', 'approvedToday', 'rejectedToday', 'escalated', 'expired', 'total']);
    });

    it('denies unauthenticated access', function () {
        $this->getJson('/crm/approvals/api')->assertUnauthorized();
    });

});

// ─── ApprovalPageController Tests ──────────────────────────────

describe('ApprovalPageController', function () {

    it('renders index page', function () {
        $user = User::factory()->create()->assignRole('admin');
        CrmApprovalRequest::factory()->create();

        $this->actingAs($user)
            ->get('/crm/approvals')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('crm/approvals/index')
                ->has('requests.data')
                ->has('metrics')
                ->has('flows')
                ->has('statuses')
            );
    });

    it('renders show page', function () {
        $user = User::factory()->create()->assignRole('admin');
        $flow = CrmApprovalFlow::factory()->has(CrmApprovalStep::factory()->count(2), 'steps')->create();
        $req = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $this->actingAs($user)
            ->get("/crm/approvals/{$req->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('crm/approvals/show')
                ->has('request')
            );
    });

    it('delegates to JSON API when wantsJson', function () {
        $user = User::factory()->create()->assignRole('admin');
        $req = CrmApprovalRequest::factory()->create();

        $this->actingAs($user)
            ->getJson("/crm/approvals/{$req->id}")
            ->assertOk()
            ->assertJsonStructure(['request' => ['id', 'status', 'flow', 'decisions']]);
    });

});

// ─── Decision Actions Tests ────────────────────────────────────

describe('Approval Decision', function () {

    it('rejects decision on non-pending request', function () {
        $user = User::factory()->create()->assignRole('admin');
        $req = CrmApprovalRequest::factory()->create(['status' => 'approved']);

        $this->actingAs($user)
            ->postJson("/crm/approvals/api/{$req->id}/decide", ['decision' => 'approved'])
            ->assertStatus(422);
    });

    it('requires comment when rejecting', function () {
        $user = User::factory()->create()->assignRole('admin');
        $flow = CrmApprovalFlow::factory()->has(CrmApprovalStep::factory(state: ['approver_type' => 'user', 'approver_id' => fn () => null]), 'steps')->create();
        $req = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->postJson("/crm/approvals/api/{$req->id}/decide", ['decision' => 'rejected'])
            ->assertStatus(422);
    });

});
