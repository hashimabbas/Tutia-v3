# CRM-5 Communications Architecture

> **Status:** Draft  
> **Phase:** CRM-5 Planning  
> **Dependencies:** CRM-4 Delivery OS (all events in place), CRM-5 Customer Portal Vision (companion document)  
> **Principle:** CRM-5 consumes domain events and produces communication events. Timeline remains the system of record. Communication never creates business state.

---

## 1. Communication Philosophy

### 1.1 Core Principles

1. **Event-Driven, Not Service-Coupled** — Listeners react to domain events; no service directly calls a notification method
2. **Channel-Agnostic Dispatch** — A single notification intent can deliver via Email, WhatsApp, SMS, or Portal simultaneously
3. **Preference-First** — Every contact controls channel + frequency; the system never overrides muted channels
4. **Observable, Not Stateful** — All deliveries recorded as timeline events; no separate communication log table
5. **Fail-Safe** — Channel failure never blocks business logic; failed deliveries are retried asynchronously

### 1.2 Flow Architecture

```
Domain Event (e.g., MilestoneCompleted)
    ↓
EventBus / Dispatch
    ↓
NotificationCoordinator
    ├── PreferenceResolver (fetch contact prefs)
    ├── ChannelRouter (decide channels)
    ├── TemplateEngine (resolve template + locale)
    └── DispatchManager
        ├── EmailDispatcher    → SES / SMTP
        ├── WhatsAppDispatcher → Twilio / Meta API
        ├── SMSDispatcher      → Twilio / AWS SNS
        └── PortalDispatcher   → In-app notification
            ↓
        DeliveryRecorder → Timeline Event (customer_safe = true)
```

---

## 2. Channel Architecture

### 2.1 Channel Abstraction

Each channel implements a common interface:

```php
interface NotificationChannel
{
    public function send(Contact $contact, NotificationMessage $message): DeliveryResult;
    public function isAvailable(Contact $contact): bool;
    public function name(): string; // 'email', 'whatsapp', 'sms', 'portal'
}
```

### 2.2 Channel Matrix

| Channel | Direction | Content Limit | Media Support | Delivery Guarantee | Cost |
|---------|-----------|---------------|---------------|-------------------|------|
| Email | Bidirectional | ~2MB | Rich HTML, images, attachments | High (retry 3x) | Low |
| WhatsApp | Bidirectional | 4096 chars | Images, PDF, buttons | High (read receipts) | Medium |
| SMS | Outbound only | 160 chars/segment | Text only | Medium (no receipt) | Low |
| Portal | In-app only | Unlimited | Rich React components | Guaranteed (in-session) | Free |

### 2.3 Contact Channel Availability

```php
$channels = NotificationPreferenceResolver::availableChannels($contact);
// Returns: ['email' => 'immediate', 'whatsapp' => 'daily', 'sms' => 'muted', 'portal' => 'immediate']
```

- `immediate` — real-time dispatch
- `daily` — batched into daily digest
- `weekly` — batched into weekly digest
- `muted` — no dispatch

---

## 3. Email Framework

### 3.1 Provider Abstraction

Wrap the email provider behind an interface so SES/SendGrid/Mailgun can be swapped:

```php
interface EmailProvider
{
    public function send(string $to, string $subject, string $body, ?array $attachments = []): EmailResult;
}
```

### 3.2 HTML Templates

Templates use Laravel Blade with inline styles (for email client compatibility):

```
resources/views/vendor/crm-communications/email/
├── layouts/
│   └── default.blade.php          # Header, footer, branding
├── notifications/
│   ├── milestone-completed.blade.php
│   ├── deliverable-completed.blade.php
│   ├── risk-closed.blade.php
│   ├── issue-resolved.blade.php
│   ├── change-order-created.blade.php
│   ├── change-order-approved.blade.php
│   └── daily-digest.blade.php
└── portal/
    ├── welcome.blade.php           # Portal access invitation
    └── login-link.blade.php        # Magic link email
```

### 3.3 Organization Branding

Each email includes the organization's logo and primary color:

```php
$branding = [
    'logo_url' => $organization->portal_logo_url,
    'primary_color' => $organization->portal_primary_color ?? '#3b6cdb',
    'company_name' => $organization->name,
];
```

Variables are injected into every Blade layout.

### 3.4 Tracking

- Open tracking via 1x1 transparent pixel
- Click tracking via signed redirect URLs
- Bounce handling via SNS/SES webhook → marks contact email as invalid

