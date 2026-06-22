# CRM-5 Architecture Contract

> **Status:** Draft  
> **Phase:** CRM-5 Planning  
> **Dependencies:** CRM-4 Delivery OS (all phases), CRM-5 Customer Portal Vision, CRM-5 Communications Architecture  
> **Principle:** This is the binding contract between product vision and execution. Every migration, model, controller, and rule derives from this document. Deviations require written exception.

---

## 1. Portal Domain Model

### 1.1 Entity Relationship

```
crm_contacts
    ├── crm_portal_accounts          (1:1 — portal access state per contact)
    ├── crm_portal_sessions          (1:N — active browser sessions)
    ├── crm_portal_tokens            (1:N — magic links & API tokens)
    ├── crm_portal_notification_preferences (1:N — per-channel preferences)
    ├── crm_portal_notifications            (1:N — in-app notification history)
    └── crm_communication_logs       (1:N — delivery tracking)

crm_projects
    └── crm_portal_account_project   (N:M — which projects a contact can see)

crm_project_risks
    └── is_visible_to_customer       (column — override on each risk)

crm_issues
    └── is_visible_to_customer       (column — override on each issue)
```

### 1.2 Table Definitions

#### `crm_portal_accounts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK | |
| contact_id | bigint | FK → crm_contacts, ON DELETE CASCADE | Unique |
| enabled_at | timestamp | nullable | When portal access was granted |
| enabled_by | bigint | FK → users, nullable | Who granted access |
| last_login_at | timestamp | nullable | |
| login_count | int | default 0 | |
| locale | varchar(10) | default 'ar' | Portal display language |
| disabled_at | timestamp | nullable | |
| disabled_reason | varchar(200) | nullable | Audit trail |
| **email_snapshot** | **varchar(255)** | **nullable** | **Contact email at time of portal grant — survives later contact edits** |
| **name_snapshot** | **varchar(255)** | **nullable** | **Contact name at time of portal grant — preserves historical records** |
| created_at | timestamp | | |
| updated_at | timestamp | | |

Index: `crm_pa_contact_idx` on `contact_id` (unique)

#### `crm_portal_tokens`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK | |
| portal_account_id | bigint | FK → crm_portal_accounts, CASCADE | |
| **token_hash** | **varchar(64)** | **unique** | **SHA-256 of raw token — never store plaintext** |
| type | varchar(20) | NOT NULL | 'magic_link', 'api' |
| expires_at | timestamp | nullable | |
| used_at | timestamp | nullable | Magic links consumed once |
| ip_address | varchar(45) | nullable | |
| user_agent | text | nullable | |
| created_at | timestamp | | |

Indexes: `crm_pt_token_hash_idx` on `token_hash` (unique), `crm_pt_account_idx` on `portal_account_id`

#### `crm_portal_sessions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK | |
| portal_account_id | bigint | FK → crm_portal_accounts, CASCADE | |
| **token_hash** | **varchar(64)** | **unique** | **SHA-256 of session token** |
| expires_at | timestamp | nullable | 30-day default |
| **revoked_at** | **timestamp** | **nullable** | **For logout / force logout / device removal** |
| revoked_reason | varchar(100) | nullable | 'logout', 'admin_revoke', 'passwordless_reset' |
| last_used_at | timestamp | nullable | Extended on each request |
| ip_address | varchar(45) | nullable | |
| user_agent | text | nullable | |
| created_at | timestamp | | |

Indexes: `crm_ps_token_hash_idx` on `token_hash` (unique), `crm_ps_account_idx` on `portal_account_id`

#### `crm_portal_notification_preferences`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK | |
| portal_account_id | bigint | FK → crm_portal_accounts, CASCADE | |
| channel | varchar(20) | NOT NULL | 'email', 'whatsapp', 'sms', 'portal' |
| frequency | varchar(20) | default 'immediate' | 'immediate', 'daily', 'weekly', 'muted' |
| event_filters | json | nullable | Null = all. Array of event types or filter groups |
| created_at | timestamp | | |
| updated_at | timestamp | | |

Unique: `crm_pnp_account_channel_uq` on `(portal_account_id, channel)`

Filter groups for `event_filters`:
- `"all"` — all events
- `"critical"` — `issue_escalated`, `risk_critical`, `project_at_risk`
- `"approvals"` — `change_order_created`, `change_order_approved`
- `"milestones"` — `milestone_completed`, `deliverable_completed`, `deliverable_approved`
- `"custom"` — explicit array of event type strings

#### `crm_portal_notifications`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK | |
| portal_account_id | bigint | FK → crm_portal_accounts, CASCADE | |
| type | varchar(50) | NOT NULL | Event type string |
| title | varchar(200) | NOT NULL | Human-readable |
| body | text | nullable | |
| notifiable_type | varchar(100) | NOT NULL | Morph: project, milestone, etc. |
| notifiable_id | bigint | NOT NULL | |
| **idempotency_key** | **varchar(100)** | **unique** | **Prevents duplicate delivery on job retry** |
| metadata | json | nullable | Event-specific data |
| read_at | timestamp | nullable | |
| created_at | timestamp | | |

Indexes: `crm_n_idempotency_idx` on `idempotency_key` (unique), `crm_n_acct_read_idx` on `(portal_account_id, read_at)`

