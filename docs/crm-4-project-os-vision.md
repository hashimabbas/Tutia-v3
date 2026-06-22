# CRM-4 — Project Operating System Vision

## Mandate

CRM-4 transforms TUTIA CRM from a **Sales Operating System** into a **Revenue-to-Delivery Platform**. When a deal is won, it converts into a project — not as a handoff to a separate tool, but as a seamless continuation within the same command center philosophy built in CRM-2 and CRM-3.

The same principles apply:

- **3-panel workspaces** — Left: intelligence, Center: workflow, Right: timeline
- **Health intelligence** — Delivery Health Score mirrors Deal Health Score
- **Universal Timeline** — All project events flow into the same activity stream
- **Information-dense, minimal, premium** — Same dark theme, same UX hierarchy

**This document is architectural and design only. No migrations, models, or frontend code should be written until this vision is reviewed and approved.**

---

## Part 1: Deal → Project Conversion Engine

### The Core Flow

```
Deal (Won)
    ↓
Project Created (one-click)
    ├── Organization (copied)
    ├── Contacts / Stakeholders (copied)
    ├── Quotation (linked, not copied)
    ├── Products / Services (converted to deliverables)
    ├── Value / Contract Amount (copied)
    ├── Expected Timeline (from quotation context)
    └── Template (assigned by product category)
```

### Design Principles

| Principle | Rationale |
|---|---|
| **One-click conversion** | Rep clicks "Convert to Project" on a won deal — no form filling |
| **Template-driven** | Each product category (ERP, Connectivity, VPN, etc.) has a default milestone template |
| **Quotation-linked, not duplicated** | The quotation remains the source of truth for pricing; the project references it |
| **Stakeholders carried forward** | DM, champion, influencer, blocker all transfer to the project team |
| **Products → Deliverables** | Each quoted product becomes a high-level deliverable within the project |

### Conversion Dialog (Proposed)

```
┌─────────────────────────────────────────────────┐
│  Convert to Project                     [✕]     │
├─────────────────────────────────────────────────┤
│                                                  │
│  Deal: ERP Implementation — Acme Corp           │
│  Value: $45,000                                  │
│                                                  │
│  Project Name: [Acme ERP Implementation    ]    │
│                                                  │
│  Template: ──────────────────────────────────┐  │
│  │  ERP Implementation (6 milestones)       ▼│  │
│  │  VPN Setup (4 milestones)                 │  │
│  │  Bulk SMS Integration (3 milestones)      │  │
│  │  Consulting (2 milestones)                │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Start Date: [2026-07-01]                        │
│  Target End:  [2026-09-30]                       │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Include stakeholders as project team    │   │
│  │  Link quotation to project budget        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│           [Cancel]  [Create Project]             │
└─────────────────────────────────────────────────┘
```

### Stakeholder Continuity

This is a critical architectural constraint. When a deal converts to a project, stakeholders must **not** be copied as flat records. The link back to the original deal contact must be preserved.

#### Continuity Chain

```
CrmContact (person)
    ↓
CrmDealContact / Deal Stakeholder (deal context)
    ├── influence_type (DM, champion, influencer, blocker)
    └── weight (relationship strength)
            ↓
Project Stakeholder (project context)
    ├── project_role (sponsor, point_of_contact, technical_reviewer, approver)
    ├── derived_from_contact_id → CrmContact
    └── derived_from_deal_id → CrmDeal
```

#### Why This Matters

| Scenario | Without Continuity | With Continuity |
|---|---|---|
| PM wants to know who the DM was during sales | Lost — only project role stored | Traceable: contact → deal influence → project role |
| Health score needs stakeholder coverage | Must re-identify stakeholders from scratch | Confidence score carries over from CRM-3 |
| Customer portal contacts | Must re-ask who the customer contacts are | Portal inherits contacts from project stakeholders |
| CRM-5 meeting logs | No link between meeting participants and project role | Meeting participants linked to project stakeholders |

#### Schema (Proposed)

| Field | Type | Notes |
|---|---|---|
| `project_id` | FK → CrmProject | |
| `contact_id` | FK → CrmContact | The actual person |
| `derived_from_deal_id` | FK → CrmDeal | NULL if added directly in project context |
| `project_role` | string | sponsor, point_of_contact, technical_reviewer, approver, team_member |
| `influence_type_at_conversion` | string | Snapshot of deal influence type when converted |
| `is_active` | boolean | |

