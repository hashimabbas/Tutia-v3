# CRM-4 Architecture & Data Model Design

## Document Purpose

This document translates the CRM-4 vision (`crm-4-project-os-vision.md`) into a concrete architecture ready for implementation. It covers database design, entity relationships, service layer, API boundaries, permissions, and directory structure.

**Status:** Pre-implementation — ready for review  
**Target Migrations:** 1 (300001)  
**Target Models:** 10  
**Target Controllers:** 4  
**Target Frontend Pages:** 3  

---

## 1. Database Architecture

### Migration Strategy

A single migration `2026_06_30_300001_add_crm4_project_tables.php` creates all CRM-4 tables. This follows the same pattern as CRM-3 migration `200000`.

### Table List

| # | Table | Type | Description |
|---|---|---|---|
| 1 | `crm_project_templates` | Configuration | Predefined milestone/deliverable structures |
| 2 | `crm_template_milestones` | Configuration | Milestone definitions within a template |
| 3 | `crm_template_deliverables` | Configuration | Deliverable definitions within a template milestone |
| 4 | `crm_projects` | Core | Projects converted from won deals |
| 5 | `crm_project_stakeholders` | Supporting | Contacts linked to a project with a role |
| 6 | `crm_project_members` | Supporting | TUTIA team members assigned to a project |
| 7 | `crm_milestones` | Core | Phases within a project |
| 8 | `crm_deliverables` | Core | Outputs of a milestone |
| 9 | `crm_project_risks` | Supporting | Events that may impact the project |
| 10 | `crm_issues` | Supporting | Events that have impacted the project |
| 11 | `crm_change_orders` | Supporting | Scope changes with cost/timeline impact |

### Proposed Schema

#### `crm_project_templates`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| name | VARCHAR(255) | NOT NULL |
| category | VARCHAR(50) | NOT NULL — erp, vpn, connectivity, bulk_sms, payment_gateway, custom_development, consulting |
| description | TEXT | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| UNIQUE | (name) | |

#### `crm_template_milestones`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| template_id | BIGINT | FK → crm_project_templates, CASCADE |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| default_duration_days | SMALLINT | DEFAULT 14 |
| sort_order | SMALLINT | DEFAULT 0 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| UNIQUE | (template_id, sort_order) | |
| INDEX | (template_id) | |

#### `crm_template_deliverables`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| template_milestone_id | BIGINT | FK → crm_template_milestones, CASCADE |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| sort_order | SMALLINT | DEFAULT 0 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| UNIQUE | (template_milestone_id, sort_order) | |
| INDEX | (template_milestone_id) | |

#### `crm_projects`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| deal_id | BIGINT | FK → crm_deals, NULLABLE, ON DELETE SET NULL |
| organization_id | BIGINT | FK → crm_organizations, CASCADE |
| template_id | BIGINT | FK → crm_project_templates, NULLABLE, ON DELETE SET NULL |
| name | VARCHAR(255) | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'planned' — planned, initiating, active, on_hold, at_risk, completed, cancelled |
| contract_value | DECIMAL(14,2) | DEFAULT 0 |
| change_order_total | DECIMAL(14,2) | DEFAULT 0 (computed from approved change orders) |
| total_value | DECIMAL(14,2) | VIRTUAL (contract_value + change_order_total) |
| billed_amount | DECIMAL(14,2) | DEFAULT 0 |
| collected_amount | DECIMAL(14,2) | DEFAULT 0 |
| start_date | DATE | NULLABLE |
| target_end_date | DATE | NULLABLE |
| actual_end_date | DATE | NULLABLE |
| customer_sentiment | VARCHAR(10) | NULLABLE — positive, neutral, negative |
| health_score | SMALLINT | VIRTUAL (computed) |
| health_tier | VARCHAR(10) | VIRTUAL (computed) |
| visibility | VARCHAR(10) | DEFAULT 'internal' — internal, customer |
| created_by | BIGINT | FK → users, NULLABLE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| INDEX | (organization_id) | |
| INDEX | (deal_id) | |
| INDEX | (status) | |
| INDEX | (template_id) | |