#### `crm_communication_logs`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK | |
| portal_account_id | bigint | FK → crm_portal_accounts, CASCADE | |
| **correlation_id** | **varchar(100)** | **indexed** | **Links Domain Event → Notification → Channel Dispatch → Delivery Result** |
| event_id | bigint | FK → crm_activity_timeline, ON DELETE SET NULL | The domain event that triggered this |
| channel | varchar(20) | NOT NULL | 'email', 'whatsapp', 'sms', 'portal' |
| template | varchar(100) | NOT NULL | Template name used |
| status | varchar(20) | NOT NULL | 'queued', 'sent', 'delivered', 'failed', 'bounced', 'read', 'clicked' |
| provider_message_id | varchar(200) | nullable | Provider-specific ID |
| provider_response | json | nullable | Raw provider response |
| error_message | text | nullable | |
| delivered_at | timestamp | nullable | |
| read_at | timestamp | nullable | |
| clicked_at | timestamp | nullable | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

Indexes: `crm_cl_correlation_idx` on `correlation_id`, `crm_cl_account_status_idx` on `(portal_account_id, status)`, `crm_cl_created_idx` on `created_at`

#### `crm_portal_account_project`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigint | PK | |
| portal_account_id | bigint | FK → crm_portal_accounts, CASCADE | |
| project_id | bigint | FK → crm_projects, CASCADE | |
| role | varchar(30) | default 'viewer' | 'primary_contact', 'stakeholder', 'viewer', 'approver' |
| created_at | timestamp | | |

Unique: `crm_pap_account_project_uq` on `(portal_account_id, project_id)`

### 1.3 Existing Table Modifications

```php
// crm_contacts — add portal tracking
$table->timestamp('portal_enabled_at')->nullable()->after('notes');
// No separate index needed — used via crm_portal_accounts join

// crm_project_risks — add visibility flag
$table->boolean('is_visible_to_customer')->default(false)->after('mitigation_plan');

// crm_issues — add visibility flag
$table->boolean('is_visible_to_customer')->default(false)->after('resolution');

// crm_activity_timeline — add customer_safe flag
$table->boolean('customer_safe')->default(false)->after('metadata');
$table->index(['causer_type', 'causer_id', 'customer_safe'], 'crm_at_causer_safe_idx');
```

---

## 2. Customer Visibility Engine

### 2.1 Core Contract

The Visibility Engine is a **single service class** that enforces all customer-safe access rules. Every portal controller calls it before returning data.

```php
interface CustomerVisibilityService
{
    /**
     * Verify a contact can access a project.
     */
    public function canAccessProject(PortalAccount $account, CrmProject $project): bool;

    /**
     * Filter projects to only those the contact can see.
     */
    public function visibleProjects(PortalAccount $account): Collection;

    /**
     * Get customer-safe project data array.
     */
    public function projectData(PortalAccount $account, CrmProject $project): array;

    /**
     * Check if a specific entity is visible to this contact.
     */
    public function isEntityVisible(PortalAccount $account, object $entity): bool;

    /**
     * Filter a collection to visible entities only.
     */
    public function filterVisible(PortalAccount $account, Collection $entities): Collection;
}
```

### 2.2 Visibility Rules Engine

```php
class CustomerVisibilityService implements CustomerVisibilityService
{
    public function canAccessProject(PortalAccount $account, CrmProject $project): bool
    {
        // Rule 1: Account must be enabled
        if (! $account->enabled_at || $account->disabled_at) {
            return false;
        }

        // Rule 2: Must have explicit project assignment
        return $account->projects()
            ->where('crm_projects.id', $project->id)
            ->exists();
    }

    public function isEntityVisible(PortalAccount $account, object $entity): bool
    {
        if ($entity instanceof CrmProjectRisk) {
            return $entity->is_visible_to_customer;
        }
        if ($entity instanceof CrmIssue) {
            return $entity->is_visible_to_customer;
        }
        if ($entity instanceof CrmDeliverable) {
            return $entity->is_visible_to_customer;
        }
        // Milestones and change orders are always visible
        if ($entity instanceof CrmMilestone || $entity instanceof CrmChangeOrder) {
            return true;
        }
        return false;
    }

    public function projectData(PortalAccount $account, CrmProject $project): array
    {
        return [
            'id' => $project->id,
            'name' => $project->name,
            'status' => $this->translateStatus($project->status),
            'health_tier' => $this->resolveHealthTier($project),
            'health_score' => $project->healthScore(), // simplified for display
            'total_value' => $project->contract_value + $project->change_order_total,
            'milestones' => $project->milestones->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'status' => $m->status,
                'progress' => $this->milestoneProgress($m),
            ]),
            'risks' => $this->filterVisible($account, $project->risks)->values(),
            'issues' => $this->filterVisible($account, $project->issues)->values(),
            'change_orders' => $project->changeOrders->map(fn ($co) => [
                'id' => $co->id,
                'title' => $co->title,
                'amount' => $co->amount,
                'status' => $co->status,
                'created_at' => $co->created_at,
            ]),
            'recent_activity' => $this->recentTimeline($project, $account),
        ];
    }
}
```

### 2.3 Status Translation

| Internal Status | Portal Display |
|----------------|----------------|
| `planned` | "Not Started" |
| `initiating` | "Getting Started" |
| `active` | "In Progress" |
| `at_risk` | "At Risk" |
| `completed` | "Completed" |
| `archived` | "Archived" |

### 2.4 Health Tier Translation

| Internal Score | Portal Tier | Color |
|---------------|-------------|-------|
| 80–100 | "On Track" | `#22c55e` (green) |
| 50–79 | "At Risk" | `#eab308` (yellow) |
| 0–49 | "Behind" | `#ef4444` (red) |

---

## 3. Portal Authentication Architecture

### 3.1 Authentication Flow

