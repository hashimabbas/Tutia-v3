<?php

use App\Events\Crm\IssueEscalated;
use App\Events\Crm\RiskClosed;
use App\Models\CrmActivity;
use App\Models\CrmApprovalFlow;
use App\Models\CrmApprovalRequest;
use App\Models\CrmApprovalStep;
use App\Models\CrmChangeOrder;
use App\Models\CrmIssue;
use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowAction as CrmWorkflowActionModel;
use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowRun;
use App\Models\CrmWorkflowTrigger;
use App\Models\User;
use App\Services\Crm\Approvals\Contracts\ApprovalEngineInterface;
use App\Services\Crm\Communications\NotificationCoordinator;
use App\Services\Crm\Communications\NotificationInstruction;
use App\Services\Crm\Workflows\Actions\AssignOwnerWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateActivityWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateChangeOrderWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateIssueWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateNoteWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateRiskWorkflowAction;
use App\Services\Crm\Workflows\Actions\CreateTaskWorkflowAction;
use App\Services\Crm\Workflows\Actions\RequestApprovalWorkflowAction;
use App\Services\Crm\Workflows\Actions\SendEmailWorkflowAction;
use App\Services\Crm\Workflows\Actions\SendPortalNotificationWorkflowAction;
use App\Services\Crm\Workflows\Actions\SendSmsWorkflowAction;
use App\Services\Crm\Workflows\Actions\SendWhatsAppWorkflowAction;
use App\Services\Crm\Workflows\Actions\UpdateStatusWorkflowAction;
use App\Services\Crm\Workflows\Actions\WorkflowActionHandlerInterface;
use App\Services\Crm\Workflows\Actions\WorkflowActionRegistry;
use App\Services\Crm\Workflows\Catalogs\WorkflowActionCatalog;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;
use App\Services\Crm\Workflows\Services\CrmActionService;
use App\Services\Crm\Workflows\WorkflowCondition;
use App\Services\Crm\Workflows\WorkflowContextBuilder;
use App\Services\Crm\Workflows\WorkflowEngine;
use App\Services\Crm\Workflows\WorkflowEvaluator;
use App\Services\Crm\Workflows\WorkflowExecutor;
use App\Services\Crm\Workflows\WorkflowLoader;
use Illuminate\Support\Facades\Queue;

// ─── Setup ───────────────────────────────────────────────────────

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

function wf(): CrmWorkflow
{
    return CrmWorkflow::factory()->create(['entity_type' => 'project']);
}

function triggerWf(CrmWorkflow $wf, string $eventKey = 'issue.escalated'): void
{
    CrmWorkflowTrigger::factory()->create([
        'workflow_id' => $wf->id,
        'event_key' => $eventKey,
    ]);
}

function actionWf(CrmWorkflow $wf, string $actionType, array $config = [], int $sortOrder = 0, bool $stopOnFail = false): CrmWorkflowActionModel
{
    return CrmWorkflowActionModel::factory()->create([
        'workflow_id' => $wf->id,
        'action_type' => $actionType,
        'configuration_json' => $config,
        'sort_order' => $sortOrder,
        'stop_on_fail' => $stopOnFail,
    ]);
}

function makeEngineWithRegistry(WorkflowActionRegistry $registry): WorkflowEngine
{
    return new WorkflowEngine(
        new WorkflowLoader,
        new WorkflowContextBuilder,
        new WorkflowEvaluator(new WorkflowCondition),
        new WorkflowExecutor($registry),
    );
}

function buildCtx(array $payload = [], string $correlationId = 'corr-p3'): WorkflowContext
{
    return (new WorkflowContextBuilder)->build(new stdClass, $payload, $correlationId);
}

function actionContext(WorkflowContext $ctx, string $actionType, array $config = []): WorkflowActionContext
{
    $action = CrmWorkflowActionModel::factory()->create([
        'action_type' => $actionType,
        'configuration_json' => $config,
        'workflow_id' => CrmWorkflow::factory()->create(['entity_type' => 'project'])->id,
    ]);

    return new WorkflowActionContext($ctx, $action);
}

// ─── WorkflowActionContext DTO ────────────────────────────────────