#### UX

- The project **Team** section in the left panel shows stakeholders with their `project_role` badge
- Hover reveals the original influence type from the deal: "Was DM during sales"
- New stakeholders can be added directly in the project context (without a deal)
- Stakeholders inherited from the deal are visually marked with a "From Deal" badge

### Data Model Considerations

- `crm_projects` — project_id, deal_id (FK nullable — survives even if deal is deleted?), organization_id, name, status, start_date, target_end_date, actual_end_date, contract_value, template_slug
- `crm_project_templates` — template with name, category, default milestones
- `crm_project_stakeholders` — junction table linking project members to their project role, with `contact_id`, `derived_from_deal_id`, `project_role`, `influence_type_at_conversion`
- Decision needed: **soft delete protection** on `deal_id` — a won deal should not be deletable if a project references it
- Decision needed: **status lifecycle** — `draft → active → on_hold → completed → cancelled` (not the same as quotation lifecycle)

---

## Part 1.5: Project Template Engine

### Mandate

The template engine is the **heart of the conversion process**. It determines what kind of project a won deal becomes — which milestones, which deliverables, which team roles, which default timeline. Without it, every conversion starts from a blank slate.

### Template Structure

```
Template
 ├── name (e.g., "ERP Implementation")
 ├── category (erp, connectivity, vpn, bulk_sms, payment_gateway, custom_development, consulting)
 ├── is_active (boolean)
 └── Milestone Definitions (ordered)
        ├── name
        ├── description
        ├── default_duration_days
        ├── sort_order
        └── Deliverable Definitions (ordered)
               ├── name
               ├── description
               └── sort_order
```

### TUTIA Template Catalog (Proposed — 7 Templates)

| Template | Category | Milestones | Typical Duration |
|---|---|---|---|
| **ERP Implementation** | erp | Discovery → Configuration → Data Migration → UAT → Go Live → Hypercare | 12 weeks |
| **VPN Deployment** | vpn | Assessment → Provisioning → Testing → Handover | 4 weeks |
| **Connectivity Setup** | connectivity | Site Survey → Provisioning → Testing → Handover | 6 weeks |
| **Bulk SMS Integration** | bulk_sms | API Setup → Testing → Go Live | 2 weeks |
| **Payment Gateway Onboarding** | payment_gateway | Account Setup → Integration → Testing → Go Live | 4 weeks |
| **Custom Development** | custom_development | Requirements → Design → Development → QA → Deployment | Per SOW |
| **Consulting Engagement** | consulting | Kickoff → Assessment → Findings → Recommendations → Closure | 4 weeks |

### ERP Implementation Template (Example — Expanded)

```
ERP Implementation
 ├── 1. Discovery (2 weeks)
 │    ├── Requirements Document
 │    └── Gap Analysis Report
 ├── 2. Configuration (4 weeks)
 │    ├── System Configuration
 │    └── Internal Test Results
 ├── 3. Data Migration (2 weeks)
 │    ├── Data Mapping Document
 │    ├── Migration Execution Report
 │    └── Validation Report
 ├── 4. UAT (2 weeks)
 │    ├── Test Cases
 │    └── UAT Sign-off
 ├── 5. Go Live (1 week)
 │    ├── Production Deployment
 │    └── Cutover Plan
 └── 6. Hypercare (2 weeks)
      ├── Support Log
      ├── Handover Document
      └── Training Completion Report
```

### Design Decisions

| Decision | Rationale |
|---|---|
| **Templates stored in DB, not code** | PMs can create/edit templates via seeder or future UI without developer involvement |
| **Templates are flat (milestones + deliverables)** | No nested sub-milestones — keeps complexity manageable for CRM-4 |
| **Auto-selected by product category** | An ERP deal defaults to ERP Implementation template; PM can override during conversion |
| **Customizable after conversion** | Milestones and deliverables can be added/removed/reordered per project without affecting the template |
| **Template versioning deferred** | Templates evolve slowly; versioning can be added in CRM-6 if needed |

### Auto-Mapping: Products → Deliverables

When a deal with specific products converts, the template can auto-create certain deliverables:

| Product | Template Milestone | Auto-created Deliverable |
|---|---|---|
| ERP Pro (license) | Configuration | "ERP Pro License Setup" |
| Dedicated Internet | Connectivity Setup | "Circuit Provisioning" |
| Site-to-Site VPN | VPN Deployment | "VPN Tunnel Configuration" |
| SMS API | Bulk SMS Integration | "API Key Provisioning" |