---

## 4. WhatsApp Framework

### 4.1 Provider Abstraction

```php
interface WhatsAppProvider
{
    public function sendText(string $to, string $message): WhatsAppResult;
    public function sendTemplate(string $to, string $templateName, array $variables): WhatsAppResult;
    public function sendInteractive(string $to, string $body, array $buttons): WhatsAppResult;
}
```

### 4.2 Template Messages

WhatsApp requires pre-approved templates for outbound messages. Each event gets a template:

| Event | Template Name | Variables |
|-------|---------------|-----------|
| Milestone Completed | `milestone_completed` | `{{project_name}}`, `{{milestone_name}}` |
| Deliverable Completed | `deliverable_completed` | `{{project_name}}`, `{{deliverable_name}}` |
| Change Order Created | `change_order_created` | `{{project_name}}`, `{{amount}}` |
| Change Order Approved | `change_order_approved` | `{{project_name}}`, `{{change_order_name}}` |
| Daily Digest | `daily_digest` | `{{project_count}}`, `{{summary}}` |

### 4.3 Interactive Messages

Change order approval uses WhatsApp interactive buttons:

```
TUTIA — Change Order #12
Additional Server Capacity
Amount: +$5,000

[Approve] [Reject] [View Details]
```

- Button click → webhook → process approval/rejection
- "View Details" → sends portal link

---

## 5. SMS Framework

### 5.1 Provider Abstraction

```php
interface SmsProvider
{
    public function send(string $to, string $message): SmsResult;
}
```

### 5.2 Usage Rules

- SMS is for **urgent, short notifications only**
- Maximum 160 characters; multi-segment messages discouraged
- Never send HTML or links longer than shortened URL
- Use for: issue escalated, risk critical, change order pending > 48h
- Never use for: daily digest, confirmation messages, non-urgent updates

### 5.3 Message Templates

```
TUTIA: Issue escalated in "VPN Project" — API latency is CRITICAL. View: https://tutia.portal/...
```

---

## 6. Portal Notifications

### 6.1 In-App Bell

The portal notification bell shows unread count:

```
┌───────────────────────────────────────────────┐
│  🔔 Notifications                    Clear    │
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │ ● Milestone "Training" completed     2m  │   │
│  │ ● Change order #12 approved          1h  │   │
│  │ ○ Issue "API latency" resolved       1d  │   │
│  └───────────────────────────────────────┘   │
│                                               │
│  Show all →                                    │
└───────────────────────────────────────────────┘
```

### 6.2 Portal Notification Record

Portal notifications are stored in-memory (session-scoped) or in a lightweight table:

```php
Schema::create('crm_portal_notifications', function (Blueprint $table) {
    $table->id();
    $table->foreignId('contact_id')->constrained('crm_contacts')->cascadeOnDelete();
    $table->string('type', 50);
    $table->string('title');
    $table->text('body')->nullable();
    $table->morphs('notifiable'); // project, milestone, change_order, etc.
    $table->timestamp('read_at')->nullable();
    $table->timestamps();

    $table->index(['contact_id', 'read_at'], 'crm_pn_contact_read_idx');
});
```

---

## 7. Notification Preferences

### 7.1 Preference Center UI

Available in the portal under Profile → Notification Preferences:

```
Notification Preferences
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Channel     Frequency    Event Types                    │
│  ────────────────────────────────────────────────────   │
│  📧 Email  ˅ [Immediate] ˅  [All events] (change)       │
│                                                          │
│  💬 WhatsApp ˅ [Daily] ˅     [Critical only] (change)    │
│                                                          │
│  📱 SMS  ˅    [Muted] ˅      [--]                        │
│                                                          │
│  🔔 Portal ˅  [Immediate] ˅  [All events] (change)      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Event Type Filtering

Each preference row can filter by event type:

| Filter | Includes |
|--------|----------|
| `all` | All communication events |
| `critical` | `issue_escalated`, `risk_critical`, `project_at_risk` |
| `approvals` | `change_order_created`, `change_order_approved` |
| `milestones` | `milestone_completed`, `deliverable_completed` |
| `custom` | Selected individual event types |

### 7.3 Default Preferences

When a contact is first granted portal access, defaults are:

| Channel | Frequency | Scope |
|---------|-----------|-------|
| Email | Immediate | All events |
| WhatsApp | Daily | Critical + approvals |
| SMS | Muted | — |
| Portal | Immediate | All events |

---

## 8. Event → Notification Mapping

### 8.1 Full Mapping Table

| Domain Event | Channel | Template | Customer Safe | Priority |
|-------------|---------|----------|---------------|----------|
| `project_created` | Email, Portal | `project_created` | ✅ | Low |
| `project_at_risk` | Email, WhatsApp, SMS, Portal | `project_at_risk` | ✅ | High |
| `project_archived` | Email, Portal | `project_archived` | ✅ | Low |
| `milestone_completed` | Email, Portal | `milestone_completed` | ✅ | Normal |
| `milestone_reopened` | Email, Portal | `milestone_reopened` | ✅ | Normal |
| `deliverable_completed` | Email, Portal | `deliverable_completed` | ✅ (if visible) | Normal |
| `deliverable_approved` | Email, Portal | `deliverable_approved` | ✅ (if visible) | Normal |
| `risk_created` | Email, Portal | `risk_created` | ✅ (if visible) | Normal |
| `risk_mitigated` | Portal only | `risk_mitigated` | ✅ (if visible) | Low |
| `risk_closed` | Portal only | `risk_closed` | ✅ (if visible) | Low |
| `issue_created` | Email, Portal | `issue_created` | ✅ (if visible) | Normal |
| `issue_escalated` | Email, WhatsApp, SMS, Portal | `issue_escalated` | ✅ (if visible) | High |
| `issue_resolved` | Email, Portal | `issue_resolved` | ✅ (if visible) | Normal |
| `change_order_created` | Email, WhatsApp, Portal | `change_order_created` | ✅ | High |
| `change_order_approved` | Email, WhatsApp, Portal | `change_order_approved` | ✅ | Normal |
| `health_degraded` | Email, Portal | `health_degraded` | ✅ | High |

### 8.2 Internal Notifications (Not Customer-Safe)

These events trigger internal-only notifications (Slack, email to project manager):

| Domain Event | Internal Channel | Recipient |
|-------------|-----------------|-----------|
| `change_order_rejected` | Email, Slack | Project Manager |
| `risk_critical` | Email, Slack, SMS | Project Manager |
| `issue_blocker` | Email, Slack | Project Manager |
| `project_created` | Portal (internal) | Assignee |
| `deal_converted_to_project` | Portal (internal) | Project Manager |

---

## 9. Digests

### 9.1 Daily Digest

Contacts with `frequency = daily` receive a summarized digest:

```
Subject: TUTIA — Your Daily Project Summary (15 Jul 2026)

┌────────────────────────────────────────────────────┐
│  Your Daily Summary                                │
│                                                    │
│  Projects: 3 active                                │
│  ─────────────────────                              │
│                                                    │
│  ✅ Completed (2)                                  │
│    • Training pilot session — ERP Project          │
│    • API documentation — SMS Platform              │
│                                                    │
│  ⚠️ At Risk (1)                                    │
│    • Project "Data Migration" — behind schedule    │
│                                                    │
│  🔄 Pending Approvals (1)                          │
│    • Change Order #12 — Additional Server Capacity │
│                                                    │
│  📊 Overall Health: 82%                            │
│                                                    │
│  View full dashboard →                             │
└────────────────────────────────────────────────────┘
```

### 9.2 Weekly Digest

Same structure but includes:

- Week-over-week health trend
- Milestones completed this week vs. planned
- Change orders approved vs. total
- Same period last week comparison

### 9.3 Digest Generation

```php
php artisan crm:generate-digests --frequency=daily
php artisan crm:generate-digests --frequency=weekly
```

Scheduled via Laravel's scheduler:

```php
// App\Console\Kernel
$schedule->job(new GenerateDailyDigests)->dailyAt('20:00');
$schedule->job(new GenerateWeeklyDigests)->weeklyOn(5, '18:00'); // Friday
```

---

## 10. Delivery Tracking

### 10.1 Delivery Record

Each delivery attempt records a lightweight log (not a full communication system):

```php
Schema::create('crm_communication_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('contact_id')->constrained('crm_contacts')->cascadeOnDelete();
    $table->foreignId('causer_event_id')->nullable()->constrained('crm_activity_timeline')->nullOnDelete(); // The domain event that triggered this
    $table->string('channel', 20); // email, whatsapp, sms, portal
    $table->string('template', 100);
    $table->string('status', 20); // sent, delivered, failed, bounced, read
    $table->text('provider_message_id')->nullable();
    $table->json('provider_response')->nullable();
    $table->text('error_message')->nullable();
    $table->timestamp('delivered_at')->nullable();
    $table->timestamp('read_at')->nullable();
    $table->timestamps();

    $table->index(['contact_id', 'status'], 'crm_cl_contact_status_idx');
    $table->index('created_at', 'crm_cl_created_idx');
});
```

### 10.2 Retry Policy

| Channel | Max Retries | Backoff | Dead Letter After |
|---------|-------------|---------|-------------------|
| Email | 3 | 5min, 15min, 1h | 3 failures |
| WhatsApp | 2 | 5min, 30min | 2 failures |
| SMS | 1 | 5min | 1 failure |
| Portal | 0 | — | N/A (in-session) |

### 10.3 Provider Webhooks

```php
Route::post('/webhooks/email/bounce', [EmailWebhookController::class, 'bounce']);
Route::post('/webhooks/whatsapp/status', [WhatsAppWebhookController::class, 'status']);
Route::post('/webhooks/sms/delivery', [SmsWebhookController::class, 'delivery']);
```

---

## 11. Timeline Integration

### 11.1 Recording Principle

Every successful communication dispatch records a timeline event:

```
Domain Event (MilestoneCompleted)
    ↓
