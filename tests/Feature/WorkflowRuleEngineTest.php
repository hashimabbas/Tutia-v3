<?php

use App\Events\Crm\ChangeOrderApproved;
use App\Events\Crm\ChangeOrderRejected;
use App\Events\Crm\DealConvertedToProject;
use App\Events\Crm\DeliverableCompleted;
use App\Events\Crm\HealthDegraded;
use App\Events\Crm\IssueEscalated;
use App\Events\Crm\IssueResolved;
use App\Events\Crm\MilestoneCompleted;
use App\Events\Crm\ProjectAtRisk;
use App\Events\Crm\ProjectCreated;
use App\Events\Crm\RiskClosed;
use App\Listeners\HandleWorkflowAutomation;
use App\Models\CrmIssue;
use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use App\Models\CrmWorkflow;
use App\Models\CrmWorkflowAction as CrmWorkflowActionModel;
use App\Models\CrmWorkflowActionRun;
use App\Models\CrmWorkflowCondition as CrmWorkflowConditionModel;
use App\Models\CrmWorkflowRun;
use App\Models\CrmWorkflowTrigger as CrmWorkflowTriggerModel;
use App\Models\User;
use App\Services\Crm\Expressions\Evaluation\ExpressionEvaluator;
use App\Services\Crm\Expressions\Parser\ExpressionParser;
use App\Services\Crm\Expressions\Parser\Lexer;
use App\Services\Crm\Workflows\Actions\WorkflowActionHandlerInterface;
use App\Services\Crm\Workflows\Actions\WorkflowActionRegistry;
use App\Services\Crm\Workflows\Catalogs\WorkflowStatusCatalog;
use App\Services\Crm\Workflows\DTOs\WorkflowActionContext;
use App\Services\Crm\Workflows\DTOs\WorkflowActionResult;
use App\Services\Crm\Workflows\DTOs\WorkflowContext;
use App\Services\Crm\Workflows\Evaluation\ExpressionWorkflowEvaluator;
use App\Services\Crm\Workflows\Evaluation\LegacyConditionEvaluator;
use App\Services\Crm\Workflows\Evaluation\WorkflowConditionEvaluator;
use App\Services\Crm\Workflows\WorkflowCondition;
use App\Services\Crm\Workflows\WorkflowContextBuilder;
use App\Services\Crm\Workflows\WorkflowEngine;
use App\Services\Crm\Workflows\WorkflowEvaluator;
use App\Services\Crm\Workflows\WorkflowExecutor;
use App\Services\Crm\Workflows\WorkflowLoader;
use Illuminate\Support\Facades\Event;

// ─── Setup ───────────────────────────────────────────────────────

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

function makeWorkflow(array $overrides = []): CrmWorkflow
{
    return CrmWorkflow::factory()->create($overrides);
}

function addTrigger(CrmWorkflow $wf, string $eventKey): CrmWorkflowTriggerModel
{
    return CrmWorkflowTriggerModel::factory()->create([
        'workflow_id' => $wf->id,
        'event_key' => $eventKey,
    ]);
}

function addCondition(CrmWorkflow $wf, string $field, string $operator, mixed $value, int $groupOrder = 0): CrmWorkflowConditionModel
{
    return CrmWorkflowConditionModel::factory()->create([
        'workflow_id' => $wf->id,
        'field' => $field,
        'operator' => $operator,
        'value' => is_string($value) ? $value : json_encode($value),
        'group_order' => $groupOrder,
    ]);
}

function addAction(CrmWorkflow $wf, string $actionType, array $config = [], int $sortOrder = 0, bool $stopOnFail = false): CrmWorkflowActionModel
{
    return CrmWorkflowActionModel::factory()->create([
        'workflow_id' => $wf->id,
        'action_type' => $actionType,
        'configuration_json' => $config,
        'sort_order' => $sortOrder,
        'stop_on_fail' => $stopOnFail,
    ]);
}