This mapping is defined in a `product_template_map` table or as configuration within each template. It is optional in CRM-4 — if no map exists, the template is applied as-is.

---

## Part 2: Project Workspace

### Layout: 3-Panel (Project Command Center)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Projects  /  {Project Name}                     [Edit]  │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│  LEFT    │  CENTER                          │  RIGHT        │
│  280px   │  flex-1                          │  320px        │
│          │                                  │               │
│  Team    │  Header                          │  Timeline     │
│   - PM   │    Title · Status · Health       │  (filtered    │
│   - TL   │    Budget · Timeline             │   to project) │
│   - Devs │                                  │               │
│          │  Progress Bar                    │  Event types: │
│  Risks   │  (milestones completed / total)  │   activities  │
│   - risk │                                  │   milestones  │
│   - risk │  Milestone Timeline              │   risks/iss.  │
│          │   ┌──────────────────────────┐   │   scope chg   │
│  Issues  │   │ Discovery      [33%] ██░░│   │   approvals   │
│   - issue│   │ Config         [ 0%] ░░░░│   │               │
│   - issue│   │ Data Migration  [ 0%] ░░░░│   │               │
│          │   │ UAT            [ 0%] ░░░░│   │               │
│  Depend. │   │ Go Live        [ 0%] ░░░░│   │               │
│   - dep  │   │ Hypercare      [ 0%] ░░░░│   │               │
│          │   └──────────────────────────┘   │               │
│  Delivery│                                  │               │
│  Health  │  Deliverables Table              │               │
│  🟢 85%  │  (per milestone)                 │               │
│          │                                  │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

### Left Panel — Project Intelligence

| Section | Content |
|---|---|
| **Team** | Project Manager, Technical Lead, Consultants, Developers, Support |
| **Risks** | List with severity, probability, impact, owner, mitigation |
| **Issues** | List with severity, status, owner, resolution |
| **Dependencies** | Cross-milestone or external dependencies |
| **Delivery Health** | HealthScoreBadge (reuse pattern from CRM-2) with factor breakdown |

### Center Panel — Project Command Center

| Section | Content |
|---|---|
| **Header** | Project name, status badge, Delivery Health badge, budget (contract value), timeline (start → target end) |
| **Progress Bar** | Overall completion: `X of Y milestones completed (Z%)` |
| **Milestone Timeline** | Vertical list of milestones with progress bars, dates, and status badges |
| **Deliverables Table** | Per-milestone breakdown: deliverable name, owner, due date, status, acceptance |

### Right Panel — Universal Timeline

- Same ActivityTimeline component from CRM-2/CRM-3, filtered to this project
- New event types added (see Part 9)

---

## Part 3: Delivery Health Score

### Concept

Mirrors the CRM-2 Health Score pattern but adapted for delivery. A computed 0–100 score with tier classification.

### Factors

| Factor | Weight | Criteria |
|---|---|---|
| **Milestone Progress** | 30% | % of milestones completed vs expected at this point in schedule |
| **Schedule Variance** | 25% | Days ahead/behind plan. Penalty increases with delay. On-time = 100%, 1 week late = 70%, 2 weeks = 40%, 3+ weeks = 10% |
| **Open Risks** | 15% | High-severity risks reduce score. 0 critical risks = 100%, 1+ critical = 50%, 2+ critical = 20% |
| **Open Issues** | 15% | Unresolved blocking issues reduce score. 0 blockers = 100%, 1 blocker = 60%, 2+ blockers = 20% |
| **Customer Sentiment** | 15% | Manually set by PM (positive/neutral/negative). Positive = 100%, Neutral = 60%, Negative = 20%. Future: derive from communication patterns |

### Formula

```
Delivery Health = Σ(factor_weight × factor_score) / total_weight
```

### Output

| Tier | Range | Color |
|---|---|---|
| **Healthy** | 70–100 | `#34d399` (green) |
| **At Risk** | 40–69 | `#fbbf24` (yellow) |
| **Critical** | 0–39 | `#f87171` (red) |

### Display

Same HealthScoreBadge component from CRM-2, extended to accept delivery health data. Tooltip shows factor breakdown.

### Health Contributors (Positive & Negative Breakdown)

Following the same pattern as CRM-2 Deal Health, the Delivery Health Score must be transparent — not a single number, but a list of contributors that explain **why** the score is what it is.

