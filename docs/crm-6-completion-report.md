# CRM-6 Workflow Automation Platform — Completion Report

## 1. Executive Summary

CRM-6 delivers a complete Workflow Automation Engine for the TUTIA CRM platform. It enables event-driven, rule-based workflow execution with configurable triggers, AND-group conditions, 13 action types, approval flows with SLA monitoring and escalation, a full workflow builder UI, run monitoring, and an approval management interface.

**What CRM-6 adds to the system:**

- Event-driven automation (11 events → trigger → condition → action pipeline)
- 13 workflow action types (4 communication, 5 CRM, 3 project, 1 approval)
- Full approval engine with 3 strategies, SLA monitoring, escalation, and auto-resume
- Workflow Builder UI (list, editor, 13 dynamic action config forms)
- Workflow Run Monitoring (execution timeline, debug, metrics)
- Approval Management UI (inbox, details, approve/reject/abstain)

**Status: COMPLETE — 483 tests, 1,417 assertions, 0 failures**

---

## 2. Architecture Overview

### 2.1 Core Pattern: Registry-Based Dispatch

Every extensible component uses a registry pattern to eliminate switch/match statements:

| Registry | Purpose |
|---|---|
| `WorkflowActionRegistry` | Maps `action_type` string → handler class. 13 handlers registered |
| `ApprovalStrategyRegistry` | Maps strategy key → strategy class. 3 strategies registered |
| `actionConfigRegistry` (React) | Maps `action_type` → React config form component. 13 forms registered |

### 2.2 Workflow Engine

```
Event Dispatch
     │
     ▼
HandleWorkflowAutomation (Listener)
     │
     ▼
WorkflowEngine
     ├── WorkflowLoader (loads active workflows for event)
     ├── WorkflowEvaluator (evaluates conditions per workflow)
     │     └── WorkflowCondition (11 operators)
     └── WorkflowExecutor
           ├── Creates CrmWorkflowRun
           ├── Executes actions via WorkflowActionRegistry
           ├── Handles pause/resume for approvals
           └── Creates CrmWorkflowActionRun per action
```

**Key components:**

| Class | Responsibility |
|---|---|
| `WorkflowEngine` | Entry point. Event key map → load workflows → evaluate → execute |
| `WorkflowExecutor` | Creates run, iterates actions, handles pause/fail/complete |
| `WorkflowEvaluator` | Evaluates all condition groups (AND within groups, AND between groups) |
| `WorkflowLoader` | Queries active workflows matching event key + entity type |
| `HandleWorkflowAutomation` | Listener registered for 11 events. Dispatches to WorkflowEngine |

### 2.3 Action System

**Communication actions** (use CRM-5 `NotificationCoordinator`):

| Action Type | Handler | Route |
|---|---|---|
| `send_email` | `SendEmailWorkflowAction` | → NotificationCoordinator → Email channel |
| `send_sms` | `SendSmsWorkflowAction` | → NotificationCoordinator → SMS channel |
| `send_whatsapp` | `SendWhatsAppWorkflowAction` | → NotificationCoordinator → WhatsApp channel |
| `send_portal_notification` | `SendPortalNotificationWorkflowAction` | → NotificationCoordinator → Portal channel |

**CRM actions** (via `CrmActionService`):

| Action Type | Handler | Effect |
|---|---|---|
| `create_activity` | `CreateActivityWorkflowAction` | Creates CrmActivity |
| `create_task` | `CreateTaskWorkflowAction` | Creates CrmActivity with task type |
| `create_note` | `CreateNoteWorkflowAction` | Creates CrmActivity with note type |
| `assign_owner` | `AssignOwnerWorkflowAction` | Updates entity owner |
| `update_status` | `UpdateStatusWorkflowAction` | Updates entity status |

**Project actions** (via `CrmActionService`):

| Action Type | Handler | Effect |
|---|---|---|
| `create_risk` | `CreateRiskWorkflowAction` | Creates CrmProjectRisk |
| `create_issue` | `CreateIssueWorkflowAction` | Creates CrmIssue |
| `create_change_order` | `CreateChangeOrderWorkflowAction` | Creates CrmChangeOrder |

**Approval action:**

| Action Type | Handler | Effect |
|---|---|---|
| `request_approval` | `RequestApprovalWorkflowAction` | Pauses run, creates CrmApprovalRequest |

