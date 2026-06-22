# CRM-6 Approval Engine — Architecture Document

## 1. Philosophy

The Approval Engine is a **pluggable decision layer** for CRM-6 workflows. It does not replace workflow execution — it pauses, collects decisions, and resumes.

### What It Is

- A **multi-step decision collector** that routes approval requests through ordered steps
- An **SLA-aware escalation framework** that enforces time-bound decisions
- A **workflow integration point** — approval actions pause the workflow; decisions resume it

### What It Is Not

| Not This | Why |
|----------|-----|
| A notification system | CRM-5 Communications handles all notifications (pending approval, approved, rejected, escalated) |
| A workflow engine | The Approval Engine does not evaluate conditions or execute actions — it only collects decisions |
| A replacement for business logic | Approval rules (who must approve, when, what happens if rejected) are configurable per flow, not hard-coded |
| A standalone service | The Approval Engine is always invoked from `WorkflowExecutor` via approval-type actions |

## 2. Data Model

```
crm_approval_flows
├── id (PK)
├── name (e.g. "Change Order Approval")
├── description
├── strategy (all_must_approve | first_approver_wins | majority_vote)
├── escalation_model (none | manager | role | specific_user)
├── escalation_config JSON
├── sla_warning_minutes ?int
├── sla_breach_minutes ?int
├── is_active bool
└── timestamps

crm_approval_steps
├── id (PK)
├── approval_flow_id (FK → crm_approval_flows)
├── step_order int
├── approver_type (role | user | manager_of)
├── approver_id ?int (user_id if approver_type=user, role_id if approver_type=role)
├── required bool (must this step approve?)
└── timestamps

crm_approval_requests
├── id (PK)
├── approval_flow_id (FK → crm_approval_flows)
├── workflow_run_id (FK → crm_workflow_runs)
├── entity_type (change_order | deal | risk | issue)
├── entity_id int
├── status (pending | approved | rejected | escalated | expired)
├── requested_by int (user_id)
├── requested_at datetime
├── sla_warning_sent_at ?datetime
├── sla_breach_at ?datetime
├── escalated_at ?datetime
├── completed_at ?datetime
├── notes ?text
└── timestamps

crm_approval_decisions
├── id (PK)
├── approval_request_id (FK → crm_approval_requests)
├── approval_step_id (FK → crm_approval_steps)
├── user_id int
├── decision (approved | rejected | abstained)
├── comment ?text
├── decided_at datetime
└── timestamps
```

### Migration Index Strategy

All index names ≤64 chars for MySQL 8+ compatibility. Explicit short names:

| Table | Index | Name |
|-------|-------|------|
| `crm_approval_steps` | `approval_flow_id` | `apr_steps_flow_idx` |
| `crm_approval_requests` | `approval_flow_id` | `apr_reqs_flow_idx` |
| `crm_approval_requests` | `workflow_run_id` | `apr_reqs_run_idx` |
| `crm_approval_requests` | `entity_type + entity_id` | `apr_reqs_entity_idx` |
| `crm_approval_requests` | `status` | `apr_reqs_status_idx` |
| `crm_approval_decisions` | `approval_request_id` | `apr_decisions_req_idx` |
| `crm_approval_decisions` | `approval_step_id` | `apr_decisions_step_idx` |
| `crm_approval_decisions` | `user_id` | `apr_decisions_user_idx` |

## 3. Approval Strategies

### `all_must_approve` (default)

Every required step must approve. If any step rejects, the request is rejected.

```
Step 1 (Manager)    → approved
Step 2 (Director)   → approved
Step 3 (VP)         → approved
                    → Status: approved
```

If any step rejects:
```
Step 1 (Manager)    → rejected
                    → Status: rejected (remaining steps not asked)
```

### `first_approver_wins`

The first decision (approve or reject) is final. Useful for on-call approval rotations.

```
Step 1 (On-call eng)  → approved (no more steps asked)
                      → Status: approved
```

### `majority_vote`

Requires >50% of steps to approve. Steps are counted, not weighted, in v1.

```
Step 1 (Alice)   → approved
Step 2 (Bob)     → rejected
Step 3 (Carol)   → approved
                  → Status: approved (2/3)
```

## 4. Escalation Model

### `none`

No escalation. Request stays pending indefinitely (or until SLA breach).

### `manager`

Escalate to the manager of the current step's assigned user.

```
Step assigned to User A
→ No decision after SLA breach
→ Escalated to User A's manager
→ New decision record added, linked to same step
```

### `role`

Escalate to a specific system role.

```
Step assigned to Role X
→ No decision after SLA breach
→ Escalated to Role Y (configured in escalation_config)
```

### `specific_user`

Escalate to a named user.

