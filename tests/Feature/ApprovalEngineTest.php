<?php

use App\Console\Commands\CrmApprovalsCheckSlaCommand;
use App\Console\Commands\CrmApprovalsEscalateCommand;
use App\Events\Crm\ApprovalApproved;
use App\Events\Crm\ApprovalEscalated;
use App\Events\Crm\ApprovalExpired;
use App\Events\Crm\ApprovalRejected;
use App\Events\Crm\ApprovalRequested;
use App\Http\Resources\ApprovalDecisionResource;
use App\Http\Resources\ApprovalRequestResource;
use App\Jobs\CheckApprovalSlaJob;
use App\Listeners\HandleApprovalDecision;
use App\Models\CrmApprovalDecision;
use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Models\CrmApprovalStep;
use App\Models\CrmProject;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowAction as CrmWorkflowActionModel;
use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowRun;
use App\Models\CrmWorkflowTrigger;
use App\Models\User;
use App\Services\Crm\Approvals\ApprovalEngine;
use App\Services\Crm\Approvals\ApprovalStrategyRegistry;
use App\Services\Crm\Approvals\Catalogs\ApprovalStatusCatalog;
use App\Services\Crm\Approvals\Contracts\ApprovalEngineInterface;
use App\Services\Crm\Approvals\DTOs\ApprovalContext;
use App\Services\Crm\Approvals\DTOs\ApprovalDecisionResult;
use App\Services\Crm\Approvals\DTOs\ApprovalEvaluationResult;
use App\Services\Crm\Approvals\Strategies\FirstApproverWinsStrategy;
use App\Services\Crm\Approvals\Strategies\MajorityVoteStrategy;
use App\Services\Crm\Approvals\Strategies\UnanimousStrategy;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;

// ─── ApprovalStatusCatalog ───────────────────────────────────────

describe('ApprovalStatusCatalog', function () {

    it('defines 6 request statuses', function () {
        expect(ApprovalStatusCatalog::REQUEST_ALL)->toHaveCount(6);
        expect(ApprovalStatusCatalog::REQUEST_ALL)->toContain(
            'pending', 'approved', 'rejected', 'expired', 'escalated', 'cancelled',
        );
    });

    it('defines 4 decision statuses', function () {
        expect(ApprovalStatusCatalog::DECISION_ALL)->toHaveCount(4);
    });

    it('validates request statuses', function () {
        expect(ApprovalStatusCatalog::isValidRequestStatus('pending'))->toBeTrue();
        expect(ApprovalStatusCatalog::isValidRequestStatus('unknown'))->toBeFalse();
    });

    it('validates decision values', function () {
        expect(ApprovalStatusCatalog::isValidDecision('approved'))->toBeTrue();
        expect(ApprovalStatusCatalog::isValidDecision('invalid'))->toBeFalse();
    });

    it('identifies terminal request statuses', function () {
        expect(ApprovalStatusCatalog::isRequestTerminal('approved'))->toBeTrue();
        expect(ApprovalStatusCatalog::isRequestTerminal('rejected'))->toBeTrue();
        expect(ApprovalStatusCatalog::isRequestTerminal('expired'))->toBeTrue();
        expect(ApprovalStatusCatalog::isRequestTerminal('cancelled'))->toBeTrue();
        expect(ApprovalStatusCatalog::isRequestTerminal('pending'))->toBeFalse();
        expect(ApprovalStatusCatalog::isRequestTerminal('escalated'))->toBeFalse();
    });
});

// ─── DTOs ─────────────────────────────────────────────────────────

describe('ApprovalContext DTO', function () {

    it('stores workflow run, entity, and requester', function () {
        $run = CrmWorkflowRun::factory()->create();
        $user = User::factory()->create();

        $context = new ApprovalContext(
            workflowRun: $run,
            entityType: 'change_order',
            entityId: 42,
            requestedBy: $user,
            notes: 'Please review',
        );

        expect($context->workflowRun->id)->toBe($run->id);
        expect($context->entityType)->toBe('change_order');
        expect($context->entityId)->toBe(42);
        expect($context->requestedBy->id)->toBe($user->id);
        expect($context->notes)->toBe('Please review');
    });

    it('accepts null notes', function () {
        $run = CrmWorkflowRun::factory()->create();
        $user = User::factory()->create();

        $context = new ApprovalContext(
            workflowRun: $run,
            entityType: 'deal',
            entityId: 1,
            requestedBy: $user,
        );

        expect($context->notes)->toBeNull();
    });
});