NotificationCoordinator dispatches channels
    ↓
Each channel delivery records:
  Timeline: "Email sent to ahmad@example.com — Milestone 'Training' completed"
  Tags: { customer_safe: true, communication: true, channel: 'email' }
```

### 11.2 Timeline Event Types for Communications

| Event Type | Customer Safe | Display |
|-----------|:-------------:|---------|
| `communication_email_sent` | ✅ | "Email sent" |
| `communication_whatsapp_sent` | ✅ | "WhatsApp sent" |
| `communication_sms_sent` | ✅ | "SMS sent" |
| `communication_portal_sent` | ✅ | "Portal notification" |

### 11.3 No Duplicate Communication Log

The timeline **is** the communication log. The `crm_communication_logs` table is an operational tracking table only (delivery status, retries, webhooks). For customer-facing history, the portal queries the timeline filtered by `communication = true`.

---

## 12. Domain Events Consumers

### 12.1 Listener Architecture

```php
// App\Listeners\Communications\DispatchMilestoneCompletedNotification
class DispatchMilestoneCompletedNotification
{
    public function __construct(
        private NotificationCoordinator $coordinator,
        private PortalVisibilityService $visibility,
    ) {}

    public function handle(MilestoneCompleted $event): void
    {
        $project = $event->project;
        $contacts = $project->customerContacts(); // All contacts with portal_access

        foreach ($contacts as $contact) {
            $this->coordinator->dispatch(
                contact: $contact,
                event: $event,
                template: 'milestone_completed',
                variables: [
                    'project_name' => $project->name,
                    'milestone_name' => $event->milestone->name,
                ],
            );
        }
    }
}
```

### 12.2 Event → Listener Registration

```php
// App\Providers\EventServiceProvider
protected $listen = [
    \App\Events\Crm\MilestoneCompleted::class => [
        \App\Listeners\Communications\DispatchMilestoneCompletedNotification::class,
    ],
    \App\Events\Crm\DeliverableCompleted::class => [
        \App\Listeners\Communications\DispatchDeliverableCompletedNotification::class,
    ],
    \App\Events\Crm\RiskClosed::class => [
        \App\Listeners\Communications\DispatchRiskClosedNotification::class,
    ],
    \App\Events\Crm\IssueResolved::class => [
        \App\Listeners\Communications\DispatchIssueResolvedNotification::class,
    ],
    \App\Events\Crm\ChangeOrderApproved::class => [
        \App\Listeners\Communications\DispatchChangeOrderApprovedNotification::class,
    ],
    \App\Events\Crm\IssueEscalated::class => [
        \App\Listeners\Communications\DispatchIssueEscalatedNotification::class,
        \App\Listeners\Communications\DispatchInternalEscalationAlert::class,
    ],
    \App\Events\Crm\ProjectAtRisk::class => [
        \App\Listeners\Communications\DispatchProjectAtRiskNotification::class,
        \App\Listeners\Communications\DispatchInternalProjectAtRiskAlert::class,
    ],
];
```

### 12.3 Deferred Events

Some events need new domain events (CRM-4 did not create them all):

| New Event Needed | Trigger | Purpose |
|-----------------|---------|---------|
| `IssueEscalated` | Issue severity changed to `critical` or `blocker` | Triggers SMS + internal alert |
| `ProjectAtRisk` | Health score drops below 50 | Triggers urgent notification |
| `HealthDegraded` | Health score drops 15+ points in 24h | Triggers alert + daily digest highlight |

These should be fired from the `DeliveryHealthService` or `IssueController` as part of CRM-5.

---

## 13. Queue Architecture

### 13.1 Queue Layout

| Queue Name | Purpose | Workers | Retries |
|-----------|---------|---------|---------|
| `communications` | All notification dispatch | 3 | 3 |
| `communications-digests` | Daily/Weekly digest generation | 1 | 2 |
| `communications-webhooks` | Incoming provider webhooks | 2 | 3 |
| `communications-retry` | Dead letter queue reprocessing | 1 | 5 |

### 13.2 Job Structure

```php
class DispatchNotification implements ShouldQueue
{
    public function __construct(
        private Contact $contact,
        private string $channel,
        private string $template,
        private array $variables,
    ) {
        $this->onQueue('communications');
    }