```
Contact receives email/WhatsApp with portal link
    ↓
Link contains signed token: https://portal.tutia.com/auth/token/{signed_token}
    ↓
Server validates signature + expiry (48h)
    ↓
PortalAccount looked up by contact_id
    ↓
If disabled → 403 with "Access revoked" message
    ↓
If first login → creates PortalAccount with enabled_at = now
    ↓
Session token created (SHA-256, 30-day expiry)
    ↓
Set cookie + redirect to Dashboard
```

### 3.2 Token Architecture

| Token Type | Stored In | Generated By | Lifetime | Usage |
|-----------|-----------|-------------|----------|-------|
| `magic_link` | `crm_portal_tokens` | Internal user grants access | 48 hours | Single-use, signed URL |
| `session` | `crm_portal_sessions` | Server after magic link consumed | 30 days | Cookie-based, refreshed on each request, revocable |
| `api` | `crm_portal_tokens` | Future CRM-6 | Configurable | For automation/webhook callbacks |

All tokens are stored as **SHA-256 hashes** — the raw 32-byte hex string is never persisted. Comparison uses `hash_equals()`.

### 3.3 Magic Link Generation

```php
// Internal user action: ContactController@enablePortal
$plaintext = bin2hex(random_bytes(32));

$token = PortalToken::create([
    'portal_account_id' => $account->id,
    'token_hash' => hash('sha256', $plaintext),  // Never store raw token
    'type' => 'magic_link',
    'expires_at' => now()->addHours(48),
]);

// Send to contact (only the plaintext leaves the server)
NotificationCoordinator::dispatch(
    contact: $contact,
    template: 'portal_welcome',
    variables: [
        'link' => config('app.portal_url') . '/auth/token/' . $plaintext,
        'expires_in' => '48 hours',
    ],
);
```

### 3.4 Token Consumption

```php
// GET /auth/token/{plaintext}
$hashed = hash('sha256', $plaintext);
$token = PortalToken::where('token_hash', $hashed)
    ->where('type', 'magic_link')
    ->whereNull('used_at')
    ->where(fn $q => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
    ->firstOrFail();

$token->update(['used_at' => now(), 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent()]);

// Create session (separate table from tokens)
$sessionPlaintext = bin2hex(random_bytes(32));
$sessionToken = PortalSession::create([
    'portal_account_id' => $token->portal_account_id,
    'token_hash' => hash('sha256', $sessionPlaintext),
    'expires_at' => now()->addDays(30),
    'ip_address' => $request->ip(),
    'user_agent' => $request->userAgent(),
]);

// Set cookie (only plaintext leaves the server)
cookie('portal_session', $sessionPlaintext, 60 * 24 * 30, secure: true, httpOnly: true, sameSite: 'lax');
```

### 3.5 Optional OTP (Phase 2, CRM-5.1)

For high-security projects, an OTP can be required in addition to magic link:

- OTP delivered via the same portal link page
- 6-digit code, valid for 5 minutes
- Sent to contact's email or WhatsApp based on preference
- Enabled per-project via `crm_portal_account_project.otp_required`

### 3.6 Session Revocation

Sessions can be revoked explicitly, independent of expiry:

```php
// Logout — revoke current session
PortalSession::where('token_hash', hash('sha256', $cookieToken))
    ->whereNull('revoked_at')
    ->update(['revoked_at' => now(), 'revoked_reason' => 'logout']);

// Force logout — revoke all sessions for an account
PortalSession::where('portal_account_id', $account->id)
    ->whereNull('revoked_at')
    ->update(['revoked_at' => now(), 'revoked_reason' => 'admin_revoke']);

// Device removal — revoke specific session
PortalSession::where('id', $sessionId)
    ->whereNull('revoked_at')
    ->update(['revoked_at' => now(), 'revoked_reason' => 'device_removal']);
```

### 3.7 Session Validation Middleware

```php
class PortalAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        $plaintext = $request->cookie('portal_session') ?? $request->bearerToken();

        if (! $plaintext) {
            return redirect()->route('portal.auth.login');
        }

        $hashed = hash('sha256', $plaintext);
        $session = PortalSession::where('token_hash', $hashed)
            ->whereNull('revoked_at')
            ->where(fn $q => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->first();

        if (! $session || ! $session->account->enabled_at || $session->account->disabled_at) {
            return redirect()->route('portal.auth.login');
        }

        // Extend session expiry on each active request
        $session->update(['last_used_at' => now()]);

        $request->merge(['portal_account' => $session->account]);
        app()->instance('portal-account', $session->account);

        return $next($request);
    }
}
```

### 3.7 Portal Routes

```php
// routes/portal.php
Route::prefix('portal')->name('portal.')->group(function () {
    // Pre-auth
    Route::get('/auth/login', [PortalAuthController::class, 'loginForm'])->name('auth.login');
    Route::get('/auth/token/{token}', [PortalAuthController::class, 'consumeToken'])->name('auth.token');
    Route::post('/auth/logout', [PortalAuthController::class, 'logout'])->name('auth.logout');

    // Protected
    Route::middleware('portal.auth')->group(function () {
        Route::get('/dashboard', [PortalDashboardController::class, 'index'])->name('dashboard');

        // Project workspace
        Route::get('/projects/{project}', [PortalProjectController::class, 'show'])->name('projects.show');

        // Change order approval
        Route::post('/projects/{project}/change-orders/{changeOrder}/approve', [PortalChangeOrderController::class, 'approve'])->name('change-orders.approve');
        Route::post('/projects/{project}/change-orders/{changeOrder}/reject', [PortalChangeOrderController::class, 'reject'])->name('change-orders.reject');

        // Timeline (API JSON endpoint for the React component)
        Route::get('/api/timeline', [PortalTimelineController::class, 'index'])->name('api.timeline');

        // Notification preferences
        Route::get('/preferences', [PortalPreferencesController::class, 'index'])->name('preferences');
        Route::patch('/preferences', [PortalPreferencesController::class, 'update'])->name('preferences.update');

        // Profile
        Route::get('/profile', [PortalProfileController::class, 'show'])->name('profile');
    });
});
```