describe('WorkflowActionContext', function () {

    it('wraps WorkflowContext, CrmWorkflowAction, and optional WorkflowRun', function () {
        $ctx = buildCtx(['id' => 1]);
        $action = CrmWorkflowActionModel::factory()->make(['action_type' => 'send_email']);

        $ac = new WorkflowActionContext($ctx, $action);

        expect($ac->workflowContext)->toBe($ctx);
        expect($ac->action)->toBe($action);
        expect($ac->workflowRun)->toBeNull();
    });

    it('accepts an optional WorkflowRun', function () {
        $ctx = buildCtx(['id' => 1]);
        $action = CrmWorkflowActionModel::factory()->make(['action_type' => 'request_approval']);
        $run = CrmWorkflowRun::factory()->make();

        $ac = new WorkflowActionContext($ctx, $action, $run);

        expect($ac->workflowRun)->toBe($run);
    });
});

// ─── Handler Registration ─────────────────────────────────────────

describe('WorkflowActionRegistry — Phase 3 + Phase 4C Handlers', function () {

    it('registers all 13 action handlers', function () {
        $service = app(CrmActionService::class);
        $coordinator = Mockery::mock(NotificationCoordinator::class);
        $approvalEngine = Mockery::mock(ApprovalEngineInterface::class);
        $registry = new WorkflowActionRegistry;

        $registry->register(new SendEmailWorkflowAction($coordinator));
        $registry->register(new SendSmsWorkflowAction($coordinator));
        $registry->register(new SendWhatsAppWorkflowAction($coordinator));
        $registry->register(new SendPortalNotificationWorkflowAction($coordinator));
        $registry->register(new CreateActivityWorkflowAction($service));
        $registry->register(new CreateTaskWorkflowAction($service));
        $registry->register(new CreateNoteWorkflowAction($service));
        $registry->register(new AssignOwnerWorkflowAction($service));
        $registry->register(new UpdateStatusWorkflowAction($service));
        $registry->register(new CreateRiskWorkflowAction($service));
        $registry->register(new CreateIssueWorkflowAction($service));
        $registry->register(new CreateChangeOrderWorkflowAction($service));
        $registry->register(new RequestApprovalWorkflowAction($approvalEngine));

        foreach (WorkflowActionCatalog::ALL as $type) {
            expect($registry->hasHandler($type))
                ->toBeTrue("Handler not registered for: {$type}");
        }
    });

    it('container resolves registry with all 13 handlers', function () {
        $registry = app(WorkflowActionRegistry::class);

        expect($registry)->toBeInstanceOf(WorkflowActionRegistry::class);

        foreach (WorkflowActionCatalog::ALL as $type) {
            expect($registry->hasHandler($type))
                ->toBeTrue("Container did not register handler for: {$type}");
        }
    });
});

// ─── Communication Handlers (Phase 3A) ───────────────────────────

describe('Communication Action Handlers', function () {

    it('SendEmailWorkflowAction handles send_email', function () {
        $coordinator = Mockery::mock(NotificationCoordinator::class);
        $handler = new SendEmailWorkflowAction($coordinator);

        expect($handler->handles())->toBe(WorkflowActionCatalog::SEND_EMAIL);
    });

    it('SendEmailWorkflowAction dispatches instruction on success', function () {
        Queue::fake();

        $event = new IssueEscalated(
            CrmIssue::factory()->create(),
            User::factory()->create(),
            'blocker',
        );

        $coordinator = Mockery::mock(NotificationCoordinator::class);
        $coordinator->shouldReceive('handle')
            ->once()
            ->andReturn(new NotificationInstruction(
                event: $event::class,
                template: 'issue.escalated',
                channels: ['email'],
                recipients: [],
                payload: [],
                correlationId: 'corr-test',
                idempotencyKey: 'test-key',
            ));

        $handler = new SendEmailWorkflowAction($coordinator);
        $builder = new WorkflowContextBuilder;
        $ctx = $builder->build($event, ['id' => 1], 'corr-test');
        $ac = actionContext($ctx, 'send_email');

        $result = $handler->execute($ac);

        expect($result->success)->toBeTrue();
        expect($result->response['dispatched'])->toBeTrue();
    });

    it('SendSmsWorkflowAction handles send_sms', function () {
        $coordinator = Mockery::mock(NotificationCoordinator::class);
        $handler = new SendSmsWorkflowAction($coordinator);

        expect($handler->handles())->toBe(WorkflowActionCatalog::SEND_SMS);
    });

    it('SendWhatsAppWorkflowAction handles send_whatsapp', function () {
        $coordinator = Mockery::mock(NotificationCoordinator::class);
        $handler = new SendWhatsAppWorkflowAction($coordinator);

        expect($handler->handles())->toBe(WorkflowActionCatalog::SEND_WHATSAPP);
    });

    it('SendPortalNotificationWorkflowAction handles send_portal_notification', function () {
        $coordinator = Mockery::mock(NotificationCoordinator::class);
        $handler = new SendPortalNotificationWorkflowAction($coordinator);

        expect($handler->handles())->toBe(WorkflowActionCatalog::SEND_PORTAL_NOTIFICATION);
    });

    it('communication handlers handle coordinator returning null gracefully', function () {
        $event = new RiskClosed(
            CrmProjectRisk::factory()->create(),
            User::factory()->create(),
        );
        $coordinator = Mockery::mock(NotificationCoordinator::class);
        $coordinator->shouldReceive('handle')->once()->andReturnNull();

        $handler = new SendEmailWorkflowAction($coordinator);
        $builder = new WorkflowContextBuilder;
        $ctx = $builder->build($event, ['id' => 1], 'corr-test');
        $ac = actionContext($ctx, 'send_email');

        $result = $handler->execute($ac);

        expect($result->success)->toBeTrue();
        expect($result->response['dispatched'])->toBeFalse();
    });
});