#### `crm_project_stakeholders`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| project_id | BIGINT | FK → crm_projects, CASCADE |
| contact_id | BIGINT | FK → crm_contacts, CASCADE |
| derived_from_deal_id | BIGINT | FK → crm_deals, NULLABLE, ON DELETE SET NULL |
| project_role | VARCHAR(30) | NOT NULL — sponsor, point_of_contact, technical_reviewer, approver, team_member |
| influence_type_at_conversion | VARCHAR(30) | NULLABLE — snapshot of deal influence type |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| UNIQUE | (project_id, contact_id) | |
| INDEX | (project_id) | |
| INDEX | (contact_id) | |

#### `crm_project_members`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| project_id | BIGINT | FK → crm_projects, CASCADE |
| user_id | BIGINT | FK → users, CASCADE |
| role | VARCHAR(30) | NOT NULL — pm, tech_lead, consultant, developer, support |
| allocation_percent | SMALLINT | DEFAULT 100 — 0-100 |
| assigned_at | TIMESTAMP | |
| unassigned_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| UNIQUE | (project_id, user_id, unassigned_at) | |
| INDEX | (project_id) | |
| INDEX | (user_id) | |

#### `crm_milestones`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| project_id | BIGINT | FK → crm_projects, CASCADE |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| status | VARCHAR(20) | DEFAULT 'pending' — pending, in_progress, blocked, completed |
| start_date | DATE | NULLABLE |
| end_date | DATE | NULLABLE |
| actual_end_date | DATE | NULLABLE |
| sort_order | SMALLINT | DEFAULT 0 |
| owner_id | BIGINT | FK → users, NULLABLE, ON DELETE SET NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| UNIQUE | (project_id, sort_order) | |
| INDEX | (project_id) | |
| INDEX | (status) | |

#### `crm_deliverables`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| milestone_id | BIGINT | FK → crm_milestones, CASCADE |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| status | VARCHAR(20) | DEFAULT 'pending' — pending, in_progress, submitted, accepted, rejected |
| due_date | DATE | NULLABLE |
| owner_id | BIGINT | FK → users, NULLABLE, ON DELETE SET NULL |
| acceptance_criteria | TEXT | NULLABLE |
| is_visible_to_customer | BOOLEAN | DEFAULT true |
| customer_approved_at | TIMESTAMP | NULLABLE |
| customer_approved_by | VARCHAR(255) | NULLABLE — name or email of approver |
| sort_order | SMALLINT | DEFAULT 0 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| INDEX | (milestone_id) | |
| INDEX | (status) | |

#### `crm_project_risks`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| project_id | BIGINT | FK → crm_projects, CASCADE |
| description | TEXT | NOT NULL |
| severity | VARCHAR(10) | DEFAULT 'medium' — critical, high, medium, low |
| probability | VARCHAR(10) | DEFAULT 'medium' — high, medium, low |
| impact | TEXT | NULLABLE |
| status | VARCHAR(30) | DEFAULT 'identified' — identified, being_mitigated, closed |
| owner_id | BIGINT | FK → users, NULLABLE, ON DELETE SET NULL |
| mitigation_plan | TEXT | NULLABLE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| INDEX | (project_id) | |
| INDEX | (status) | |

#### `crm_issues`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| project_id | BIGINT | FK → crm_projects, CASCADE |
| description | TEXT | NOT NULL |
| severity | VARCHAR(10) | DEFAULT 'major' — blocker, critical, major, minor |
| status | VARCHAR(20) | DEFAULT 'open' — open, in_progress, resolved, closed |
| owner_id | BIGINT | FK → users, NULLABLE, ON DELETE SET NULL |
| resolution | TEXT | NULLABLE |
| resolved_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| INDEX | (project_id) | |
| INDEX | (status) | |