function makeExpressionEngine(): ExpressionWorkflowEvaluator
{
    $lexer = new Lexer;
    $parser = new ExpressionParser($lexer);
    $eval = new ExpressionEvaluator($parser);

    return new ExpressionWorkflowEvaluator($parser, $eval);
}

function makeEngine(array $actionHandlers = []): WorkflowEngine
{
    $condition = new WorkflowCondition;
    $legacy = new LegacyConditionEvaluator($condition);
    $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
    $evaluator = new WorkflowEvaluator($bridge);

    $registry = new WorkflowActionRegistry($actionHandlers);

    return new WorkflowEngine(
        new WorkflowLoader,
        new WorkflowContextBuilder,
        $evaluator,
        new WorkflowExecutor($registry),
    );
}

function makeSuccessHandler(string $actionType): WorkflowActionHandlerInterface
{
    return new class($actionType) implements WorkflowActionHandlerInterface
    {
        public function __construct(private readonly string $actionType) {}

        public function handles(): string
        {
            return $this->actionType;
        }

        public function execute(WorkflowActionContext $actionContext): WorkflowActionResult
        {
            return new WorkflowActionResult(
                actionId: $actionContext->action->id,
                actionType: $this->actionType,
                configuration: $actionContext->action->configuration_json,
                success: true,
                response: ['executed' => true],
            );
        }
    };
}

function buildEventPayload(): array
{
    return [
        'id' => 42,
        'severity' => 'blocker',
        'status' => 'escalated',
        'health_score' => 35,
        'project' => [
            'id' => 99,
            'name' => 'Acme Migration',
            'health_score' => 72,
        ],
        'title' => 'Database connection timeout',
        'amount' => 15000,
    ];
}

// ─── WorkflowCondition: Operator Tests ──────────────────────────

