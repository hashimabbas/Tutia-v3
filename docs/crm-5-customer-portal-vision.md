# CRM-5 Customer Portal Vision

> **Status:** Draft  
> **Phase:** CRM-5 Planning  
> **Dependencies:** CRM-4 Delivery OS (all phases complete), CRM-3 Sales OS, CRM-2 Contact OS  
> **Principle:** CRM-5 does not create business state. It consumes domain events and produces communication events. Timeline remains the system of record.

---

## 1. Product Philosophy

### 1.1 What CRM-5 Is

CRM-5 is a **customer-facing communication and transparency layer**. It provides:

- A **Customer Portal** where contacts can view project status, milestones, deliverables, risks, issues, and change orders
- A **Communications Engine** that delivers notifications across Email, WhatsApp, SMS, and Portal channels
- A **Preference Center** where contacts control how and when they receive updates

### 1.2 What CRM-5 Is Not

CRM-5 **does not**:

- Create or modify business entities (deals, projects, milestones, etc.)
- Replace CRM-4 as the delivery operating system
- Store communication history as its own state — it records all events to the Universal Timeline
- Introduce a second timeline system

### 1.3 Responsibility Boundary

```
CRM-2 = Relationship source of truth
CRM-3 = Sales source of truth
CRM-4 = Delivery source of truth
CRM-5 = Communication & visibility layer only
```

### 1.4 Architectural Principle

```
Domain Event (e.g. MilestoneCompleted)
    ↓
Notification Listener (CRM-5)
    ↓
Channel Dispatch (Email / WhatsApp / SMS / Portal)
    ↓
Timeline Event Recorded (Universal Timeline)
```

---

## 2. Portal Navigation Model

### 2.1 Top-Level Navigation

| Section | Description |
|---------|-------------|
| **Dashboard** | Aggregate view across all accessible projects |
| **Projects** | List of visible projects with status and health |
| **Documents** | Customer-visible documents (future) |
| **Profile** | Contact profile, notification preferences, security |
| **Support** | Contact form, FAQs (future) |

### 2.2 Authentication Model

- **Portal Access:** Token-based authentication via email magic link (no passwords required)
- **Session Lifetime:** 30 days with remember-me; 24 hours without
- **Multi-Account:** A single email address can have visibility into multiple organizations' projects
- **No Registration Flow:** Portal access is granted by an internal user adding a contact with `portal_access = true` at the organization or project level
- **Identity Provider:** Existing `User`/`Contact` model — portal users are `Contact` records with `portal_enabled_at` timestamp

### 2.3 Access Grant Flow

1. Manager enables portal access on a Contact (`PATCH /crm/contacts/{contact}` with `portal_enabled = true`)
2. System generates a unique portal token (hashed, stored in `contact_portal_tokens` table)
3. System sends welcome email/WhatsApp with portal link containing signed access token
4. Contact clicks link → authenticated via signed token → redirected to Dashboard
5. Token can be revoked at any time by the internal user

---

## 3. Customer Workspace

### 3.1 Customer Dashboard

When a contact logs in, they land on the **Customer Dashboard**:

```
┌─────────────────────────────────────────────────────┐
│  Welcome back, Ahmed                                │
│                                                     │
│  Your Organizations & Projects:                     │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ TUTIA ERP│  │ VPN Proj │  │ SMS Plat │          │
│  │  Health  │  │  Health  │  │  Health  │          │
│  │    82    │  │    94    │  │    67    │          │
│  │  Active  │  │  Active  │  │ At Risk  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
│  Recent Activity:  (last 10 events across projects) │
│  ┌─────────────────────────────────────────────┐   │
│  │ • ERP: Milestone "Training" completed    2h  │   │
│  │ • VPN: Change order approved             5h  │   │
│  │ • SMS: Issue "API latency" resolved       1d │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Pending Actions:                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Approve] Change Order #12 — +$5,000        │   │
│  │                    ⏳ Waiting 3 days         │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Multi-Organization Support

- A single contact can be associated with multiple organizations (via `crm_contact_organization` pivot or project stakeholders)
- The dashboard shows projects across all accessible organizations
- Projects are grouped by organization with collapse/expand

---

## 4. Project Workspace (Customer View)

### 4.1 Layout

The Customer Project Workspace follows the same 3-column grammar as the internal CRM-4 workspace, **filtered for customer-safety**:

```
┌──────────┬──────────────────────────────┬──────────────┐
│ LEFT     │ CENTER                       │ RIGHT        │
│           │                              │              │
│ Health   │ Project Header               │ Timeline     │
│ Status   │  (customer-safe only)         │  (customer-  │
│ Milestones│                             │  safe events  │
│ Risks     │ Milestone Progress           │  only)       │
│ (visible) │ Deliverable Status           │              │
│ Issues   │ Change Orders                 │              │
│ (visible) │ (pending approval)           │              │
└──────────┴──────────────────────────────┴──────────────┘
```

### 4.2 Customer-Safe Visibility Rules

All entities have an `is_visible_to_customer` flag (already on `crm_deliverables`). The portal filters every query through a **VisibilityScope**:

| Entity | Customer Visible? | Filter Logic |
|--------|-------------------|--------------|
| Project name & status | ✅ Always | Direct column |
| Milestone name & status | ✅ Always | Milestone-level flag |
| Deliverable name & status | ✅ When `is_visible_to_customer=true` | Deliverable-level flag |
| Risks | ✅ When `visibility=customer` on risk | Risk-level flag |
| Issues | ✅ When `visibility=customer` on issue | Issue-level flag |
| Change Orders | ✅ Always (read-only except approval) | Always visible |
| Health Score | ✅ Always | Computed; shown as simplified tier |
| Internal Notes | ❌ Never | Filtered by source |
| Stakeholder names | ❌ Never | Internal data |
| Financial amounts | ✅ Contract value + approved CO value | Aggregated only |
| Timeline Events | ✅ `customer_safe=true` events only | Filtered by tag |

### 4.3 Visibility Matrix

| Data | Internal (CRM-4) | Customer Portal (CRM-5) |
|------|------------------|------------------------|
| Project Name | Full | Full |
| Project Status | planned/active/at_risk/archived | "On Track" / "At Risk" / "Completed" |
| Milestones | Full CRUD | Read-only list with % |
| Deliverables | Full CRUD | Read-only list (if flagged) |
| Risks | Full CRUD | Read-only (if flagged) |
| Issues | Full CRUD | Read-only (if flagged) |
| Change Orders | Full CRUD | Read + Approve/Reject |
| Health Score | 0-100 + factors | Tier + simplified gauge |
| Financials | Full breakdown | Total value only |
| Team Members | Full list | Names only (no roles) |
| Timeline | All events | Customer-safe events |
| Documents | All | Customer-designated only |

---

## 5. Milestones & Deliverables Visibility

### 5.1 Customer View

The customer sees milestones as a **read-only progress list**:

```
Training Phase ─────────────────●──────────────── 60%
    • Training materials prepared          ✅
    • Trainer onboarding completed         ✅
    • Pilot training session               ⏳ Due 15 Jul
    • Production rollout                   ⏳ Due 30 Jul

Deployment Phase ──────────────────────────────── 0%
    • System migration                      ⏳ Due 15 Aug