// ─── CRM Handlers (Phase 3B) ─────────────────────────────────────

describe('CRM Action Handlers — CrmActionService', function () {

    it('createActivity creates CrmActivity with type=general', function () {
        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);

        $svc = app(CrmActionService::class);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_activity', [
            'subject' => 'Test activity',
            'description' => 'Created by workflow',
        ]);

        $activity = $svc->createActivity($ac);

        expect($activity)->toBeInstanceOf(CrmActivity::class);
        expect($activity->type)->toBe('general');
        expect($activity->subject)->toBe('Test activity');
        expect($activity->activitable_id)->toBe($project->id);
    });

    it('createTask creates activity with type=task', function () {
        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);

        $svc = app(CrmActionService::class);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_task', ['subject' => 'Task from workflow']);

        $task = $svc->createTask($ac);

        expect($task)->toBeInstanceOf(CrmActivity::class);
        expect($task->type)->toBe('task');
        expect($task->subject)->toBe('Task from workflow');
    });

    it('createNote creates activity with type=note', function () {
        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);

        $svc = app(CrmActionService::class);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_note', ['description' => 'A note']);

        $note = $svc->createNote($ac);

        expect($note)->toBeInstanceOf(CrmActivity::class);
        expect($note->type)->toBe('note');
        expect($note->description)->toBe('A note');
    });

    it('assignOwner updates owner_id on entity', function () {
        $user = User::factory()->create();
        $issue = CrmIssue::factory()->create();

        $svc = app(CrmActionService::class);
        $ctx = buildCtx(['issue' => $issue, 'id' => $issue->id]);
        $ac = actionContext($ctx, 'assign_owner', [
            'entity_type' => 'issue',
            'owner_id' => $user->id,
        ]);

        $svc->assignOwner($ac);

        $issue->refresh();
        expect($issue->owner_id)->toBe($user->id);
    });

    it('updateStatus changes status field on entity', function () {
        $issue = CrmIssue::factory()->create(['status' => 'open']);

        $svc = app(CrmActionService::class);
        $ctx = buildCtx(['issue' => $issue, 'id' => $issue->id]);
        $ac = actionContext($ctx, 'update_status', [
            'entity_type' => 'issue',
            'field' => 'status',
            'value' => 'resolved',
        ]);

        $svc->updateStatus($ac);

        $issue->refresh();
        expect($issue->status)->toBe('resolved');
    });

    it('createRisk creates CrmProjectRisk', function () {
        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);

        $svc = app(CrmActionService::class);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_risk', [
            'description' => 'New risk',
            'severity' => 'high',
        ]);

        $risk = $svc->createRisk($ac);

        expect($risk)->toBeInstanceOf(CrmProjectRisk::class);
        expect($risk->project_id)->toBe($project->id);
        expect($risk->severity)->toBe('high');
        expect($risk->status)->toBe('identified');
    });

    it('createIssue creates CrmIssue', function () {
        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);

        $svc = app(CrmActionService::class);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_issue', [
            'description' => 'New issue',
            'severity' => 'critical',
        ]);

        $issue = $svc->createIssue($ac);

        expect($issue)->toBeInstanceOf(CrmIssue::class);
        expect($issue->project_id)->toBe($project->id);
        expect($issue->severity)->toBe('critical');
        expect($issue->status)->toBe('open');
    });

    it('createChangeOrder creates CrmChangeOrder', function () {
        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);

        $svc = app(CrmActionService::class);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_change_order', [
            'title' => 'Scope change',
            'cost_impact' => 5000.00,
        ]);

        $co = $svc->createChangeOrder($ac);

        expect($co)->toBeInstanceOf(CrmChangeOrder::class);
        expect($co->project_id)->toBe($project->id);
        expect($co->title)->toBe('Scope change');
        expect((float) $co->cost_impact)->toBe(5000.00);
        expect($co->status)->toBe('pending');
    });
});