#### Example Display

```
Delivery Health: 62  (At Risk)
  ▲ Positive Contributors          ▼ Negative Contributors
     +25 Milestones On Track          -20 Schedule Delay (2 weeks behind)
     +10 Customer Feedback Good       -15 3 Open Risks (1 critical)
                                       -10 UAT Sign-off Pending (overdue)
```

#### Contributor Types

| Direction | Contributor | Generated When |
|---|---|---|
| Positive | **Milestones On Track** | Milestone progress ≥ 80% of expected |
| Positive | **All Milestones Completed** | All milestones done |
| Positive | **Customer Feedback Positive** | Sentiment = positive |
| Positive | **Ahead of Schedule** | Actual end date < target end date |
| Negative | **Schedule Delay** | Any milestone past its end_date |
| Negative | **Open Risks** | Any risk with severity ≥ high |
| Negative | **Blocking Issues** | Any issue with severity = blocker |
| Negative | **Milestone Overdue** | Specific milestone past its end_date |
| Negative | **Customer Feedback Negative** | Sentiment = negative |
| Negative | **Stakeholder Churn** | Key stakeholder (sponsor) removed from project |

#### Implementation

- `DeliveryHealthContributor` DTO with: `type` (positive/negative), `label` (string), `impact` (signed integer, e.g. +25 or -20), `factor` (which health factor it maps to)
- Returned alongside the `score`, `tier`, and `factor_breakdown` from the health service
- HealthScoreBadge component extended to render positive (green) and negative (red) contributors in tooltip
- Same pattern as `HealthScoreContributor` in CRM-2 — consistent UX across deal and delivery

---

## Part 4: Milestone Operating System

### Philosophy

Milestones are **not** a task list. They are the primary organizational unit of a project — each milestone represents a phase with a clear start, end, and deliverable set.

### Structure

```
Project
   └── Milestone
          ├── name, description
          ├── start_date, end_date
          ├── status (not_started → in_progress → completed → accepted)
          ├── progress (0–100%, computed from deliverables)
          ├── owner
          └── Deliverables
                 ├── name, description
                 ├── owner, due_date
                 ├── status (pending → in_progress → submitted → accepted → rejected)
                 └── acceptance_criteria (text)
```

### ERP Implementation Template (Example — 6 Milestones)

| Milestone | Typical Duration | Key Deliverables |
|---|---|---|
| **Discovery** | 2 weeks | Requirements document, gap analysis, project plan |
| **Configuration** | 4 weeks | System configured per requirements, internal testing |
| **Data Migration** | 2 weeks | Data mapping, migration run, validation report |
| **UAT** | 2 weeks | Test cases, sign-off document |
| **Go Live** | 1 week | Production deployment, cutover plan |
| **Hypercare** | 2 weeks | Support log, handover document, training completion |

### Design Decisions

- Milestones should be **reorderable** (drag within a project)
- Each milestone has a **health indicator** separate from the project health
- Completed milestones are **collapsible** in the UI
- Template milestones can be **customized** per project (add/remove/reorder after conversion)

### Delivery Stage Framework: Status Lifecycles

Every entity in the delivery layer has a defined status lifecycle. These must be documented before implementation to prevent inconsistent state transitions.

#### Project Status Lifecycle

```
                ┌──────────┐
                │ Planned  │
                └────┬─────┘
                     ▼
                ┌──────────┐
          ┌─────│ Initiating│─────┐
          │     └─────┬────┘     │
          │           ▼          │
          │    ┌──────────┐      │
          │    │  Active  │      │
          │    └────┬─────┘      │
          │     ┌──┴──┐         │
          │     ▼     ▼          │
          │ ┌──────┐ ┌────────┐ │
          │ │At Risk│ │On Hold │ │
          │ └──┬───┘ └───┬────┘ │
          │    └────┬────┘      │
          │         ▼           │
          │   ┌──────────┐      │
          └──▶│Completed │      │
              └────┬─────┘      │
                   ▼            │
              ┌──────────┐      │
              │ Cancelled│◀─────┘
              └──────────┘
```

| Status | Description | Can transition to |
|---|---|---|
| `planned` | Project created but not started | initiating |
| `initiating` | Kickoff in progress, team being assembled | active, cancelled |
| `active` | Work in progress | on_hold, at_risk, completed, cancelled |
| `on_hold` | Paused (customer delay, resource issue) | active, cancelled |
| `at_risk` | Active but flagged — health score < 40 | active, on_hold, cancelled |
| `completed` | All milestones done, final deliverables accepted | — (terminal) |
| `cancelled` | Project terminated before completion | — (terminal) |

