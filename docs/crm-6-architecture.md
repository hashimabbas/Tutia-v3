# CRM-6 Workflow Automation Engine — Architecture Document

## 1. Workflow Philosophy

### What CRM-6 Is

CRM-6 is an **Orchestration Layer** — not a new notification system, not a new event system, not a low-code platform. It sits above CRM-3 (Sales OS), CRM-4 (Delivery OS), and CRM-5 (Customer Experience OS) and provides:

- **Trigger → Condition → Action** rules that react to domain events
- **Approval workflows** for high-value decisions (change orders, deals, escalations)
- **Automation** of repetitive operational patterns

### What CRM-6 Is Not

| Not This | Why |
|----------|-----|
| BPMN engine | Over-engineered for current needs. CRM-6 uses simple trigger→condition→action rules. |
| Visual drag-drop canvas | Form builder is faster to build, more stable, and sufficient for v1 workflows. |
| Low-code designer | Premature. Let CRM-6 prove value first; CRM-7/CRM-8 can add designer. |
| New notification system | CRM-5 Communications Engine handles all notification routing. CRM-6 reuses it. |
| Script execution | No PHP/JS sandbox. All actions are predefined composable units. |
| External integration hub | Use-case specific webhooks only. Full integration platform deferred to CRM-7. |
| Infinite nested conditions | Max 2-level nesting in v1. Flat condition groups with AND/OR. |

### CRM-6 Relationship to Existing Systems

```
CRM-3 (Sales OS)          CRM-4 (Delivery OS)         CRM-5 (Customer OS)
  ────── Domain Events ──────→  ────── Domain Events ──────→  ────── Domain Events ──────→
                                                                      │
                                                                      ▼
                                                            HandleDomainNotification
                                                                      │
                                                                      ▼
                                                            NotificationCoordinator
                                                                      │
                                                         ┌────────────┴────────────┐
                                                         ▼                        ▼
                                                    CRM-5 Channels         CRM-6 Workflow
                                                    (email/whatsapp/       Engine (new)
                                                     sms/portal)               │
                                                                         ┌──────┴──────┐
                                                                         ▼             ▼
                                                                    CRM Actions    Approval
                                                                                   Engine
```

### Key Design Principles

> CRM-6 does not listen to domain events directly. It has its own dedicated listener — `HandleWorkflowAutomation` — separate from CRM-5's `HandleDomainNotification`.

**Why a separate listener, not merging into HandleDomainNotification:**

| Approach | Problem |
|----------|---------|
| Merging into `HandleDomainNotification` | Creates coupling between CRM-5 Communications and CRM-6 Automation from day one. Two different systems (communication orchestration vs business automation) become interdependent. |
| Dedicated `HandleWorkflowAutomation` | Clean separation. CRM-5 notifications continue independently. CRM-6 workflows can be disabled, monitored, or logged separately. No architectural coupling. |

Both listeners register for the same 11 domain events but dispatch to independent pipelines:

```
Domain Event
    │
    ├── HandleDomainNotification (CRM-5)
    │   └── NotificationCoordinator → CRM-5 notification channels
    │
    └── HandleWorkflowAutomation (CRM-6 — new, separate)
        └── WorkflowEngine → CRM-6 action execution
```

This ensures:
- One event routing pipeline (same events, different consumers)
- Consistent correlation IDs across notifications and workflows
- CRM-6 can be disabled independently without affecting CRM-5 notifications
- CRM-4/CRM-5 events don't need modification when CRM-6 adds workflows
- Each system logs independently — easier debugging, monitoring, and analytics

---

## 2. Trigger Model

### Trigger Definition

A trigger defines **which domain event activates a workflow**. CRM-6 uses the same event class→event key mapping established by `NotificationEventCatalog` in CRM-5.

```php
crm_workflow_triggers {
    id:              UUID
    workflow_id:     UUID → crm_workflows.id
    event_key:       VARCHAR(100)  // References NotificationEventCatalog constants
    // Example: 'issue.escalated', 'risk.closed', 'change_order.approved'
}
```

### Available Event Keys (CRM-5 NotificationEventCatalog)