describe('CRM Action Handlers — Handler Execute', function () {

    it('CreateActivityWorkflowAction returns success with activity_id', function () {
        $svc = app(CrmActionService::class);
        $handler = new CreateActivityWorkflowAction($svc);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_activity', ['subject' => 'Test']);

        $result = $handler->execute($ac);

        expect($result->success)->toBeTrue();
        expect($result->response)->toHaveKey('activity_id');
    });

    it('CreateTaskWorkflowAction returns success', function () {
        $svc = app(CrmActionService::class);
        $handler = new CreateTaskWorkflowAction($svc);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_task', ['subject' => 'Task']);

        expect($handler->execute($ac)->success)->toBeTrue();
    });

    it('CreateNoteWorkflowAction returns success', function () {
        $svc = app(CrmActionService::class);
        $handler = new CreateNoteWorkflowAction($svc);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_note', ['description' => 'Note']);

        expect($handler->execute($ac)->success)->toBeTrue();
    });

    it('AssignOwnerWorkflowAction returns success', function () {
        $svc = app(CrmActionService::class);
        $handler = new AssignOwnerWorkflowAction($svc);

        $owner = User::factory()->create();
        $issue = CrmIssue::factory()->create();
        $ctx = buildCtx(['issue' => $issue, 'id' => $issue->id]);
        $ac = actionContext($ctx, 'assign_owner', [
            'entity_type' => 'issue',
            'owner_id' => $owner->id,
        ]);

        expect($handler->execute($ac)->success)->toBeTrue();
    });

    it('UpdateStatusWorkflowAction returns success', function () {
        $svc = app(CrmActionService::class);
        $handler = new UpdateStatusWorkflowAction($svc);

        $issue = CrmIssue::factory()->create(['status' => 'open']);
        $ctx = buildCtx(['issue' => $issue, 'id' => $issue->id]);
        $ac = actionContext($ctx, 'update_status', [
            'entity_type' => 'issue',
            'field' => 'status',
            'value' => 'resolved',
        ]);

        expect($handler->execute($ac)->success)->toBeTrue();
    });

    it('CreateRiskWorkflowAction returns success with risk_id', function () {
        $svc = app(CrmActionService::class);
        $handler = new CreateRiskWorkflowAction($svc);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_risk', ['description' => 'Risk']);

        $result = $handler->execute($ac);

        expect($result->success)->toBeTrue();
        expect($result->response)->toHaveKey('risk_id');
    });

    it('CreateIssueWorkflowAction returns success with issue_id', function () {
        $svc = app(CrmActionService::class);
        $handler = new CreateIssueWorkflowAction($svc);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_issue', ['description' => 'Issue']);

        $result = $handler->execute($ac);

        expect($result->success)->toBeTrue();
        expect($result->response)->toHaveKey('issue_id');
    });

    it('CreateChangeOrderWorkflowAction returns success with change_order_id', function () {
        $svc = app(CrmActionService::class);
        $handler = new CreateChangeOrderWorkflowAction($svc);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $ctx = buildCtx(['project' => $project, 'id' => $project->id]);
        $ac = actionContext($ctx, 'create_change_order', ['title' => 'CO']);

        $result = $handler->execute($ac);

        expect($result->success)->toBeTrue();
        expect($result->response)->toHaveKey('change_order_id');
    });

    it('handler exception is caught by executor and marked as failure', function () {
        $failing = new class implements WorkflowActionHandlerInterface
        {
            public function handles(): string
            {
                return 'failing';
            }

            public function execute(WorkflowActionContext $ac): WorkflowActionResult
            {
                throw new RuntimeException('Something went wrong');
            }
        };

        $registry = new WorkflowActionRegistry([$failing]);
        $executor = new WorkflowExecutor($registry);

        $user = User::factory()->create();
        $wf = CrmWorkflow::factory()->create(['entity_type' => 'project', 'created_by' => $user->id]);
        CrmWorkflowActionModel::factory()->create([
            'workflow_id' => $wf->id,
            'action_type' => 'failing',
            'configuration_json' => [],
            'sort_order' => 0,
            'stop_on_fail' => false,
        ]);
        $ctx = buildCtx([]);

        $result = $executor->execute($wf, $ctx);

        expect($result->allActionsSucceeded)->toBeFalse();
        expect($result->actionResults)->toHaveCount(1);
        expect($result->actionResults[0]->success)->toBeFalse();
        expect($result->actionResults[0]->errorMessage)->toContain('Something went wrong');
    });
});