#### Milestone Status Lifecycle

```
pending → in_progress → completed
                  ↓
              blocked
```

| Status | Description | Can transition to |
|---|---|---|
| `pending` | Not yet started | in_progress |
| `in_progress` | Work actively underway | completed, blocked |
| `blocked` | Blocked by dependency, risk, or customer | in_progress |
| `completed` | All deliverables submitted and accepted | — (terminal) |

#### Deliverable Status Lifecycle

```
pending → in_progress → submitted → accepted
                                    ↓
                                 rejected
```

| Status | Description | Can transition to |
|---|---|---|
| `pending` | Not started | in_progress |
| `in_progress` | Being worked on | submitted |
| `submitted` | Handed off for customer review | accepted, rejected |
| `accepted` | Customer signed off | — (terminal) |
| `rejected` | Customer rejected; revisions needed | in_progress |

#### Why This Matters Before Implementation

- Prevents invalid transitions (e.g., `planned` → `completed`)
- Ensures consistent state across all UI components (badge colors, workflow buttons, action availability)
- The timeline events (Part 9) are triggered by these transitions — if the lifecycle is undefined, the events have no trigger points
- The Delivery Health Score (Part 3) depends on milestone status to compute progress — ambiguous status = broken health

---

## Part 5: Risks & Issues Framework

### Distinct Entities

| Entity | Definition | Example |
|---|---|---|
| **Risk** | Something that **may** happen | "Key stakeholder may leave during implementation" |
| **Issue** | Something that **has** happened | "Server delivery delayed by 2 weeks" |

### Risk Schema (Proposed)

| Field | Type | Notes |
|---|---|---|
| `project_id` | FK → CrmProject | |
| `description` | text | |
| `severity` | enum | critical, high, medium, low |
| `probability` | enum | high, medium, low |
| `impact` | text | What happens if it materializes |
| `status` | enum | identified → being_mitigated → closed |
| `owner_id` | FK → User | |
| `mitigation_plan` | text | |
| `created_at` | timestamp | |

### Issue Schema (Proposed)

| Field | Type | Notes |
|---|---|---|
| `project_id` | FK → CrmProject | |
| `description` | text | |
| `severity` | enum | blocker, critical, major, minor |
| `status` | enum | open → in_progress → resolved → closed |
| `owner_id` | FK → User | |
| `resolution` | text | How it was resolved |
| `resolved_at` | timestamp | |
| `created_at` | timestamp | |

### UX

- Risks and issues live in the **left panel** of the Project Workspace
- Color-coded severity badges (reuse InfluenceBadge component pattern)
- Inline "Add Risk" / "Add Issue" forms
- Click to expand full detail with mitigation/resolution
- Risks and issues that are created/updated/resolved emit timeline events

---

## Part 6: Resource Assignment Layer

### Principle

Lightweight assignment — not workforce planning, not timesheets. Just enough to know who is working on what.

### Team Roles (TUTIA-specific)

| Role | Typical Assignment |
|---|---|
| **Project Manager** | 1 per project (required) |
| **Technical Lead** | 1 per project (required) |
| **Consultant** | 1+ per project |
| **Developer** | 0+ per project |
| **Support Engineer** | 0+ per project |

### Schema (Proposed)

| Field | Type | Notes |
|---|---|---|
| `project_id` | FK → CrmProject | |
| `user_id` | FK → User | |
| `role` | string | pm, tech_lead, consultant, developer, support |
| `allocation_percent` | integer | 0–100 |
| `assigned_at` | timestamp | |
| `unassigned_at` | timestamp | nullable |

### UX

- **Left panel** shows team as a compact avatar list with role labels
- Hover or click shows allocation %
- "Assign Member" button opens user selector with role dropdown
- No utilization dashboards, no capacity planning in CRM-4

---

## Part 7: Customer Visibility Model

### The Two Views

```
┌──────────────────────────────────────┐
│           TUTIA CRM                   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Internal View (PM, Team)    │   │
│  │  - Full project workspace    │   │
│  │  - Risks, issues, all data   │   │
│  └──────────────────────────────┘   │
│              │                       │
│              ▼                       │
│  ┌──────────────────────────────┐   │
│  │  Customer View (Portal)†     │   │
│  │  - Milestone progress only   │   │
│  │  - Key dates                 │   │
│  │  - Deliverable status        │   │
│  │  - Contact form              │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘

† Customer Portal is CRM-5 scope. CRM-4 must model the data so
  that the portal view is a simple permission filter, not a redesign.
```