| Event Key | CRM Origin | Trigger Use Case Example |
|-----------|------------|-------------------------|
| `deal.converted` | CRM-4 | Create onboarding tasks |
| `project.created` | CRM-4 | Assign project manager, send welcome notification |
| `milestone.completed` | CRM-4 | Check milestone count, escalate if behind schedule |
| `deliverable.completed` | CRM-4 | Send approval request if deliverable requires sign-off |
| `risk.closed` | CRM-4 | Notify stakeholders, close related issues |
| `issue.resolved` | CRM-4 | Clear escalation, notify reporter |
| `issue.escalated` | CRM-5 | Route to senior engineer, create timeline entry, notify manager |
| `project.at_risk` | CRM-5 | Create recovery plan task, notify account manager |
| `health.degraded` | CRM-5 | Schedule health review meeting |
| `change_order.approved` | CRM-4 | Update budget, notify finance, create implementation tasks |
| `change_order.rejected` | CRM-5 | Notify sales, create revision task |

### Trigger Matching

Single workflow → single trigger. If the same event should trigger different actions under different conditions, that is handled by **conditions** (not multiple triggers on one workflow).

```
Workflow: "Escalated Blocker Protocol"
  Trigger: issue.escalated
  Conditions: severity = blocker
  Actions: Send WhatsApp + Create Task + Escalate Issue
```

---

## 3. Condition Model

### Condition Definition

Conditions filter whether a workflow executes based on event payload data. CRM-6 v1 supports flat condition groups with AND logic (all conditions must match). OR groups can be added in v2 if needed.

```php
crm_workflow_conditions {
    id:              UUID
    workflow_id:     UUID → crm_workflows.id
    field:           VARCHAR(100)   // Dot-notation path into event payload
    operator:        VARCHAR(20)    // eq, neq, gt, gte, lt, lte, in, not_in, contains, is_empty, not_empty
    value:           TEXT           // JSON-encoded value(s)
    group_order:     INT            // 0 = AND group (all groups must match)
}
```

### Supported Operators

| Operator | Type | Example |
|----------|------|---------|
| `eq` | Exact match | `severity = blocker` |
| `neq` | Not equal | `status != closed` |
| `gt` | Greater than | `change_amount > 10000` |
| `gte` | Greater than or equal | `health_score >= 50` |
| `lt` | Less than | `risk_probability < 0.3` |
| `lte` | Less than or equal | `open_issues <= 5` |
| `in` | In array | `role in [manager, director]` |
| `not_in` | Not in array | `priority not_in [low, trivial]` |
| `contains` | String contains | `description contains "urgent"` |
| `is_empty` | Null or empty | `assigned_to is_empty` |
| `not_empty` | Has value | `resolution is not empty` |

### Condition Evaluation

Conditions evaluate against the event payload built by `NotificationCoordinator::buildPayload()`. Payload structure is consistent per event type and includes all fields needed for condition matching.

Payload example for `issue.escalated`:
```json
{
    "issue_title": "Database connection timeout",
    "issue_description": "Production DB connections timing out after 30s",
    "severity": "blocker",
    "status": "escalated",
    "project_name": "Acme CRM Migration",
    "project_id": "uuid-...",
    "escalated_by_name": "Ahmed Hassan",
    "previous_severity": "major"
}
```

Condition `field = "severity"`, `operator = "eq"`, `value = "blocker"` evaluates to true.

---

## 4. Action Model

### Action Definition

Actions are the output of a workflow — what actually happens when trigger matches and conditions pass.

```php
crm_workflow_actions {
    id:                 UUID
    workflow_id:        UUID → crm_workflows.id
    action_type:        VARCHAR(50)     // See action catalog below
    configuration_json: JSON           // Type-specific config
    sort_order:         INT            // Execution order
}
```

### Action Library (CRM-6 v1)

#### Communication Actions (reuse CRM-5)

| Action Type | Reuses | Configuration |
|-------------|--------|---------------|
| `send_email` | `NotificationCoordinator` | `{template_key, recipients} ` |
| `send_whatsapp` | `NotificationCoordinator` | `{template_key, recipients} ` |
| `send_sms` | `NotificationCoordinator` | `{template_key, recipients} ` |
| `send_portal_notification` | `NotificationCoordinator` | `{template_key, recipients} ` |

> These do **not** create a new notification pipeline. They call `NotificationCoordinator::handle()` with the workflow's context as the event. The coordinator handles routing, template rendering, channel dispatch, and delivery tracking as normal.

#### CRM Actions

| Action Type | System | Configuration |
|-------------|--------|---------------|
| `create_activity` | CRM-4 `crm_activities` | `{type, description, customer_safe}` |
| `create_task` | CRM-4 tasks | `{title, description, assigned_to, due_in_hours}` |
| `assign_user` | CRM-4 entities | `{entity_type, entity_id, user_id}` — reassigns owner |
| `update_field` | CRM-4 entities | `{entity_type, entity_id, field, value}` — sets field directly |
| `add_tag` | CRM-4 tagging | `{entity_type, entity_id, tag}` |