### 2.4 Approval System

```
WorkflowExecutor (pauses on approval actions)
     │
     ▼
ApprovalEngine
     ├── createRequest() → CrmApprovalRequest + dispatch ApprovalRequested event
     ├── recordDecision() → record + evaluate + dispatch (Approved/Rejected)
     ├── evaluateRequest() → strategy.evaluate()
     │     └── ApprovalStrategyRegistry
     │           ├── UnanimousStrategy (all_must_approve)
     │           ├── FirstApproverWinsStrategy (first_approver_wins)
     │           └── MajorityVoteStrategy (majority_vote)
     ├── expireRequest() → + dispatch ApprovalExpired
     ├── checkSla() → warning/breach → escalate or expire
     └── escalateRequest() → + dispatch ApprovalEscalated
```

**Event chain:**

```
ApprovalEngine::recordDecision()
     │
     ▼
ApprovalApproved / ApprovalRejected events
     │
     ▼
HandleApprovalDecision (listener)
     │
     ▼
WorkflowEngine::resume()
     ├── Rebuild context from snapshot
     ├── Find paused CrmWorkflowRun
     ├── Continue remaining actions after approval step
     └── Complete or fail run
```

**SLA processing:**

```
Schedule: crm:approvals:check-sla (everyMinute)
     │
     ▼
CheckApprovalSlaJob (queued, crm-workflows queue, chunked 100)
     │
     ▼
ApprovalEngine::checkSla()
     ├── Within warning → set sla_warning_sent_at
     ├── Breach + escalation_model != none → escalateRequest()
     └── Breach + escalation_model == none → expireRequest()
```

---

## 3. Database Schema

### 3.1 Workflow Tables (Migration 500001)

**`crm_workflows`** — Workflow definitions
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | Auto-increment |
| name | string(200) | |
| slug | string(220) | Unique, auto-generated (500004) |
| description | text | Nullable |
| entity_type | string(50) | Lead, Deal, Project, etc. |
| is_active | boolean | Default false |
| version | integer | Default 1, incremented on update |
| created_by | bigint FK → users | |

**`crm_workflow_triggers`** — Event triggers per workflow
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| workflow_id | bigint FK → crm_workflows | CASCADE |
| event_key | string(100) | From NotificationEventCatalog |

**`crm_workflow_conditions`** — AND-group conditions
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| workflow_id | bigint FK → crm_workflows | CASCADE |
| field | string(100) | |
| operator | string(20) | eq, neq, gt, gte, lt, lte, in, not_in, contains, is_empty, not_empty |
| value | string(255) | Nullable |
| group_order | integer | Default 1 |

**`crm_workflow_actions`** — Action definitions
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| workflow_id | bigint FK → crm_workflows | CASCADE |
| action_type | string(50) | From WorkflowActionCatalog |
| configuration_json | json | Nullable |
| sort_order | integer | |
| stop_on_fail | boolean | Default false |

**`crm_workflow_runs`** — Execution records
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| workflow_id | bigint FK → crm_workflows | CASCADE |
| event_key | string(100) | Triggering event |
| entity_type | string(50) | |
| entity_id | bigint | |
| status | string(20) | pending, running, completed, failed, skipped, paused |
| context_snapshot | json | Frozen event payload |
| root_cause | text | Nullable. Added in 500005 |
| correlation_id | string(100) | UUID |
| started_at | timestamp | |
| completed_at | timestamp | |

**`crm_workflow_action_runs`** — Per-action execution records
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| workflow_run_id | bigint FK → crm_workflow_runs | CASCADE |
| action_type | string(50) | |
| status | string(20) | pending, running, completed, failed, skipped, waiting |
| configuration_json | json | |
| response_json | json | Nullable |
| error_message | text | Nullable |
| started_at | timestamp | |
| completed_at | timestamp | |

### 3.2 Approval Tables (Migration 500002)

**`crm_approval_flows`** — Approval flow templates
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | string(200) | |
| strategy | string(50) | all_must_approve, first_approver_wins, majority_vote |
| escalation_model | string(50) | None, chain, round_robin |
| escalation_config | json | Nullable |
| sla_warning_minutes | integer | Nullable |
| sla_breach_minutes | integer | Nullable |
| is_active | boolean | |