describe('ApprovalDecisionResult DTO', function () {

    it('stores a recorded decision', function () {
        $result = new ApprovalDecisionResult(
            decisionId: 1,
            requestId: 10,
            stepId: 5,
            userId: 3,
            decision: 'approved',
            comment: 'Looks good',
        );

        expect($result->decisionId)->toBe(1);
        expect($result->requestId)->toBe(10);
        expect($result->stepId)->toBe(5);
        expect($result->userId)->toBe(3);
        expect($result->decision)->toBe('approved');
        expect($result->comment)->toBe('Looks good');
    });

    it('accepts null comment', function () {
        $result = new ApprovalDecisionResult(
            decisionId: 2, requestId: 10, stepId: 5,
            userId: 3, decision: 'approved',
        );

        expect($result->comment)->toBeNull();
    });
});

describe('ApprovalEvaluationResult DTO', function () {

    it('stores an approved evaluation', function () {
        $result = new ApprovalEvaluationResult(
            requestId: 1,
            status: 'approved',
            approved: true,
            rejected: false,
            totalSteps: 2,
            decidedSteps: 2,
            approvedCount: 2,
            rejectedCount: 0,
            abstainedCount: 0,
        );

        expect($result->approved)->toBeTrue();
        expect($result->rejected)->toBeFalse();
        expect($result->totalSteps)->toBe(2);
        expect($result->approvedCount)->toBe(2);
    });

    it('stores a rejected evaluation', function () {
        $result = new ApprovalEvaluationResult(
            requestId: 2,
            status: 'rejected',
            approved: false,
            rejected: true,
            totalSteps: 1,
            decidedSteps: 1,
            approvedCount: 0,
            rejectedCount: 1,
            abstainedCount: 0,
        );

        expect($result->approved)->toBeFalse();
        expect($result->rejected)->toBeTrue();
    });
});

// ─── ApprovalStrategyRegistry ─────────────────────────────────────

describe('ApprovalStrategyRegistry', function () {

    it('registers and retrieves strategies', function () {
        $registry = new ApprovalStrategyRegistry;

        $registry->register(new UnanimousStrategy);
        $registry->register(new FirstApproverWinsStrategy);
        $registry->register(new MajorityVoteStrategy);

        expect($registry->hasStrategy('all_must_approve'))->toBeTrue();
        expect($registry->hasStrategy('first_approver_wins'))->toBeTrue();
        expect($registry->hasStrategy('majority_vote'))->toBeTrue();
    });

    it('throws for unregistered strategy', function () {
        $registry = new ApprovalStrategyRegistry;

        expect(fn () => $registry->get('nonexistent'))
            ->toThrow(RuntimeException::class, 'nonexistent');
    });

    it('accepts strategies via constructor', function () {
        $registry = new ApprovalStrategyRegistry([
            new UnanimousStrategy,
            new FirstApproverWinsStrategy,
        ]);

        expect($registry->hasStrategy('all_must_approve'))->toBeTrue();
        expect($registry->hasStrategy('first_approver_wins'))->toBeTrue();
    });

    it('container resolves with all 3 strategies', function () {
        $registry = app(ApprovalStrategyRegistry::class);

        expect($registry->hasStrategy('all_must_approve'))->toBeTrue();
        expect($registry->hasStrategy('first_approver_wins'))->toBeTrue();
        expect($registry->hasStrategy('majority_vote'))->toBeTrue();
    });
});

// ─── Strategy Implementations ─────────────────────────────────────

describe('UnanimousStrategy (all_must_approve)', function () {

    function unanimousFlow(): CrmApprovalFlow
    {
        return CrmApprovalFlow::factory()->create(['strategy' => 'all_must_approve']);
    }

    it('returns pending when no decisions exist', function () {
        $flow = unanimousFlow();
        CrmApprovalStep::factory()->count(2)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $strategy = new UnanimousStrategy;
        $result = $strategy->evaluate($request);

        expect($result->approved)->toBeFalse();
        expect($result->rejected)->toBeFalse();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('approves when all required steps approve', function () {
        $flow = unanimousFlow();
        $step1 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $step2 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step1->id,
        ]);
        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step2->id,
        ]);

        $strategy = new UnanimousStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeTrue();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_APPROVED);
    });

    it('rejects when any step rejects', function () {
        $flow = unanimousFlow();
        $step1 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $step2 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step1->id,
        ]);
        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step2->id,
        ]);

        $strategy = new UnanimousStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->rejected)->toBeTrue();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_REJECTED);
    });

    it('stays pending if not all required steps have decided', function () {
        $flow = unanimousFlow();
        $step1 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => true]);
        CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => true]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step1->id,
        ]);

        $strategy = new UnanimousStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeFalse();
        expect($result->rejected)->toBeFalse();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('ignores non-required steps for approval gate', function () {
        $flow = unanimousFlow();
        $step1 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => true]);
        CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => false]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step1->id,
        ]);

        $strategy = new UnanimousStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeTrue();
    });

    it('tracks abstentions without blocking approval', function () {
        $flow = unanimousFlow();
        $step1 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => true]);
        CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => false]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step1->id,
        ]);
        CrmApprovalDecision::factory()->abstained()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $flow->steps->last()->id,
        ]);

        $strategy = new UnanimousStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeTrue();
        expect($result->abstainedCount)->toBe(1);
    });

    it('handles handles() correctly', function () {
        expect((new UnanimousStrategy)->handles())->toBe('all_must_approve');
    });
});

