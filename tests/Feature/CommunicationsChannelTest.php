<?php

use App\Events\Crm\MilestoneCompleted;
use App\Events\Crm\ProjectAtRisk;
use App\Jobs\DispatchNotificationInstruction;
use App\Jobs\SendEmailNotification;
use App\Jobs\SendPortalNotification;
use App\Models\CrmCommunicationLog;
use App\Models\CrmMilestone;
use App\Models\CrmPortalAccount;
use App\Models\CrmPortalNotification;
use App\Models\CrmProject;
use App\Models\User;
use App\Services\Crm\Communications\Channels\EmailChannel;
use App\Services\Crm\Communications\Channels\PortalChannel;
use App\Services\Crm\Communications\DeliveryTracker;
use App\Services\Crm\Communications\NotificationCoordinator;
use App\Services\Crm\Communications\NotificationInstruction;
use App\Services\Crm\Communications\NotificationRouter;
use App\Services\Crm\Communications\RecipientTarget;
use App\Services\Crm\Communications\Registry\NotificationMap;
use App\Services\Crm\Communications\Resolvers\PortalRecipientResolver;
use App\Services\Crm\Communications\Templates\TemplateRenderer;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'CrmRolePermissionSeeder']);
});

function makeFullStack(): NotificationCoordinator
{
    return new NotificationCoordinator(
        new NotificationRouter(new NotificationMap),
        new PortalRecipientResolver,
    );
}

function chSetupProject(): array
{
    $user = User::factory()->create()->assignRole('manager');
    $project = CrmProject::factory()->create(['created_by' => $user->id]);

    $primary = CrmPortalAccount::factory()->create();
    $stakeholder = CrmPortalAccount::factory()->create();

    $project->portalAccounts()->attach($primary->id, ['role' => 'primary_contact']);
    $project->portalAccounts()->attach($stakeholder->id, ['role' => 'stakeholder']);

    return ['project' => $project, 'accounts' => [$primary, $stakeholder]];
}

function makeInstruction(string $correlationId = 'corr-test', array $recipients = []): NotificationInstruction
{
    if ($recipients === []) {
        $recipients = [new RecipientTarget(1, 'test@test.com', 'en')];
    }

    return new NotificationInstruction(
        event: 'test.event',
        template: 'test.template',
        channels: ['email'],
        recipients: $recipients,
        payload: [],
        correlationId: $correlationId,
        idempotencyKey: 'idem-test',
    );
}

// ─── TemplateRenderer ───────────────────────────────────────────

describe('TemplateRenderer', function () {

    it('renders milestone.completed in English', function () {
        $renderer = new TemplateRenderer;

        $result = $renderer->render('milestone.completed', ['milestone_name' => 'Phase 1'], 'en');

        expect($result)->toBe('Milestone completed: Phase 1');
    });

    it('renders milestone.completed in Arabic', function () {
        $renderer = new TemplateRenderer;

        $result = $renderer->render('milestone.completed', ['milestone_name' => 'المرحلة الأولى'], 'ar');

        expect($result)->toBe('تم إكمال المرحلة: المرحلة الأولى');
    });

    it('renders project.at_risk with health score', function () {
        $renderer = new TemplateRenderer;

        $result = $renderer->render('project.at_risk', ['health_score' => 35], 'en');

        expect($result)->toContain('health score: 35');
    });

    it('renders change_order.rejected', function () {
        $renderer = new TemplateRenderer;

        $result = $renderer->render('change_order.rejected', ['change_order_title' => 'CO-001'], 'en');

        expect($result)->toBe('Change order rejected: CO-001');
    });

    it('renders health.degraded with drop value', function () {
        $renderer = new TemplateRenderer;

        $result = $renderer->render('health.degraded', ['health_score' => 50, 'drop' => 20], 'en');

        expect($result)->toContain('50');
        expect($result)->toContain('20');
    });

    it('renders issue.escalated in Arabic', function () {
        $renderer = new TemplateRenderer;

        $result = $renderer->render('issue.escalated', ['issue_title' => 'مشكلة تقنية'], 'ar');

        expect($result)->toBe('تم تصعيد مشكلة: مشكلة تقنية');
    });

    it('returns empty for unknown template', function () {
        $renderer = new TemplateRenderer;

        $result = $renderer->render('unknown.template', [], 'en');

        expect($result)->toBe('');
    });
});

// ─── DeliveryTracker ────────────────────────────────────────────