// ─── End-to-End Engine Tests ─────────────────────────────────────

describe('End-to-End: Engine + Real Handlers', function () {

    function makeIssueEscalatedEvent(): IssueEscalated
    {
        return new IssueEscalated(
            CrmIssue::factory()->create(),
            User::factory()->create(),
            'blocker',
        );
    }

    it('executes workflow with create_activity action', function () {
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = wf();
        triggerWf($wf, 'issue.escalated');
        actionWf($wf, 'create_activity', ['subject' => 'Escalation alert'], 0);

        $event = makeIssueEscalatedEvent();
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker'];

        $results = $engine->handle($event, $payload, 'corr-e2e-1');

        expect($results)->toHaveCount(1);
        expect($results[0]->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        expect($run)->not->toBeNull();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);

        $activity = CrmActivity::where('subject', 'Escalation alert')->first();
        expect($activity)->not->toBeNull();
    });

    it('executes workflow with create_issue action', function () {
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = wf();
        triggerWf($wf, 'issue.escalated');
        actionWf($wf, 'create_issue', [
            'description' => 'Escalation follow-up',
            'severity' => 'critical',
        ], 0);

        $event = makeIssueEscalatedEvent();
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker'];

        $results = $engine->handle($event, $payload, 'corr-e2e-2');

        expect($results)->toHaveCount(1);
        expect($results[0]->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);

        $issue = CrmIssue::where('description', 'Escalation follow-up')->first();
        expect($issue)->not->toBeNull();
        expect($issue->severity)->toBe('critical');
    });

    it('executes multiple actions in sequence', function () {
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = wf();
        triggerWf($wf, 'issue.escalated');
        actionWf($wf, 'create_activity', ['subject' => 'Step 1'], 0);
        actionWf($wf, 'create_issue', ['description' => 'Step 2'], 1);

        $event = makeIssueEscalatedEvent();
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker'];

        $results = $engine->handle($event, $payload, 'corr-e2e-3');

        expect($results)->toHaveCount(1);
        expect($results[0]->allActionsSucceeded)->toBeTrue();

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        $actionRuns = CrmWorkflowActionRun::where('workflow_run_id', $run->id)->get();
        expect($actionRuns)->toHaveCount(2);
        expect($actionRuns[0]->status)->toBe(WorkflowStatusCatalog::ACTION_COMPLETED);
        expect($actionRuns[1]->status)->toBe(WorkflowStatusCatalog::ACTION_COMPLETED);
    });

    it('handles stop_on_fail with real handlers', function () {
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = wf();
        triggerWf($wf, 'issue.escalated');
        actionWf($wf, 'nonexistent_action', [], 0, true);

        $event = makeIssueEscalatedEvent();
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker'];

        $results = $engine->handle($event, $payload, 'corr-e2e-4');

        expect($results)->toHaveCount(1);
        expect($results[0]->allActionsSucceeded)->toBeFalse();
        expect($results[0]->status)->toBe(WorkflowStatusCatalog::RUN_FAILED);
    });

    it('run has context_snapshot with event payload', function () {
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = wf();
        triggerWf($wf, 'issue.escalated');
        actionWf($wf, 'create_activity', ['subject' => 'Snapshot test'], 0);

        $event = makeIssueEscalatedEvent();
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker'];

        $engine->handle($event, $payload, 'corr-e2e-5');

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        expect($run->context_snapshot['correlation_id'])->toBe('corr-e2e-5');
        expect($run->context_snapshot['event_payload']['severity'])->toBe('blocker');
    });

    it('creates action runs for each action with correct status', function () {
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = wf();
        triggerWf($wf, 'issue.escalated');
        actionWf($wf, 'create_activity', ['subject' => 'A1'], 0);
        actionWf($wf, 'create_note', ['subject' => 'A2'], 1);

        $event = makeIssueEscalatedEvent();
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker'];

        $engine->handle($event, $payload, 'corr-e2e-6');

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        $actionRuns = CrmWorkflowActionRun::where('workflow_run_id', $run->id)
            ->orderBy('id')
            ->get();

        expect($actionRuns)->toHaveCount(2);
        expect($actionRuns[0]->action_type)->toBe('create_activity');
        expect($actionRuns[1]->action_type)->toBe('create_note');

        foreach ($actionRuns as $ar) {
            expect($ar->status)->toBe(WorkflowStatusCatalog::ACTION_COMPLETED);
        }
    });
});