---

## 4. Notification Architecture

### 4.1 Flow Diagram

```
Domain Event (e.g., MilestoneCompleted)
    │
    ▼
EventServiceProvider::dispatch()
    │
    ▼
Listener (e.g., DispatchMilestoneCompletedNotification)
    │
    ▼
NotificationCoordinator
    │
    ├── 1. PreferenceResolver::resolve(contact, event_type)
    │       Returns: ['email' => 'immediate', 'whatsapp' => 'daily', 'portal' => 'immediate']
    │
    ├── 2. ChannelRouter::route(preferences, event)
    │       Returns: ['email', 'portal']  (filters: muted, digest-only vs immediate)
    │
    ├── 3. TemplateEngine::resolve(template_name, locale, variables)
    │       Returns: NotificationMessage { subject, body, html_body, buttons }
    │
    └── 4. DispatchManager::dispatch(contact, channels, message)
            │
            ├── EmailChannel::send()    → SES/SMTP
            ├── WhatsAppChannel::send() → Twilio/Meta
            ├── SmsChannel::send()      → Twilio/SNS
            └── PortalChannel::send()   → crm_portal_notifications table
                │
                ▼
            DeliveryRecorder::record(channel, status, provider_id)
                │
                ▼
            TimelineRecorder::record('communication_{channel}_sent', customer_safe: true)
```

### 4.2 NotificationCoordinator Contract

```php
class NotificationCoordinator
{
    public function __construct(
        private PreferenceResolver $preferences,
        private ChannelRouter $router,
        private TemplateEngine $templates,
        private DispatchManager $dispatcher,
        private DeliveryRecorder $recorder,
    ) {}

    public function dispatch(
        PortalAccount $account,
        string $eventType,
        string $templateName,
        NotifiableEntity $notifiable,
        array $variables = [],
    ): void {
        // 1. Resolve preferences
        $prefs = $this->preferences->resolve($account);

        // 2. Route to appropriate channels
        $channels = $this->router->route($prefs, $eventType);

        // 3. Render template
        $message = $this->templates->resolve(
            name: $templateName,
            locale: $account->locale,
            variables: $variables,
        );

        // 4. Dispatch per channel
        foreach ($channels as $channel) {
            $this->dispatcher->dispatchToChannel(
                account: $account,
                channel: $channel,
                message: $message,
                eventType: $eventType,
                notifiable: $notifiable,
            );
        }
    }
}
```

### 4.3 ChannelRouter Logic

```php
class ChannelRouter
{
    public function route(array $preferences, string $eventType): array
    {
        $channels = [];
        foreach ($preferences as $channel => $frequency) {
            if ($frequency === 'muted') {
                continue;
            }
            if ($frequency === 'immediate') {
                $channels[] = $channel;
                continue;
            }
            // daily/weekly handled by digest scheduler
        }
        return $channels;
    }
}
```

Daily and weekly frequency notifications are **not dispatched in real-time**. Instead, the `DispatchManager` enqueues them to a digest buffer:

```php
if (in_array($frequency, ['daily', 'weekly'])) {
    DigestBuffer::enqueue($account, $eventType, $message);
    return; // No immediate dispatch
}
```

### 4.4 Channel Interface

```php
interface NotificationChannel
{
    public function send(PortalAccount $account, NotificationMessage $message): CommunicationResult;
    public function isAvailable(PortalAccount $account): bool;
    public function channelName(): string;
}
```

---

## 5. Event-to-Notification Matrix

### 5.1 Full Mapping

| Domain Event | Event Type String | Customer Safe | Template | Email | WhatsApp | SMS | Portal | Priority |
|-------------|-------------------|:-------------:|----------|:-----:|:--------:|:---:|:------:|----------|
| `DealConvertedToProject` | `project_created` | ✅ | `project_created` | ✅ | ❌ | ❌ | ✅ | Low |
| `ProjectCreated` | `project_created` | ✅ | `project_created` | ✅ | ❌ | ❌ | ✅ | Low |
| MilestoneCompleted | `milestone_completed` | ✅ | `milestone_completed` | ✅ | ✅ | ❌ | ✅ | Normal |
| DeliverableCompleted | `deliverable_completed` | ✅ (if visible) | `deliverable_completed` | ✅ | ✅ | ❌ | ✅ | Normal |
| RiskClosed | `risk_closed` | ✅ (if visible) | `risk_closed` | ✅ | ❌ | ❌ | ✅ | Low |
| IssueResolved | `issue_resolved` | ✅ (if visible) | `issue_resolved` | ✅ | ✅ | ❌ | ✅ | Normal |
| ChangeOrderApproved | `change_order_approved` | ✅ | `change_order_approved` | ✅ | ✅ | ❌ | ✅ | Normal |
| — | `issue_escalated` | ✅ (if visible) | `issue_escalated` | ✅ | ✅ | ✅ | ✅ | **High** |
| — | `project_at_risk` | ✅ | `project_at_risk` | ✅ | ✅ | ✅ | ✅ | **High** |
| — | `health_degraded` | ✅ | `health_degraded` | ✅ | ❌ | ❌ | ✅ | Normal |
| — | `change_order_created` | ✅ | `change_order_created` | ✅ | ✅ | ❌ | ✅ | **High** |
| — | `milestone_reopened` | ✅ | `milestone_reopened` | ✅ | ❌ | ❌ | ✅ | Low |
| — | `deliverable_approved` | ✅ (if visible) | `deliverable_approved` | ✅ | ❌ | ❌ | ✅ | Low |