```
Step assigned to User A
→ No decision after SLA breach
→ Escalated to User B (configured in escalation_config)
```

## 5. SLA Behaviour

Each approval request has three SLA timestamps:

| Field | Trigger | Action |
|-------|---------|--------|
| `sla_warning_sent_at` | At `sla_warning_minutes` | CRM-5 notification: "Approval pending for X hours" |
| `sla_breach_at` | At `sla_breach_minutes` | Request status → `expired`, escalation triggered |
| `escalated_at` | On escalation trigger | Request re-assigned per escalation model |

SLA timers start at `requested_at`. All three fields nullable — if SLA config is null, no SLA enforcement.

## 6. Workflow Integration

### Approval Action Type

A new action type `request_approval` in `WorkflowActionCatalog`:

```php
WorkflowActionCatalog::REQUEST_APPROVAL = 'request_approval';
```

### Execution Flow

```
WorkflowExecutor processes action
    │
    ├── Action type == normal (e.g. create_activity)
    │   └── Execute → continue
    │
    ├── Action type == request_approval
    │   ├── Create approval request (status: pending)
    │   ├── Notify approvers (via CRM-5)
    │   └── Mark workflow run as paused
    │       └── Resume when decision is made
    │
    └── On approval completion
        ├── If approved → resume workflow (execute remaining actions)
        ├── If rejected  → mark workflow run as failed
        └── If expired   → mark workflow run as expired
```

### Workflow Resume

When a decision completes an approval request:
1. `WorkflowEngine::resume(CrmWorkflowRun)` is called
2. It reloads the workflow and finds the next unexecuted action after the approval
3. Actions execute normally
4. Run status updated to `completed` or `failed` based on remaining action results

### CRM-5 Integration Points

| Event | Notification |
|-------|-------------|
| Approval request created | "Approval request: {entity} requires your decision" |
| Approval reminder (at SLA warning) | "Reminder: Approval request pending for X hours" |
| Request approved | "{entity} has been approved" |
| Request rejected | "{entity} has been rejected" |
| Request escalated | "Approval request escalated to {user/role}" |
| Request expired | "Approval request expired — no decision within SLA" |

## 7. Services

### ApprovalEngine Service

```php
class ApprovalEngine
{
    public function createRequest(
        CrmWorkflowRun $run,
        CrmApprovalFlow $flow,
        string $entityType,
        int $entityId,
        User $requestedBy,
    ): CrmApprovalRequest;

    public function recordDecision(
        CrmApprovalRequest $request,
        CrmApprovalStep $step,
        User $user,
        string $decision,   // approved | rejected | abstained
        ?string $comment,
    ): CrmApprovalDecision;

    public function evaluate(CrmApprovalRequest $request): ApprovalStatus;

    public function escalate(CrmApprovalRequest $request): void;

    public function checkSla(CrmApprovalRequest $request): void;
}
```

### ApprovalEvaluator (internal)

```php
class ApprovalEvaluator
{
    public function evaluate(
        CrmApprovalRequest $request,
        string $strategy,    // all_must_approve | first_approver_wins | majority_vote
        Collection $decisions,
    ): ApprovalEvaluationResult;
}
```

## 8. Request Approval Workflow Action

```php
class RequestApprovalWorkflowAction implements WorkflowActionHandlerInterface
{
    public function handles(): string
    {
        return WorkflowActionCatalog::REQUEST_APPROVAL;
    }

    public function execute(WorkflowActionContext $actionContext): WorkflowActionResult
    {
        // Create approval request in pending status
        // Notify approvers
        // Return success but workflow is paused
        // Actual action execution happens when approval completes
    }
}
```

## 9. Phasing

### Phase 4A (current) — Schema + Models

- Migration `500002` — 4 tables above
- Models: `CrmApprovalFlow`, `CrmApprovalStep`, `CrmApprovalRequest`, `CrmApprovalDecision`
- Factories for all models with states
- Indexes with short names
- Enum casts for strategy, escalation_model, approver_type, status, decision

### Phase 4B — ApprovalEngine Service

- `ApprovalEngine` with create/decide/evaluate/escalate/checkSla
- `ApprovalEvaluator` for strategy resolution
- Strategy tests for all 3 modes
- Escalation logic
- SLA enforcement

### Phase 4C — Workflow Integration

- `RequestApprovalWorkflowAction` handler
- `WorkflowEngine::resume()` method
- Paused workflow run status (`WorkflowStatusCatalog::RUN_PAUSED`)
- Resume on approval decision

### Phase 4D — Portal Integration

- Approval request list in Customer Portal
- Decision submission (approve/reject/abstain)
- Approval history view
- CRM-5 notification wiring for all 6 approval events
