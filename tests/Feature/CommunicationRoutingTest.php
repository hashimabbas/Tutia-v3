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
use App\Models\CrmChangeOrder;
use App\Models\CrmDeal;
use App\Models\CrmDeliverable;
use App\Models\CrmIssue;
use App\Models\CrmMilestone;
use App\Models\CrmPortalAccount;
use App\Models\CrmPortalNotificationPreference;
use App\Models\CrmProject;
use App\Models\CrmProjectRisk;
use App\Models\User;
use App\Services\Crm\Communications\NotificationCoordinator;
use App\Services\Crm\Communications\NotificationInstruction;
use App\Services\Crm\Communications\NotificationRouter;
use App\Services\Crm\Communications\Registry\NotificationMap;
use App\Services\Crm\Communications\Resolvers\PortalRecipientResolver;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

// ─── Helpers ────────────────────────────────────────────────────

function makeCoordinator(): NotificationCoordinator
{
    $map = new NotificationMap;
    $router = new NotificationRouter($map);

    return new NotificationCoordinator($router, new PortalRecipientResolver);
}

/** @return array{project: CrmProject, accounts: array<int, CrmPortalAccount>} */
function setupProjectWithAccounts(): array
{
    $user = User::factory()->create()->assignRole('manager');
    $project = CrmProject::factory()->create(['created_by' => $user->id]);

    $primary = CrmPortalAccount::factory()->create();
    $stakeholder = CrmPortalAccount::factory()->create();
    $approver = CrmPortalAccount::factory()->create();
    $viewer = CrmPortalAccount::factory()->create();

    $project->portalAccounts()->attach($primary->id, ['role' => 'primary_contact']);
    $project->portalAccounts()->attach($stakeholder->id, ['role' => 'stakeholder']);
    $project->portalAccounts()->attach($approver->id, ['role' => 'approver']);
    $project->portalAccounts()->attach($viewer->id, ['role' => 'viewer']);

    return ['project' => $project, 'accounts' => [$primary, $stakeholder, $approver, $viewer]];
}

// ─── Routing Map ────────────────────────────────────────────────

describe('NotificationMap', function () {

    it('maps deal.converted to portal channel', function () {
        $map = new NotificationMap;

        $route = $map->get(DealConvertedToProject::class);

        expect($route['template'])->toBe('deal.converted');
        expect($route['channels'])->toBe(['portal']);
    });

    it('maps project.created to portal channel', function () {
        $map = new NotificationMap;

        $route = $map->get(ProjectCreated::class);

        expect($route['template'])->toBe('project.created');
        expect($route['channels'])->toBe(['portal']);
    });

    it('maps milestone.completed to portal channel', function () {
        $map = new NotificationMap;

        $route = $map->get(MilestoneCompleted::class);

        expect($route['template'])->toBe('milestone.completed');
        expect($route['channels'])->toBe(['portal']);
    });

    it('maps deliverable.completed to portal channel', function () {
        $map = new NotificationMap;

        $route = $map->get(DeliverableCompleted::class);

        expect($route['template'])->toBe('deliverable.completed');
        expect($route['channels'])->toBe(['portal']);
    });

    it('maps risk.closed to portal channel', function () {
        $map = new NotificationMap;

        $route = $map->get(RiskClosed::class);

        expect($route['template'])->toBe('risk.closed');
        expect($route['channels'])->toBe(['portal']);
    });

    it('maps issue.resolved to portal channel', function () {
        $map = new NotificationMap;

        $route = $map->get(IssueResolved::class);

        expect($route['template'])->toBe('issue.resolved');
        expect($route['channels'])->toBe(['portal']);
    });

    it('maps issue.escalated to email and portal', function () {
        $map = new NotificationMap;

        $route = $map->get(IssueEscalated::class);

        expect($route['template'])->toBe('issue.escalated');
        expect($route['channels'])->toBe(['email', 'portal']);
    });

    it('maps project.at_risk to email and portal', function () {
        $map = new NotificationMap;

        $route = $map->get(ProjectAtRisk::class);

        expect($route['template'])->toBe('project.at_risk');
        expect($route['channels'])->toBe(['email', 'portal']);
    });

    it('maps health.degraded to portal only', function () {
        $map = new NotificationMap;

        $route = $map->get(HealthDegraded::class);

        expect($route['template'])->toBe('health.degraded');
        expect($route['channels'])->toBe(['portal']);
    });

    it('maps change_order.approved to email and portal', function () {
        $map = new NotificationMap;

        $route = $map->get(ChangeOrderApproved::class);

        expect($route['template'])->toBe('change_order.approved');
        expect($route['channels'])->toBe(['email', 'portal']);
    });

    it('maps change_order.rejected to email, portal and whatsapp', function () {
        $map = new NotificationMap;

        $route = $map->get(ChangeOrderRejected::class);

        expect($route['template'])->toBe('change_order.rejected');
        expect($route['channels'])->toBe(['email', 'portal', 'whatsapp']);
    });

    it('returns null for unmapped events', function () {
        $map = new NotificationMap;

        $route = $map->get('App\Events\Some\UnknownEvent');

        expect($route)->toBeNull();
    });
});