#### Project Actions

| Action Type | System | Configuration |
|-------------|--------|---------------|
| `escalate_risk` | CRM-4 `CrmProjectRisk` | `{risk_id, new_severity}` — bumps severity |
| `escalate_issue` | CRM-4 `CrmIssue` | `{issue_id, new_severity}` — bumps severity, triggers event |
| `request_change_approval` | CRM-4 change orders | `{change_order_id, required_approvers}` — starts approval flow |

### Action Execution

Actions execute in `sort_order` sequence. If an action fails, by default the workflow continues (configurable: `stop_on_fail` per action).

Each action execution is recorded in `crm_workflow_action_runs`:

```php
crm_workflow_action_runs {
    id:              UUID
    workflow_run_id: UUID → crm_workflow_runs.id
    action_type:     VARCHAR(50)
    status:          ENUM(pending, running, completed, failed, skipped)
    configuration_json: JSON
    response_json:   JSON     // Stores result (e.g., notification correlation_id, activity id)
    started_at:      TIMESTAMP
    completed_at:    TIMESTAMP
    error_message:   TEXT     // Null if successful
}
```

---

## 5. Execution Engine

### WorkflowEngine (Core)

The `WorkflowEngine` is the heart of CRM-6. It evaluates triggers, checks conditions, and executes actions.

```
Event arrives at WorkflowEngine
    │
    ▼
1. LOAD all active workflows with matching trigger event_key
    │
    ▼
2. FOR each matching workflow:
    │
    ▼
3.   BUILD WorkflowContext from event + payload
    │
    ▼
4.   EVALUATE conditions (WorkflowEvaluator)
    │   ├─ ALL true → continue
    │   └─ ANY false → SKIP (record skipped run)
    │
    ▼
5.   CREATE crm_workflow_runs record (status: running)
    │
    ▼
6.   EXECUTE actions in sort_order (WorkflowExecutor)
    │   ├─ For each action:
    │   │   ├─ Create crm_workflow_action_runs (status: running)
    │   │   ├─ Execute action handler
    │   │   ├─ Update action_runs (status: completed/failed)
    │   │   └─ If failed && stop_on_fail → BREAK
    │   └─ After all actions:
    │
    ▼
7. UPDATE crm_workflow_runs (status: completed/failed, completed_at)
```

### Services

| Service | Responsibility |
|---------|---------------|
| `WorkflowEngine` | Orchestrates the full lifecycle — loads workflows, builds context, delegates to evaluator + executor |
| `WorkflowEvaluator` | Evaluates conditions against payload. Single method: `passes(Workflow, array payload): bool` |
| `WorkflowExecutor` | Iterates actions, delegates each to its handler, records results |
| `WorkflowContextBuilder` | Builds context from event + payload — provides consistent data to conditions and actions |
| `WorkflowLoader` | Queries active workflows by event key, caches results |

### Contracts

```php
interface WorkflowTriggerInterface {
    public function matches(DomainEvent $event, WorkflowTrigger $trigger): bool;
}

interface WorkflowConditionInterface {
    public function evaluate(WorkflowCondition $condition, array $payload): bool;
}

interface WorkflowActionInterface {
    public function execute(
        WorkflowAction $action,
        array $payload,
        WorkflowContext $context
    ): ActionResult;
}
```

### WorkflowContext

Context is built once per workflow run and shared across all actions:

```php
class WorkflowContext {
    public function __construct(
        public readonly string $correlationId,
        public readonly DomainEvent $event,
        public readonly array $payload,
        public readonly CrmProject $project,
        public readonly ?CrmUser $triggeredBy,       // user who caused the event
        public readonly array $resolvedRecipients,    // from PortalRecipientResolver
    ) {}
}
```

---

## 6. Approval Engine

### Why Approval Engine is Separate

Approvals are fundamentally different from trigger→condition→action workflows:

- **Stateful** — approval requests persist across multiple decisions
- **Multi-step** — sequential approval chain (manager → director → finance)
- **Branching** — approval vs rejection lead to different outcomes
- **Time-bound** — SLA for each approval step
- **Portal-facing** — customers approve/reject change orders through portal

### Tables