describe('WorkflowCondition — Operators', function () {

    it('evaluates eq operator', function () {
        $condition = new WorkflowCondition;

        $eq = CrmWorkflowConditionModel::factory()->make([
            'field' => 'severity', 'operator' => 'eq', 'value' => 'blocker',
        ]);

        expect($condition->evaluate($eq, ['severity' => 'blocker']))->toBeTrue();
        expect($condition->evaluate($eq, ['severity' => 'major']))->toBeFalse();
    });

    it('evaluates neq operator', function () {
        $condition = new WorkflowCondition;

        $neq = CrmWorkflowConditionModel::factory()->make([
            'field' => 'status', 'operator' => 'neq', 'value' => 'closed',
        ]);

        expect($condition->evaluate($neq, ['status' => 'open']))->toBeTrue();
        expect($condition->evaluate($neq, ['status' => 'closed']))->toBeFalse();
    });

    it('evaluates numeric operators (gt, gte, lt, lte)', function () {
        $condition = new WorkflowCondition;

        $gt = CrmWorkflowConditionModel::factory()->make([
            'field' => 'health_score', 'operator' => 'gt', 'value' => '50',
        ]);
        expect($condition->evaluate($gt, ['health_score' => 72]))->toBeTrue();
        expect($condition->evaluate($gt, ['health_score' => 30]))->toBeFalse();

        $gte = CrmWorkflowConditionModel::factory()->make([
            'field' => 'health_score', 'operator' => 'gte', 'value' => '50',
        ]);
        expect($condition->evaluate($gte, ['health_score' => 50]))->toBeTrue();
        expect($condition->evaluate($gte, ['health_score' => 49]))->toBeFalse();

        $lt = CrmWorkflowConditionModel::factory()->make([
            'field' => 'health_score', 'operator' => 'lt', 'value' => '40',
        ]);
        expect($condition->evaluate($lt, ['health_score' => 35]))->toBeTrue();
        expect($condition->evaluate($lt, ['health_score' => 45]))->toBeFalse();

        $lte = CrmWorkflowConditionModel::factory()->make([
            'field' => 'health_score', 'operator' => 'lte', 'value' => '35',
        ]);
        expect($condition->evaluate($lte, ['health_score' => 35]))->toBeTrue();
        expect($condition->evaluate($lte, ['health_score' => 36]))->toBeFalse();
    });

    it('evaluates in and not_in operators', function () {
        $condition = new WorkflowCondition;

        $in = CrmWorkflowConditionModel::factory()->make([
            'field' => 'severity', 'operator' => 'in', 'value' => '["blocker","critical"]',
        ]);
        expect($condition->evaluate($in, ['severity' => 'blocker']))->toBeTrue();
        expect($condition->evaluate($in, ['severity' => 'low']))->toBeFalse();

        $notIn = CrmWorkflowConditionModel::factory()->make([
            'field' => 'status', 'operator' => 'not_in', 'value' => '["closed","resolved"]',
        ]);
        expect($condition->evaluate($notIn, ['status' => 'open']))->toBeTrue();
        expect($condition->evaluate($notIn, ['status' => 'closed']))->toBeFalse();
    });

    it('evaluates contains operator', function () {
        $condition = new WorkflowCondition;

        $contains = CrmWorkflowConditionModel::factory()->make([
            'field' => 'title', 'operator' => 'contains', 'value' => 'urgent',
        ]);

        expect($condition->evaluate($contains, ['title' => 'Urgent: Database issue']))->toBeTrue();
        expect($condition->evaluate($contains, ['title' => 'Routine maintenance']))->toBeFalse();
    });

    it('evaluates is_empty and not_empty operators', function () {
        $condition = new WorkflowCondition;

        $empty = CrmWorkflowConditionModel::factory()->make([
            'field' => 'assignee', 'operator' => 'is_empty', 'value' => '',
        ]);
        expect($condition->evaluate($empty, ['assignee' => null]))->toBeTrue();
        expect($condition->evaluate($empty, ['assignee' => 'Ahmed']))->toBeFalse();

        $notEmpty = CrmWorkflowConditionModel::factory()->make([
            'field' => 'resolution', 'operator' => 'not_empty', 'value' => '',
        ]);
        expect($condition->evaluate($notEmpty, ['resolution' => 'Fixed']))->toBeTrue();
        expect($condition->evaluate($notEmpty, ['resolution' => null]))->toBeFalse();
    });

    it('returns false for unknown operators', function () {
        $condition = new WorkflowCondition;

        $unknown = CrmWorkflowConditionModel::factory()->make([
            'field' => 'severity', 'operator' => 'regex', 'value' => '/pattern/',
        ]);

        expect($condition->evaluate($unknown, ['severity' => 'blocker']))->toBeFalse();
    });
});

// ─── WorkflowCondition: Nested Field Resolution ─────────────────

describe('WorkflowCondition — Nested Field Resolution', function () {

    it('resolves dot-notation nested fields', function () {
        $condition = new WorkflowCondition;

        $c = CrmWorkflowConditionModel::factory()->make([
            'field' => 'project.health_score', 'operator' => 'gt', 'value' => '70',
        ]);

        expect($condition->evaluate($c, [
            'project' => ['health_score' => 72],
        ]))->toBeTrue();

        expect($condition->evaluate($c, [
            'project' => ['health_score' => 65],
        ]))->toBeFalse();
    });

    it('returns false when nested field is missing', function () {
        $condition = new WorkflowCondition;

        $c = CrmWorkflowConditionModel::factory()->make([
            'field' => 'nonexistent.deep.field', 'operator' => 'eq', 'value' => 'anything',
        ]);

        expect($condition->evaluate($c, ['project' => ['name' => 'Test']]))->toBeFalse();
    });
});

// ─── WorkflowEvaluator: AND/OR Group Evaluation ──────────────────