### Data Modeling for Future Portal

| Requirement | How CRM-4 Prepares |
|---|---|
| Portal shows only approved data | Add `is_visible_to_customer` flag on milestones and deliverables |
| Customer sees status, not complexity | Project workspace has a `customer_safe` view that excludes risks/issues |
| Customer approves deliverables | Add `customer_approved_at` and `customer_approved_by` on deliverables |
| Customer communication history | All project-scope changes emit timeline events visible to the portal |

### Decision

Model projects with a `visibility` field from day one:

- `internal` — only TUTIA team
- `customer` — visible in future portal

Even if the portal is not built in CRM-4, the data model must not require a migration to add it later.

---

## Part 8: Financial Tracking (Light)

### Scope

Not ERP. Not invoicing. Just enough tracking to answer:

> "How much of this contract has been delivered, billed, and collected?"

### Fields on Project

| Field | Type | Notes |
|---|---|---|
| `contract_value` | decimal | From deal, editable |
| `change_order_total` | decimal | Accumulated change requests |
| `total_value` | computed | contract_value + change_order_total |
| `billed_amount` | decimal | Invoiced to customer so far |
| `collected_amount` | decimal | Actually received |
| `billed_percent` | computed | (billed / total) × 100 |
| `collected_percent` | computed | (collected / billed) × 100 |

### Change Request Architecture

In ERP and consulting projects, scope changes are not exceptions — they are inevitable. Change Requests must be a first-class entity, not a footnote.

#### Lifecycle

```
identified → assessed → approved/rejected → implemented → closed
```

#### Schema (Proposed)

| Field | Type | Notes |
|---|---|---|
| `project_id` | FK → CrmProject | |
| `title` | string | Short description |
| `description` | text | Full scope change detail |
| `status` | enum | identified, assessed, approved, rejected, implemented, closed |
| `cost_impact` | decimal | Additional cost (positive) or credit (negative) |
| `timeline_impact_days` | integer | Number of days added to project (negative = reduction) |
| `requested_by` | string | Customer contact who requested |
| `approved_at` | timestamp | |
| `approved_by` | FK → User | |
| `rejection_reason` | text | |
| `created_at` | timestamp | |

#### Financial Impact Model

```
Project Financial View:
  contract_value (original)    $45,000
  + change_orders (approved)   +$5,200  ← sum of approved cost_impacts
  = total_value                $50,200
  - billed_amount              $30,000
  = unbilled                   $20,200
  - collected_amount           $25,000
  = outstanding                $5,000
```

#### UX

- Change requests appear in the **center panel** of the Project Workspace as a tab section
- Status workflow buttons: Assess → Approve / Reject → Mark Implemented
- Each CR emits a `scope_changed` timeline event with cost + timeline impact
- The financial summary at the top of the workspace updates automatically
- No POs, no line-item accounting, no tax calculation in CRM-4

---

## Part 9: Universal Timeline Extension

### New Event Types for CRM-4

The ActivityTimeline component from CRM-2 must be extended to handle these project events:

| Event Type | Description | System/Manual |
|---|---|---|
| `project_created` | Project was created from deal | System |
| `milestone_created` | New milestone added | Manual |
| `milestone_completed` | Milestone marked complete | Manual |
| `milestone_delayed` | Milestone end date pushed | System (detected) |
| `deliverable_submitted` | Deliverable ready for review | Manual |
| `deliverable_accepted` | Customer accepted deliverable | Manual |
| `risk_created` | New risk identified | Manual |
| `risk_mitigated` | Risk closed | Manual |
| `issue_created` | New issue logged | Manual |
| `issue_resolved` | Issue resolved | Manual |
| `project_delayed` | Project target end date moved | System (detected) |
| `project_completed` | All milestones done | System |
| `scope_changed` | Change order approved | Manual |
| `team_member_assigned` | New resource added | System |
| `health_changed` | Delivery Health tier changed | System (detected) |

### Implementation Note

- The existing `crm_action_events` table or `crm_activities` table should accommodate these new types without schema changes
- If the current schema uses an enum for event type, it must be changed to a string column before CRM-4 implementation
- The ActivityTimeline component should filter by event type while remaining a single unified stream