```

### 5.2 Visibility Control

- Each milestone inherits project visibility by default
- Each deliverable can override via `is_visible_to_customer` boolean
- Internal deliverables (e.g., "Internal QA review") are hidden from customers
- Status values are simplified in the portal: `completed` → ✅, `in_progress` → ⏳, `pending` → ○

---

## 6. Change Order Approval Experience

### 6.1 Customer View

This is the highest business-value feature in CRM-5.

Customers see pending change orders with a clear approval card:

```
┌────────────────────────────────────────────────────────┐
│  🔄 Pending Change Order #12                          │
│                                                        │
│  Additional Server Capacity                            │
│  The project requires an additional server to handle   │
│  the increased load from the Q4 campaign.              │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  Cost Impact  │  │  Timeline    │                   │
│  │  +$5,000      │  │  +10 days    │                   │
│  └──────────────┘  └──────────────┘                   │
│                                                        │
│  Original Contract: $100,000                           │
│  New Total:        $105,000                            │
│                                                        │
│  [Approve]  [Reject]  [Ask Question]                   │
└────────────────────────────────────────────────────────┘
```

### 6.2 Approval Logic

- Approval action → `POST /portal/change-orders/{id}/approve`
- Records approval via the same `CrmChangeOrderController@approve` endpoint
- Creates timeline event `change_order_approved` with `customer_safe = true`
- Sends confirmation notification to the contact and internal team
- Rejection requires a reason; sends notification to internal team

### 6.3 Security

- Contacts can only approve/reject change orders on projects they have portal access to
- Each approval records the portal contact ID as the approver
- Change order total updates the project's `change_order_total` same as internal flow

---

## 7. Customer Timeline

### 7.1 Principle

Do not build a second timeline. The **Universal Timeline** (`CrmActivity` + `TimelineProvider` architecture) already supports all event types. The portal reuses it with:

- `entity_type = 'project'` filtered to `customer_safe = true` events
- Same `ActivityTimeline` component, different API endpoint

### 7.2 Customer-Safe Events

| Event Type | Customer Safe | Display |
|------------|--------------|---------|
| `project_created` | ✅ | "Project started" |
| `milestone_completed` | ✅ | "Milestone X completed" |
| `deliverable_completed` | ✅ | "Deliverable X completed" |
| `deliverable_approved` | ✅ | "Deliverable X approved" |
| `risk_created` | ❌ (if internal) | Depends on risk visibility flag |
| `risk_closed` | ❌ (if internal) | Depends on risk visibility flag |
| `issue_resolved` | ✅ (if visible) | "Issue X resolved" |
| `change_order_created` | ✅ | "Change order X submitted" |
| `change_order_approved` | ✅ | "Change order X approved" |
| `activity` (note) | ❌ Never | Internal notes excluded |

### 7.3 Timeline Endpoint

```
GET /portal/api/timeline?entity_type=project&entity_id=123&customer_safe=true
```

Returns the same `TimelineCollection` format, filtered to safe events only.

---

## 8. Customer Health & Status Visibility

### 8.1 Simplified Health Display

Internal CRM-4 shows: `82 — Healthy` with 6 factors, scores, and weights.

Portal shows:

```
Project Health
┌──────────────────────────────────────┐
│                                      │
│           ●●●●●○○○○○                  │
│          On Track                    │
│                                      │
│  82% of milestones on schedule       │
│                                      │
└──────────────────────────────────────┘
```

- **On Track** (tier: `healthy`) — green
- **At Risk** (tier: `at_risk`) — yellow
- **Behind** (tier: `critical`) — red

No factor breakdown in portal — customers don't need to see scoring internals.

### 8.2 Status Translation

| Internal | Portal Display |
|----------|---------------|
| `planned` | Not Started |
| `initiating` | Getting Started |
| `active` | In Progress |
| `at_risk` | At Risk |
| `completed` | Completed |
| `archived` | Archived |

---

## 9. Documents Center

### 9.1 Scope

A future-facing placeholder. CRM-5 should define the schema for customer-visible documents:

- Documents are uploaded against a project or milestone
- Documents have an `is_visible_to_customer` flag
- Documents have a `type` (report, invoice, deliverable, contract, etc.)
- Portal provides a read-only download view

### 9.2 Schema Sketch

```php
// Future: crm_portal_documents
Schema::create('crm_portal_documents', function (Blueprint $table) {
    $table->id();
    $table->morphs('documentable'); // project, milestone, deliverable
    $table->string('name');
    $table->string('file_path');
    $table->string('type', 30); // report, invoice, deliverable, contract
    $table->boolean('is_visible_to_customer')->default(false);
    $table->foreignId('uploaded_by')->nullable()->constrained('users');
    $table->timestamps();
});
```

This is **not required for CRM-5 MVP**. Track for CRM-6.

---

## 10. Mobile Experience

### 10.1 Approach

CRM-5 portal is **responsive web**, not a native app:

- Built on the same Inertia + React stack
- Mobile-first layout for the portal (different from internal CRM's desktop-first)
- Simplified navigation via bottom tab bar on mobile
- Touch-friendly approval buttons
- PWA-ready for install-to-homescreen capability

### 10.2 Mobile Navigation

```
┌──────────────────────┐
│  Dashboard           │
│  Projects            │
│  Notifications (3)   │
│  Profile             │
└──────────────────────┘
```

Bottom tab bar, always visible.

---

## 11. CRM-6 Compatibility

### 11.1 Automation-Ready

CRM-5 portal must be designed so CRM-6 Workflow Automation can:

- Trigger portal notifications based on rules
- Schedule digest emails
- Route change order approvals through multi-step workflows
- Conditionally show/hide portal sections based on contact attributes

### 11.2 Portal Templates

Future CRM-6 will support branded portal views per organization:

- Custom logo
- Custom color scheme
- Custom domain (portal.clientname.com)

The portal architecture should use organization-level theming from the start.

---

## 12. Architecture Boundaries

### 12.1 Code Organization

```
app/
├── Http/
│   └── Controllers/
│       └── Portal/              # NEW — portal-specific controllers
│           ├── AuthController
│           ├── DashboardController
│           ├── ProjectController
│           ├── ChangeOrderController
│           └── TimelineController
├── Services/
│   └── Crm/
│       ├── Portal/              # NEW — portal business logic
│       │   ├── PortalAuthService
│       │   ├── PortalVisibilityService
│       │   └── PortalTokenService
│       └── Communications/      # NEW — communications engine (separate doc)
└── Models/
    ├── CrmContactPortalToken    # NEW model
    └── CrmPortalDocument        # Future