### 5.2 New Domain Events Required

These events don't exist yet in CRM-4. They must be created in CRM-5 Phase 1:

| Event | Trigger | Purpose |
|-------|---------|---------|
| `App\Events\Crm\IssueEscalated` | Issue severity changes to `critical` or `blocker` | SMS + internal alert |
| `App\Events\Crm\ProjectAtRisk` | Health score drops below 50 | Urgent customer + internal alert |
| `App\Events\Crm\HealthDegraded` | Health score drops 15+ points in 24h | Digest highlight + alert |

### 5.3 Internal-Only Events (Not Customer-Safe)

| Event | Internal Channel | Recipient |
|-------|-----------------|-----------|
| `change_order_rejected` | Email, Slack | Project Manager |
| `risk_created` (severity: critical) | Email, Slack, SMS | Project Manager |
| `issue_created` (severity: blocker) | Email, Slack | Project Manager |
| `deal_converted_to_project` | Portal (internal timeline) | Project Manager |
| `project_created` | Portal (internal timeline) | Assignee |

---

## 6. Portal Timeline Architecture

### 6.1 Principle

**One timeline, two views.** The Universal Timeline (`crm_activity_timeline` + `ActivityTimelineProvider`) already supports 18 event types. The portal reuses it with a single filter:

```php
// PortalTimelineController
public function index(Request $request): JsonResponse
{
    $account = $request->get('portal_account');
    $project = CrmProject::findOrFail($request->get('project_id'));

    // Authorization
    if (! app(CustomerVisibilityService::class)->canAccessProject($account, $project)) {
        abort(403);
    }

    $events = CrmActivityTimeline::where('causer_type', 'project')
        ->where('causer_id', $project->id)
        ->where('customer_safe', true)
        ->orderBy('created_at', 'desc')
        ->paginate(20);

    return TimelineResource::collection($events);
}
```

### 6.2 Customer-Safe Event Types

Internal events (NOT exposed to portal):
- `note_created` (all activity notes are internal)
- `meeting_logged` (internal)
- `email_logged` (internal correspondence)
- `risk_created` / `risk_mitigated` (unless `is_visible_to_customer = true`)
- `issue_created` (unless `is_visible_to_customer = true`)
- `deal_converted_to_project` (internal)
- `stakeholder_added` (internal)
- All `communication_*` events (already recorded, but the communication itself is the notification)

Portal-visible events:
- `project_created`
- `project_at_risk`
- `project_archived`
- `milestone_completed`
- `milestone_reopened`
- `deliverable_completed` (if visible)
- `deliverable_approved` (if visible)
- `risk_closed` (if visible)
- `issue_resolved` (if visible)
- `issue_escalated` (if visible)
- `change_order_created`
- `change_order_approved`

### 6.3 Timeline Component Reuse

The existing `ActivityTimeline` React component is reused with the same API contract. The only difference is the API endpoint:

```tsx
// Internal workspace
<ActivityTimeline entityType="project" entityId={project.id} />

// Portal workspace
<ActivityTimeline apiEndpoint="/portal/api/timeline" entityType="project" entityId={project.id} />
```

### 6.4 Adding `customer_safe` to Timeline Recording

```php
// In every CRM-4 event that should produce a customer-safe timeline entry:
CrmActivityTimeline::record(
    causerType: 'project',
    causerId: $project->id,
    type: 'milestone_completed',
    metadata: [
        'milestone_id' => $milestone->id,
        'milestone_name' => $milestone->name,
    ],
    customerSafe: true,  // NEW parameter
);
```

---

## 7. Change Order Approval Engine

### 7.1 Lifecycle

```
Draft (internal) ──────→ Internal Review ──────→ Customer Approval Pending
    ↑                                                  │
    └── Reopened ◄─────────────────────────────────────┤
                                                       │
                                          ┌────────────┤
                                          ▼            ▼
                                     Approved     Rejected
                                          │            │
                                          ▼            ▼
                                    Implemented    Closed
```

### 7.2 Implementation

The approval engine reuses the existing `CrmChangeOrder` model and adds:

```php
// crm_change_orders — add portal-specific columns
Schema::table('crm_change_orders', function (Blueprint $table) {
    $table->string('customer_status', 30)->default('pending')->after('status');
    // Values: 'pending', 'approved', 'rejected'
    $table->foreignId('approved_by_portal_account_id')
        ->nullable()
        ->constrained('crm_portal_accounts')
        ->nullOnDelete()
        ->after('approved_by');
    $table->timestamp('customer_responded_at')->nullable()->after('approved_at');
});
```

### 7.3 Customer Approval Flow

```
1. Change order created internally (status: 'draft')
2. Internal team finalizes → marks 'ready_for_customer' (status: 'submitted')
3. crm_change_orders.customer_status → 'pending'
4. System dispatches change_order_created event
5. NotificationCoordinator sends email + WhatsApp to project contacts with role = 'approver'
6. Contact clicks "Approve" or "Reject" in email/portal
7. PortalChangeOrderController@approve or @reject
    ├── Validates: account has 'approver' role on this project
    ├── Validates: change_order.customer_status === 'pending'
    ├── Updates: customer_status, approved_by_portal_account_id, customer_responded_at
    ├── Fires: ChangeOrderApproved (or new ChangeOrderRejected event)
    └── Records timeline event
```

### 7.4 Portal Approval Controller