describe('FirstApproverWinsStrategy', function () {

    function firstWinsFlow(): CrmApprovalFlow
    {
        return CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
    }

    it('returns pending when no decisions exist', function () {
        $flow = firstWinsFlow();
        CrmApprovalStep::factory()->count(3)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $strategy = new FirstApproverWinsStrategy;
        $result = $strategy->evaluate($request);

        expect($result->approved)->toBeFalse();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('approves when first decision is approved', function () {
        $flow = firstWinsFlow();
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step->id,
        ]);

        $strategy = new FirstApproverWinsStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeTrue();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_APPROVED);
    });

    it('rejects when first decision is rejected', function () {
        $flow = firstWinsFlow();
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step->id,
        ]);

        $strategy = new FirstApproverWinsStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->rejected)->toBeTrue();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_REJECTED);
    });

    it('ignores subsequent decisions after first', function () {
        $flow = firstWinsFlow();
        $step1 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $step2 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $first = CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step1->id,
        ]);
        CrmApprovalDecision::factory()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step2->id,
            'decision' => 'rejected',
        ]);

        $strategy = new FirstApproverWinsStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeTrue();
        expect($result->rejected)->toBeFalse();
    });

    it('treats abstained as pending (not approved/rejected)', function () {
        $flow = firstWinsFlow();
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->abstained()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $step->id,
        ]);

        $strategy = new FirstApproverWinsStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeFalse();
        expect($result->rejected)->toBeFalse();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('handles handles() correctly', function () {
        expect((new FirstApproverWinsStrategy)->handles())->toBe('first_approver_wins');
    });
});

describe('MajorityVoteStrategy', function () {

    function majorityFlow(): CrmApprovalFlow
    {
        return CrmApprovalFlow::factory()->create(['strategy' => 'majority_vote']);
    }

    it('returns pending when no decisions exist', function () {
        $flow = majorityFlow();
        CrmApprovalStep::factory()->count(3)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $strategy = new MajorityVoteStrategy;
        $result = $strategy->evaluate($request);

        expect($result->approved)->toBeFalse();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('approves when majority approves (3 steps, 2 approve)', function () {
        $flow = majorityFlow();
        $steps = CrmApprovalStep::factory()->count(3)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[0]->id,
        ]);
        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[1]->id,
        ]);

        $strategy = new MajorityVoteStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeTrue();
        expect($result->approvedCount)->toBe(2);
    });

    it('rejects when majority rejects (3 steps, 2 reject)', function () {
        $flow = majorityFlow();
        $steps = CrmApprovalStep::factory()->count(3)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[0]->id,
        ]);
        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[1]->id,
        ]);

        $strategy = new MajorityVoteStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->rejected)->toBeTrue();
        expect($result->rejectedCount)->toBe(2);
    });

    it('stays pending when no majority reached (2 approve, 2 reject, 1 abstain)', function () {
        $flow = majorityFlow();
        $steps = CrmApprovalStep::factory()->count(5)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[0]->id,
        ]);
        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[1]->id,
        ]);
        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[2]->id,
        ]);
        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[3]->id,
        ]);

        $strategy = new MajorityVoteStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeFalse();
        expect($result->rejected)->toBeFalse();
        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('resolves via approval when remaining cant reach majority', function () {
        $flow = majorityFlow();
        $steps = CrmApprovalStep::factory()->count(3)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[0]->id,
        ]);
        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[1]->id,
        ]);
        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[2]->id,
        ]);

        $strategy = new MajorityVoteStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeTrue();
    });

    it('resolves via rejection when remaining cant reach majority and reject leads', function () {
        $flow = majorityFlow();
        $steps = CrmApprovalStep::factory()->count(3)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[0]->id,
        ]);
        CrmApprovalDecision::factory()->rejected()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[1]->id,
        ]);
        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[2]->id,
        ]);

        $strategy = new MajorityVoteStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->rejected)->toBeTrue();
    });

    it('handles abstentions without affecting majority calculation', function () {
        $flow = majorityFlow();
        $steps = CrmApprovalStep::factory()->count(5)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[0]->id,
        ]);
        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[1]->id,
        ]);
        CrmApprovalDecision::factory()->approved()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[2]->id,
        ]);
        CrmApprovalDecision::factory()->abstained()->create([
            'approval_request_id' => $request->id,
            'approval_step_id' => $steps[3]->id,
        ]);

        $strategy = new MajorityVoteStrategy;
        $result = $strategy->evaluate($request->fresh());

        expect($result->approved)->toBeTrue();
        expect($result->abstainedCount)->toBe(1);
    });

    it('handles handles() correctly', function () {
        expect((new MajorityVoteStrategy)->handles())->toBe('majority_vote');
    });
});