resources/js/
└── pages/
    └── portal/                  # NEW — portal-specific pages
        ├── dashboard.tsx
        ├── projects/
        │   ├── show.tsx
        │   └── change-orders/
        └── auth/
            └── login.tsx

routes/
├── portal.php                   # NEW — portal routes (no auth middleware, uses token)
└── web.php                      # Existing
```

### 12.2 Route Design

```php
// routes/portal.php
Route::prefix('portal')->name('portal.')->group(function () {
    // Auth (token-based)
    Route::get('/auth/login', [PortalAuthController::class, 'login'])->name('auth.login');
    Route::post('/auth/token', [PortalAuthController::class, 'authenticate'])->name('auth.authenticate');
    Route::post('/auth/logout', [PortalAuthController::class, 'logout'])->name('auth.logout');

    // Protected routes
    Route::middleware('portal.auth')->group(function () {
        Route::get('/dashboard', [PortalDashboardController::class, 'index'])->name('dashboard');
        Route::get('/projects/{project}', [PortalProjectController::class, 'show'])->name('projects.show');

        // Change Order Approval
        Route::post('/projects/{project}/change-orders/{changeOrder}/approve', [PortalChangeOrderController::class, 'approve'])->name('change-orders.approve');
        Route::post('/projects/{project}/change-orders/{changeOrder}/reject', [PortalChangeOrderController::class, 'reject'])->name('change-orders.reject');

        // Timeline (API JSON)
        Route::get('/api/timeline', [PortalTimelineController::class, 'index'])->name('api.timeline');

        // Notification preferences
        Route::get('/preferences', [PortalPreferencesController::class, 'index'])->name('preferences');
        Route::patch('/preferences', [PortalPreferencesController::class, 'update'])->name('preferences.update');

        // Profile
        Route::get('/profile', [PortalProfileController::class, 'show'])->name('profile');
    });
});
```

### 12.3 Portal Auth Middleware

```php
// App\Http\Middleware\PortalAuth
class PortalAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken() ?? $request->cookie('portal_token');

        if (! $token || ! $contact = PortalAuthService::validateToken($token)) {
            return redirect()->route('portal.auth.login');
        }

        $request->merge(['portal_contact' => $contact]);
        app()->instance('portal-contact', $contact);

        return $next($request);
    }
}
```

### 12.4 Visibility Service

```php
class PortalVisibilityService
{
    public function filterProject(CrmProject $project, CrmContact $contact): array
    {
        return [
            'id' => $project->id,
            'name' => $project->name,
            'status' => $this->translateStatus($project->status),
            'health' => $this->simplifyHealth($project),
            'milestones' => $project->milestones->map(fn ($m) => [
                'name' => $m->name,
                'status' => $m->status,
                'progress' => $this->calculateMilestoneProgress($m),
            ]),
            'risks' => $project->risks->where('is_visible_to_customer', true)->values(),
            'issues' => $project->issues->where('is_visible_to_customer', true)->values(),
            'total_value' => $project->contract_value + $project->change_order_total,
        ];
    }
}
```

---

## 13. Data Model Additions

### 13.1 New Tables

```php
// Migration for CRM-5
Schema::create('crm_contact_portal_tokens', function (Blueprint $table) {
    $table->id();
    $table->foreignId('contact_id')->constrained('crm_contacts')->cascadeOnDelete();
    $table->string('token', 64)->unique();
    $table->timestamp('expires_at')->nullable();
    $table->timestamp('last_used_at')->nullable();
    $table->timestamps();

    $table->index('token', 'crm_cpt_token_idx');
});