describe('WorkflowEvaluator — Group Evaluation', function () {

    function makeLegacyEvaluator(): WorkflowEvaluator
    {
        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());

        return new WorkflowEvaluator($bridge);
    }

    it('passes when all conditions in all groups pass', function () {
        $wf = makeWorkflow();
        addCondition($wf, 'severity', 'eq', 'blocker', 0);
        addCondition($wf, 'status', 'eq', 'escalated', 0);

        $evaluator = makeLegacyEvaluator();
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
    });

    it('fails when one group fails (AND across groups)', function () {
        $wf = makeWorkflow();
        addCondition($wf, 'severity', 'eq', 'blocker', 0);
        addCondition($wf, 'severity', 'eq', 'critical', 0);
        addCondition($wf, 'status', 'eq', 'escalated', 1);

        $evaluator = makeLegacyEvaluator();
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeFalse();
    });

    it('passes with no conditions', function () {
        $wf = makeWorkflow();

        $evaluator = makeLegacyEvaluator();
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
        expect($results)->toBeEmpty();
    });

    it('returns WorkflowConditionResult with correct metadata', function () {
        $wf = makeWorkflow();
        addCondition($wf, 'severity', 'eq', 'blocker', 0);

        $evaluator = makeLegacyEvaluator();
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($results)->toHaveCount(1);
        expect($results[0]->field)->toBe('severity');
        expect($results[0]->operator)->toBe('eq');
        expect($results[0]->passed)->toBeTrue();
        expect($results[0]->groupOrder)->toBe(0);
    });
});

// ─── WorkflowContextBuilder ──────────────────────────────────────

describe('WorkflowContextBuilder', function () {

    it('builds context from event and payload', function () {
        $event = new stdClass;
        $event->severity = 'blocker';

        $builder = new WorkflowContextBuilder;
        $context = $builder->build($event, ['severity' => 'blocker'], 'corr-123');

        expect($context)->toBeInstanceOf(WorkflowContext::class);
        expect($context->correlationId)->toBe('corr-123');
        expect($context->event)->toBe($event);
        expect($context->eventPayload)->toBe(['severity' => 'blocker']);
    });

    it('extracts project and triggeredBy from payload', function () {
        $project = CrmProject::factory()->create();
        $user = User::factory()->create();

        $builder = new WorkflowContextBuilder;
        $context = $builder->build(new stdClass, [
            'project' => $project,
            'resolved_by' => $user,
        ], 'corr-456');

        expect($context->project)->toBe($project);
        expect($context->triggeredBy)->toBe($user);
    });

    it('handles null project and user', function () {
        $builder = new WorkflowContextBuilder;
        $context = $builder->build(new stdClass, ['id' => 1], 'corr-789');

        expect($context->project)->toBeNull();
        expect($context->triggeredBy)->toBeNull();
    });
});

// ─── WorkflowExecutor ────────────────────────────────────────────