```php
class PortalChangeOrderController extends Controller
{
    public function __construct(
        private CustomerVisibilityService $visibility,
    ) {}

    public function approve(Request $request, CrmProject $project, CrmChangeOrder $changeOrder): RedirectResponse
    {
        $account = $request->get('portal_account');

        // Verify access
        throw_unless($this->visibility->canAccessProject($account, $project), AuthorizationException::class);
        throw_unless($account->projects()->wherePivot('role', 'approver')->exists(), AuthorizationException::class);
        throw_unless($changeOrder->customer_status === 'pending', ValidationException::class);

        DB::transaction(function () use ($changeOrder, $account) {
            $changeOrder->update([
                'customer_status' => 'approved',
                'approved_by_portal_account_id' => $account->id,
                'customer_responded_at' => now(),
                'status' => 'approved', // sync with internal status
            ]);

            // Accumulate financial impact
            $changeOrder->project->increment('change_order_total', $changeOrder->amount);

            // Dispatch domain event
            event(new ChangeOrderApproved($changeOrder, $account));
        });

        return redirect()->back()->with('success', 'Change order approved.');
    }

    public function reject(Request $request, CrmProject $project, CrmChangeOrder $changeOrder): RedirectResponse
    {
        $account = $request->get('portal_account');

        throw_unless($this->visibility->canAccessProject($account, $project), AuthorizationException::class);
        throw_unless($changeOrder->customer_status === 'pending', ValidationException::class);

        $request->validate(['reason' => 'required|string|max:500']);

        $changeOrder->update([
            'customer_status' => 'rejected',
            'approved_by_portal_account_id' => $account->id,
            'customer_responded_at' => now(),
            'status' => 'draft', // returns to draft for revision
        ]);

        event(new ChangeOrderRejected($changeOrder, $account, $request->reason));

        return redirect()->back()->with('info', 'Change order rejected. Awaiting revision.');
    }
}
```

---

## 8. Permission Matrix

### 8.1 Portal Roles

| Role | Access Scope | Can View Project | Can View Details | Can Approve CO | Can Manage Prefs |
|------|-------------|:----------------:|:----------------:|:--------------:|:----------------:|
| `primary_contact` | All assigned projects | ✅ | ✅ Full | ✅ | ✅ |
| `stakeholder` | Assigned projects | ✅ | ✅ Full | ✅ | ✅ |
| `approver` | Assigned projects only | ✅ | ✅ Limited | ✅ | ✅ |
| `viewer` | Assigned projects only | ✅ | ❌ (health + status only) | ❌ | ✅ |

### 8.2 Role Definitions

```php
// Seeded in crm_portal_account_project
$roles = [
    'primary_contact' => [
        'description' => 'Main customer contact for the project',
        'permissions' => ['view_project', 'view_details', 'approve_co', 'manage_prefs', 'view_timeline'],
    ],
    'stakeholder' => [
        'description' => 'Customer stakeholder with full visibility',
        'permissions' => ['view_project', 'view_details', 'approve_co', 'manage_prefs', 'view_timeline'],
    ],
    'approver' => [
        'description' => 'Can approve change orders only',
        'permissions' => ['view_project', 'view_timeline', 'approve_co'],
    ],
    'viewer' => [
        'description' => 'Read-only access to health and status',
        'permissions' => ['view_project', 'view_timeline'],
    ],
];
```

### 8.3 Authorization in Portal Controllers

```php
// Trait for portal controllers
trait AuthorizesPortalAccess
{
    protected function authorizePortal(PortalAccount $account, CrmProject $project, string $permission): void
    {
        $projectAccess = $account->projects()->where('crm_projects.id', $project->id)->first();

        throw_unless($projectAccess, AuthorizationException::class);

        $role = $projectAccess->pivot->role;
        $rolePermissions = config("crm-portal.roles.{$role}.permissions", []);

        throw_unless(in_array($permission, $rolePermissions), AuthorizationException::class);
    }
}
```

### 8.4 Internal Role ↔ Portal Role Mapping

When a project is created from a deal, stakeholders are migrated with the following mapping:

| Internal Stakeholder Role | Portal Role |
|--------------------------|-------------|
| `decision_maker` | `primary_contact` |
| `influencer` | `stakeholder` |
| `champion` | `stakeholder` |
| `end_user` | `viewer` |
| `economic_buyer` | `approver` |

---

## 9. Communication Tracking Model

### 9.1 Tracking Architecture

```
Email sent → SES/SMTP
    ├── delivered_at ← SNS webhook (delivery notification)
    ├── opened_at    ← Pixel load (1x1 transparent image in email)
    ├── clicked_at   ← Signed redirect URL click
    └── bounced_at   ← SNS webhook (bounce notification)
        ↓
    crm_communication_logs.status updated
```

### 9.2 Pixel-Based Open Tracking

```php
// Email HTML includes:
<img src="{{ $trackingPixel }}" width="1" height="1" alt="" />

// Route:
Route::get('/track/open/{logId}/{signature}', [TrackingController::class, 'open'])->name('track.open');

// Controller:
public function open(string $logId, string $signature): Response
{
    if (! hash_equals(hash_hmac('sha256', $logId, config('app.key')), $signature)) {
        return response()->gif(transparent()); // Return 1x1 pixel regardless
    }

    CommunicationLog::where('id', $logId)
        ->whereNull('opened_at')
        ->update(['opened_at' => now()]);

    return response()->gif(transparent());
}
```

### 9.3 Signed Redirect URL for Click Tracking

