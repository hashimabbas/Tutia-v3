<?php

use App\Models\CrmApprovalDecision;
use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Models\CrmApprovalStep;
use App\Models\CrmProject;
use App\Models\CrmWorkflowRun;
use App\Models\User;
use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowOperatorCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use App\Services\Crm\Workflows\Contracts\WorkflowActionInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowConditionInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowContextBuilderInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowEvaluatorInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowExecutorInterface;
use App\Services\Crm\Workflows\Contracts\WorkflowTriggerInterface;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowConditionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;
use App\Services\Crm\Workflows\DTOs\WorkflowExecutionResult;

// ─── Catalog Tests ───────────────────────────────────────────────

describe('WorkflowOperatorCatalog', function () {

    it('contains all expected operators', function () {
        expect(WorkflowOperatorCatalog::ALL)->toHaveCount(11);
        expect(WorkflowOperatorCatalog::ALL)->toContain(
            WorkflowOperatorCatalog::EQ,
            WorkflowOperatorCatalog::NEQ,
            WorkflowOperatorCatalog::GT,
            WorkflowOperatorCatalog::GTE,
            WorkflowOperatorCatalog::LT,
            WorkflowOperatorCatalog::LTE,
            WorkflowOperatorCatalog::IN,
            WorkflowOperatorCatalog::NOT_IN,
            WorkflowOperatorCatalog::CONTAINS,
            WorkflowOperatorCatalog::IS_EMPTY,
            WorkflowOperatorCatalog::NOT_EMPTY,
        );
    });

    it('validates known operators', function () {
        expect(WorkflowOperatorCatalog::isValid('eq'))->toBeTrue();
        expect(WorkflowOperatorCatalog::isValid('contains'))->toBeTrue();
        expect(WorkflowOperatorCatalog::isValid('not_empty'))->toBeTrue();
    });

    it('rejects unknown operators', function () {
        expect(WorkflowOperatorCatalog::isValid('regex'))->toBeFalse();
        expect(WorkflowOperatorCatalog::isValid('matches'))->toBeFalse();
        expect(WorkflowOperatorCatalog::isValid(''))->toBeFalse();
    });

    it('identifies array-valued operators', function () {
        expect(WorkflowOperatorCatalog::requiresArrayValue('in'))->toBeTrue();
        expect(WorkflowOperatorCatalog::requiresArrayValue('not_in'))->toBeTrue();
        expect(WorkflowOperatorCatalog::requiresArrayValue('eq'))->toBeFalse();
        expect(WorkflowOperatorCatalog::requiresArrayValue('gt'))->toBeFalse();
    });
});

describe('WorkflowActionCatalog', function () {

    it('contains all expected action types', function () {
        expect(WorkflowActionCatalog::ALL)->toHaveCount(13);
    });

    it('groups communication actions', function () {
        expect(WorkflowActionCatalog::COMMUNICATION_ACTIONS)->toHaveCount(4);
        expect(WorkflowActionCatalog::COMMUNICATION_ACTIONS)->toContain(
            'send_email', 'send_whatsapp', 'send_sms', 'send_portal_notification',
        );
    });

    it('groups CRM actions', function () {
        expect(WorkflowActionCatalog::CRM_ACTIONS)->toHaveCount(5);
        expect(WorkflowActionCatalog::CRM_ACTIONS)->toContain(
            'create_activity', 'create_task', 'create_note', 'assign_owner', 'update_status',
        );
    });

    it('groups project actions', function () {
        expect(WorkflowActionCatalog::PROJECT_ACTIONS)->toHaveCount(3);
        expect(WorkflowActionCatalog::PROJECT_ACTIONS)->toContain(
            'create_risk', 'create_issue', 'create_change_order',
        );
    });

    it('validates known actions', function () {
        expect(WorkflowActionCatalog::isValid('send_email'))->toBeTrue();
        expect(WorkflowActionCatalog::isValid('create_task'))->toBeTrue();
        expect(WorkflowActionCatalog::isValid('create_issue'))->toBeTrue();
    });

    it('rejects unknown actions', function () {
        expect(WorkflowActionCatalog::isValid('send_pigeon'))->toBeFalse();
        expect(WorkflowActionCatalog::isValid('do_something'))->toBeFalse();
    });

    it('identifies communication actions', function () {
        expect(WorkflowActionCatalog::isCommunication('send_email'))->toBeTrue();
        expect(WorkflowActionCatalog::isCommunication('send_whatsapp'))->toBeTrue();
        expect(WorkflowActionCatalog::isCommunication('create_task'))->toBeFalse();
    });
});