describe('DeliveryTracker', function () {

    function trackerAccount(): CrmPortalAccount
    {
        return CrmPortalAccount::factory()->create();
    }

    it('tracks queued status', function () {
        $account = trackerAccount();
        $tracker = new DeliveryTracker;
        $instruction = makeInstruction('corr-123', [new RecipientTarget($account->id, 'test@test.com', 'en')]);

        $tracker->trackQueued($instruction, $account->id, 'email');

        expect(CrmCommunicationLog::where('correlation_id', 'corr-123')->exists())->toBeTrue();
        expect(CrmCommunicationLog::where('correlation_id', 'corr-123')->first()->status)->toBe('queued');
    });

    it('tracks sent status', function () {
        $account = trackerAccount();
        $tracker = new DeliveryTracker;
        $instruction = makeInstruction('corr-456', [new RecipientTarget($account->id, 'test@test.com', 'en')]);
        $tracker->trackQueued($instruction, $account->id, 'email');

        $tracker->trackSent('corr-456', 'email', 'prov-msg-1');

        $log = CrmCommunicationLog::where('correlation_id', 'corr-456')->first();
        expect($log->status)->toBe('sent');
        expect($log->provider_message_id)->toBe('prov-msg-1');
    });

    it('tracks delivered status', function () {
        $account = trackerAccount();
        $tracker = new DeliveryTracker;
        $instruction = makeInstruction('corr-789', [new RecipientTarget($account->id, 'test@test.com', 'en')]);
        $tracker->trackQueued($instruction, $account->id, 'email');
        $tracker->trackSent('corr-789', 'email', 'prov-msg-2');

        $tracker->trackDelivered('corr-789', 'email');

        $log = CrmCommunicationLog::where('correlation_id', 'corr-789')->first();
        expect($log->status)->toBe('delivered');
        expect($log->delivered_at)->not->toBeNull();
    });

    it('tracks failed status', function () {
        $account = trackerAccount();
        $tracker = new DeliveryTracker;
        $instruction = makeInstruction('corr-fail', [new RecipientTarget($account->id, 'test@test.com', 'en')]);
        $tracker->trackQueued($instruction, $account->id, 'email');

        $tracker->trackFailed('corr-fail', 'email', 'Connection timeout');

        $log = CrmCommunicationLog::where('correlation_id', 'corr-fail')->first();
        expect($log->status)->toBe('failed');
        expect($log->error_message)->toBe('Connection timeout');
    });
});

// ─── EmailChannel ───────────────────────────────────────────────

describe('EmailChannel', function () {

    it('sends email and tracks delivery for each recipient', function () {
        $setup = chSetupProject();
        $instruction = makeFullStack()->handle(new ProjectAtRisk($setup['project'], 45, 70));

        $channel = new EmailChannel(new TemplateRenderer, new DeliveryTracker);

        Log::shouldReceive('info')
            ->atLeast()
            ->times(2);

        $channel->send($instruction);

        $logs = CrmCommunicationLog::where('correlation_id', $instruction->correlationId)
            ->where('channel', 'email')
            ->get();

        expect($logs)->toHaveCount(2);
        expect($logs->pluck('status')->all())->each->toBeIn(['queued', 'sent']);
    });
});

// ─── PortalChannel ──────────────────────────────────────────────

describe('PortalChannel', function () {

    it('creates portal notifications and tracks delivery', function () {
        $setup = chSetupProject();
        $instruction = makeFullStack()->handle(new ProjectAtRisk($setup['project'], 45, 70));

        $channel = new PortalChannel(new TemplateRenderer, new DeliveryTracker);

        $channel->send($instruction);

        $notifications = CrmPortalNotification::where('idempotency_key', 'like', $instruction->idempotencyKey.'-%')->get();
        expect($notifications)->toHaveCount(2);
        expect($notifications[0]->portal_account_id)->toBe($instruction->recipients[0]->portalAccountId);

        $logs = CrmCommunicationLog::where('correlation_id', $instruction->correlationId)
            ->where('channel', 'portal')
            ->get();

        expect($logs)->toHaveCount(2);
    });
});

// ─── DispatchNotificationInstruction ────────────────────────────

describe('DispatchNotificationInstruction', function () {

    it('dispatches email and portal jobs for project at risk', function () {
        $setup = chSetupProject();
        $instruction = makeFullStack()->handle(new ProjectAtRisk($setup['project'], 45, 70));

        Bus::fake();

        $job = new DispatchNotificationInstruction($instruction);
        $job->handle();

        Bus::assertDispatched(SendEmailNotification::class);
        Bus::assertDispatched(SendPortalNotification::class);
    });
});

// ─── Full Integration ───────────────────────────────────────────

describe('Communications Full Stack', function () {

    it('routes milestone event through coordinator to channel', function () {
        $setup = chSetupProject();
        $milestone = CrmMilestone::factory()->create(['project_id' => $setup['project']->id]);
        $user = User::factory()->create();
        $event = new MilestoneCompleted($milestone, $user);

        $instruction = makeFullStack()->handle($event);

        expect($instruction)->not->toBeNull();
        expect($instruction->template)->toBe('milestone.completed');
        expect($instruction->channels)->toBe(['portal']);
        expect($instruction->recipients)->toHaveCount(2);

        $channel = new PortalChannel(new TemplateRenderer, new DeliveryTracker);
        $channel->send($instruction);

        $notifications = CrmPortalNotification::where('idempotency_key', 'like', $instruction->idempotencyKey.'-%')->get();
        expect($notifications)->toHaveCount(2);

        $rendered = (new TemplateRenderer)->render(
            $instruction->template,
            $instruction->payload,
            $instruction->recipients[0]->locale,
        );

        expect($notifications[0]->title)->toBe($rendered);
    });
});