```php
// Email link:
<a href="{{ $trackingUrl }}">View Dashboard</a>

// Route:
Route::get('/track/click/{logId}/{signature}', [TrackingController::class, 'click'])->name('track.click');

// Controller:
public function click(string $logId, string $signature, Request $request): RedirectResponse
{
    if (hash_equals(hash_hmac('sha256', $logId, config('app.key')), $signature)) {
        CommunicationLog::where('id', $logId)
            ->whereNull('clicked_at')
            ->update(['clicked_at' => now()]);
    }

    return redirect()->to($request->query('to', '/'));
}
```

### 9.4 Provider Webhook Routes

```php
// routes/webhooks.php
Route::prefix('webhooks/communications')->name('webhooks.communications.')->group(function () {
    Route::post('/email/sns', [EmailWebhookController::class, 'sns'])->name('email.sns');
    Route::post('/whatsapp/status', [WhatsAppWebhookController::class, 'status'])->name('whatsapp.status');
    Route::post('/sms/status', [SmsWebhookController::class, 'status'])->name('sms.status');
});
```

All webhook endpoints are excluded from CSRF protection in `App\Http\Middleware\VerifyCsrfToken`.

---

## 10. CRM-6 Compatibility Contracts

### 10.1 What CRM-6 Needs From CRM-5

CRM-6 Workflow Automation will need to:

| Requirement | CRM-5 Must Provide |
|-------------|-------------------|
| Custom event→channel mapping | `NotificationCoordinator` must accept override rules |
| Conditional notification logic | `PreferenceResolver` must accept rule-based overrides |
| Scheduled/delayed notifications | `DispatchManager` must support `available_at` scheduling |
| Multi-step approval workflows | CO approval engine must support `required_approvals_count` |
| Branded portal themes | `crm_organizations` must store `portal_logo_url`, `portal_primary_color`, `portal_custom_domain` |
| Custom digest sections | `Digester` must accept pluggable section providers |
| Contact attribute routing | `ChannelRouter` must accept `Contact` attributes for branching |

### 10.2 Schema Contracts for CRM-6

The following tables must exist in their current form for CRM-6 to extend:

| CRM-5 Table | CRM-6 Extension |
|-------------|-----------------|
| `crm_portal_accounts` | Add `metadata` json column for custom attributes |
| `crm_portal_notification_preferences` | Add `conditions` json column for rule-based overrides |
| `crm_portal_account_project` | Add `metadata` json column for custom role data |
| `crm_communication_logs` | Add `campaign_id` nullable FK for bulk campaigns |
| `crm_portal_notifications` | Add `action_url` + `action_label` for actionable in-app notifs |

### 10.3 CRM-6 Extension Points (No Schema Change)

```php
// Override point 1: Channel routing rules
// CRM-6 can register rule classes that implement:
interface RoutingRule
{
    public function shouldRoute(PortalAccount $account, string $eventType): ?string;
    // Returns channel name or null to fall through to default
}

// Override point 2: Template selection rules
interface TemplateRule
{
    public function resolve(string $templateName, PortalAccount $account): string;
    // Returns alternative template name
}

// Override point 3: Approval workflow rules
interface ApprovalRule
{
    public function requiresAdditionalApproval(CrmChangeOrder $changeOrder): bool;
    public function requiredApprovers(CrmChangeOrder $changeOrder): Collection;
}
```

---

## 11. CRM-7 Analytics Contracts

### 11.1 What CRM-7 Needs From CRM-5

| Metric | Data Source | CRM-5 Must Guarantee |
|--------|------------|---------------------|
| Portal Adoption Rate | `crm_portal_accounts.enabled_at` vs `crm_contacts` | Clean join |
| Login Frequency | `crm_portal_accounts.login_count`, `last_login_at` | Always updated |
| Notification Delivery Rate | `crm_communication_logs.status` | Status field accurate |
| Notification Open Rate | `crm_communication_logs.opened_at` | Pixel tracking present |
| Notification Click Rate | `crm_communication_logs.clicked_at` | Signed redirects present |
| Channel Effectiveness | `crm_communication_logs` aggregate by channel | Channel column always set |
| CO Approval Time | `change_order_created` → `customer_responded_at` | Timestamps always recorded |
| Content Engagement | Portal timeline event views | `crm_portal_account_project.last_viewed_at` |

### 11.2 Additional Tracking Column

```php
// Add to crm_portal_account_project for CRM-7 analytics
$table->timestamp('last_viewed_at')->nullable()->after('role');
```

### 11.3 Reporting View Placeholder

For CRM-7, consider a materialized view:

```sql
CREATE MATERIALIZED VIEW crm_portal_analytics_daily AS
SELECT
    DATE(cl.created_at) as date,
    cl.channel,
    cl.status,
    COUNT(*) as count,
    COUNT(cl.opened_at) as opens,
    COUNT(cl.clicked_at) as clicks
FROM crm_communication_logs cl
GROUP BY DATE(cl.created_at), cl.channel, cl.status;
```

Not created in CRM-5; schema reserved for CRM-7.

---

## 12. Implementation Roadmap

### Phase 1 — Portal Infrastructure (CRM-5.1)

**Migration + Models + Visibility Engine**

- Migration `400001`: Create `crm_portal_accounts`, `crm_portal_tokens`, `crm_portal_sessions`, `crm_portal_notification_preferences`, `crm_portal_notifications`, `crm_communication_logs`, `crm_portal_account_project`
- Migration `400002`: Add columns (`portal_enabled_at` to contacts, `is_visible_to_customer` to risks/issues, `customer_safe` to activity timeline, `customer_status`/`approved_by_portal_account_id`/`customer_responded_at` to change orders)
- Models: `CrmPortalAccount`, `CrmPortalToken`, `CrmNotificationPreference`, `CrmNotification`, `CrmCommunicationLog` (with fillable, casts, relationships)
- Factories + Seeder: `CrmPortalAccountFactory`, portal role permission seeder
- Service: `CustomerVisibilityService` (contract + implementation)
- Event: `IssueEscalated`, `ProjectAtRisk`, `HealthDegraded` (new domain events)
- Tests: Visibility engine, model relationships, token generation/consumption (15 tests)