```php
crm_approval_flows {
    id:              UUID
    name:            VARCHAR(200)
    entity_type:     VARCHAR(50)    // change_order, deal, quotation
    trigger_amount:  DECIMAL(15,2)  // Optional: auto-activate above threshold
    is_active:       BOOLEAN
    created_by:      UUID → crm_users.id
}

crm_approval_steps {
    id:              UUID
    approval_flow_id: UUID → crm_approval_flows.id
    step_order:      INT
    role:            VARCHAR(50)    // sales_manager, finance_manager, director, customer
    approval_type:   ENUM(any, all) // any=one approver, all=unanimous
    sla_hours:       INT            // Max hours before escalation
    escalation_step_id: UUID → crm_approval_steps.id  // Null = no escalation
}

crm_approval_requests {
    id:              UUID
    approval_flow_id: UUID → crm_approval_flows.id
    entity_type:     VARCHAR(50)
    entity_id:       UUID
    requested_by:    UUID → crm_users.id
    status:          ENUM(pending, approved, rejected, escalated, expired)
    current_step_id: UUID → crm_approval_steps.id
    created_at:      TIMESTAMP
    completed_at:    TIMESTAMP
}

crm_approval_decisions {
    id:              UUID
    approval_request_id: UUID → crm_approval_requests.id
    approval_step_id:    UUID → crm_approval_steps.id
    decider_id:      UUID → polymorphic (crm_users.id OR crm_portal_accounts.id)
    decider_type:    ENUM(user, portal_account)
    decision:        ENUM(approved, rejected)
    notes:           TEXT
    decided_at:      TIMESTAMP
}
```

### Approval Flow Lifecycle

```
1. Entity created with amount > threshold
    │
    ▼
2. Workflow action "request_change_approval" called
    │
    ▼
3. ApprovalEngine starts flow
    │   ├─ Find matching crm_approval_flow (entity_type + amount)
    │   ├─ Create crm_approval_request (status: pending)
    │   └─ Set current_step to step 1
    │
    ▼
4. Flow progresses through crm_approval_steps
    │   ├─ Step 1: Sales Manager (any)
    │   │   └─ Portal notification sent to sales managers
    │   ├─ Step 2: Finance Manager (must)
    │   │   └─ Portal notification sent to finance team
    │   └─ Step 3: Director (any)
    │       └─ Portal notification to director
    │
    ▼
5. All steps completed
    │   ├─ All approved → request status: approved
    │   │   └─ Fires workflow completion action
    │   └─ Any rejected → request status: rejected
    │       └─ Notifies requester, rolls back if configured
```

### Portal Integration

The existing CRM-5 portal is the natural approval interface:

- Approval requests appear in the portal **Action Center** (already aggregates pending approvals)
- Approve/reject uses existing `PortalRoleResolver` permission checks
- Change order approval already works — CRM-6 extends this to configurable flows
- Portal notifications for approval requests go through CRM-5 `PortalChannel`

---

## 7. UI Architecture

### Philosophy

> Form Builder over Visual Canvas. CRM-6 v1 uses structured forms for workflow creation — no drag-drop, no node graph, no BPMN notation. This is faster to build, more accessible, and produces cleaner data.

### Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/automation/workflows` | `Automation/Workflows/Index` | List all workflows, toggle active/inactive |
| `/automation/workflows/create` | `Automation/Workflows/Create` | Step-by-step form to create workflow |
| `/automation/workflows/{workflow}` | `Automation/Workflows/Show` | View workflow details, runs history |
| `/automation/workflows/{workflow}/edit` | `Automation/Workflows/Edit` | Edit workflow configuration |
| `/automation/approvals` | `Automation/Approvals/Index` | List all approval flows |
| `/automation/approvals/create` | `Automation/Approvals/Create` | Create approval flow |
| `/automation/approvals/{approvalFlow}` | `Automation/Approvals/Show` | View approval flow with step chain |
| `/automation/workflows/{workflow}/runs` | `Automation/Workflows/Runs` | View run history for a workflow |
| `/automation/runs/{run}` | `Automation/Workflows/RunDetail` | Single run detail with action results |

### Create Workflow Form Structure