#### `crm_change_orders`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| project_id | BIGINT | FK → crm_projects, CASCADE |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| status | VARCHAR(20) | DEFAULT 'identified' — identified, assessed, approved, rejected, implemented, closed |
| cost_impact | DECIMAL(14,2) | DEFAULT 0 |
| timeline_impact_days | SMALLINT | DEFAULT 0 — positive = delay, negative = reduction |
| requested_by | VARCHAR(255) | NULLABLE |
| approved_at | TIMESTAMP | NULLABLE |
| approved_by | BIGINT | FK → users, NULLABLE, ON DELETE SET NULL |
| rejection_reason | TEXT | NULLABLE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| INDEX | (project_id) | |
| INDEX | (status) | |

---

## 2. Entity Relationships

```
┌──────────────────────┐         ┌───────────────────────┐
│   CrmDeal (existing) │         │ CrmOrganization (ext) │
└────────┬─────────────┘         └───────────┬───────────┘
         │                                    │
         │ 1                           1      │
         ▼                                    ▼
┌───────────────────────────────────────────────────────────┐
│                     CrmProject                             │
│  id, deal_id, organization_id, template_id, name, status   │
│  contract_value, change_order_total, billed_amount, ...    │
│  start_date, target_end_date, actual_end_date, visibility  │
└──────┬────────────┬──────────────┬────────────┬────────────┘
       │             │              │            │
       │ 1           │ 1            │ 1          │ 1
       ▼             ▼              ▼            ▼
┌────────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐
│ CrmMilestone│ │CrmProj. │ │CrmProj.  │ │ CrmIssue     │
│            │ │Stakehold│ │Member     │ │              │
│ id, proj_id│ │         │ │           │ │ id, proj_id  │
│ name, stat.│ │id,contac│ │id,user_id │ │ description  │
│ start, end │ │project_r│ │role,alloc│ │ severity     │
│ sort_order │ │is_active│ │assigned_at│ │ status       │
└──────┬─────┘ └─────────┘ └───────────┘ └──────────────┘
       │ 1
       ▼
┌────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│ CrmDeliverable  │     │ CrmProjectRisk    │     │ CrmChangeOrder   │
│                 │     │                   │     │                  │
│ id, milestone   │     │ id, project_id    │     │ id, project_id   │
│ name, status    │     │ description       │     │ title, status    │
│ due_date, owner │     │ severity, prob.   │     │ cost_impact      │
│ acceptance_crit.│     │ status, mitigation│     │ timeline_impact  │
│ cust_visible    │     │ owner_id          │     │ approved_by      │
└─────────────────┘     └───────────────────┘     └──────────────────┘
```

### Relationship Summary

| Parent | Child | Cardinality | FK Column | On Delete |
|---|---|---|---|---|
| CrmDeal | CrmProject | 1 → 0..1 | deal_id | SET NULL |
| CrmOrganization | CrmProject | 1 → 0..N | organization_id | CASCADE |
| CrmProjectTemplate | CrmProject | 1 → 0..N | template_id | SET NULL |
| CrmProject | CrmMilestone | 1 → 0..N | project_id | CASCADE |
| CrmMilestone | CrmDeliverable | 1 → 0..N | milestone_id | CASCADE |
| CrmProject | CrmProjectStakeholder | 1 → 0..N | project_id | CASCADE |
| CrmContact | CrmProjectStakeholder | 1 → 0..N | contact_id | CASCADE |
| CrmDeal | CrmProjectStakeholder | 1 → 0..N | derived_from_deal_id | SET NULL |
| CrmProject | CrmProjectMember | 1 → 0..N | project_id | CASCADE |
| User | CrmProjectMember | 1 → 0..N | user_id | CASCADE |
| CrmProject | CrmProjectRisk | 1 → 0..N | project_id | CASCADE |
| CrmProject | CrmIssue | 1 → 0..N | project_id | CASCADE |
| CrmProject | CrmChangeOrder | 1 → 0..N | project_id | CASCADE |

---

## 3. Deal → Project Conversion Flow

### Service: `CrmDealToProjectConversionService`