// ─── ApprovalEngine ───────────────────────────────────────────────

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

function approvalEngine(): ApprovalEngine
{
    return app(ApprovalEngineInterface::class);
}

function runWithProject(): CrmWorkflowRun
{
    $user = User::factory()->create();
    $project = CrmProject::factory()->create(['created_by' => $user->id]);
    $wf = CrmWorkflow::factory()->create(['entity_type' => 'project', 'created_by' => $user->id]);
    CrmWorkflowTrigger::factory()->create(['workflow_id' => $wf->id]);
    CrmWorkflowActionModel::factory()->create([
        'workflow_id' => $wf->id,
        'action_type' => 'request_approval',
    ]);

    return CrmWorkflowRun::factory()->create([
        'workflow_id' => $wf->id,
        'context_snapshot' => ['project_id' => $project->id],
    ]);
}

describe('ApprovalEngine — createRequest', function () {

    it('creates a pending approval request', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create();
        $run = runWithProject();
        $user = User::factory()->create();
        $context = new ApprovalContext($run, 'change_order', 42, $user);

        $request = $engine->createRequest($flow, $context);

        expect($request)->toBeInstanceOf(CrmApprovalRequest::class);
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
        expect($request->approval_flow_id)->toBe($flow->id);
        expect($request->workflow_run_id)->toBe($run->id);
        expect($request->entity_type)->toBe('change_order');
        expect($request->entity_id)->toBe(42);
        expect($request->requested_by)->toBe($user->id);
    });

    it('persists notes when provided', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create();
        $run = runWithProject();
        $user = User::factory()->create();
        $context = new ApprovalContext($run, 'deal', 1, $user, 'Urgent');

        $request = $engine->createRequest($flow, $context);

        expect($request->notes)->toBe('Urgent');
    });

    it('creates request with different entity types', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create();
        $run = runWithProject();
        $user = User::factory()->create();

        foreach (['change_order', 'deal', 'risk'] as $type) {
            $context = new ApprovalContext($run, $type, 1, $user);
            $request = $engine->createRequest($flow, $context);
            expect($request->entity_type)->toBe($type);
        }
    });

    it('container resolves ApprovalEngineInterface', function () {
        $engine = app(ApprovalEngineInterface::class);
        expect($engine)->toBeInstanceOf(ApprovalEngine::class);
    });
});

describe('ApprovalEngine — recordDecision', function () {

    it('records a decision and updates request status', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'all_must_approve']);
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => true]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();

        $result = $engine->recordDecision($request, $step, $user, 'approved', 'Looks good');

        expect($result)->toBeInstanceOf(ApprovalDecisionResult::class);
        expect($result->decision)->toBe('approved');
        expect($result->comment)->toBe('Looks good');

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_APPROVED);
    });

    it('records rejection and marks request rejected', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();

        $engine->recordDecision($request, $step, $user, 'rejected', 'Not now');

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_REJECTED);
    });

    it('throws when step already has a decision', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create();
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();

        $engine->recordDecision($request, $step, $user, 'approved', null);

        expect(fn () => $engine->recordDecision($request, $step, $user, 'approved', null))
            ->toThrow(RuntimeException::class, 'already has a decision');
    });

    it('records abstained without resolving', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'all_must_approve']);
        $step1 = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => true]);
        CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => true]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();

        $result = $engine->recordDecision($request, $step1, $user, 'abstained', null);

        expect($result->decision)->toBe('abstained');

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('sets completed_at when request resolves', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();

        expect($request->completed_at)->toBeNull();

        $engine->recordDecision($request, $step, $user, 'approved', null);

        $request->refresh();
        expect($request->completed_at)->not->toBeNull();
    });

    it('records decision with null comment', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();

        $result = $engine->recordDecision($request, $step, $user, 'approved', null);

        expect($result->comment)->toBeNull();
    });
});