```
Step 1: Basic Info
  ┌─────────────────────────────────────────┐
  │ Workflow Name    [____________________] │
  │ Description      [____________________] │
  │ Entity Type      [▼ Select entity      ]│
  │ Active           [✓]                    │
  └─────────────────────────────────────────┘

Step 2: Trigger
  ┌─────────────────────────────────────────┐
  │ Event      [▼ Select domain event     ] │
  │   ┌─────────────────────────────────┐   │
  │   │ When Issue Escalated           │   │
  │   └─────────────────────────────────┘   │
  └─────────────────────────────────────────┘

Step 3: Conditions (optional)
  ┌─────────────────────────────────────────┐
  │ AND Condition Group                    │
  │ ┌─────────────────────────────────────┐│
  │ │ Field       [▼ Severity           ] ││
  │ │ Operator    [▼ equals             ] ││
  │ │ Value       [blocker              ] ││
  │ │ [Remove]                            ││
  │ └─────────────────────────────────────┘│
  │ [+ Add Condition]                      │
  │                                         │
  │ OR Condition Group                     │
  │ ┌─────────────────────────────────────┐│
  │ │ Field       [▼ Priority           ] ││
  │ │ Operator    [▼ equals             ] ││
  │ │ Value       [critical             ] ││
  │ │ [Remove]                            ││
  │ └─────────────────────────────────────┘│
  │ [+ Add Condition Group]                │
  └─────────────────────────────────────────┘

Step 4: Actions
  ┌─────────────────────────────────────────┐
  │ Sort │ Action Type    │ Configuration   │
  │ ──── │ ──────────── │ ─────────────── │
  │  1   │ Send WhatsApp │ Template:       │
  │      │               │ issue.escalated │
  │      │               │ [Edit] [Remove] │
  │ ──── │ ──────────── │ ─────────────── │
  │  2   │ Create Task   │ Title: "Review  │
  │      │               │ escalated issue"│
  │      │               │ Assign to:...   │
  │      │               │ [Edit] [Remove] │
  │ ──── │ ──────────── │ ─────────────── │
  │      │ [+ Add Action]                 │
  └─────────────────────────────────────────┘
```

### Component Architecture

```
resources/js/pages/automation/
  ├── Workflows/
  │   ├── Index.tsx
  │   ├── Create.tsx
  │   ├── Show.tsx
  │   ├── Edit.tsx
  │   ├── Runs.tsx
  │   └── RunDetail.tsx
  ├── Approvals/
  │   ├── Index.tsx
  │   ├── Create.tsx
  │   └── Show.tsx
  └── Components/
      ├── WorkflowForm.tsx           // Multi-step form wrapper
      ├── TriggerSelector.tsx         // Event key dropdown
      ├── ConditionBuilder.tsx        // Dynamic condition groups
      ├── ConditionRow.tsx            // Field + operator + value
      ├── ActionListEditor.tsx        // Sortable action list
      ├── ActionConfigurator.tsx      // Dynamic form per action type
      ├── WorkflowTimeline.tsx        // Run history display
      └── ApprovalFlowDiagram.tsx     // Simple vertical step chain
```

### Design Language

Same design system as CRM-5 portal (dark theme, `#0a0a0f` / `#1e1e2a` / `#e8e8ed`). The automation pages live under the internal CRM layout (not the portal layout) since they are configured by internal users, not customers.

---

## 8. CRM-5 Integration

### Integration Points

| CRM-5 Component | CRM-6 Usage | Integration Type |
|-----------------|-------------|------------------|
| `HandleDomainNotification` | Entry point — dispatches to both `NotificationCoordinator` and `WorkflowEngine` | Event listener extends dispatch |
| `NotificationCoordinator` | Reused by communication actions (send_email, send_whatsapp, etc.) | Method call |
| `NotificationMap` | CRM-6 reads event keys from `NotificationEventCatalog` for trigger selection | Shared constants |
| `NotificationEventCatalog` | Source of truth for event keys in trigger selection | Shared constants |
| `PortalRecipientResolver` | CRM-6 actions can query recipients for notifications | Method call |
| `TemplateRenderer` | Communication actions use existing templates | Method call |
| `DeliveryTracker` | Communication actions log through existing tracking | Method call |
| `CustomerVisibilityService` | Approval engine checks portal role permissions | Method call |
| `PortalRoleResolver` | Determines if portal user can approve in approval flow | Method call |
| `CrmPortalAccount` | Approval decisions from portal users reference this model | FK relationship |
| `crm_portal_notifications` | Approval step notifications sent through PortalChannel | Reuse |
| `crm_communication_logs` | All CRM-6 communication actions log here | Shared table |

### Integration Architecture

```
HandleDomainNotification (updated)
    │
    ├── NotificationCoordinator (CRM-5 — unchanged)
    │   └── Routes to CRM-5 notification channels
    │
    └── WorkflowEngine (CRM-6 — new)
        └── Evaluates all active workflows for this event
            └── If conditions pass:
                └── Communication Actions
                    └── Call NotificationCoordinator directly
                └── CRM Actions
                    └── Call CRM-4/CRM-5 services directly
                └── Approval Actions
                    └── Call ApprovalEngine
```