// ─── NotificationRouter ─────────────────────────────────────────

describe('NotificationRouter', function () {

    it('routes a known event class', function () {
        $router = new NotificationRouter(new NotificationMap);

        $route = $router->route(ProjectAtRisk::class);

        expect($route)->toHaveKey('template');
        expect($route)->toHaveKey('channels');
        expect($route['template'])->toBe('project.at_risk');
    });

    it('returns null for unknown event class', function () {
        $router = new NotificationRouter(new NotificationMap);

        $route = $router->route('App\Events\Unknown');

        expect($route)->toBeNull();
    });
});

// ─── NotificationInstruction DTO ────────────────────────────────

describe('NotificationInstruction', function () {

    it('constructs with all properties', function () {
        $instruction = new NotificationInstruction(
            event: ProjectAtRisk::class,
            template: 'project.at_risk',
            channels: ['email', 'portal'],
            recipients: [],
            payload: ['project_id' => 1],
            correlationId: '550e8400-e29b-41d4-a716-446655440000',
            idempotencyKey: '550e8400-e29b-41d4-a716-446655440001',
        );

        expect($instruction->event)->toBe(ProjectAtRisk::class);
        expect($instruction->template)->toBe('project.at_risk');
        expect($instruction->channels)->toBe(['email', 'portal']);
        expect($instruction->recipients)->toBe([]);
        expect($instruction->payload)->toHaveKey('project_id');
        expect($instruction->correlationId)->toBeString();
        expect($instruction->idempotencyKey)->toBeString();
    });
});

// ─── PortalRecipientResolver ────────────────────────────────────

describe('PortalRecipientResolver', function () {

    it('resolves primary contact and stakeholder for milestone', function () {
        $setup = setupProjectWithAccounts();
        ['project' => $project, 'accounts' => $accounts] = $setup;
        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);
        $user = User::factory()->create();
        $event = new MilestoneCompleted($milestone, $user);

        $resolver = new PortalRecipientResolver;
        $recipients = $resolver->resolve($event);

        expect($recipients)->toHaveCount(2);
        expect($recipients[0]->portalAccountId)->toBe($accounts[0]->id);
        expect($recipients[1]->portalAccountId)->toBe($accounts[1]->id);
    });

    it('resolves primary, stakeholder and approver for project at risk', function () {
        $setup = setupProjectWithAccounts();
        ['project' => $project, 'accounts' => $accounts] = $setup;
        $event = new ProjectAtRisk($project, 45, 70);

        $resolver = new PortalRecipientResolver;
        $recipients = $resolver->resolve($event);

        expect($recipients)->toHaveCount(3);
        expect($recipients[0]->portalAccountId)->toBe($accounts[0]->id);
        expect($recipients[1]->portalAccountId)->toBe($accounts[1]->id);
        expect($recipients[2]->portalAccountId)->toBe($accounts[2]->id);
    });

    it('excludes disabled accounts', function () {
        ['project' => $project, 'accounts' => $accounts] = setupProjectWithAccounts();

        $accounts[0]->update(['disabled_at' => now()]);

        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);
        $user = User::factory()->create();
        $event = new MilestoneCompleted($milestone, $user);

        $resolver = new PortalRecipientResolver;
        $recipients = $resolver->resolve($event);

        expect($recipients)->toHaveCount(1);
        expect($recipients[0]->portalAccountId)->toBe($accounts[1]->id);
    });

    it('returns empty for events with no linked project', function () {
        $issue = CrmIssue::factory()->create();
        $user = User::factory()->create();
        $event = new IssueEscalated($issue, $user, 'low');

        $resolver = new PortalRecipientResolver;
        $recipients = $resolver->resolve($event);

        expect($recipients)->toBe([]);
    });
});