describe('ApprovalEngine — evaluateRequest', function () {

    it('evaluates via unanimous strategy', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'all_must_approve']);
        CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id, 'required' => true]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $result = $engine->evaluateRequest($request);

        expect($result)->toBeInstanceOf(ApprovalEvaluationResult::class);
        expect($result->approved)->toBeFalse();
    });

    it('evaluates via first_approver_wins strategy', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $result = $engine->evaluateRequest($request);

        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('evaluates via majority_vote strategy', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'majority_vote']);
        CrmApprovalStep::factory()->count(3)->create(['approval_flow_id' => $flow->id]);
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);

        $result = $engine->evaluateRequest($request);

        expect($result->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });
});

describe('ApprovalEngine — expireRequest', function () {

    it('marks request as expired with completed_at', function () {
        $engine = approvalEngine();
        $request = CrmApprovalRequest::factory()->create();

        $engine->expireRequest($request);

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_EXPIRED);
        expect($request->completed_at)->not->toBeNull();
    });
});

describe('ApprovalEngine — checkSla', function () {

    it('expires request when SLA breach minutes exceeded', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create([
            'sla_breach_minutes' => 60,
            'escalation_model' => 'none',
        ]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'requested_at' => now()->subHours(3),
        ]);

        $this->travel(3)->hours();

        $engine->checkSla($request);

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_EXPIRED);

        $this->travelBack();
    });

    it('does nothing when within SLA', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create([
            'sla_breach_minutes' => 60,
        ]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'requested_at' => now()->subMinutes(10),
        ]);

        $this->travel(10)->minutes();

        $engine->checkSla($request);

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);

        $this->travelBack();
    });

    it('does nothing when SLA is not configured', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create([
            'sla_breach_minutes' => null,
        ]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'requested_at' => now()->subDays(7),
        ]);

        $this->travel(7)->days();

        $engine->checkSla($request);

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);

        $this->travelBack();
    });

    it('sets sla_warning_sent_at at warning threshold', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create([
            'sla_warning_minutes' => 10,
            'sla_breach_minutes' => 60,
        ]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'requested_at' => now()->subMinutes(15),
        ]);

        expect($request->sla_warning_sent_at)->toBeNull();

        $this->travel(15)->minutes();

        $engine->checkSla($request);

        $request->refresh();
        expect($request->sla_warning_sent_at)->not->toBeNull();

        $this->travelBack();
    });

    it('does not set sla_warning_sent_at twice', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create([
            'sla_warning_minutes' => 10,
            'sla_breach_minutes' => 60,
        ]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'requested_at' => now()->subMinutes(15),
            'sla_warning_sent_at' => now()->subMinutes(5),
        ]);

        $original = $request->sla_warning_sent_at->toIso8601String();

        $this->travel(15)->minutes();

        $engine->checkSla($request);

        $request->refresh();
        expect($request->sla_warning_sent_at->toIso8601String())->toBe($original);

        $this->travelBack();
    });

    it('skips SLA check for non-pending requests', function () {
        $engine = approvalEngine();
        $request = CrmApprovalRequest::factory()->approved()->create([
            'requested_at' => now()->subDays(7),
        ]);

        $this->travel(7)->days();

        $engine->checkSla($request);

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_APPROVED);

        $this->travelBack();
    });
});

describe('ApprovalEngine — escalateRequest', function () {

    it('marks request as escalated', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['escalation_model' => 'manager']);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
        ]);

        $engine->escalateRequest($request);

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_ESCALATED);
        expect($request->escalated_at)->not->toBeNull();
    });

    it('throws when escalation_model is none', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['escalation_model' => 'none']);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
        ]);

        expect(fn () => $engine->escalateRequest($request))
            ->toThrow(RuntimeException::class, 'no escalation model');
    });

    it('escalates when SLA breach + escalation_model set', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create([
            'sla_breach_minutes' => 60,
            'escalation_model' => 'manager',
        ]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'requested_at' => now()->subHours(3),
        ]);

        $this->travel(3)->hours();

        $engine->checkSla($request);

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_ESCALATED);

        $this->travelBack();
    });
});

// ─── Phase 4D — Event Dispatching from ApprovalEngine ────────────