describe('WorkflowStatusCatalog', function () {

    it('contains all run statuses', function () {
        expect(WorkflowStatusCatalog::RUN_ALL)->toHaveCount(6);
        expect(WorkflowStatusCatalog::RUN_ALL)->toContain(
            'pending', 'running', 'completed', 'failed', 'skipped', 'paused',
        );
    });

    it('contains all action statuses', function () {
        expect(WorkflowStatusCatalog::ACTION_ALL)->toHaveCount(6);
    });

    it('validates statuses', function () {
        expect(WorkflowStatusCatalog::isValidRunStatus('completed'))->toBeTrue();
        expect(WorkflowStatusCatalog::isValidRunStatus('unknown'))->toBeFalse();
        expect(WorkflowStatusCatalog::isValidActionStatus('failed'))->toBeTrue();
        expect(WorkflowStatusCatalog::isValidActionStatus('unknown'))->toBeFalse();
    });

    it('identifies terminal statuses', function () {
        expect(WorkflowStatusCatalog::isTerminal('completed'))->toBeTrue();
        expect(WorkflowStatusCatalog::isTerminal('failed'))->toBeTrue();
        expect(WorkflowStatusCatalog::isTerminal('skipped'))->toBeTrue();
        expect(WorkflowStatusCatalog::isTerminal('pending'))->toBeFalse();
        expect(WorkflowStatusCatalog::isTerminal('running'))->toBeFalse();
        expect(WorkflowStatusCatalog::isTerminal('paused'))->toBeFalse();
    });
});

// ─── DTO Tests ───────────────────────────────────────────────────

describe('WorkflowContext DTO', function () {

    it('is immutable via readonly properties', function () {
        $event = new stdClass;
        $project = CrmProject::factory()->create();
        $user = User::factory()->create();

        $context = new WorkflowContext(
            correlationId: 'corr-123',
            event: $event,
            eventPayload: ['key' => 'value'],
            project: $project,
            triggeredBy: $user,
        );

        expect($context->correlationId)->toBe('corr-123');
        expect($context->event)->toBe($event);
        expect($context->eventPayload)->toBe(['key' => 'value']);
        expect($context->project)->toBe($project);
        expect($context->triggeredBy)->toBe($user);
    });

    it('builds a frozen snapshot of context', function () {
        $event = new stdClass;
        $project = CrmProject::factory()->create();

        $context = new WorkflowContext(
            correlationId: 'corr-456',
            event: $event,
            eventPayload: ['health_score' => 42],
            project: $project,
            triggeredBy: null,
        );

        $snapshot = $context->snapshot();

        expect($snapshot)->toHaveKey('correlation_id');
        expect($snapshot)->toHaveKey('event_payload');
        expect($snapshot['correlation_id'])->toBe('corr-456');
        expect($snapshot['event_payload'])->toBe(['health_score' => 42]);
        expect($snapshot['project_id'])->toBe($project->id);
        expect($snapshot['triggered_by_id'])->toBeNull();
    });

    it('accepts null project and user', function () {
        $context = new WorkflowContext(
            correlationId: 'corr-789',
            event: new stdClass,
            eventPayload: [],
            project: null,
            triggeredBy: null,
        );

        expect($context->project)->toBeNull();
        expect($context->triggeredBy)->toBeNull();
        expect($context->snapshot()['project_id'])->toBeNull();
    });
});