### Phase 2 — Authentication + Visibility (CRM-5.2)

**Auth Flow + Portal Middleware + Dashboard**

- Controller: `PortalAuthController` (login form, token consumption, logout)
- Middleware: `PortalAuthenticate`
- Routes: `portal.php` with auth group
- Page: `portal/auth/login.tsx` (token entry / magic link landing)
- Page: `portal/dashboard.tsx` (project cards, recent activity, pending approvals)
- Tests: Auth flow, token validation, session management, access revocation (12 tests)

### Phase 3 — Customer Workspace (CRM-5.3)

**Project Page + Timeline + Change Order Approval**

- Controller: `PortalProjectController@show`
- Controller: `PortalTimelineController@index`
- Controller: `PortalChangeOrderController` (approve + reject)
- Page: `portal/projects/show.tsx` (simplified 3-column workspace)
- Component: `portal-health-gauge.tsx` (simplified tier-based health display)
- Component: `portal-milestone-list.tsx` (read-only progress view)
- Component: `portal-change-order-card.tsx` (approve/reject buttons)
- Tests: Project visibility, timeline filtering, CO approval lifecycle (18 tests)

### Phase 4 — Communications Engine (CRM-5.4)

**Listeners + Channels + Templates**

- Services: `NotificationCoordinator`, `PreferenceResolver`, `ChannelRouter`, `TemplateEngine`, `DispatchManager`, `DeliveryRecorder`
- Channels: `EmailChannel`, `WhatsAppChannel`, `SmsChannel`, `PortalChannel`
- Providers: `SesEmailProvider`, `TwilioWhatsAppProvider`, `TwilioSmsProvider`
- Listeners: 10 listeners for all mapped domain events
- Jobs: `DispatchNotification`, `GenerateDigest`, `RetryCommunication`
- Commands: `crm:generate-digests`, `crm:retry-communications`
- Templates: 13 Blade email templates + WhatsApp template definitions
- Webhooks: `EmailWebhookController`, `WhatsAppWebhookController`, `SmsWebhookController`
- Tests: Coordinator routing, channel dispatch, digest generation, retry logic (25 tests)

### Phase 5 — Portal UX (CRM-5.5)

**Preferences + Profile + Polish**

- Controller: `PortalPreferencesController` (index + update)
- Controller: `PortalProfileController@show`
- Page: `portal/preferences.tsx` (channel/frequency table)
- Page: `portal/profile.tsx`
- Mobile responsive: bottom tab navigation, touch-friendly buttons
- PWA: manifest.json, service worker, install prompt
- Tests: Preference CRUD, profile view, PWA manifest (8 tests)

### Total Estimate

| Phase | New Files | Tests | Effort |
|-------|-----------|-------|--------|
| Phase 1 | 8 | 15 | High |
| Phase 2 | 6 | 12 | Medium |
| Phase 3 | 6 | 18 | High |
| Phase 4 | 35 | 25 | Very High |
| Phase 5 | 5 | 8 | Low |
| **Total** | **~60** | **78** | |

---

## Appendix A: Migration Naming Convention

Follow CRM-4 pattern: `YYYY_MM_DD_{sequence}_add_crm5_{table_name}`

| Sequence | Migration |
|----------|-----------|
| `400001` | `add_crm5_portal_tables` — all new tables |
| `400002` | `add_crm5_columns` — all column additions |

## Appendix B: Key Decisions Record

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth method | Passwordless magic link + session token | No password management; no reset flow; 30-day session acceptable for customer portal |
| Portal account model | Separate `crm_portal_accounts` table (not column on contacts) | Clean separation of internal contact vs portal identity; disable portal without losing contact data |
| Visibility model | Application-layer filtering (not DB views) | Current CRM-4 data volume makes DB views unnecessary; keeps the simple approach consistent |
| Notification channel interface | PHP interface per channel | Swap providers (SES→SendGrid, Twilio→Meta) without changing coordinator; testable with mocks |
| Digest generation | Scheduled Artisan commands | Simple, auditable, debuggable; no need for a crate job scheduler yet |
| Timeline reuse | Single table, `customer_safe` flag | Eliminates entire second timeline codebase; already proven in CRM-2/CRM-4 |
| CO approval flow | Same controller, portal overlay | No duplication of business logic; portal just validates + delegates |
| Event-to-notification | Coordinated via Listener | Keeps domain events pure; listeners are the only communication-aware layer |
| No separate comms table | Timeline IS the communication record | Eliminates dual-write risk; one source of truth for events |
| OTP | Phase 2 (CRM-5.1) | Not needed for MVP; most TUTIA projects don't require it |

## Appendix C: Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Customer sees internal data | High | Low | `VisibilityEngine` is the single gateway; all queries must pass through it |
| Magic link intercepted | High | Low | 48h expiry, single-use, HTTPS-only, signed with HMAC |
| Portal account disabled mid-session | Medium | Low | Middleware checks `disabled_at` on every request |
| Email delivery failure | Medium | Medium | Queue retry (3x) + dead letter + hourly reprocess |
| WhatsApp template rejection | Medium | Medium | Template pre-approval process; fallback to email |
| Digest generation too heavy | Low | Low | Queued per-contact; batch size 500 |
| CRM-6 schema incompatibility | Medium | Low | JSON `metadata` columns reserved on all new tables |