### What Does NOT Change in CRM-5

- `NotificationCoordinator` — no modification needed. CRM-6 calls it as a client.
- `NotificationMap` — no modification needed. CRM-6 reads its event keys, doesn't modify them.
- `PortalRecipientResolver` — no modification needed. CRM-6 calls it for recipient data.
- `TemplateRenderer` — no modification needed. CRM-6 passes the same template keys.
- `DeliveryTracker` — no modification needed. CRM-6 actions use existing tracking.
- `crm_communication_logs` — no schema change. CRM-6 writes to it as any channel does.

---

## 9. CRM-7 Analytics Contracts

### What CRM-6 Produces for CRM-7

| Data Point | Source Table | CRM-7 Use |
|------------|-------------|-----------|
| Workflow execution count | `crm_workflow_runs` | Automation adoption metric |
| Workflow success rate | `crm_workflow_runs.status` | Reliability scoring |
| Action execution metrics | `crm_workflow_action_runs` | Action-type effectiveness |
| Approval flow throughput | `crm_approval_requests` | Approval cycle time |
| Approval step latency | `crm_approval_decisions.decided_at` — `step.created_at` | Bottleneck identification |
| Approval rejection rate | `crm_approval_decisions.decision` | Quality of initial submission |
| Automation → Notification correlation | `crm_communication_logs.correlation_id` (set by CRM-6 actions calling CRM-5) | End-to-end automation trace |
| Portal approval engagement | `crm_approval_decisions` via portal accounts | Customer approval behavior |

### Reserved Analytics Columns

| Column | Table | CRM-7 Purpose |
|--------|-------|---------------|
| `crm_workflow_runs.correlation_id` | Reserved | Links workflow run to triggering event's correlation chain |
| `crm_workflow_action_runs.response_json` | Reserved | Stores provider responses, entity IDs, correlation IDs from actions |

---

## 10. Migration Plan

### Migration 500001 — Workflow Foundation

```php
Schema::create('crm_workflows', function (Blueprint $table) {
    $table->id();
    $table->string('name', 200);
    $table->text('description')->nullable();
    $table->string('entity_type', 50);        // project, deal, change_order, risk, issue
    $table->boolean('is_active')->default(true);
    $table->unsignedInteger('version')->default(1);  // Incremented on each edit — preserves audit trail for historical runs
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
});

Schema::create('crm_workflow_triggers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('workflow_id')->constrained('crm_workflows')->cascadeOnDelete();
    $table->string('event_key', 100);          // References NotificationEventCatalog
    $table->timestamps();
});

Schema::create('crm_workflow_conditions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('workflow_id')->constrained('crm_workflows')->cascadeOnDelete();
    $table->string('field', 100);
    $table->string('operator', 20);
    $table->text('value');                     // JSON-encoded
    $table->unsignedTinyInteger('group_order')->default(0);
    $table->timestamps();
});

Schema::create('crm_workflow_actions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('workflow_id')->constrained('crm_workflows')->cascadeOnDelete();
    $table->string('action_type', 50);
    $table->json('configuration_json');
    $table->unsignedSmallInteger('sort_order')->default(0);
    $table->boolean('stop_on_fail')->default(false);
    $table->timestamps();
});

Schema::create('crm_workflow_runs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('workflow_id')->constrained('crm_workflows')->cascadeOnDelete();
    $table->string('event_key', 100);
    $table->string('entity_type', 50);
    $table->unsignedBigInteger('entity_id');
    $table->string('status', 20);              // pending, running, completed, failed, skipped
    $table->json('context_snapshot')->nullable();  // Frozen event payload at run time — enables CRM-7 analytics without rehydrating
    $table->string('correlation_id', 100)->nullable();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();
});

Schema::create('crm_workflow_action_runs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('workflow_run_id')->constrained('crm_workflow_runs')->cascadeOnDelete();
    $table->string('action_type', 50);
    $table->string('status', 20);              // pending, running, completed, failed, skipped
    $table->json('configuration_json');
    $table->json('response_json')->nullable();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->text('error_message')->nullable();
    $table->timestamps();
});
```

### Migration 500002 — Approval Foundation