**`crm_approval_steps`** — Steps within a flow
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| approval_flow_id | bigint FK → crm_approval_flows | CASCADE |
| step_order | integer | |
| approver_type | string(20) | user, role |
| approver_id | bigint | FK to users or role ID |
| required | boolean | |

**`crm_approval_requests`** — Active/completed requests
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| approval_flow_id | bigint FK → crm_approval_flows | |
| workflow_run_id | bigint FK → crm_workflow_runs | |
| entity_type | string(50) | |
| entity_id | bigint | |
| status | string(20) | pending, approved, rejected, expired, escalated, cancelled |
| requested_by | bigint FK → users | |
| requested_at | timestamp | |
| sla_warning_sent_at | timestamp | Nullable |
| sla_breach_at | timestamp | Nullable |
| escalated_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |
| notes | text | |

**`crm_approval_decisions`** — Individual approver decisions
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| approval_request_id | bigint FK → crm_approval_requests | CASCADE |
| approval_step_id | bigint FK → crm_approval_steps | |
| user_id | bigint FK → users | |
| decision | string(20) | approved, rejected, abstained |
| comment | text | Nullable |
| decided_at | timestamp | |

### 3.3 Analytics Columns (Migration 500003)

Added to `crm_approval_requests`:

| Column | Type | Purpose |
|---|---|---|
| `approved_at` | timestamp | Resolution timestamp for approvals |
| `rejected_at` | timestamp | Resolution timestamp for rejections |
| `first_response_at` | timestamp | Time of first decision (any type) |
| `resolution_time_minutes` | integer | `completed_at - requested_at` in minutes |
| `escalation_count` | integer | Incremented on each escalation |

### 3.4 Schema Extensions (Migration 500004, 500005)

| Migration | Change |
|---|---|
| `500004` | Added `slug` (string 220, unique) to `crm_workflows` |
| `500005` | Added `root_cause` (text, nullable) to `crm_workflow_runs` |

---

## 4. Event Architecture

CRM-6 maintains strict separation from CRM-5 Communications. Both systems listen to the same 11 domain events but dispatch to independent pipelines:

```
Domain Event (e.g., deal.converted, project.created, ...)
     │
     ├── CRM-5 Path ──────────────────────────────────────────────
     │     │
     │     ▼
     │  HandleDomainNotification (Listener)
     │     │
     │     ▼
     │  NotificationCoordinator
     │     │
     │     ▼
     │  NotificationRouter → Channel Jobs
     │
     └── CRM-6 Path ──────────────────────────────────────────────
           │
           ▼
        HandleWorkflowAutomation (Listener)
           │
           ▼
        WorkflowEngine
           ├── Loader (find active workflows for event)
           ├── Evaluator (check conditions)
           └── Executor (run actions)
```

**11 shared events:**

| Event | NotificationEventCatalog Key |
|---|---|
| `DealConverted` | `deal.converted` |
| `ProjectCreated` | `project.created` |
| `ProjectAtRisk` | `project.at_risk` |
| `HealthSnapshotDegraded` | `health.degraded` |
| `MilestoneCompleted` | `milestone.completed` |
| `DeliverableCompleted` | `deliverable.completed` |
| `RiskClosed` | `risk.closed` |
| `IssueResolved` | `issue.resolved` |
| `IssueEscalated` | `issue.escalated` |
| `ChangeOrderApproved` | `change_order.approved` |
| `ChangeOrderRejected` | `change_order.rejected` |

Both listeners registered in `EventServiceProvider`. No coupling between the two systems. Each can be disabled, monitored, and extended independently.

---

## 5. Workflow Builder

### 5.1 Backend

**Controllers (6):**

| Controller | Type | Routes |
|---|---|---|
| `WorkflowController` | JSON API | store, update, destroy, duplicate, toggle |
| `WorkflowPageController` | Inertia | index (list), show (editor) |
| `TriggerBuilderController` | JSON API | index, store, update, destroy |
| `ConditionBuilderController` | JSON API | index, store, update, destroy |
| `ActionBuilderController` | JSON API | index, store, update, destroy |
| `MetadataController` | JSON API | events, operators, actions, approval-flows |

**Resources (6):**

- `WorkflowResource`, `WorkflowTriggerResource`
- `WorkflowConditionResource`, `WorkflowActionResource`
- `ApprovalRequestResource`, `ApprovalDecisionResource`