    public function handle(ChannelResolver $resolver, TemplateEngine $engine): void
    {
        $channel = $resolver->resolve($this->channel);
        $message = $engine->render($this->template, $this->variables);
        $result = $channel->send($this->contact, $message);

        DeliveryRecorder::record(
            contact: $this->contact,
            channel: $this->channel,
            template: $this->template,
            result: $result,
        );
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Communication dispatch failed', [
            'contact_id' => $this->contact->id,
            'channel' => $this->channel,
            'template' => $this->template,
            'error' => $e->getMessage(),
        ]);
    }
}
```

### 13.3 Failure Handling

- After max retries, the job moves to `communications-retry` queue
- A scheduled job (`php artisan crm:retry-communications`) reprocesses failed dispatches once per hour
- After 5 reprocess attempts, the job is permanently failed and an internal notification is sent

---

## 14. Code Organization

### 14.1 Directory Structure

```
app/
├── Console/
│   └── Commands/
│       └── Crm/
│           ├── GenerateDailyDigests.php
│           ├── GenerateWeeklyDigests.php
│           └── RetryFailedCommunications.php
├── Events/
│   └── Crm/
│       ├── IssueEscalated.php       # NEW
│       ├── ProjectAtRisk.php        # NEW
│       └── HealthDegraded.php       # NEW
├── Listeners/
│   └── Communications/
│       ├── DispatchMilestoneCompletedNotification.php
│       ├── DispatchDeliverableCompletedNotification.php
│       ├── DispatchRiskClosedNotification.php
│       ├── DispatchIssueResolvedNotification.php
│       ├── DispatchChangeOrderCreatedNotification.php
│       ├── DispatchChangeOrderApprovedNotification.php
│       ├── DispatchIssueEscalatedNotification.php
│       ├── DispatchProjectAtRiskNotification.php
│       ├── DispatchInternalEscalationAlert.php
│       └── DispatchInternalProjectAtRiskAlert.php
├── Jobs/
│   └── Communications/
│       ├── DispatchNotification.php
│       ├── GenerateDigest.php
│       └── RetryCommunication.php
├── Services/
│   └── Crm/
│       ├── Communications/
│       │   ├── NotificationCoordinator.php
│       │   ├── PreferenceResolver.php
│       │   ├── ChannelRouter.php
│       │   ├── TemplateEngine.php
│       │   ├── DispatchManager.php
│       │   ├── DeliveryRecorder.php
│       │   └── Digester.php
│       └── Channels/
│           ├── NotificationChannel.php           # Interface
│           ├── Email/
│           │   ├── EmailChannel.php
│           │   ├── EmailProvider.php             # Interface
│           │   └── SesEmailProvider.php
│           ├── WhatsApp/
│           │   ├── WhatsAppChannel.php
│           │   ├── WhatsAppProvider.php          # Interface
│           │   └── TwilioWhatsAppProvider.php
│           ├── Sms/
│           │   ├── SmsChannel.php
│           │   ├── SmsProvider.php               # Interface
│           │   └── TwilioSmsProvider.php
│           └── Portal/
│               ├── PortalChannel.php
│               └── PortalNotificationService.php
├── Http/
│   └── Controllers/
│       └── Api/
│           └── Communications/
│               ├── EmailWebhookController.php
│               ├── WhatsAppWebhookController.php
│               └── SmsWebhookController.php
└── Models/
    ├── CrmCommunicationLog.php
    └── CrmPortalNotification.php