Schema::create('crm_contact_notification_preferences', function (Blueprint $table) {
    $table->id();
    $table->foreignId('contact_id')->constrained('crm_contacts')->cascadeOnDelete();
    $table->string('channel', 20); // email, whatsapp, sms, portal
    $table->string('frequency', 20)->default('immediate'); // immediate, daily, weekly, muted
    $table->json('event_types')->nullable(); // null = all
    $table->timestamps();

    $table->unique(['contact_id', 'channel'], 'crm_cnp_contact_channel_uq');
});
```

### 13.2 Model Changes

```php
// Add to CrmContact
Schema::table('crm_contacts', function (Blueprint $table) {
    $table->timestamp('portal_enabled_at')->nullable()->after('created_by');
});

// Add to CrmProjectRisk
Schema::table('crm_project_risks', function (Blueprint $table) {
    $table->boolean('is_visible_to_customer')->default(false)->after('mitigation_plan');
});

// Add to CrmIssue
Schema::table('crm_issues', function (Blueprint $table) {
    $table->boolean('is_visible_to_customer')->default(false)->after('resolution');
});
```

### 13.3 Timeline Tagging

Events recorded as customer-safe should include a `customer_safe = true` tag in metadata. This allows the TimelineProvider to filter both in API responses and the Timeline component.

---

## 14. Visibility Matrix (Complete)

| Entity | Internal Read | Internal Write | Customer Read | Customer Write |
|--------|:------------:|:--------------:|:-------------:|:--------------:|
| Project | ✅ | ✅ | ✅ | ❌ |
| Milestone | ✅ | ✅ | ✅ (simplified) | ❌ |
| Deliverable | ✅ | ✅ | ✅ (if flagged) | ❌ |
| Risk | ✅ | ✅ | ✅ (if flagged) | ❌ |
| Issue | ✅ | ✅ | ✅ (if flagged) | ❌ |
| Change Order | ✅ | ✅ | ✅ | ✅ (approve/reject) |
| Health Score | ✅ | ❌ (computed) | ✅ (simplified) | ❌ |
| Financials | ✅ | ✅ | ✅ (total only) | ❌ |
| Timeline | ✅ | ✅ | ✅ (safe events) | ❌ |
| Team/Stakeholders | ✅ | ✅ | ❌ | ❌ |
| Documents | ✅ | ✅ | ✅ (future) | ❌ |
| Notification Prefs | ✅ | ✅ | ✅ | ✅ |

---

## 15. CRM-6 Compatibility Notes

The portal architecture is designed so CRM-6 Workflow Automation can:

- **Trigger actions** based on portal events (e.g., "After customer approves CO, send Slack notification to project manager")
- **Schedule digests** via the existing `frequency` field on notification preferences
- **Route approvals** through multi-step workflows (e.g., "CO > $10,000 requires two approvals")
- **Brand portals** per organization via theme variables stored on `crm_organizations`
- **Extend visibility rules** with custom conditions (e.g., "Show risk only if severity < critical")

---

## 16. Open Questions

1. Should portal access be granted per-contact or per-organization? (Recommend: per-contact, inherited from organization roles)
2. Should we support OAuth/SSO for enterprise customers? (Track for CRM-6)
3. Should the portal have its own notification preferences table, or reuse the communications architecture? (Use the communications architecture — see companion document)
4. Should change order approval require a digital signature for audit? (Track for CRM-6)
5. Should we expose an API for third-party portal integration? (Track for CRM-7)