**Form Requests (7):**

- `StoreWorkflowRequest`, `UpdateWorkflowRequest`
- `StoreWorkflowTriggerRequest`, `StoreWorkflowConditionRequest`, `StoreWorkflowActionRequest`
- `UpdateWorkflowConditionRequest`, `UpdateWorkflowActionRequest`

**Policy:**

- `CrmWorkflowPolicy` — `viewAny` (auth), `create`/`update`/`delete` (admin+), `duplicate`/`toggle` (admin+)

**Routes (23 workflow routes + 5 approval routes):**

Defined in `routes/workflow-management.php` and `routes/approval-management.php`, loaded from `routes/web.php` inside `auth,verified` middleware group.

### 5.2 Frontend

**Workflow List (`/crm/workflows`):**
- Search by name/description
- Filter by entity type, active status
- Paginated table with triggers/conditions/actions counts
- Toggle active, duplicate, delete actions
- Empty state when no workflows exist

**Workflow Editor (`/crm/workflows/{workflow}`):**
- WorkflowHeader — inline name/description/entity type editing
- TriggerSection — event selector from metadata
- ConditionBuilder — AND-group builder with field/operator/value
- ActionBuilder — sortable action list with dynamic config forms

**Dynamic Action Config Forms (13):**

All self-register via `actionConfigRegistry` (React-side mirror of `WorkflowActionRegistry`):

| Communication | CRM | Project | Approval |
|---|---|---|---|
| `EmailActionConfig` | `CreateTaskActionConfig` | `CreateRiskActionConfig` | `RequestApprovalActionConfig` |
| `SmsActionConfig` | `CreateActivityActionConfig` | `CreateIssueActionConfig` | |
| `WhatsAppActionConfig` | `CreateNoteActionConfig` | `CreateChangeOrderActionConfig` | |
| `PortalNotificationActionConfig` | `AssignOwnerActionConfig` | | |
| | `UpdateStatusActionConfig` | | |

All mutations use `fetch()` to JSON API endpoints + local state — no full page reloads.

---

## 6. Approval Management

**Approval Inbox (`/crm/approvals`):**
- Metric cards: Pending, Approved Today, Rejected Today, Escalated
- Filters: status, approval flow, date range
- Paginated table with flow, entity, status, escalation count
- Row click navigates to details

**Approval Details (`/crm/approvals/{request}`):**

4 tabs:

| Tab | Content |
|---|---|
| **Overview** | Status, Flow + Strategy, Entity, Requester, Timestamps, Resolution time, Escalations, SLA info, Linked workflow run |
| **Approval Steps** | All flow steps with order, required flag, decision status, comments |
| **Decisions Timeline** | Chronological timeline of all decisions with decision type, user name, timestamp, comment |
| **Workflow Context** | Read-only JSON viewer of `context_snapshot` from linked workflow run |

**Decision Actions:**
- Shown only when status is `pending` AND current user has an undecided step
- Approve (optional comment), Reject (required reason), Abstain (optional comment)
- Calls `ApprovalEngine::recordDecision()` via `POST /crm/approvals/api/{request}/decide`
- Auto-resume workflow run when request is approved/rejected

**Metrics API (`GET /crm/approvals/api/metrics`):**
- `pending`, `approvedToday`, `rejectedToday`, `escalated`, `expired`, `total`
- `averageResolutionTimeMinutes`, `averageFirstResponseMinutes`, `escalationRatePercent`

---

## 7. Operations & Monitoring

**Workflow Runs (`/crm/workflows/runs`):**
- Metric cards: Total Runs, Successful, Failed, Paused, Avg Duration
- Filters: workflow, status, date range
- Paginated table with workflow, status, entity, started at, duration
- Row click navigates to run details

**Run Details (`/crm/workflows/runs/{run}`):**

4 tabs:

| Tab | Content |
|---|---|
| **Overview** | Status, Workflow, Event key, Entity, Started at, Completed at, Duration, Root cause |
| **Execution Timeline** | Ordered action runs with status, timing, error messages |
| **Context Snapshot** | Read-only JSON viewer of frozen event payload |
| **Approvals** | Linked approval requests with flow, strategy, decisions, escalation count |

---

## 8. Testing Summary