describe('WorkflowConditionResult DTO', function () {

    it('stores a single condition evaluation result', function () {
        $result = new WorkflowConditionResult(
            conditionId: 1,
            field: 'severity',
            operator: 'eq',
            expectedValue: 'blocker',
            actualValue: 'major',
            passed: false,
            groupOrder: 0,
        );

        expect($result->conditionId)->toBe(1);
        expect($result->field)->toBe('severity');
        expect($result->operator)->toBe('eq');
        expect($result->passed)->toBeFalse();
        expect($result->groupOrder)->toBe(0);
    });

    it('stores a passing condition result', function () {
        $result = new WorkflowConditionResult(
            conditionId: 2,
            field: 'status',
            operator: 'eq',
            expectedValue: 'escalated',
            actualValue: 'escalated',
            passed: true,
            groupOrder: 0,
        );

        expect($result->passed)->toBeTrue();
    });
});

describe('WorkflowActionResult DTO', function () {

    it('stores a successful action result', function () {
        $result = new WorkflowActionResult(
            actionId: 1,
            actionType: 'send_email',
            configuration: ['template_key' => 'issue.escalated'],
            success: true,
            response: ['correlation_id' => 'corr-abc'],
        );

        expect($result->success)->toBeTrue();
        expect($result->actionType)->toBe('send_email');
        expect($result->response)->toBe(['correlation_id' => 'corr-abc']);
        expect($result->errorMessage)->toBeNull();
    });

    it('stores a failed action result with error message', function () {
        $result = new WorkflowActionResult(
            actionId: 2,
            actionType: 'create_task',
            configuration: ['title' => 'Test'],
            success: false,
            errorMessage: 'Failed to create task: project not found',
        );

        expect($result->success)->toBeFalse();
        expect($result->response)->toBeNull();
        expect($result->errorMessage)->toContain('project not found');
    });
});

describe('WorkflowExecutionResult DTO', function () {

    it('stores execution summary for passing conditions', function () {
        $conditionResult = new WorkflowConditionResult(
            conditionId: 1, field: 'severity', operator: 'eq',
            expectedValue: 'blocker', actualValue: 'blocker',
            passed: true, groupOrder: 0,
        );

        $actionResult = new WorkflowActionResult(
            actionId: 1, actionType: 'send_email',
            configuration: [], success: true,
        );

        $result = new WorkflowExecutionResult(
            workflowId: 1,
            conditionsPassed: true,
            conditionResults: [$conditionResult],
            actionResults: [$actionResult],
            allActionsSucceeded: true,
            status: 'completed',
        );

        expect($result->workflowId)->toBe(1);
        expect($result->conditionsPassed)->toBeTrue();
        expect($result->allActionsSucceeded)->toBeTrue();
        expect($result->conditionResults)->toHaveCount(1);
        expect($result->actionResults)->toHaveCount(1);
        expect($result->status)->toBe('completed');
    });

    it('stores execution summary for failed conditions', function () {
        $result = new WorkflowExecutionResult(
            workflowId: 2,
            conditionsPassed: false,
            conditionResults: [],
            actionResults: [],
            allActionsSucceeded: true,
            status: 'skipped',
        );

        expect($result->conditionsPassed)->toBeFalse();
        expect($result->actionResults)->toBeEmpty();
        expect($result->status)->toBe('skipped');
    });
});

// ─── Contract Existence Tests ────────────────────────────────────