```
Input:  CrmDeal (won), template_id, start_date, target_end_date
Output: CrmProject
Side effects:
  - Marks deal as converted (converted_to_project_at timestamp on crm_deals)
  - Creates timeline event: project_created
  - Creates audit log entry
```

### Conversion Steps (Ordered)

| Step | Action | Details |
|---|---|---|
| 1 | Validate | Deal must have status = 'won'. Deal must not already have a project. |
| 2 | Resolve template | If template_id provided, load template + milestones + deliverables. If not, auto-select by deal's primary product category. |
| 3 | Create project | Insert into `crm_projects` with deal_id, organization_id, template_id, name, status='planned', contract_value (from deal), start_date, target_end_date |
| 4 | Create milestones | For each template milestone: insert into `crm_milestones` with project_id, name, description, start_date (computed from previous milestone end), end_date, sort_order |
| 5 | Create deliverables | For each template deliverable: insert into `crm_deliverables` with milestone_id, name, description, sort_order |
| 6 | Copy stakeholders | For each deal contact with influence type: insert into `crm_project_stakeholders` with project_id, contact_id, derived_from_deal_id, project_role (mapped from influence type), influence_type_at_conversion |
| 7 | Emit event | Create `project_created` timeline event + audit log |
| 8 | Return project | Load project with milestones + stakeholders + member count |

### Influence Type → Project Role Mapping

| Deal Influence | Default Project Role | Rationale |
|---|---|---|
| decision_maker | sponsor | The DM during sales typically becomes the project sponsor |
| champion | point_of_contact | The champion is the day-to-day contact during delivery |
| influencer | technical_reviewer | Influencers often review deliverables |
| blocker | team_member (unassigned) | Blockers should be monitored; marked as team member without active role |

### Rollback Consideration

If any step after step 3 fails, the conversion service must clean up the partially-created project and its children. Wrapped in a database transaction.

---

## 4. Template Engine Design

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  CrmProjectTemplate                           │
│  id, name, category, description, is_active                  │
└────────────────────┬────────────────────────────────────────┘
                     │ 1
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  CrmTemplateMilestone                         │
│  id, template_id, name, description, default_duration_days,  │
│  sort_order                                                  │
└────────────────────┬────────────────────────────────────────┘
                     │ 1
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               CrmTemplateDeliverable                          │
│  id, template_milestone_id, name, description, sort_order    │
└─────────────────────────────────────────────────────────────┘
```

### Service: `CrmProjectTemplateService`

| Method | Description |
|---|---|
| `getTemplatesByCategory(category)` | Returns templates filtered by product category |
| `getTemplateWithStructure(id)` | Loads template + milestones + deliverables |
| `applyTemplate(project, template)` | Creates milestones + deliverables from template onto an existing project |
| `getDefaultTemplateForDeal(deal)` | Auto-selects template based on deal's product category |

### Seeder Data

7 templates, 31 milestone definitions, ~90 deliverable definitions total. See vision doc Part 1.5 for template catalog.

### Template Selection Logic

```
IF template_id provided in conversion dialog → use it
ELSE IF deal has products with known category → find template matching that category
ELSE IF deal.organization.industry maps to a template → use mapped template
ELSE → default to Consulting Engagement (most generic)
```

---

## 5. Risk & Issue Model

### Architecture Decision: Separate Tables (Not Polymorphic)

Risks and issues are separate tables, not a single polymorphic `project_events` table.

| Reason | Detail |
|---|---|
| Different lifecycles | Risk: identified → being_mitigated → closed. Issue: open → in_progress → resolved → closed |
| Different fields | Risk has probability + mitigation_plan. Issue has resolution + resolved_at |
| Different severity scales | Risk: critical/high/medium/low. Issue: blocker/critical/major/minor |
| Different UX treatment | Risk = future-oriented, Issue = past-oriented. Different badge colors, different action buttons |
| Query clarity | `$project->risks()->where('severity', 'critical')` is clearer than polymorphic with type filter |

### Shared Pattern

Both entities share:

- `project_id` FK
- `description` text
- `owner_id` FK (nullable)
- Timeline event on create/status change
- Notification on severity ≥ critical/blocker

---

## 6. Delivery Health Architecture

### Service: `CrmDeliveryHealthService`

```
Input:  CrmProject (with milestones, risks, issues)
Output: DeliveryHealthResult
          - score (0-100)
          - tier (healthy / at_risk / critical)
          - factors (array of {name, weight, score, contribution})
          - contributors (array of {type: positive|negative, label, impact, factor})