**Full suite: 483 tests, 1,417 assertions, 0 failures, Pint clean**

| Test File | Scope | Tests | Assertions |
|---|---|---|---|
| `WorkflowFoundationTest` | Phase 1 — Models, factories, migrations | ~30 | ~50 |
| `WorkflowRuleEngineTest` | Phase 2 — Trigger/condition/evaluate/execute | ~60 | ~180 |
| `WorkflowActionLibraryTest` | Phase 3 — 13 action handlers | ~80 | ~200 |
| `ApprovalEngineTest` | Phase 4 — Approval engine, strategies, SLA | ~90 | ~250 |
| `WorkflowBuilderApiTest` | Phase 5A — Builder API CRUD + policies | ~46 | ~180 |
| `WorkflowRunOperationsTest` | Phase 5C — Run monitoring API + pages | ~13 | ~72 |
| `ApprovalUITest` | Phase 6 — Approval UI API + pages | ~10 | ~48 |
| Other CRM-6 tests | Edge cases, integration | ~154 | ~437 |

---

## 9. Key Architectural Decisions

### Registry Pattern

`WorkflowActionRegistry` on the backend and `actionConfigRegistry` on the frontend both use the same pattern: register by key, lookup by key, execute/render by key. Adding a new action type = new handler class + register call + config form component. No switch/match statements.

### Strategy Pattern

`ApprovalStrategyRegistry` holds 3 strategies resolved by `$flow->strategy`. Adding a new strategy = new class implementing `ApprovalStrategyInterface` + register in `AppServiceProvider`. No switch/match on strategy keys.

### Context Snapshot Freeze

`context_snapshot` on `crm_workflow_runs` freezes the event payload at run creation time. Never rehydrated or modified. Enables debug, replay, and analytics without depending on live data.

### Separate Approval Tables

Approval tables (`crm_approval_flows`, `crm_approval_steps`, `crm_approval_requests`, `crm_approval_decisions`) are independent of workflow tables. Approval engine is usable without the workflow engine. Decoupling enables standalone approval flows (future: manual approval requests without workflows).

### CRM-5 / CRM-6 Decoupling

Both systems listen to the same 11 events but dispatch to completely independent pipelines. `HandleDomainNotification` (CRM-5) and `HandleWorkflowAutomation` (CRM-6) are separate listeners with no shared state or coupling. Each can be disabled independently.

### AND-Only Conditions (v1)

Condition groups use AND-within-group and AND-between-groups. No OR support in v1. Simplifies the evaluator, UI, and testing. OR groups deferred to CRM-7 Expression Engine.

### Form Builder over Drag & Drop

Workflow Builder UI uses dropdowns, selects, and forms — not a visual canvas or BPMN editor. Reduces complexity and development time while retaining a clear upgrade path to a visual editor.

### NotificationCoordinator Reuse

Communication action handlers (`send_email`, `send_sms`, `send_whatsapp`, `send_portal_notification`) go through CRM-5 `NotificationCoordinator → NotificationRouter → Channel Jobs`. No direct channel calls from workflow actions. CRM-5 remains sole owner of communication infrastructure.

### CrmActionService Gateway

CRM and project action handlers delegate all database operations to `CrmActionService`. No direct model creation or DB queries inside handlers. Enables consistent auditing, validation, and future transactional wrapping.

### Explicit EVENT_KEY_MAP

`WorkflowEngine::EVENT_KEY_MAP` uses `NotificationEventCatalog` constants explicitly mapped to event classes. Prevents incorrect keys for compound names (e.g., `change_order.approved` vs `change_order.rejected`). Enables compile-time verification.

### `shouldRenderJsonWhen` + `expectsJson()`

`bootstrap/app.php` handles `$request->expectsJson()` alongside URL-based detection. Enables `postJson()`/`patchJson()` to receive JSON validation errors on non-API routes — critical for Inertia SPA + JSON API coexistence.

---

## 10. CRM-7 Readiness

CRM-6 has been built with CRM-7 Analytics in mind from day one. The following data is already being captured:

### Available Analytics Data