describe('CRM-6 Contracts', function () {

    it('WorkflowTriggerInterface exists with matches method', function () {
        expect(interface_exists(WorkflowTriggerInterface::class))->toBeTrue();
        expect(method_exists(WorkflowTriggerInterface::class, 'matches'))->toBeTrue();
    });

    it('WorkflowConditionInterface exists with evaluate method', function () {
        expect(interface_exists(WorkflowConditionInterface::class))->toBeTrue();
        expect(method_exists(WorkflowConditionInterface::class, 'evaluate'))->toBeTrue();
    });

    it('WorkflowActionInterface exists with execute method', function () {
        expect(interface_exists(WorkflowActionInterface::class))->toBeTrue();
        expect(method_exists(WorkflowActionInterface::class, 'execute'))->toBeTrue();
    });

    it('WorkflowEvaluatorInterface exists', function () {
        expect(interface_exists(WorkflowEvaluatorInterface::class))->toBeTrue();
        expect(method_exists(WorkflowEvaluatorInterface::class, 'evaluate'))->toBeTrue();
    });

    it('WorkflowExecutorInterface exists', function () {
        expect(interface_exists(WorkflowExecutorInterface::class))->toBeTrue();
        expect(method_exists(WorkflowExecutorInterface::class, 'execute'))->toBeTrue();
    });

    it('WorkflowContextBuilderInterface exists', function () {
        expect(interface_exists(WorkflowContextBuilderInterface::class))->toBeTrue();
        expect(method_exists(WorkflowContextBuilderInterface::class, 'build'))->toBeTrue();
    });
});

// ─── Container Binding Tests ─────────────────────────────────────

describe('CRM-6 Container Bindings', function () {

    it('binds WorkflowTriggerInterface in the container', function () {
        expect(app()->bound(WorkflowTriggerInterface::class))->toBeTrue();
    });

    it('binds WorkflowConditionInterface in the container', function () {
        expect(app()->bound(WorkflowConditionInterface::class))->toBeTrue();
    });

    it('binds WorkflowContextBuilderInterface in the container', function () {
        expect(app()->bound(WorkflowContextBuilderInterface::class))->toBeTrue();
    });

    it('binds WorkflowEvaluatorInterface in the container', function () {
        expect(app()->bound(WorkflowEvaluatorInterface::class))->toBeTrue();
    });

    it('binds WorkflowExecutorInterface in the container', function () {
        expect(app()->bound(WorkflowExecutorInterface::class))->toBeTrue();
    });
});

// ─── Model Relationship Tests ────────────────────────────────────

describe('Workflow Model Relationships', function () {

    it('crm_workflows table exists with version column', function () {
        $schema = Schema::getColumnListing('crm_workflows');
        expect($schema)->toContain('version');
    });

    it('crm_workflow_runs table exists with context_snapshot column', function () {
        $schema = Schema::getColumnListing('crm_workflow_runs');
        expect($schema)->toContain('context_snapshot');
    });
});

// ─── Approval Engine Schema and Models (Phase 4A) ────────────────

describe('Approval Engine — Tables', function () {

    it('crm_approval_flows table exists with expected columns', function () {
        $cols = Schema::getColumnListing('crm_approval_flows');
        expect($cols)->toContain('id', 'name', 'strategy', 'escalation_model');
        expect($cols)->toContain('sla_warning_minutes', 'sla_breach_minutes');
        expect($cols)->toContain('is_active');
    });

    it('crm_approval_steps table exists with expected columns', function () {
        $cols = Schema::getColumnListing('crm_approval_steps');
        expect($cols)->toContain('id', 'approval_flow_id', 'step_order');
        expect($cols)->toContain('approver_type', 'approver_id', 'required');
    });

    it('crm_approval_requests table exists with expected columns', function () {
        $cols = Schema::getColumnListing('crm_approval_requests');
        expect($cols)->toContain('id', 'approval_flow_id', 'workflow_run_id');
        expect($cols)->toContain('entity_type', 'entity_id', 'status');
        expect($cols)->toContain('requested_by', 'requested_at');
        expect($cols)->toContain('sla_warning_sent_at', 'sla_breach_at', 'escalated_at');
    });

    it('crm_approval_decisions table exists with expected columns', function () {
        $cols = Schema::getColumnListing('crm_approval_decisions');
        expect($cols)->toContain('id', 'approval_request_id', 'approval_step_id');
        expect($cols)->toContain('user_id', 'decision', 'comment', 'decided_at');
    });
});