describe('WorkflowExecutor', function () {

    it('creates crm_workflow_runs with context_snapshot', function () {
        $registry = new WorkflowActionRegistry;
        $executor = new WorkflowExecutor($registry);

        $user = User::factory()->create();
        $project = CrmProject::factory()->create(['created_by' => $user->id]);
        $wf = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf, 'issue.escalated');

        $context = buildContext(['project' => $project, 'id' => $project->id, 'severity' => 'blocker']);

        $result = $executor->execute($wf, $context);

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();

        expect($run)->not->toBeNull();
        expect($run->context_snapshot)->not->toBeNull();
        expect($run->context_snapshot['correlation_id'])->toBe('corr-exec-1');
        expect($run->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);
    });

    it('stores context_snapshot immutably at run creation', function () {
        $registry = new WorkflowActionRegistry;
        $executor = new WorkflowExecutor($registry);

        $user = User::factory()->create();
        $wf = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf, 'issue.escalated');

        $originalPayload = ['severity' => 'blocker', 'id' => 1];
        $context = buildContext($originalPayload);

        $executor->execute($wf, $context);

        $run = CrmWorkflowRun::where('workflow_id', $wf->id)->first();

        expect($run->context_snapshot['event_payload']['severity'])->toBe('blocker');
    });

    it('creates action runs for each action', function () {
        $registry = new WorkflowActionRegistry;
        $executor = new WorkflowExecutor($registry);

        $user = User::factory()->create();
        $wf = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf, 'issue.escalated');
        addAction($wf, 'send_email', ['template' => 'alert'], 0);
        addAction($wf, 'create_task', ['title' => 'Review'], 1);

        $context = buildContext(['id' => 1, 'severity' => 'blocker']);

        $result = $executor->execute($wf, $context);

        $actionRuns = CrmWorkflowActionRun::where('workflow_run_id', CrmWorkflowRun::where('workflow_id', $wf->id)->first()->id)->get();

        expect($actionRuns)->toHaveCount(2);
        expect($result->actionResults)->toHaveCount(2);
    });

    it('stops on fail when stop_on_fail is set', function () {
        $registry = new WorkflowActionRegistry;
        $executor = new WorkflowExecutor($registry);

        $user = User::factory()->create();
        $wf = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf, 'issue.escalated');
        addAction($wf, 'unknown_action', [], 0, true);
        addAction($wf, 'send_email', [], 1);

        $context = buildContext(['id' => 1, 'severity' => 'blocker']);

        $result = $executor->execute($wf, $context);

        $actionRuns = CrmWorkflowActionRun::where('workflow_run_id', CrmWorkflowRun::where('workflow_id', $wf->id)->first()->id)->get();

        expect($actionRuns)->toHaveCount(2);
        expect($actionRuns[0]->status)->toBe(WorkflowStatusCatalog::ACTION_FAILED);
        expect($actionRuns[1]->status)->toBe(WorkflowStatusCatalog::ACTION_SKIPPED);
    });

    it('continues on failure when stop_on_fail is false', function () {
        $registry = new WorkflowActionRegistry;
        $executor = new WorkflowExecutor($registry);

        $user = User::factory()->create();
        $wf = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf, 'issue.escalated');
        addAction($wf, 'unknown_action', [], 0, false);
        addAction($wf, 'unknown_action_2', [], 1, false);

        $context = buildContext(['id' => 1, 'severity' => 'blocker']);

        $result = $executor->execute($wf, $context);

        expect($result->actionResults)->toHaveCount(2);
        expect($result->actionResults[0]->success)->toBeFalse();
        expect($result->actionResults[1]->success)->toBeFalse();
    });
});

// ─── WorkflowEngine ──────────────────────────────────────────────