describe('ApprovalEngine — Event Dispatching', function () {

    it('dispatches ApprovalRequested when request is created', function () {
        Event::fake([ApprovalRequested::class]);

        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create();
        $run = runWithProject();
        $user = User::factory()->create();
        $context = new ApprovalContext($run, 'change_order', 42, $user);

        $request = $engine->createRequest($flow, $context);

        Event::assertDispatched(ApprovalRequested::class, fn ($e) => $e->request->id === $request->id);
    });

    it('dispatches ApprovalApproved when request is approved via last decision', function () {
        Event::fake([ApprovalApproved::class, HandleApprovalDecision::class]);

        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        $step = CrmApprovalStep::factory()->create([
            'approval_flow_id' => $flow->id,
            'step_order' => 1,
            'approver_type' => 'role',
            'required' => true,
        ]);
        $user = User::factory()->create();
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'workflow_run_id' => CrmWorkflowRun::factory()->create()->id,
            'status' => 'pending',
        ]);

        $engine->recordDecision($request, $step, $user, 'approved', null);

        Event::assertDispatched(ApprovalApproved::class);
    });

    it('dispatches ApprovalRejected when request is rejected', function () {
        Event::fake([ApprovalRejected::class, HandleApprovalDecision::class]);

        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        $step = CrmApprovalStep::factory()->create([
            'approval_flow_id' => $flow->id,
            'step_order' => 1,
            'approver_type' => 'role',
            'required' => true,
        ]);
        $user = User::factory()->create();
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'workflow_run_id' => CrmWorkflowRun::factory()->create()->id,
            'status' => 'pending',
        ]);

        $engine->recordDecision($request, $step, $user, 'rejected', null);

        Event::assertDispatched(ApprovalRejected::class);
    });

    it('dispatches ApprovalExpired when request expires', function () {
        Event::fake([ApprovalExpired::class]);

        $engine = approvalEngine();
        $request = CrmApprovalRequest::factory()->create(['status' => 'pending']);

        $engine->expireRequest($request);

        Event::assertDispatched(ApprovalExpired::class);
    });

    it('dispatches ApprovalEscalated when request is escalated', function () {
        Event::fake([ApprovalEscalated::class]);

        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['escalation_model' => 'manager']);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
        ]);

        $engine->escalateRequest($request);

        Event::assertDispatched(ApprovalEscalated::class);
    });
});

// ─── Phase 4D — HandleApprovalDecision Listener ──────────────────

describe('HandleApprovalDecision', function () {

    function setupPausedRun(): array
    {
        $flow = CrmApprovalFlow::factory()->create();
        CrmApprovalStep::factory()->create([
            'approval_flow_id' => $flow->id,
            'step_order' => 1,
            'approver_type' => 'role',
            'required' => true,
        ]);
        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = CrmWorkflow::factory()->create(['entity_type' => 'project']);
        CrmWorkflowTrigger::factory()->create(['workflow_id' => $wf->id]);
        $action = CrmWorkflowActionModel::factory()->create([
            'workflow_id' => $wf->id,
            'action_type' => 'request_approval',
            'configuration_json' => ['approval_flow_id' => $flow->id],
            'sort_order' => 0,
        ]);
        $run = CrmWorkflowRun::factory()->create([
            'workflow_id' => $wf->id,
            'status' => WorkflowStatusCatalog::RUN_PAUSED,
            'context_snapshot' => ['event_payload' => [], 'project_id' => $project->id],
        ]);
        $approvalRequest = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'workflow_run_id' => $run->id,
        ]);
        CrmWorkflowActionRun::factory()->create([
            'workflow_run_id' => $run->id,
            'action_type' => 'request_approval',
            'status' => WorkflowStatusCatalog::ACTION_WAITING,
            'response_json' => [
                'approval_request_id' => $approvalRequest->id,
                'crm_workflow_action_id' => $action->id,
            ],
        ]);

        return [$approvalRequest, $run, $user, $action];
    }

    it('resumes paused workflow run on approval', function () {
        [$approvalRequest, $run, $user] = setupPausedRun();
        $approvalRequest->update(['status' => 'approved', 'completed_at' => now()]);

        $listener = app(HandleApprovalDecision::class);
        $listener->handleApproved(new ApprovalApproved($approvalRequest->fresh(), $user, null));

        $run->refresh();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);
    });

    it('does nothing when workflow run is not paused on approval', function () {
        $request = CrmApprovalRequest::factory()->create(['status' => 'approved']);
        $listener = app(HandleApprovalDecision::class);

        $listener->handleApproved(new ApprovalApproved($request, User::factory()->create(), null));

        expect(true)->toBeTrue();
    });

    it('resumes paused workflow run on rejection', function () {
        [$approvalRequest, $run, $user] = setupPausedRun();
        $approvalRequest->update(['status' => 'rejected', 'completed_at' => now()]);

        $listener = app(HandleApprovalDecision::class);
        $listener->handleRejected(new ApprovalRejected($approvalRequest->fresh(), $user, null));

        $run->refresh();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_FAILED);
    });
});