describe('Approval Engine — Models', function () {

    it('CrmApprovalFlow can be created via factory', function () {
        $flow = CrmApprovalFlow::factory()->create();
        expect($flow)->toBeInstanceOf(CrmApprovalFlow::class);
        expect($flow->id)->toBeGreaterThan(0);
        expect($flow->is_active)->toBeTrue();
    });

    it('CrmApprovalFlow casts escalation_config as array', function () {
        $flow = CrmApprovalFlow::factory()->create([
            'escalation_config' => ['fallback_role' => 'director'],
        ]);
        expect($flow->escalation_config)->toBeArray();
        expect($flow->escalation_config['fallback_role'])->toBe('director');
    });

    it('CrmApprovalStep belongs to CrmApprovalFlow', function () {
        $flow = CrmApprovalFlow::factory()->create();
        $step = CrmApprovalStep::factory()->create([
            'approval_flow_id' => $flow->id,
        ]);
        expect($step->flow->id)->toBe($flow->id);
    });

    it('CrmApprovalRequest can be created via factory', function () {
        $request = CrmApprovalRequest::factory()->create();
        expect($request)->toBeInstanceOf(CrmApprovalRequest::class);
        expect($request->status)->toBe('pending');
    });

    it('CrmApprovalRequest has relationships', function () {
        $request = CrmApprovalRequest::factory()->create();
        expect($request->flow)->toBeInstanceOf(CrmApprovalFlow::class);
        expect($request->workflowRun)->toBeInstanceOf(CrmWorkflowRun::class);
        expect($request->requester)->toBeInstanceOf(User::class);
    });

    it('CrmApprovalDecision can be created via factory', function () {
        $decision = CrmApprovalDecision::factory()->create();
        expect($decision)->toBeInstanceOf(CrmApprovalDecision::class);
        expect($decision->decision)->toBeIn(['approved', 'rejected', 'abstained']);
    });

    it('CrmApprovalDecision has relationships', function () {
        $decision = CrmApprovalDecision::factory()->create();
        expect($decision->request)->toBeInstanceOf(CrmApprovalRequest::class);
        expect($decision->step)->toBeInstanceOf(CrmApprovalStep::class);
        expect($decision->user)->toBeInstanceOf(User::class);
    });

    it('CrmApprovalFlow has steps and requests relationships', function () {
        $flow = CrmApprovalFlow::factory()->create();
        CrmApprovalStep::factory()->count(2)->create([
            'approval_flow_id' => $flow->id,
        ]);
        expect($flow->steps)->toHaveCount(2);
    });
});

describe('Approval Engine — Factory States', function () {

    it('CrmApprovalFlowFactory inactive state', function () {
        $flow = CrmApprovalFlow::factory()->inactive()->create();
        expect($flow->is_active)->toBeFalse();
    });

    it('CrmApprovalFlowFactory firstApproverWins state', function () {
        $flow = CrmApprovalFlow::factory()->firstApproverWins()->create();
        expect($flow->strategy)->toBe('first_approver_wins');
    });

    it('CrmApprovalFlowFactory majorityVote state', function () {
        $flow = CrmApprovalFlow::factory()->majorityVote()->create();
        expect($flow->strategy)->toBe('majority_vote');
    });

    it('CrmApprovalRequestFactory approved state', function () {
        $req = CrmApprovalRequest::factory()->approved()->create();
        expect($req->status)->toBe('approved');
        expect($req->completed_at)->not->toBeNull();
    });

    it('CrmApprovalRequestFactory rejected state', function () {
        $req = CrmApprovalRequest::factory()->rejected()->create();
        expect($req->status)->toBe('rejected');
    });

    it('CrmApprovalRequestFactory expired state', function () {
        $req = CrmApprovalRequest::factory()->expired()->create();
        expect($req->status)->toBe('expired');
    });

    it('CrmApprovalDecisionFactory approved state', function () {
        $d = CrmApprovalDecision::factory()->approved()->create();
        expect($d->decision)->toBe('approved');
    });

    it('CrmApprovalDecisionFactory rejected state', function () {
        $d = CrmApprovalDecision::factory()->rejected()->create();
        expect($d->decision)->toBe('rejected');
    });

    it('CrmApprovalDecisionFactory abstained state', function () {
        $d = CrmApprovalDecision::factory()->abstained()->create();
        expect($d->decision)->toBe('abstained');
    });
});