```php
Schema::create('crm_approval_flows', function (Blueprint $table) {
    $table->id();
    $table->string('name', 200);
    $table->string('entity_type', 50);
    $table->decimal('trigger_amount', 15, 2)->nullable();
    $table->boolean('is_active')->default(true);
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
});

Schema::create('crm_approval_steps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('approval_flow_id')->constrained('crm_approval_flows')->cascadeOnDelete();
    $table->unsignedTinyInteger('step_order');
    $table->string('role', 50);
    $table->string('approval_type', 10);       // any, all
    $table->unsignedSmallInteger('sla_hours')->nullable();
    $table->foreignId('escalation_step_id')->nullable()->constrained('crm_approval_steps');
    $table->timestamps();
});

Schema::create('crm_approval_requests', function (Blueprint $table) {
    $table->id();
    $table->foreignId('approval_flow_id')->constrained('crm_approval_flows');
    $table->string('entity_type', 50);
    $table->unsignedBigInteger('entity_id');
    $table->foreignId('requested_by')->constrained('users');
    $table->string('status', 20);              // pending, approved, rejected, escalated, expired
    $table->foreignId('current_step_id')->nullable()->constrained('crm_approval_steps');
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();
});

Schema::create('crm_approval_decisions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('approval_request_id')->constrained('crm_approval_requests')->cascadeOnDelete();
    $table->foreignId('approval_step_id')->constrained('crm_approval_steps');
    $table->string('decider_type', 20);        // user, portal_account
    $table->string('decider_id', 100);         // Polymorphic — user or portal_account ID
    $table->string('decision', 20);            // approved, rejected
    $table->text('notes')->nullable();
    $table->timestamp('decided_at');
    $table->timestamps();
});
```

### Migration 500003 — Update HandleDomainNotification

No schema change. Code update to `HandleDomainNotification` to dispatch to `WorkflowEngine` alongside `NotificationCoordinator`.

---

## 11. Security Model

### Workflow Permissions

| Action | Permission | Check |
|--------|-----------|-------|
| Create workflow | `automation.workflows.create` | Internal user permission |
| Edit workflow | `automation.workflows.edit` | Owner or admin |
| Delete workflow | `automation.workflows.delete` | Owner or admin |
| Activate/deactivate | `automation.workflows.manage` | Admin only |
| View run history | `automation.workflows.view` | Owner or admin |
| Create approval flow | `automation.approvals.create` | Admin |
| Approve/reject | `automation.approvals.decide` | Role-based (mapped from approval step role) |

### Action Security

- Communication actions use CRM-5's existing permission checks (no new surface)
- CRM actions operate within the caller's permission scope
- Approval decisions are audited with `decider_id` + `decider_type`
- Workflow engine runs as system — actions are recorded but auditable

### Data Isolation

- Workflows are scoped to `entity_type` — a workflow on `change_order` cannot affect `deal` entities
- Conditions only read event payload — they cannot write data
- Actions write through existing CRM-4/CRM-5 services with existing validation

---

## 12. Performance & Queue Strategy

### Execution Sync vs Async

| Phase | Execution | Reason |
|-------|-----------|--------|
| Trigger matching | Synchronous (in request) | Fast — query active workflows by event key |
| Condition evaluation | Synchronous (in request) | Fast — payload comparison only |
| Action execution | **Asynchronous (queue job)** | Actions may be slow (API calls, DB writes, notifications) |

### Queue Design

```
WorkflowEngine (synchronous — trigger matching + condition eval)
    │
    ▼
ExecuteWorkflowActions (queue job — one per matched workflow)
    │
    ├── Communication Actions → calls NotificationCoordinator
    │   └── CRM-5 channels dispatch to their own queues (already async)
    │
    ├── CRM Actions → direct service calls (fast, synchronous within job)
    │
    └── Approval Actions → calls ApprovalEngine
        └── Approval requests → crm_approval_requests (DB write)
```

### Queue Connection

| Job | Queue |
|-----|-------|
| `ExecuteWorkflowActions` | `crm-workflows` (dedicated) |

This ensures:
- Workflow execution doesn't block the HTTP response
- Workflow actions don't compete with notification channel queues
- Failed workflow actions can be retried independently of notifications

### Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Many workflows per event | WorkflowLoader caches active workflow→trigger mappings. Loaded once per request. |
| Expensive condition evaluation | Conditions are simple field→operator→value comparisons. No regex, no script eval. |
| Slow action execution | Actions are async via queue job. One job per matched workflow. |
| Approval SLA escalation | Scheduled command checks `crm_approval_requests` for overdue steps. |
| Run history growth | Retention policy configurable (default 90 days). Cleanup command. |

---

## 13. Implementation Phases

### Phase 1 — Workflow Foundation