---

## Part 10: CRM-5 Compatibility

### Explicit Design Targets

Every project entity in CRM-4 must be designed with these future integrations in mind:

| CRM-5 Feature | CRM-4 Requirement |
|---|---|
| **Email Integration** | Each project needs a `communication_channel` identifier so emails can be linked |
| **SMS/WhatsApp** | Timeline events must carry a `channel` field (system/email/sms/whatsapp) |
| **Meeting Logs** | Meeting activities can already be created via ActivityTimeline; extend with `meeting_url` and `recording_url` |
| **Customer Portal** | `visibility` field on milestones/deliverables; `customer_safe` view on workspace |
| **Automated Notifications** | Health changes, milestone completions, and risk escalations must emit events consumable by the notification system built in CRM-1 |
| **Reporting / BI** | All financial fields, milestone dates, and health snapshots should be structured for aggregation queries |

### Non-Negotiable

> No CRM-4 migration or model change should require a **destructive migration** (drop column, change type) when CRM-5 is implemented. All additions in CRM-5 should be additive — new columns, new tables, new indexes — never a redesign of CRM-4 structures.

---

## Part 11: CRM-4 Entity Map

### Purpose

A high-level map of all entities that will be created in CRM-4, their relationships, and their cardinality. This prevents scope creep during implementation by defining exactly what belongs in CRM-4 and what does not.

### Entity Relationship Overview

```
CrmDeal (existing)
    │
    │ 1     1 (optional)
    ├─────── CrmProject  ←───┐
    │         │               │
    │         │ 1             │ N
    │         ├── CrmMilestone──── CrmDeliverable
    │         │               1          N
    │         ├── CrmProjectStakeholder──── CrmContact (existing)
    │         │     N                       1
    │         ├── CrmProjectRisk
    │         ├── CrmIssue
    │         ├── CrmChangeOrder
    │         └── CrmProjectMember──── User (existing)
    │                              N      1
    │
    │ 1     N
    └─────── CrmQuotation (existing — linked, not duplicated)
```

### Entity Catalog

#### Core Entities

| Entity | Description | Key Relationships | CRUD in CRM-4? |
|---|---|---|---|
| **CrmProject** | A delivery project created from a won deal | belongsTo CrmDeal, belongsTo CrmOrganization, hasMany milestones, hasMany stakeholders, hasMany risks, hasMany issues, hasMany changeOrders, hasMany members | Yes — full lifecycle |
| **CrmMilestone** | A phase within a project (not a task) | belongsTo CrmProject, hasMany CrmDeliverables | Yes — create, reorder, complete |
| **CrmDeliverable** | An output of a milestone | belongsTo CrmMilestone | Yes — create, submit, accept/reject |

#### Supporting Entities

| Entity | Description | Key Relationships | CRUD in CRM-4? |
|---|---|---|---|
| **CrmProjectStakeholder** | A contact linked to a project with a role | belongsTo CrmProject, belongsTo CrmContact, nullable belongsTo CrmDeal (origin) | Yes — add, remove, change role |
| **CrmProjectRisk** | Something that may impact the project | belongsTo CrmProject, belongsTo User (owner) | Yes — identify, mitigate, close |
| **CrmIssue** | Something that has impacted the project | belongsTo CrmProject, belongsTo User (owner) | Yes — log, resolve, close |
| **CrmChangeOrder** | A scope change with cost/timeline impact | belongsTo CrmProject, belongsTo User (approver) | Yes — assess, approve, reject |
| **CrmProjectMember** | A TUTIA team member assigned to a project | belongsTo CrmProject, belongsTo User | Yes — assign, unassign, role |

#### Configuration Entities

| Entity | Description | Key Relationships | CRUD in CRM-4? |
|---|---|---|---|
| **CrmProjectTemplate** | Predefined milestone/deliverable structure | hasMany milestone definitions (JSON or related table) | Seeder-only in CRM-4 |
| **CrmProductTemplateMap** | Maps a product to a template + auto-created deliverables | belongsTo CrmProduct, belongsTo CrmProjectTemplate | Seeder-only in CRM-4 |

### What Is NOT in CRM-4 Entity Scope