// ─── NotificationCoordinator Integration ────────────────────────

describe('NotificationCoordinator', function () {

    it('creates instruction for project at risk event', function () {
        $setup = setupProjectWithAccounts();
        $event = new ProjectAtRisk($setup['project'], 45, 70);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->event)->toBe(ProjectAtRisk::class);
        expect($instruction->template)->toBe('project.at_risk');
        expect($instruction->channels)->toBe(['email', 'portal']);
        expect($instruction->recipients)->toHaveCount(3);
    });

    it('creates instruction for deal converted event', function () {
        $setup = setupProjectWithAccounts();
        $deal = CrmDeal::factory()->create();
        $user = User::factory()->create();
        $event = new DealConvertedToProject($deal, $setup['project']->id, $user, null);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('deal.converted');
        expect($instruction->channels)->toBe(['portal']);
        expect($instruction->recipients)->toHaveCount(2);
    });

    it('creates instruction for project created event', function () {
        $setup = setupProjectWithAccounts();
        $user = User::factory()->create();
        $event = new ProjectCreated($setup['project'], $user, 3, 10, 2, 1);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('project.created');
        expect($instruction->channels)->toBe(['portal']);
        expect($instruction->recipients)->toHaveCount(2);
    });

    it('creates instruction for milestone completed event', function () {
        $setup = setupProjectWithAccounts();
        $milestone = CrmMilestone::factory()->create(['project_id' => $setup['project']->id]);
        $user = User::factory()->create();
        $event = new MilestoneCompleted($milestone, $user);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('milestone.completed');
        expect($instruction->channels)->toBe(['portal']);
        expect($instruction->recipients)->toHaveCount(2);
    });

    it('creates instruction for deliverable completed event', function () {
        $setup = setupProjectWithAccounts();
        $milestone = CrmMilestone::factory()->create(['project_id' => $setup['project']->id]);
        $deliverable = CrmDeliverable::factory()->create(['milestone_id' => $milestone->id]);
        $user = User::factory()->create();
        $event = new DeliverableCompleted($deliverable, $user);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('deliverable.completed');
        expect($instruction->channels)->toBe(['portal']);
    });

    it('creates instruction for risk closed event', function () {
        $setup = setupProjectWithAccounts();
        $risk = CrmProjectRisk::factory()->create(['project_id' => $setup['project']->id]);
        $user = User::factory()->create();
        $event = new RiskClosed($risk, $user);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('risk.closed');
        expect($instruction->channels)->toBe(['portal']);
    });

    it('creates instruction for issue resolved event', function () {
        $setup = setupProjectWithAccounts();
        $issue = CrmIssue::factory()->create(['project_id' => $setup['project']->id]);
        $user = User::factory()->create();
        $event = new IssueResolved($issue, $user);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('issue.resolved');
        expect($instruction->channels)->toBe(['portal']);
    });

    it('creates instruction for change order approved', function () {
        $setup = setupProjectWithAccounts();
        $changeOrder = CrmChangeOrder::factory()->create(['project_id' => $setup['project']->id]);
        $user = User::factory()->create();
        $event = new ChangeOrderApproved($changeOrder, $user);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('change_order.approved');
        expect($instruction->recipients)->toHaveCount(2);
    });

    it('creates instruction for change order rejected', function () {
        $setup = setupProjectWithAccounts();
        $changeOrder = CrmChangeOrder::factory()->create(['project_id' => $setup['project']->id]);
        $account = CrmPortalAccount::factory()->create();
        $event = new ChangeOrderRejected($changeOrder, $account, 'Too expensive');

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('change_order.rejected');
        expect($instruction->channels)->toBe(['email', 'portal', 'whatsapp']);
        expect($instruction->recipients)->toHaveCount(2);
    });

    it('creates instruction for issue escalated', function () {
        $setup = setupProjectWithAccounts();
        $issue = CrmIssue::factory()->create(['project_id' => $setup['project']->id]);
        $user = User::factory()->create();
        $event = new IssueEscalated($issue, $user, 'low');

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('issue.escalated');
        expect($instruction->recipients)->toHaveCount(2);
    });

    it('creates instruction for health degraded', function () {
        $setup = setupProjectWithAccounts();
        $event = new HealthDegraded($setup['project'], 50, 70, 20);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('health.degraded');
        expect($instruction->channels)->toBe(['portal']);
        expect($instruction->recipients)->toHaveCount(2);
    });

    it('returns null for unmapped events', function () {
        $event = new stdClass;

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->toBeNull();
    });

    it('returns null when no recipients found', function () {
        $project = CrmProject::factory()->create(['created_by' => User::factory()->create()->assignRole('manager')->id]);
        $event = new ProjectAtRisk($project, 45, 70);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction)->toBeNull();
    });

    it('generates correlation id as uuid', function () {
        $setup = setupProjectWithAccounts();
        $event = new ProjectAtRisk($setup['project'], 45, 70);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction->correlationId)->toMatch('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/');
    });

    it('generates idempotency key as uuid', function () {
        $setup = setupProjectWithAccounts();
        $event = new ProjectAtRisk($setup['project'], 45, 70);

        $instruction = makeCoordinator()->handle($event);

        expect($instruction->idempotencyKey)->toMatch('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/');
    });

    it('generates unique correlation and idempotency keys per call', function () {
        $setup = setupProjectWithAccounts();
        $event1 = new ProjectAtRisk($setup['project'], 45, 70);
        $event2 = new ProjectAtRisk($setup['project'], 30, 70);

        $instruction1 = makeCoordinator()->handle($event1);
        $instruction2 = makeCoordinator()->handle($event2);

        expect($instruction1->correlationId)->not->toBe($instruction2->correlationId);
        expect($instruction1->idempotencyKey)->not->toBe($instruction2->idempotencyKey);
    });
});