// ─── Phase 4D — CheckApprovalSlaJob ──────────────────────────────

describe('CheckApprovalSlaJob', function () {

    it('processes pending requests with SLA configuration', function () {
        $flow = CrmApprovalFlow::factory()->create([
            'sla_breach_minutes' => 60,
            'escalation_model' => 'none',
        ]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'requested_at' => now()->subHours(3),
            'status' => 'pending',
        ]);

        $job = new CheckApprovalSlaJob;
        $job->handle(app(ApprovalEngineInterface::class));

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_EXPIRED);
    });

    it('skips requests without SLA configuration', function () {
        $flow = CrmApprovalFlow::factory()->create(['sla_breach_minutes' => null]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'status' => 'pending',
        ]);

        $job = new CheckApprovalSlaJob;
        $job->handle(app(ApprovalEngineInterface::class));

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_PENDING);
    });

    it('processes specific request when requestId is set', function () {
        $flow1 = CrmApprovalFlow::factory()->create(['sla_breach_minutes' => 60]);
        CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow1->id,
            'requested_at' => now()->subHours(3),
            'status' => 'pending',
        ]);
        $flow2 = CrmApprovalFlow::factory()->create(['sla_breach_minutes' => 60]);
        $target = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow2->id,
            'requested_at' => now()->subHours(3),
            'status' => 'pending',
        ]);

        $job = new CheckApprovalSlaJob($target->id);
        $job->handle(app(ApprovalEngineInterface::class));

        $target->refresh();
        expect($target->status)->toBe(ApprovalStatusCatalog::REQUEST_EXPIRED);
    });
});

// ─── Phase 4D — Artisan Commands ─────────────────────────────────

describe('Approval Commands', function () {

    it('crm:approvals:check-sla dispatches SLA job', function () {
        Queue::fake();

        $this->artisan(CrmApprovalsCheckSlaCommand::class)
            ->assertSuccessful();

        Queue::assertPushed(CheckApprovalSlaJob::class, fn ($job) => $job->requestId === null);
    });

    it('crm:approvals:check-sla with request-id dispatches targeted job', function () {
        Queue::fake();

        $this->artisan(CrmApprovalsCheckSlaCommand::class, ['--request-id' => '5'])
            ->assertSuccessful();

        Queue::assertPushed(CheckApprovalSlaJob::class, fn ($job) => $job->requestId === 5);
    });

    it('crm:approvals:escalate escalates pending requests', function () {
        $flow = CrmApprovalFlow::factory()->create([
            'escalation_model' => 'manager',
        ]);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'status' => 'pending',
        ]);

        $this->artisan(CrmApprovalsEscalateCommand::class)
            ->assertSuccessful();

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_ESCALATED);
    });

    it('crm:approvals:escalate with request-id targets specific request', function () {
        $flow = CrmApprovalFlow::factory()->create(['escalation_model' => 'manager']);
        $target = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'status' => 'pending',
        ]);
        CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'status' => 'pending',
        ]);

        $this->artisan(CrmApprovalsEscalateCommand::class, ['--request-id' => $target->id])
            ->assertSuccessful();

        $target->refresh();
        expect($target->status)->toBe(ApprovalStatusCatalog::REQUEST_ESCALATED);
    });
});

// ─── Phase 4D — API Resources Contract ───────────────────────────

describe('Approval API Resources', function () {

    it('ApprovalRequestResource has expected structure', function () {
        $request = CrmApprovalRequest::factory()->create();
        $resource = new ApprovalRequestResource($request);
        $data = $resource->resolve(request());

        expect($data)->toHaveKey('id');
        expect($data)->toHaveKey('approval_flow_id');
        expect($data)->toHaveKey('workflow_run_id');
        expect($data)->toHaveKey('entity_type');
        expect($data)->toHaveKey('entity_id');
        expect($data)->toHaveKey('status');
        expect($data)->toHaveKey('requested_by');
        expect($data)->toHaveKey('requested_at');
        expect($data)->toHaveKey('completed_at');
        expect($data)->toHaveKey('notes');
    });

    it('ApprovalDecisionResource has expected structure', function () {
        $flow = CrmApprovalFlow::factory()->create();
        $request = CrmApprovalRequest::factory()->create(['approval_flow_id' => $flow->id]);
        $decision = CrmApprovalDecision::factory()->create([
            'approval_request_id' => $request->id,
        ]);
        $resource = new ApprovalDecisionResource($decision);
        $data = $resource->resolve(request());

        expect($data)->toHaveKey('id');
        expect($data)->toHaveKey('approval_request_id');
        expect($data)->toHaveKey('approval_step_id');
        expect($data)->toHaveKey('user_id');
        expect($data)->toHaveKey('decision');
        expect($data)->toHaveKey('comment');
        expect($data)->toHaveKey('decided_at');
    });
});