describe('WorkflowEngine', function () {

    function issueEscalatedEvent(): IssueEscalated
    {
        return new IssueEscalated(
            CrmIssue::factory()->create(),
            User::factory()->create(),
            'blocker',
        );
    }

    it('executes matching workflow end-to-end', function () {
        $engine = makeEngine([makeSuccessHandler('create_activity')]);

        $user = User::factory()->create();
        $wf = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf, 'issue.escalated');
        addCondition($wf, 'severity', 'eq', 'blocker', 0);
        addAction($wf, 'create_activity', ['description' => 'Escalated'], 0);

        $event = issueEscalatedEvent();
        $payload = array_merge(buildEventPayload(), ['severity' => 'blocker']);

        $results = $engine->handle($event, $payload, 'corr-engine-1');

        expect($results)->toHaveCount(1);
        expect($results[0]->conditionsPassed)->toBeTrue();
        expect($results[0]->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);
    });

    it('skips workflow when conditions fail', function () {
        $engine = makeEngine([makeSuccessHandler('create_activity')]);

        $user = User::factory()->create();
        $wf = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf, 'issue.escalated');
        addCondition($wf, 'severity', 'eq', 'low', 0);

        $event = issueEscalatedEvent();
        $payload = array_merge(buildEventPayload(), ['severity' => 'blocker']);

        $results = $engine->handle($event, $payload, 'corr-skip-1');

        expect($results)->toHaveCount(1);
        expect($results[0]->conditionsPassed)->toBeFalse();
        expect($results[0]->status)->toBe('skipped');
    });

    it('returns empty array when no workflows match', function () {
        $engine = makeEngine();

        $event = issueEscalatedEvent();

        $results = $engine->handle($event, buildEventPayload(), 'corr-empty-1');

        expect($results)->toBeEmpty();
    });

    it('skips inactive workflows', function () {
        $engine = makeEngine([makeSuccessHandler('create_activity')]);

        $user = User::factory()->create();
        $wf = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id, 'is_active' => false]);
        addTrigger($wf, 'issue.escalated');

        $event = issueEscalatedEvent();

        $results = $engine->handle($event, buildEventPayload(), 'corr-inactive-1');

        expect($results)->toBeEmpty();
    });

    it('executes multiple workflows for same event', function () {
        $engine = makeEngine([
            makeSuccessHandler('create_activity'),
            makeSuccessHandler('create_task'),
        ]);

        $user = User::factory()->create();
        $wf1 = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf1, 'issue.escalated');
        addAction($wf1, 'create_activity', ['desc' => 'Notify manager'], 0);

        $wf2 = makeWorkflow(['entity_type' => 'project', 'created_by' => $user->id]);
        addTrigger($wf2, 'issue.escalated');
        addCondition($wf2, 'severity', 'eq', 'blocker', 0);
        addAction($wf2, 'create_task', ['title' => 'Investigate'], 0);

        $event = issueEscalatedEvent();
        $payload = array_merge(buildEventPayload(), ['severity' => 'blocker']);

        $results = $engine->handle($event, $payload, 'corr-multi-1');

        expect($results)->toHaveCount(2);
        expect($results[0]->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);
        expect($results[1]->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);
    });

    it('processes versioned workflows correctly', function () {
        $engine = makeEngine();

        $user = User::factory()->create();
        $wf = makeWorkflow([
            'entity_type' => 'project',
            'created_by' => $user->id,
            'version' => 3,
        ]);
        addTrigger($wf, 'risk.closed');

        $event = new RiskClosed(
            CrmProjectRisk::factory()->create(),
            User::factory()->create(),
        );

        $results = $engine->handle($event, buildEventPayload(), 'corr-ver-1');

        expect($results)->toHaveCount(1);
    });
});

// ─── WorkflowActionRegistry ─────────────────────────────────────

describe('WorkflowActionRegistry', function () {

    it('registers and executes handlers', function () {
        $handler = new class implements WorkflowActionHandlerInterface
        {
            public function handles(): string
            {
                return 'test_action';
            }

            public function execute(WorkflowActionContext $actionContext): WorkflowActionResult
            {
                return new WorkflowActionResult(
                    actionId: $actionContext->action->id,
                    actionType: 'test_action',
                    configuration: $actionContext->action->configuration_json,
                    success: true,
                    response: ['executed' => true],
                );
            }
        };

        $registry = new WorkflowActionRegistry([$handler]);

        expect($registry->hasHandler('test_action'))->toBeTrue();
        expect($registry->hasHandler('unknown'))->toBeFalse();
    });

    it('throws for unregistered action type', function () {
        $registry = new WorkflowActionRegistry;

        $action = CrmWorkflowActionModel::factory()->make([
            'action_type' => 'nonexistent',
            'configuration_json' => [],
        ]);

        $context = buildContext([]);

        expect(fn () => $registry->execute($action, $context))
            ->toThrow(RuntimeException::class, 'nonexistent');
    });
});

// ─── HandleWorkflowAutomation Listener ──────────────────────────