// ─── Preference Filtering ───────────────────────────────────────

describe('Preference filtering', function () {

    it('excludes accounts with muted channel preference', function () {
        $setup = setupProjectWithAccounts();
        ['project' => $project, 'accounts' => $accounts] = $setup;

        CrmPortalNotificationPreference::factory()->create([
            'portal_account_id' => $accounts[0]->id,
            'channel' => 'email',
            'frequency' => 'never',
        ]);

        $event = new ProjectAtRisk($project, 45, 70);
        $instruction = makeCoordinator()->handle($event);

        $recipientIds = array_map(fn ($a) => $a->portalAccountId, $instruction->recipients);

        expect($recipientIds)->not->toContain($accounts[0]->id);
        expect($recipientIds)->toContain($accounts[1]->id);
        expect($recipientIds)->toContain($accounts[2]->id);
    });

    it('excludes accounts with matching event filter', function () {
        $setup = setupProjectWithAccounts();
        ['project' => $project, 'accounts' => $accounts] = $setup;

        CrmPortalNotificationPreference::factory()->create([
            'portal_account_id' => $accounts[0]->id,
            'channel' => 'portal',
            'frequency' => 'immediate',
            'event_filters' => ['milestone.completed'],
        ]);

        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);
        $user = User::factory()->create();
        $event = new MilestoneCompleted($milestone, $user);

        $instruction = makeCoordinator()->handle($event);

        $recipientIds = array_map(fn ($a) => $a->portalAccountId, $instruction->recipients);

        expect($recipientIds)->not->toContain($accounts[0]->id);
        expect($recipientIds)->toContain($accounts[1]->id);
    });

    it('keeps accounts with non-matching event filter', function () {
        $setup = setupProjectWithAccounts();
        ['project' => $project, 'accounts' => $accounts] = $setup;

        CrmPortalNotificationPreference::factory()->create([
            'portal_account_id' => $accounts[0]->id,
            'channel' => 'portal',
            'frequency' => 'immediate',
            'event_filters' => ['issue.escalated'],
        ]);

        $milestone = CrmMilestone::factory()->create(['project_id' => $project->id]);
        $user = User::factory()->create();
        $event = new MilestoneCompleted($milestone, $user);

        $instruction = makeCoordinator()->handle($event);

        $recipientIds = array_map(fn ($a) => $a->portalAccountId, $instruction->recipients);

        expect($recipientIds)->toContain($accounts[0]->id);
        expect($recipientIds)->toContain($accounts[1]->id);
    });
});