// ─── Phase 4C — Workflow + Approval Integration ──────────────────

describe('RequestApprovalWorkflowAction', function () {

    it('handles request_approval action type', function () {
        $engine = Mockery::mock(ApprovalEngineInterface::class);
        $handler = new RequestApprovalWorkflowAction($engine);

        expect($handler->handles())->toBe(WorkflowActionCatalog::REQUEST_APPROVAL);
    });

    it('creates approval request and returns pending result', function () {
        $flow = CrmApprovalFlow::factory()->create();
        $user = User::factory()->create();
        $run = CrmWorkflowRun::factory()->create();
        $approvalRequest = CrmApprovalRequest::factory()->make([
            'id' => 999,
            'approval_flow_id' => $flow->id,
            'workflow_run_id' => $run->id,
        ]);

        $engine = Mockery::mock(ApprovalEngineInterface::class);
        $engine->shouldReceive('createRequest')
            ->once()
            ->andReturn($approvalRequest);

        $handler = new RequestApprovalWorkflowAction($engine);
        $ctx = buildCtx(['id' => 1, 'triggered_by' => ['id' => $user->id]]);
        $action = CrmWorkflowActionModel::factory()->create([
            'workflow_id' => CrmWorkflow::factory()->create(['entity_type' => 'project'])->id,
            'action_type' => WorkflowActionCatalog::REQUEST_APPROVAL,
            'configuration_json' => ['approval_flow_id' => $flow->id],
        ]);

        $result = $handler->execute(new WorkflowActionContext($ctx, $action, $run));

        expect($result->success)->toBeTrue();
        expect($result->isPending)->toBeTrue();
        expect($result->response['approval_request_id'])->toBe(999);
        expect($result->response['approval_flow_id'])->toBe($flow->id);
    });

    it('throws when config missing approval_flow_id', function () {
        $engine = Mockery::mock(ApprovalEngineInterface::class);
        $handler = new RequestApprovalWorkflowAction($engine);
        $ctx = buildCtx(['id' => 1]);
        $action = CrmWorkflowActionModel::factory()->create([
            'workflow_id' => CrmWorkflow::factory()->create()->id,
            'action_type' => WorkflowActionCatalog::REQUEST_APPROVAL,
            'configuration_json' => [],
        ]);

        $result = $handler->execute(new WorkflowActionContext($ctx, $action, CrmWorkflowRun::factory()->make()));

        expect($result->success)->toBeFalse();
        expect($result->errorMessage)->toContain('approval_flow_id');
    });

    it('throws when approval flow not found', function () {
        $engine = Mockery::mock(ApprovalEngineInterface::class);
        $handler = new RequestApprovalWorkflowAction($engine);
        $ctx = buildCtx(['id' => 1]);
        $action = CrmWorkflowActionModel::factory()->create([
            'workflow_id' => CrmWorkflow::factory()->create()->id,
            'action_type' => WorkflowActionCatalog::REQUEST_APPROVAL,
            'configuration_json' => ['approval_flow_id' => 99999],
        ]);

        $result = $handler->execute(new WorkflowActionContext($ctx, $action, CrmWorkflowRun::factory()->make()));

        expect($result->success)->toBeFalse();
        expect($result->errorMessage)->toContain('not found');
    });

    it('throws when no workflow run provided', function () {
        $engine = Mockery::mock(ApprovalEngineInterface::class);
        $handler = new RequestApprovalWorkflowAction($engine);
        $flow = CrmApprovalFlow::factory()->create();
        $ctx = buildCtx(['id' => 1]);
        $action = CrmWorkflowActionModel::factory()->create([
            'workflow_id' => CrmWorkflow::factory()->create()->id,
            'action_type' => WorkflowActionCatalog::REQUEST_APPROVAL,
            'configuration_json' => ['approval_flow_id' => $flow->id],
        ]);

        $result = $handler->execute(new WorkflowActionContext($ctx, $action));

        expect($result->success)->toBeFalse();
        expect($result->errorMessage)->toContain('workflow run');
    });
});