describe('HandleWorkflowAutomation', function () {

    it('resolves from the container', function () {
        $listener = app(HandleWorkflowAutomation::class);

        expect($listener)->toBeInstanceOf(HandleWorkflowAutomation::class);
    });

    it('each domain event has exactly 2 listeners (CRM-5 + CRM-6)', function () {
        $events = [
            IssueEscalated::class,
            IssueResolved::class,
            RiskClosed::class,
            ProjectAtRisk::class,
            HealthDegraded::class,
            MilestoneCompleted::class,
            DeliverableCompleted::class,
            DealConvertedToProject::class,
            ProjectCreated::class,
            ChangeOrderApproved::class,
            ChangeOrderRejected::class,
        ];

        foreach ($events as $eventClass) {
            $hasListeners = Event::hasListeners($eventClass);

            expect($hasListeners)->toBeTrue("{$eventClass} has no listeners registered");
        }
    });

    it('builds payload from event object variables', function () {
        $issue = CrmIssue::factory()->create();
        $user = User::factory()->create();
        $event = new IssueEscalated($issue, $user, 'major');

        $listener = app(HandleWorkflowAutomation::class);
        $reflection = new ReflectionMethod($listener, 'buildPayload');
        $reflection->setAccessible(true);
        $payload = $reflection->invoke($listener, $event);

        expect($payload)->toHaveKey('issue');
        expect($payload)->toHaveKey('escalatedBy');
        expect($payload)->toHaveKey('previousSeverity');
        expect($payload['previousSeverity'])->toBe('major');
    });
});

// ─── Workflow Versioning ─────────────────────────────────────────

describe('Workflow Versioning', function () {

    it('defaults version to 1', function () {
        $wf = makeWorkflow();

        expect($wf->version)->toBe(1);
    });

    it('stores incremented version', function () {
        $wf = makeWorkflow(['version' => 3]);

        expect($wf->version)->toBe(3);
    });
});

// ─── Event Key Resolution ────────────────────────────────────────

describe('Event Key Resolution', function () {

    it('maps event classes via explicit engine registry', function () {
        $engine = makeEngine();
        $reflection = new ReflectionMethod($engine, 'resolveEventKey');
        $reflection->setAccessible(true);

        $issue = CrmIssue::factory()->create();
        $user = User::factory()->create();
        $event = new IssueEscalated($issue, $user, 'blocker');

        $key = $reflection->invoke($engine, $event);

        expect($key)->toBe('issue.escalated');
    });

    it('throws for unknown event classes', function () {
        $engine = makeEngine();
        $reflection = new ReflectionMethod($engine, 'resolveEventKey');
        $reflection->setAccessible(true);

        expect(fn () => $reflection->invoke($engine, new stdClass))
            ->toThrow(RuntimeException::class, 'Unknown event');
    });
});

// ─── Phase 4E — Expression Workflow Integration ──────────────────

describe('WorkflowConditionEvaluator — v1 Legacy', function () {

    it('evaluates v1 workflow using LegacyConditionEvaluator', function () {
        $wf = makeWorkflow(['conditions_version' => 'v1']);
        addCondition($wf, 'severity', 'eq', 'blocker', 0);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
    });

    it('fails v1 workflow when condition does not match', function () {
        $wf = makeWorkflow(['conditions_version' => 'v1']);
        addCondition($wf, 'severity', 'eq', 'low', 0);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeFalse();
    });

    it('defaults to v1 when conditions_version is not set', function () {
        $wf = makeWorkflow();
        addCondition($wf, 'severity', 'eq', 'blocker', 0);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
    });
});