resources/views/vendor/crm-communications/
├── email/
│   ├── layouts/
│   └── notifications/
│       ├── milestone-completed.blade.php
│       ├── deliverable-completed.blade.php
│       ├── risk-closed.blade.php
│       ├── issue-resolved.blade.php
│       ├── change-order-created.blade.php
│       ├── change-order-approved.blade.php
│       ├── daily-digest.blade.php
│       └── weekly-digest.blade.php
└── whatsapp/
    └── templates.json              # WhatsApp template definitions
```

### 14.2 Configuration

```php
// config/crm-communications.php
return [
    'channels' => [
        'email' => [
            'provider' => env('CRM_EMAIL_PROVIDER', 'ses'),
            'from_address' => env('CRM_EMAIL_FROM', 'noreply@tutia.com'),
            'from_name' => env('CRM_EMAIL_FROM_NAME', 'TUTIA'),
        ],
        'whatsapp' => [
            'provider' => env('CRM_WHATSAPP_PROVIDER', 'twilio'),
            'from_number' => env('CRM_WHATSAPP_FROM'),
        ],
        'sms' => [
            'provider' => env('CRM_SMS_PROVIDER', 'twilio'),
            'from_number' => env('CRM_SMS_FROM'),
        ],
        'portal' => [
            'enabled' => true,
        ],
    ],
    'retry' => [
        'max_attempts' => 3,
        'backoff' => [300, 900, 3600], // 5min, 15min, 1h
    ],
    'digests' => [
        'daily_at' => '20:00',
        'weekly_on' => 'friday 18:00',
        'timezone' => 'Asia/Riyadh',
    ],
];
```

---

## 15. CRM-6 Automation Compatibility

### 15.1 Workflow Triggers

The communications architecture is designed so CRM-6 Workflow Automation can:

- **Create custom event-to-channel mappings** (e.g., "Send SMS when risk severity > medium")
- **Add conditional logic** (e.g., "Only notify if contract value > $50,000")
- **Schedule delayed notifications** (e.g., "Remind customer 48h after CO created if not approved")
- **Branch based on contact attributes** (e.g., "Send WhatsApp for VIP contacts, email for standard")
- **Create custom digests** with user-defined frequency and content selection

### 15.2 Extension Points

| Extension Point | What CRM-6 Can Plug Into |
|----------------|--------------------------|
| `ChannelRouter::resolveChannels()` | Override channel selection with rules |
| `TemplateEngine::resolve()` | Add custom templates per organization |
| `PreferenceResolver::preferences()` | Add conditional overrides |
| `NotificationCoordinator` | Add custom middleware (logging, analytics, throttling) |
| `Digester` | Add custom digest sections |

---

## 16. CRM-7 Analytics Compatibility

### 16.1 Communication Analytics

CRM-7 Analytics can consume:

- **Delivery rates** per channel (sent vs. delivered vs. read)
- **Response times** (time from notification to approval action)
- **Channel effectiveness** (which channel drives fastest CO approval)
- **Contact engagement** (portal login frequency after notifications)
- **Digest engagement** (click-through rates from daily/weekly digests)

### 16.2 Data Source

All analytics data comes from:
1. `crm_communication_logs` — delivery status, timestamps
2. `crm_activity_timeline` — communication events (customer-safe)
3. `crm_portal_notifications` — in-app notification engagement

No separate analytics schema needed.

---

## 17. Security & Compliance

### 17.1 Data Privacy

- Communication logs retain for 90 days; archive after 90; purge after 365
- Contacts can request all communication history via GDPR/PDPL data export
- Channel preference changes are logged as timeline events for audit

### 17.2 Opt-Out

- Every email includes "Unsubscribe from project notifications" link
- Unsubscribe → sets email channel to `muted` for that contact
- SMS opt-out via reply STOP (standard Twilio compliance)

### 17.3 Rate Limiting

| Channel | Max Per Contact Per Hour |
|---------|-------------------------|
| Email | 20 |
| WhatsApp | 10 |
| SMS | 5 |
| Portal | Unlimited |

---

## 18. Open Questions

1. Should we support WhatsApp Business API for read receipts? (Recommend: yes, CRM-6)
2. Should daily digest be per-project or cross-project? (Recommend: cross-project, organized by project)
3. Should the notification coordinator handle batching or rely on queue framework? (Recommend: queue handles batching, coordinator handles logic)
4. Should we store rendered message bodies in the log for audit? (Recommend: no — store template name + variables, not rendered output)
5. Should SMS support two-way replies? (Recommend: track for CRM-6)