// ─── Phase 4E — Approval Analytics Fields ────────────────────────

describe('Approval Analytics — Schema', function () {

    it('has analytics columns on crm_approval_requests', function () {
        $columns = Schema::getColumnListing('crm_approval_requests');

        expect($columns)->toContain('approved_at');
        expect($columns)->toContain('rejected_at');
        expect($columns)->toContain('first_response_at');
        expect($columns)->toContain('resolution_time_minutes');
        expect($columns)->toContain('escalation_count');
    });
});

describe('Approval Analytics — Engine Population', function () {

    it('sets first_response_at on first decision', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'workflow_run_id' => CrmWorkflowRun::factory()->create()->id,
            'status' => 'pending',
        ]);

        $engine->recordDecision($request, $step, $user, 'approved', null);

        $request->refresh();
        expect($request->first_response_at)->not->toBeNull();
    });

    it('sets approved_at and resolution_time on approval', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'workflow_run_id' => CrmWorkflowRun::factory()->create()->id,
            'status' => 'pending',
            'requested_at' => now()->subHours(2),
        ]);

        $engine->recordDecision($request, $step, $user, 'approved', null);

        $request->refresh();
        expect($request->approved_at)->not->toBeNull();
        expect($request->rejected_at)->toBeNull();
        expect($request->resolution_time_minutes)->toBeGreaterThan(100);
    });

    it('sets rejected_at and resolution_time on rejection', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['strategy' => 'first_approver_wins']);
        $step = CrmApprovalStep::factory()->create(['approval_flow_id' => $flow->id]);
        $user = User::factory()->create();
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'workflow_run_id' => CrmWorkflowRun::factory()->create()->id,
            'status' => 'pending',
            'requested_at' => now()->subHours(2),
        ]);

        $engine->recordDecision($request, $step, $user, 'rejected', null);

        $request->refresh();
        expect($request->rejected_at)->not->toBeNull();
        expect($request->approved_at)->toBeNull();
        expect($request->resolution_time_minutes)->toBeGreaterThan(100);
    });

    it('sets resolution_time_minutes on expiry', function () {
        $engine = approvalEngine();
        $request = CrmApprovalRequest::factory()->create([
            'status' => 'pending',
            'requested_at' => now()->subHours(5),
        ]);

        $engine->expireRequest($request);

        $request->refresh();
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_EXPIRED);
        expect($request->resolution_time_minutes)->toBeGreaterThan(250);
    });

    it('increments escalation_count on escalation', function () {
        $engine = approvalEngine();
        $flow = CrmApprovalFlow::factory()->create(['escalation_model' => 'manager']);
        $request = CrmApprovalRequest::factory()->create([
            'approval_flow_id' => $flow->id,
            'escalation_count' => 0,
        ]);

        $engine->escalateRequest($request);

        $request->refresh();
        expect($request->escalation_count)->toBe(1);
        expect($request->status)->toBe(ApprovalStatusCatalog::REQUEST_ESCALATED);
    });
});

describe('Approval Analytics — Factory States', function () {

    it('approved state sets approved_at and resolution_time', function () {
        $request = CrmApprovalRequest::factory()->approved()->create();

        expect($request->status)->toBe('approved');
        expect($request->approved_at)->not->toBeNull();
        expect($request->first_response_at)->not->toBeNull();
        expect($request->resolution_time_minutes)->toBeNumeric();
    });

    it('rejected state sets rejected_at', function () {
        $request = CrmApprovalRequest::factory()->rejected()->create();

        expect($request->status)->toBe('rejected');
        expect($request->rejected_at)->not->toBeNull();
        expect($request->resolution_time_minutes)->toBeNumeric();
    });

    it('escalated state sets escalation_count to 1', function () {
        $request = CrmApprovalRequest::factory()->escalated()->create();

        expect($request->status)->toBe('escalated');
        expect($request->escalation_count)->toBe(1);
    });

    it('firstResponseAt state sets first_response_at', function () {
        $request = CrmApprovalRequest::factory()->firstResponseAt(now())->create();

        expect($request->first_response_at)->not->toBeNull();
    });
});