| Entity | Rationale |
|---|---|
| Task / Sub-task | Milestone + Deliverable is the right granularity for CRM-4 |
| Timesheet Entry | Deferred to CRM-7 |
| Invoice | Deferred to CRM-6 |
| Purchase Order | Not planned — TUTIA sells services, not goods |
| Customer Portal User | Deferred to CRM-5 |
| Automated Notification Rule | Deferred to CRM-5 |
| Delivery Note / Handover Certificate | A deliverable can represent this; no separate entity needed |

### Entity Count Summary

| Category | Count |
|---|---|
| Core entities | 3 (Project, Milestone, Deliverable) |
| Supporting entities | 5 (Stakeholder, Risk, Issue, ChangeOrder, Member) |
| Configuration entities | 2 (Template, ProductMap) |
| **Total new entities** | **10** |

This is the maximum scope. If any of these grows beyond CRM-4, it should be flagged during implementation.

---

## Part 12: What Not to Build in CRM-4

| Feature | Reason to Defer | Target |
|---|---|---|
| **Gantt Engine** | Complex, many edge cases. A milestone list with dates is sufficient. | CRM-6+ |
| **Full Kanban Task Board** | Tasks are deliverables within milestones. A board view is nice but not essential. | CRM-5+ |
| **Timesheets** | Requires hourly tracking, approval workflows, payroll integration. Separate product. | CRM-7+ |
| **Full Invoicing** | Requires tax calculations, PDF generation, payment reconciliation. Separate product. | CRM-6+ |
| **Helpdesk / Ticketing** | Different domain. Customer portal in CRM-5 will include contact form. | CRM-8+ |
| **Resource Capacity Planning** | Requires utilization dashboards, forecasting, conflict detection. | CRM-6+ |
| **Budget vs Actual** | Requires timesheet data to compute actual cost. Not meaningful without it. | CRM-7+ |

---

## Part 13: Delivery Order (Proposed)

1. **Design approval** — this document ✅ (pending)
2. **Migration 300001** — `crm_projects`, `crm_project_templates`, `crm_project_stakeholders`, `crm_milestones`, `crm_deliverables`, `crm_risks`, `crm_issues`, `crm_change_orders`, update `crm_action_events` type to string if needed
3. **Models** — CrmProject, CrmMilestone, CrmDeliverable, CrmProjectRisk, CrmIssue, CrmChangeOrder, CrmProjectTemplate
4. **Deal → Project Conversion Service** — One-click conversion with template application
5. **Delivery Health Score Service** — Computed score feeding the HealthScoreBadge
6. **Controllers** — ProjectController (CRUD + convert), MilestoneController, DeliverableController
7. **Project Workspace** — 3-panel with team, risks, issues, milestones, deliverables, timeline
8. **Financial Tracking** — Change orders, billed/collected fields on project workspace
9. **Universal Timeline Extension** — New event types + filtering
10. **Tests** — Full coverage all new features
11. **CRM-4 Completion Report**

---

## Architectural Decisions Summary (Preliminary)

| Decision | Proposal | Rationale |
|---|---|---|
| Project → Deal relationship | FK with soft-delete protection | Won deal should never be deleted |
| Milestone vs Task | Milestone = phase, Deliverable = output | Keeps scope lean; avoids task management scope creep |
| Risks vs Issues | Separate tables (not polymorphic) | Different lifecycle, severity, and resolution patterns |
| Customer visibility | `visibility` field + `customer_safe` view | Portal-ready from day one without portal code |
| Financial tracking | Fields on project + change_orders table | Lightweight; no invoicing logic needed |
| Timeline events | String type (not enum) on action_events | Allows adding new event types without migration |
| Templates | Database rows, not code | PMs can create/modify templates without developer involvement |
| Health Score | Reuse HealthScoreBadge component | Consistent UX; same tooltip/factor breakdown pattern |

---

## Scoring Rubric for Approval

Before CRM-4 implementation begins, this document should score **7/10 or higher** against:

| Criterion | Weight | Description |
|---|---|---|
| Architectural soundness | 25% | Will these decisions survive CRM-5 through CRM-8? |
| Scope containment | 25% | Does it avoid building Gantt, timesheets, invoicing? |
| UX consistency | 20% | Does it follow the CRM-2/CRM-3 command center pattern? |
| TUTIA-specific relevance | 20% | Does it solve real problems for ERP/connectivity/VPN delivery? |
| Migration readiness | 10% | Are the data model decisions clear enough to write a migration? |

---

*This document is architectural and design-only. No implementation begins until the vision is reviewed and approved.*