| Data Point | Source Table | Ready Since |
|---|---|---|
| Workflow execution count | `crm_workflow_runs` | Phase 1 |
| Success/failure rate | `crm_workflow_runs.status` | Phase 1 |
| Execution duration | `started_at` + `completed_at` | Phase 1 |
| Failure root cause | `root_cause` | Phase 5C (500005) |
| Action execution metrics | `crm_workflow_action_runs` | Phase 1 |
| Action error messages | `error_message` | Phase 1 |
| Approval resolution time | `resolution_time_minutes` | Phase 4E (500003) |
| First response time | `requested_at` + `first_response_at` | Phase 4E |
| Escalation rate | `escalation_count` | Phase 4E |
| Approval bottlenecks | Step-level `decided_at` | Phase 4B |
| SLA breach rate | `sla_breach_at` | Phase 4B |

### CRM-7 Candidates

- Analytics Dashboards (workflow performance, trends, bottlenecks)
- Workflow Performance Insights (avg duration by action type, success rates)
- Approval Bottleneck Detection (step-level delays, approver response times)
- SLA Breach Analytics (trends, by flow, by strategy)
- Expression Engine (OR condition groups)
- Advanced Automation Studio (visual workflow editor, drag-and-drop)
- Workflow Recommendations (AI-driven optimization suggestions)
- Approver Performance Metrics (response time by user, approval ratio)

---

## Appendix A: Migration Summary

| # | Migration | Batch | Purpose |
|---|---|---|---|
| `500001` | `add_crm6_workflow_tables` | 12 | 6 workflow tables + indexes |
| `500002` | `add_crm6_approval_tables` | 14 | 4 approval tables + 10 indexes + cascade deletes |
| `500003` | `add_crm6_approval_analytics_columns` | 15 | 5 analytics columns on `crm_approval_requests` |
| `500004` | `add_slug_to_crm_workflows` | 16 | `slug` column with unique index + backfill |
| `500005` | `add_root_cause_to_workflow_runs` | 17 | `root_cause` text column for failure diagnostics |

## Appendix B: Route Inventory (CRM-6 only)

**Workflow Builder (23 routes under `/crm/workflows`):**

```
GET    /crm/workflows                    → PageController@index
GET    /crm/workflows/{workflow}         → PageController@show
POST   /crm/workflows                    → WorkflowController@store
PATCH  /crm/workflows/{workflow}         → WorkflowController@update
DELETE /crm/workflows/{workflow}         → WorkflowController@destroy
POST   /crm/workflows/{workflow}/duplicate → WorkflowController@duplicate
POST   /crm/workflows/{workflow}/toggle  → WorkflowController@toggle
GET    /crm/workflows/meta/events        → MetadataController@events
GET    /crm/workflows/meta/operators     → MetadataController@operators
GET    /crm/workflows/meta/actions       → MetadataController@actions
GET    /crm/workflows/meta/approval-flows → MetadataController@approvalFlows
GET    /crm/workflows/{workflow}/triggers/*   (4 routes)
GET|POST|PATCH|DELETE /crm/workflows/{workflow}/conditions/* (4 routes)
GET|POST|PATCH|DELETE /crm/workflows/{workflow}/actions/* (4 routes)
```

**Run Monitoring (5 routes under `/crm/workflows/runs`):**

```
GET  /crm/workflows/runs            → RunPageController@index
GET  /crm/workflows/runs/{run}      → RunPageController@show
GET  /crm/workflows/runs/api        → RunController@index
GET  /crm/workflows/runs/api/{run}  → RunController@show
GET  /crm/workflows/runs/api/metrics → RunController@metrics
```

**Approval UI (6 routes under `/crm/approvals`):**

```
GET  /crm/approvals                 → ApprovalPageController@index
GET  /crm/approvals/{request}       → ApprovalPageController@show
GET  /crm/approvals/api             → ApprovalController@index
GET  /crm/approvals/api/{request}   → ApprovalController@show
POST /crm/approvals/api/{request}/decide → ApprovalController@decide
GET  /crm/approvals/api/metrics     → ApprovalController@metrics
```

## Appendix C: Console Commands

| Command | Purpose | Frequency |
|---|---|---|
| `crm:approvals:check-sla` | Check all pending requests for SLA warnings/breaches | EveryMinute (scheduled) |
| `crm:approvals:escalate` | Manually trigger escalation for a specific request | On-demand |

---

*Report generated: 2026-06-21*
*CRM-6 Workflow Automation Platform — Status: COMPLETE*