describe('WorkflowExecutor — Pause & Resume', function () {

    function makeWorkflowWithApprovalAction(): array
    {
        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = CrmWorkflow::factory()->create(['entity_type' => 'project']);
        CrmWorkflowTrigger::factory()->create([
            'workflow_id' => $wf->id,
            'event_key' => 'issue.escalated',
        ]);

        $flow = CrmApprovalFlow::factory()->create();
        CrmApprovalStep::factory()->create([
            'approval_flow_id' => $flow->id,
            'approver_type' => 'role',
            'approver_id' => null,
        ]);

        $action = CrmWorkflowActionModel::factory()->create([
            'workflow_id' => $wf->id,
            'action_type' => WorkflowActionCatalog::REQUEST_APPROVAL,
            'configuration_json' => ['approval_flow_id' => $flow->id],
            'sort_order' => 0,
        ]);

        return [$wf, $flow, $project, $user];
    }

    it('pauses workflow run when request_approval action is encountered', function () {
        [$wf, $flow, $project, $user] = makeWorkflowWithApprovalAction();
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);
        $event = new IssueEscalated(
            CrmIssue::factory()->create(),
            $user,
            'blocker',
        );
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker', 'triggered_by' => $user];

        $results = $engine->handle($event, $payload, 'corr-p4c-1');

        expect($results)->toHaveCount(1);
        expect($results[0]->status)->toBe(WorkflowStatusCatalog::RUN_PAUSED);

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_PAUSED);
    });

    it('sets waiting action run status on pause', function () {
        [$wf, $flow, $project, $user] = makeWorkflowWithApprovalAction();
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);
        $event = new IssueEscalated(
            CrmIssue::factory()->create(),
            $user,
            'blocker',
        );
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker', 'triggered_by' => $user];

        $engine->handle($event, $payload, 'corr-p4c-2');

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        $actionRun = CrmWorkflowActionRun::where('workflow_run_id', $run->id)->first();

        expect($actionRun->status)->toBe(WorkflowStatusCatalog::ACTION_WAITING);
        expect($actionRun->response_json['approval_request_id'])->not->toBeNull();
    });

    it('creates no action runs after pause', function () {
        [$wf, $flow, $project, $user] = makeWorkflowWithApprovalAction();
        CrmWorkflowActionModel::factory()->create([
            'workflow_id' => $wf->id,
            'action_type' => WorkflowActionCatalog::CREATE_NOTE,
            'configuration_json' => ['subject' => 'After approval'],
            'sort_order' => 1,
        ]);

        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);
        $event = new IssueEscalated(
            CrmIssue::factory()->create(),
            $user,
            'blocker',
        );
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker', 'triggered_by' => $user];

        $engine->handle($event, $payload, 'corr-p4c-3');

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        $actionRuns = CrmWorkflowActionRun::where('workflow_run_id', $run->id)->get();

        expect($actionRuns)->toHaveCount(1);
    });

    it('resumes and completes run when approval request is approved (last action)', function () {
        [$wf, $flow, $project, $user] = makeWorkflowWithApprovalAction();
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);
        $event = new IssueEscalated(
            CrmIssue::factory()->create(),
            $user,
            'blocker',
        );
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker', 'triggered_by' => $user];

        $results = $engine->handle($event, $payload, 'corr-p4c-4');

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_PAUSED);

        $waitingRun = CrmWorkflowActionRun::where('workflow_run_id', $run->id)->first();
        $approvalRequest = CrmApprovalRequest::find($waitingRun->response_json['approval_request_id']);
        $approvalRequest->update(['status' => 'approved', 'completed_at' => now()]);

        $result = $engine->resume($run->id);

        expect($result->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);

        $run->refresh();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);

        $waitingRun->refresh();
        expect($waitingRun->status)->toBe(WorkflowStatusCatalog::ACTION_COMPLETED);
    });

    it('resumes and continues remaining actions when approved', function () {
        [$wf, $flow, $project, $user] = makeWorkflowWithApprovalAction();
        $afterAction = CrmWorkflowActionModel::factory()->create([
            'workflow_id' => $wf->id,
            'action_type' => WorkflowActionCatalog::CREATE_NOTE,
            'configuration_json' => ['subject' => 'Post-approval note'],
            'sort_order' => 1,
        ]);

        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);
        $event = new IssueEscalated(
            CrmIssue::factory()->create(),
            $user,
            'blocker',
        );
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker', 'triggered_by' => $user];

        $engine->handle($event, $payload, 'corr-p4c-5');

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_PAUSED);

        $waitingRun = CrmWorkflowActionRun::where('workflow_run_id', $run->id)->first();
        $approvalRequest = CrmApprovalRequest::find($waitingRun->response_json['approval_request_id']);
        $approvalRequest->update(['status' => 'approved', 'completed_at' => now()]);

        $result = $engine->resume($run->id);

        expect($result->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);

        $run->refresh();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);

        $waitingRun->refresh();
        expect($waitingRun->status)->toBe(WorkflowStatusCatalog::ACTION_COMPLETED);

        $actionRuns = CrmWorkflowActionRun::where('workflow_run_id', $run->id)
            ->orderBy('id')
            ->get();
        expect($actionRuns)->toHaveCount(2);
        expect($actionRuns[0]->status)->toBe(WorkflowStatusCatalog::ACTION_COMPLETED);
        expect($actionRuns[1]->status)->toBe(WorkflowStatusCatalog::ACTION_COMPLETED);
        expect($actionRuns[1]->action_type)->toBe(WorkflowActionCatalog::CREATE_NOTE);
    });

    it('fails run on resume when approval request is rejected', function () {
        [$wf, $flow, $project, $user] = makeWorkflowWithApprovalAction();
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);
        $event = new IssueEscalated(
            CrmIssue::factory()->create(),
            $user,
            'blocker',
        );
        $payload = ['project' => $project, 'id' => $project->id, 'severity' => 'blocker', 'triggered_by' => $user];

        $engine->handle($event, $payload, 'corr-p4c-6');

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();
        $waitingRun = CrmWorkflowActionRun::where('workflow_run_id', $run->id)->first();
        $approvalRequest = CrmApprovalRequest::find($waitingRun->response_json['approval_request_id']);
        $approvalRequest->update(['status' => 'rejected', 'completed_at' => now()]);

        $result = $engine->resume($run->id);

        expect($result->status)->toBe(WorkflowStatusCatalog::RUN_FAILED);

        $run->refresh();
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_FAILED);

        $waitingRun->refresh();
        expect($waitingRun->status)->toBe(WorkflowStatusCatalog::ACTION_FAILED);
    });

    it('throws on resume when run is not paused', function () {
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);
        $run = CrmWorkflowRun::factory()->create(['status' => WorkflowStatusCatalog::RUN_COMPLETED]);

        expect(fn () => $engine->resume($run->id))
            ->toThrow(RuntimeException::class, 'not in paused status');
    });

    it('throws on resume when no waiting action found', function () {
        $registry = app(WorkflowActionRegistry::class);
        $engine = makeEngineWithRegistry($registry);
        $run = CrmWorkflowRun::factory()->create(['status' => WorkflowStatusCatalog::RUN_PAUSED]);

        expect(fn () => $engine->resume($run->id))
            ->toThrow(RuntimeException::class, 'No waiting action run found');
    });
});