**Deliverables:**
- Migration 500001 (workflow tables)
- Models: `CrmWorkflow`, `CrmWorkflowTrigger`, `CrmWorkflowCondition`, `CrmWorkflowAction`, `CrmWorkflowRun`, `CrmWorkflowActionRun`
- Factories for all 6 models
- Basic CRUD service for workflow management (no execution yet)

**Tests:** 12+ (model relationships, factory states, CRUD validation)

### Phase 2 — Rule Engine

**Deliverables:**
- `WorkflowEngine` — orchestrator
- `WorkflowLoader` — caches active workflows
- `WorkflowContextBuilder` — builds context from event + payload
- `WorkflowEvaluator` — condition evaluation
- `WorkflowExecutor` — action execution with status tracking
- Contracts: `WorkflowTriggerInterface`, `WorkflowConditionInterface`, `WorkflowActionInterface`
- Integration: update `HandleDomainNotification` to dispatch to `WorkflowEngine`
- Update `NotificationCoordinator` to accept external calls from CRM-6 actions

**Tests:** 25+ (engine evaluation, condition matching, action execution, error handling, full-stack integration)

### Phase 3 — Action Library

**Deliverables:**
- Communication actions (4 types — reuse CRM-5)
- CRM actions (5 types)
- Project actions (3 types)
- Action handler classes implementing `WorkflowActionInterface`
- One action type test suite per handler

**Tests:** 20+ (action execution, CRM-5 integration, error cases)

### Phase 4 — Approval Engine

**Deliverables:**
- Migration 500002 (approval tables)
- Models: `CrmApprovalFlow`, `CrmApprovalStep`, `CrmApprovalRequest`, `CrmApprovalDecision`
- `ApprovalEngine` — flow lifecycle management
- `ApprovalStepResolver` — determines next step, checks SLA
- `ApprovalNotificationService` — sends approval step notifications via CRM-5
- Portal integration for approval/rejection
- SLA escalation scheduled command

**Tests:** 30+ (flow lifecycle, step progression, SLA escalation, portal approval, rejection)

### Phase 5 — Workflow Builder UI

**Deliverables:**
- Inertia + React pages for workflow management
- Multi-step workflow creation form
- Condition builder (dynamic groups)
- Action list editor (sortable)
- Run history viewer
- Approval flow management UI
- All using existing CRM design system (no new design tokens)

**No automated tests for UI** (manual QA + existing backend tests cover logic)

---

## 14. Migration Sequence

```
Current State (CRM-3 + CRM-4 + CRM-5)
    │
    ▼
Step 1: Migration 500001 — workflow tables + models (Phase 1)
    │
    ▼
Step 2: Rule engine code — WorkflowEngine + Evaluator + Executor (Phase 2)
    │
    ▼
Step 3: Migration 500003 — update HandleDomainNotification (Phase 2)
    │
    ▼
Step 4: Action handlers — communication + CRM + project actions (Phase 3)
    │
    ▼
Step 5: Migration 500002 — approval tables + models (Phase 4)
    │
    ▼
Step 6: Approval engine + portal integration (Phase 4)
    │
    ▼
Step 7: UI — workflow builder + approval flow manager (Phase 5)
    │
    ▼
CRM-6 Complete
```

---

## 15. What Does NOT Change

This list is as important as what does change. CRM-6 must not introduce regressions or architectural changes to stable systems.

| System | What Does NOT Change |
|--------|---------------------|
| CRM-3 Sales OS | No schema changes. No service changes. |
| CRM-4 Delivery OS | No schema changes. Controllers unchanged (no new dispatch calls needed). |
| CRM-5 Customer Portal | No schema changes. No UI changes. Auth unchanged. |
| CRM-5 Communications | No changes to `NotificationCoordinator` (called externally by CRM-6). No changes to channels, templates, or tracking. |
| `NotificationEventCatalog` | No changes. CRM-6 reads constants, does not modify them. |
| `NotificationMap` | No changes. CRM-6 reads event keys from catalog, not map. |
| `CustomerVisibilityService` | No changes. Approval engine calls it directly. |
| `PortalRoleResolver` | No changes. Approval engine calls it for role checks. |
| `bootstrap/app.php` | No changes. Route registration unchanged. |
| Dark theme design system | No changes. CRM-6 pages use existing tokens. |

---

> **This document is the starting point for CRM-6 implementation.** Once approved, development begins with **Phase 1A — Workflow Foundation (Migrations + Models)** , as all prerequisite infrastructure (domain events, timeline, communications, portal, correlation tracking) already exists in CRM-5.