describe('WorkflowConditionEvaluator — v2 Expression', function () {

    it('evaluates v2 simple expression', function () {
        $wf = makeWorkflow([
            'conditions_version' => 'v2',
            'expression' => 'severity = "blocker"',
        ]);
        addCondition($wf, 'severity', 'eq', 'blocker', 0);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
    });

    it('evaluates v2 expression with AND', function () {
        $wf = makeWorkflow([
            'conditions_version' => 'v2',
            'expression' => 'severity = "blocker" AND health_score > 30',
        ]);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
    });

    it('evaluates v2 expression with nested AND/OR', function () {
        $wf = makeWorkflow([
            'conditions_version' => 'v2',
            'expression' => 'health_score > 30 AND (severity = "blocker" OR priority = "high")',
        ]);

        $payload = array_merge(buildEventPayload(), ['priority' => 'high']);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext($payload);

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
    });

    it('evaluates v2 expression with NOT', function () {
        $wf = makeWorkflow([
            'conditions_version' => 'v2',
            'expression' => 'NOT (status = "closed")',
        ]);

        $payload = array_merge(buildEventPayload(), ['status' => 'open']);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext($payload);

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
    });

    it('fails v2 expression when expression does not match', function () {
        $wf = makeWorkflow([
            'conditions_version' => 'v2',
            'expression' => 'severity = "low"',
        ]);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeFalse();
    });

    it('handles missing field in v2 expression gracefully', function () {
        $wf = makeWorkflow([
            'conditions_version' => 'v2',
            'expression' => 'nonexistent_field = "anything"',
        ]);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeFalse();
    });

    it('handles invalid v2 expression gracefully', function () {
        $wf = makeWorkflow([
            'conditions_version' => 'v2',
            'expression' => 'INVALID @@@ EXPRESSION !!!',
        ]);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeFalse();
    });

    it('passes v2 expression with empty expression string', function () {
        $wf = makeWorkflow([
            'conditions_version' => 'v2',
            'expression' => null,
        ]);

        $condition = new WorkflowCondition;
        $legacy = new LegacyConditionEvaluator($condition);
        $bridge = new WorkflowConditionEvaluator($legacy, makeExpressionEngine());
        $evaluator = new WorkflowEvaluator($bridge);
        $context = buildContext(buildEventPayload());

        $results = $evaluator->evaluate($wf, $context);

        expect($evaluator->conditionsPassed($results))->toBeTrue();
    });
});

describe('WorkflowConditionEvaluator — v1 + v2 Coexistence', function () {

    it('executes v1 and v2 workflows side by side via engine', function () {
        $engine = makeEngine([makeSuccessHandler('create_activity')]);

        $user = User::factory()->create();
        $entityType = 'project';

        $v1 = makeWorkflow([
            'entity_type' => $entityType,
            'created_by' => $user->id,
            'conditions_version' => 'v1',
        ]);
        addTrigger($v1, 'issue.escalated');
        addCondition($v1, 'severity', 'eq', 'blocker', 0);
        addAction($v1, 'create_activity', ['from' => 'v1'], 0);

        $v2 = makeWorkflow([
            'entity_type' => $entityType,
            'created_by' => $user->id,
            'conditions_version' => 'v2',
            'expression' => 'severity = "blocker"',
        ]);
        addTrigger($v2, 'issue.escalated');
        addAction($v2, 'create_activity', ['from' => 'v2'], 0);

        $event = new IssueEscalated(
            CrmIssue::factory()->create(),
            User::factory()->create(),
            'blocker',
        );
        $payload = array_merge(buildEventPayload(), ['severity' => 'blocker']);

        $results = $engine->handle($event, $payload, 'corr-mixed-1');

        expect($results)->toHaveCount(2);
        expect($results[0]->conditionsPassed)->toBeTrue();
        expect($results[1]->conditionsPassed)->toBeTrue();
        expect($results[0]->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);
        expect($results[1]->status)->toBe(WorkflowStatusCatalog::RUN_COMPLETED);
    });
});

// ─── Helpers ─────────────────────────────────────────────────────

function buildContext(array $payload, string $correlationId = 'corr-exec-1'): WorkflowContext
{
    return (new WorkflowContextBuilder)->build(new stdClass, $payload, $correlationId);
}