```

### Computation Flow

```
1. Load project with milestones, risks, issues
2. milestoneProgressScore()
   - milestones_completed / total_milestones * 100
   - Adjusted for schedule: if behind, reduce proportionally
3. scheduleVarianceScore()
   - Compare target_end_date to today
   - 0 days late = 100, 7 days = 70, 14 days = 40, 21+ = 10
4. openRisksScore()
   - 0 critical = 100, 1 critical = 50, 2+ critical = 20
   - Reduced further by high/medium count
5. openIssuesScore()
   - 0 blockers = 100, 1 blocker = 60, 2+ blockers = 20
   - Reduced further by critical/major count
6. customerSentimentScore()
   - positive = 100, neutral = 60, negative = 20
7. weightedScore = Σ(score × weight) / Σ(weight)
8. Determine tier from score
9. Build contributors list (positive if score ≥ 60, negative if < 60)
10. Return result
```

### Caching

The health score should be cached per project with TTL of 1 hour, invalidated on:

- Milestone status change
- Risk/issue create or status change
- Customer sentiment update
- Schedule change (start_date or target_end_date changed)

---

## 7. Timeline Integration

### Event Types to Add

The existing `crm_action_events` table (CRM-1) must accept these new `type` values:

| Event Type | Trigger | Data Payload |
|---|---|---|
| `project_created` | Deal conversion | {project_id, deal_id, template_name} |
| `project_completed` | Last milestone completed | {project_id, actual_end_date} |
| `project_delayed` | target_end_date changed | {project_id, old_date, new_date} |
| `milestone_created` | New milestone added | {milestone_id, name, project_id} |
| `milestone_completed` | Milestone status → completed | {milestone_id, name, project_id} |
| `milestone_delayed` | Milestone past end_date (detected) | {milestone_id, name, days_overdue} |
| `deliverable_submitted` | Deliverable status → submitted | {deliverable_id, name, milestone_id} |
| `deliverable_accepted` | Deliverable status → accepted | {deliverable_id, name, milestone_id} |
| `deliverable_rejected` | Deliverable status → rejected | {deliverable_id, name, milestone_id, reason} |
| `risk_created` | New risk identified | {risk_id, description, severity} |
| `risk_mitigated` | Risk status → closed | {risk_id, description} |
| `issue_created` | New issue logged | {issue_id, description, severity} |
| `issue_resolved` | Issue status → resolved | {issue_id, description, resolution} |
| `scope_changed` | Change order approved | {change_order_id, title, cost_impact, timeline_impact} |
| `team_member_assigned` | New project member added | {user_id, user_name, role} |
| `team_member_unassigned` | Member removed | {user_id, user_name, role} |
| `health_changed` | Health tier transition | {project_id, old_tier, new_tier, score} |

### Schema Change Required

If `crm_action_events.type` uses an enum, it must be altered to VARCHAR(50) before CRM-4 migration. This is non-negotiable — adding new event types via enum migration is expensive and error-prone.

### Timeline Querying

The ActivityTimeline component (CRM-2) must support:

- Filtering by project_id (existing entity_type/entity_id pattern handles this)
- Filtering by event type category: `all`, `milestones`, `risks`, `issues`, `financial`
- Displaying new event types with appropriate icons and labels

---

## 8. Permissions Matrix

### Roles (Reusing CRM-1 RBAC)

| Role | Project Access | Level |
|---|---|---|
| **Super Admin** | All projects | Full CRUD |
| **Admin** | All projects | Full CRUD |
| **Project Manager** | Own projects + assigned as member | Full on own, read on assigned |
| **Team Member** | Assigned projects only | Read + update deliverables/risks/issues |
| **Sales Rep** | Projects converted from own deals | Read-only |
| **Viewer** | Explicitly shared | Read-only |

### Permission Checks

| Action | Check |
|---|---|
| List projects | `viewAny` (admin/PM), or `viewOwn` (member) |
| View project | Must be member OR admin OR creator of source deal |
| Create project | `convert_deal` permission on the deal |
| Update project status | Must be PM of project OR admin |
| Manage milestones | Must be PM OR tech_lead member |
| Manage risks/issues | Must be member of project |
| Manage change orders | Must be PM OR admin |
| Assign/unassign members | Must be PM OR admin |
| Delete project | Admin only |

### Policy Methods (Proposed)

```
CrmProjectPolicy:
  view(User, CrmProject)
  create(User) — requires convert_deal on source deal
  update(User, CrmProject)
  delete(User, CrmProject) — admin only
  manageMilestones(User, CrmProject)
  manageRisks(User, CrmProject)
  manageIssues(User, CrmProject)
  manageChangeOrders(User, CrmProject)
  manageMembers(User, CrmProject)
```

---

## 9. API Boundaries

### Route Structure

All routes under `/crm/projects/*` with `auth` + `verified` middleware.

| Method | URI | Controller Action | Notes |
|---|---|---|---|
| GET | `/crm/projects` | ProjectController@index | List with filters + pagination |
| GET | `/crm/projects/{project}` | ProjectController@show | Full workspace data |
| POST | `/crm/deals/{deal}/convert` | ProjectController@convert | One-click conversion |
| PATCH | `/crm/projects/{project}` | ProjectController@update | Status, dates, sentiment, financials |
| DELETE | `/crm/projects/{project}` | ProjectController@destroy | Admin only |
| GET | `/crm/projects/{project}/milestones` | MilestoneController@index | |
| POST | `/crm/projects/{project}/milestones` | MilestoneController@store | |
| PATCH | `/crm/milestones/{milestone}` | MilestoneController@update | Status, dates, reorder |
| DELETE | `/crm/milestones/{milestone}` | MilestoneController@destroy | |
| POST | `/crm/milestones/{milestone}/deliverables` | DeliverableController@store | |
| PATCH | `/crm/deliverables/{deliverable}` | DeliverableController@update | Status, acceptance |
| DELETE | `/crm/deliverables/{deliverable}` | DeliverableController@destroy | |
| GET | `/crm/projects/{project}/risks` | RiskController@index | |
| POST | `/crm/projects/{project}/risks` | RiskController@store | |
| PATCH | `/crm/risks/{risk}` | RiskController@update | |
| GET | `/crm/projects/{project}/issues` | IssueController@index | |
| POST | `/crm/projects/{project}/issues` | IssueController@store | |
| PATCH | `/crm/issues/{issue}` | IssueController@update | |
| GET | `/crm/projects/{project}/change-orders` | ChangeOrderController@index | |
| POST | `/crm/projects/{project}/change-orders` | ChangeOrderController@store | |
| PATCH | `/crm/change-orders/{changeOrder}` | ChangeOrderController@update | Approve/reject/implement |
| POST | `/crm/projects/{project}/members` | MemberController@store | |
| PATCH | `/crm/members/{member}` | MemberController@update | Role, allocation |
| DELETE | `/crm/members/{member}` | MemberController@destroy | |
| POST | `/crm/projects/{project}/stakeholders` | StakeholderController@store | |
| PATCH | `/crm/stakeholders/{stakeholder}` | StakeholderController@update | |
| DELETE | `/crm/stakeholders/{stakeholder}` | StakeholderController@destroy | |

### Controller Summary

| Controller | Responsibility |
|---|---|
| **ProjectController** | CRUD + convert + health (show loads full workspace) |
| **MilestoneController** | CRUD within project context |
| **DeliverableController** | CRUD within milestone context |
| **RiskController** | CRUD within project context |
| **IssueController** | CRUD within project context |
| **ChangeOrderController** | CRUD + approve/reject within project context |
| **MemberController** | Assign/unassign TUTIA team members |
| **StakeholderController** | Add/update/remove external stakeholders |

---

## 10. CRM-5 Compatibility Contracts

These are formal contracts that CRM-4 code must satisfy to ensure zero-breaking-change integration with CRM-5.

### Contract 1: Non-Destructive Schema

- No column may change type between CRM-4 and CRM-5
- No table may be dropped
- All CRM-5 additions must be: new columns (NULLABLE or with defaults), new tables, new indexes

### Contract 2: Event Extensibility

- `crm_action_events.type` must be VARCHAR(50), not ENUM (verified before CRM-4 migration)
- New event types in CRM-5 must not require migration — just new string values

### Contract 3: Customer Portal Ready

- `crm_projects.visibility` = 'internal' | 'customer'
- `crm_deliverables.is_visible_to_customer` = boolean
- `crm_milestones` has no sensitive fields — all safe for customer view
- Customer view excludes: `crm_project_risks`, `crm_issues`, `crm_change_orders`, `crm_project_members.allocation_percent`

### Contract 4: Stakeholder Traceability

- `crm_project_stakeholders.derived_from_deal_id` links back to the source deal
- `crm_project_stakeholders.contact_id` links to the actual person
- CRM-5 portal can reuse this to identify portal users without remapping

### Contract 5: Financial Extensibility

- `crm_projects.contract_value` is the immutable original
- `crm_change_orders.cost_impact` accumulates into `total_value` (computed)
- CRM-5 can add invoice_number, payment_date, payment_method without changing existing columns

---

## 11. Implementation Order

### Phase 1: Foundation (Migration + Models)

| Step | Files | Dependencies |
|---|---|---|
| 1.1 | Migration `300001` | None |
| 1.2 | Model: `CrmProjectTemplate` | Migration done |
| 1.3 | Model: `CrmTemplateMilestone` | 1.2 |
| 1.4 | Model: `CrmTemplateDeliverable` | 1.3 |
| 1.5 | Model: `CrmProject` | Migration done |
| 1.6 | Model: `CrmMilestone` | 1.5 |
| 1.7 | Model: `CrmDeliverable` | 1.6 |
| 1.8 | Model: `CrmProjectStakeholder` | 1.5 |
| 1.9 | Model: `CrmProjectMember` | 1.5 |
| 1.10 | Model: `CrmProjectRisk` | 1.5 |
| 1.11 | Model: `CrmIssue` | 1.5 |
| 1.12 | Model: `CrmChangeOrder` | 1.5 |
| 1.13 | Seeder: `CrmProjectTemplateSeeder` | 1.2–1.4 |

### Phase 2: Services

| Step | Service | Dependencies |
|---|---|---|
| 2.1 | `CrmProjectTemplateService` | Phase 1 |
| 2.2 | `CrmDealToProjectConversionService` | 2.1 |
| 2.3 | `CrmDeliveryHealthService` | Phase 1 |
| 2.4 | Template → products auto-selection logic | 2.1 |

### Phase 3: Controllers + Routes

| Step | Controller | Dependencies |
|---|---|---|
| 3.1 | `ProjectController` (index, show, update, destroy) | Phase 1 |
| 3.2 | `ProjectController@convert` | 2.2 |
| 3.3 | `MilestoneController` | Phase 1 |
| 3.4 | `DeliverableController` | Phase 1 |
| 3.5 | `RiskController` | Phase 1 |
| 3.6 | `IssueController` | Phase 1 |
| 3.7 | `ChangeOrderController` | Phase 1 |
| 3.8 | `MemberController` | Phase 1 |
| 3.9 | `StakeholderController` | Phase 1 |

### Phase 4: Frontend

| Step | Page | Dependencies |
|---|---|---|
| 4.1 | Project index (`/crm/projects`) | 3.1 |
| 4.2 | Project workspace (`/crm/projects/{project}`) | 3.1–3.9 |
| 4.3 | Conversion dialog (modal on `/crm/deals/{deal}`) | 3.2 |
| 4.4 | Update CRM sidebar (Projects link) | 4.1 |

### Phase 5: Tests

| Step | Tests | Dependencies |
|---|---|---|
| 5.1 | Model tests (all 10 models) | Phase 1 |
| 5.2 | Service tests (conversion, health, template) | Phase 2 |
| 5.3 | Controller tests (all 9 controllers) | Phase 3 |
| 5.4 | Feature tests (conversion flow, permissions) | Phase 3 |
| 5.5 | Frontend component tests | Phase 4 |

---

## 12. Directory Structure

### Backend

```
app/
├── Models/
│   ├── CrmProject.php
│   ├── CrmMilestone.php
│   ├── CrmDeliverable.php
│   ├── CrmProjectStakeholder.php
│   ├── CrmProjectMember.php
│   ├── CrmProjectRisk.php
│   ├── CrmIssue.php
│   ├── CrmChangeOrder.php
│   ├── CrmProjectTemplate.php
│   ├── CrmTemplateMilestone.php
│   └── CrmTemplateDeliverable.php
│
├── Services/
│   └── Crm/
│       ├── Project/
│       │   ├── CrmDealToProjectConversionService.php
│       │   ├── CrmProjectTemplateService.php
│       │   └── CrmDeliveryHealthService.php
│       └── Timeline/
│           └── CrmProjectTimelineService.php (extends existing CrmTimelineService)
│
├── Http/
│   └── Controllers/
│       └── Crm/
│           ├── ProjectController.php
│           ├── MilestoneController.php
│           ├── DeliverableController.php
│           ├── RiskController.php
│           ├── IssueController.php
│           ├── ChangeOrderController.php
│           ├── MemberController.php
│           └── StakeholderController.php
│
├── Policies/
│   └── CrmProjectPolicy.php
│
└── DTOs/
    └── Crm/
        └── Project/
            ├── DeliveryHealthResult.php
            └── DeliveryHealthContributor.php

database/
└── seeders/
    ├── CrmProjectTemplateSeeder.php
    └── CrmProductTemplateMapSeeder.php (optional)
```

### Frontend

```
resources/js/
├── pages/
│   └── crm/
│       └── projects/
│           ├── index.tsx
│           └── show.tsx
│
├── components/
│   └── crm/
│       ├── project/
│       │   ├── delivery-health-badge.tsx (extends health-score-badge)
│       │   ├── milestone-timeline.tsx
│       │   ├── deliverable-table.tsx
│       │   ├── risk-list.tsx
│       │   ├── issue-list.tsx
│       │   ├── change-order-list.tsx
│       │   ├── team-section.tsx
│       │   └── stakeholder-section.tsx
│       └── project-convert-dialog.tsx
│
├── routes/
│   └── crm/projects.ts (Wayfinder route functions)
```

---

## 13. Key Architectural Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| Template storage | Database tables (not code, not JSON) | Queryable, seedable, editable via future UI |
| Risks vs Issues | Separate tables (not polymorphic) | Different lifecycle, severity, and UX treatment |
| Stakeholder continuity | `derived_from_deal_id` FK + `influence_type_at_conversion` | Preserves sales → delivery knowledge transfer |
| Deal → Project FK | SET NULL on deal delete | A won deal should never be deleted, but if it is, the project survives |
| Health score | Computed (not stored), cached 1hr | Always reflects current state; cache avoids recomputation |
| Project status lifecycle | 7 states with defined transitions | Prevents invalid state changes, enables workflow automation |
| Visibility model | `visibility` field on project + `is_visible_to_customer` on deliverables | Portal-ready without portal code |
| Timeline events | String type on `crm_action_events` (not enum) | 17 new event types added without schema change; CRM-5 extensible |
| Conversion template selection | Auto by product category, overridable | Minimizes clicks for common case, flexible for edge cases |
| Financial tracking | Fields on project + change_orders table | Lightweight; no invoicing; extensible for CRM-6 |

---

*This architecture document is ready for review. After approval, CRM-4 implementation begins with Migration 300001.*
