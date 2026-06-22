# CRM Architecture Audit

> **Date**: 2026-06-19
> **Version**: CRM-A (initial implementation review)
> **Scope**: Full-stack audit of PHP/Laravel backend, React/Inertia frontend, database schema, workflows, permissions, and automation.

---

## 1. Current Entity Model

| Entity | Table | Model | Fields | Relationships |
|---|---|---|---|---|
| User | `users` | `App\Models\User` | id, name, email, password, 2fa fields, timestamps | Has many assigned leads (via `assigned_to`), has many owned deals (via `owner_id`), has many created activities (via `created_by`) |
| CrmLead | `crm_leads` | `App\Models\CrmLead` | id, source, name, email, phone, company, service, project_type, budget, timeline, time_slot, message, brief, requirements, stage, priority, assigned_to, last_contacted_at, converted_at, timestamps | BelongsTo `assignedTo` (User), HasMany `deals` (CrmDeal), MorphMany `activities` (CrmActivity) |
| CrmDeal | `crm_deals` | `App\Models\CrmDeal` | id, title, value, currency, stage, probability, lead_id, contact_name, contact_email, contact_phone, company, notes, expected_close_date, closed_at, lost_reason, owner_id, timestamps | BelongsTo `lead` (CrmLead), BelongsTo `owner` (User), MorphMany `activities` (CrmActivity) |
| CrmActivity | `crm_activities` | `App\Models\CrmActivity` | id, activitable_type, activitable_id, type, subject, description, due_at, completed_at, created_by, timestamps | MorphTo `activitable` (CrmLead\|CrmDeal), BelongsTo `createdBy` (User) |

### Entity Summary
- **4 data entities** (User is auth, not CRM-domain)
- **1 polymorphic relationship** (Activity→Lead/Deal)
- **0 dedicated CRM User model** (uses Laravel auth User)
- **0 Address/City/Country fields** on any CRM entity
- **0 social/linkedIn/profile fields** on contacts

---

## 2. Current Database Relationships

```
User (auth)
  ├── assigned_to  (CrmLead)     — 1:N  (one user assigned to many leads)
  ├── owner_id     (CrmDeal)     — 1:N  (one user owns many deals)
  └── created_by   (CrmActivity) — 1:N  (one user creates many activities)

CrmLead
  ├── assigned_to → User          — N:1
  ├── deals       → CrmDeal      — 1:N  (lead_id FK)
  └── activities  → CrmActivity  — Poly (activitable)

CrmDeal
  ├── lead_id     → CrmLead      — N:1
  ├── owner_id    → User         — N:1
  └── activities  → CrmActivity  — Poly (activitable)

CrmActivity
  ├── activitable → CrmLead|CrmDeal — Poly
  └── created_by  → User            — N:1
```

### Relationship Gaps
- **No Account/Company entity** — company is a plain text field on both Lead and Deal, no deduplication
- **No Contact entity** — contact_name/email/phone are denormalized on Deal, no shared contact records
- **No User team/group structure** — flat user model, no role hierarchy
- **No many-to-many** relationships exist
- **No tag/category** entities for flexible classification
- **No custom field** support

---

## 3. Current Workflow Coverage

### Lead Lifecycle (7 stages)
```
new → contacted → qualified → proposal → negotiation → converted
                                                          → lost
```

| Stage | Description | Supported |
|---|---|---|
| `new` | Freshly created from website form | ✅ Manual stage change in dropdown |
| `contacted` | First outreach attempted | ✅ Manual stage change |
| `qualified` | Needs identified, budget confirmed | ✅ Manual stage change |
| `proposal` | Proposal sent to lead | ✅ Manual stage change |
| `negotiation` | Active negotiation | ✅ Manual stage change |
| `converted` | Lead converted to customer | ✅ Sets `converted_at` timestamp |
| `lost` | Lead disqualified | ✅ Manual stage change |

### Deal Pipeline (6 stages)
```
qualification → meeting → proposal sent → negotiation → closed won
                                                         → closed lost
```

| Stage | Description | Supported |
|---|---|---|
| `qualification` | Initial qualification | ✅ Pipeline column |
| `meeting` | Meeting scheduled/held | ✅ Pipeline column |
| `proposal` | Proposal sent to prospect | ✅ Pipeline column |
| `negotiation` | Active negotiation | ✅ Pipeline column |
| `closed_won` | Deal won | ✅ Sets `closed_at`, probability=100 |
| `closed_lost` | Deal lost | ✅ Sets `closed_at`, requires `lost_reason` |

### Lead Intake Sources (6 sources)
| Source | Origin | Supported |
|---|---|---|
| `contact` | General contact form `/contact/submit` | ✅ |
| `consultation` | Book consultation form | ✅ |
| `proposal` | Request proposal form | ✅ |
| `quote` | Get a quote form | ✅ |
| `seller_registration` | Matger seller registration | ✅ |
| `newsletter` | Newsletter subscription | ✅ |

### Activity Types
| Type | Description | Supported |
|---|---|---|
| `note` | Free-form note | ✅ Activity form on Lead/Deal detail |
| `call` | Phone call log | ✅ Activity form |
| `email` | Email record | ✅ Activity form |
| `meeting` | Meeting record | ✅ Activity form |
| `task` | To-do with due date | ✅ Activity form (with `due_at`, `completed_at`) |

### Workflow Gaps
- **No stage transition validation** — any stage can go to any other stage
- **No stage transition automation** — no triggers, no email notifications
- **No pipeline stage probability** — probability is set manually, not auto-calculated
- **No lead scoring** — no automated scoring based on behavior/source/engagement
- **No deal aging alerts** — no warnings for stale deals in pipeline
- **No activity reminders** — no notification when task `due_at` is approaching
- **No email integration** — activities are logged manually, no sync with real email
- **No calendar sync** — no integration with Google/Outlook calendar

---

## 4. Current Permission Coverage

| Aspect | Status | Details |
|---|---|---|
| **Route protection** | ✅ Basic | All CRM routes use `auth` + `verified` middleware group |
| **Route authorization** | ❌ None | No policies, no gates, no role middleware |
| **Role-based access** | ❌ None | No `admin`, `manager`, `sales`, `viewer` roles |
| **Team-based access** | ❌ None | No team isolation for lead/deal visibility |
| **Ownership-based access** | ❌ None | Sales rep A can see and edit sales rep B's leads |
| **Record-level permissions** | ❌ None | No `view`, `edit`, `delete` granularity |
| **Action-level permissions** | ❌ None | No control over who can change stages, delete, assign |
| **API permissions** | ❌ None | JSON endpoints use same auth middleware, no token/scope auth |
| **Audit logging** | ❌ None | No log of who changed what and when (beyond Laravel `updated_at`) |
| **Soft deletes** | ❌ None | All deletes are hard deletes via `->delete()` |

### Security Concerns
- Hard deletes instead of soft deletes on leads, deals, and activities
- No restore capability
- No deleted record archive
- Any authenticated user can view, edit, or delete any CRM record
- No rate limiting on CRM API endpoints
- No request logging for sensitive operations (stage changes, deletions)

---

## 5. Current Automation Coverage

| Capability | Status | Details |
|---|---|---|
| **Stage change triggers** | ❌ Not implemented | No events/listeners for stage transitions |
| **Email notifications** | ❌ Not implemented | No lead assignment, stage change, or deal alerts |
| **Lead scoring** | ❌ Not implemented | No behavior/source/engagement scoring |
| **Auto-assignment** | ❌ Not implemented | No round-robin or rule-based lead assignment |
| **Follow-up reminders** | ❌ Not implemented | No scheduled reminders for activities |
| **Deal aging alerts** | ❌ Not implemented | No alerts for stale pipeline deals |
| **Welcome sequences** | ❌ Not implemented | No automated email/sms sequences for new leads |
| **Data enrichment** | ❌ Not implemented | No auto-enrichment from email domain or API |
| **Duplicate detection** | ❌ Not implemented | No matching logic for lead/company duplicates |
| **Webhook triggers** | ❌ Not implemented | No outbound webhooks for CRM events |
| **SLA monitoring** | ❌ Not implemented | No SLA tracking for response times |
| **Reporting automation** | ❌ Not implemented | No scheduled report generation/delivery |

---

## 6. Missing Enterprise CRM Capabilities

### Entity & Data Model

| Capability | Classification | Current State |
|---|---|---|
| **Account/Company entity** | **Critical** | Company is a free-text field, no dedup, no hierarchy |
| **Contact entity** | **Critical** | Contacts embedded as flat fields on deals, no standalone records |
| **Deal-to-Contact relationship** | **Critical** | No junction table for deal-people relationships |
| **Address model** | **Important** | No structured address (street, city, country, postal code) on any entity |
| **Custom fields** | **Important** | No EAV or JSON field support |
| **Tags / Categories** | **Important** | No flexible classification system |
| **Product / Service catalog** | **Important** | No product entity for deal line items |
| **Document / File attachments** | **Important** | No file storage linked to records |
| **Email templates** | **Future** | No stored email templates |
| **Activity types extensibility** | **Future** | Types hardcoded in frontend |
| **Note with rich formatting** | **Future** | Plain text only |

### Workflow & Process

| Capability | Classification | Current State |
|---|---|---|
| **Stage transition validation** | **Important** | Any stage → any stage, no guard logic |
| **Pipeline probability automation** | **Important** | Probability set manually per deal |
| **Lead routing / assignment rules** | **Important** | Assignment is manual only |
| **Proposal generation** | **Important** | No proposal document generation from deal data |
| **Quote-to-order flow** | **Future** | No quote/order/invoice lifecycle |
| **Contract management** | **Future** | No contract records or renewal tracking |
| **Subscription/recurring billing** | **Future** | No subscription model |
| **Customer onboarding** | **Future** | No onboarding checklist/workflow |
| **Support ticket integration** | **Future** | No case/ticket management |
| **Project delivery tracking** | **Important** | No project milestones or delivery records |

### Communications

| Capability | Classification | Current State |
|---|---|---|
| **Email sync (IMAP/Gmail/Outlook)** | **Important** | Activities logged manually, no email sync |
| **Email send from CRM** | **Important** | Cannot send email from CRM interface |
| **Calendar integration** | **Important** | No Google/Outlook calendar sync |
| **SMS sending** | **Important** | No SMS integration despite TUTIA's Bulk SMS service |
| **WhatsApp integration** | **Important** | No WhatsApp messaging (Sudan standard) |
| **Call recording/CTI** | **Future** | No phone system integration |
| **Live chat integration** | **Future** | No chat-to-lead flow |
| **Email tracking (opens/clicks)** | **Future** | No engagement tracking |

### Permissions & Security

| Capability | Classification | Current State |
|---|---|---|
| **Role-based access control** | **Critical** | No roles (admin, manager, sales, viewer) |
| **Team-based record isolation** | **Important** | All users see all records |
| **Ownership-based access** | **Important** | No view/edit/delete restrictions by ownership |
| **Audit trail** | **Important** | No operation logging |
| **Soft deletes with restore** | **Important** | Hard deletes only |
| **Field-level permissions** | **Future** | No per-field read/write control |
| **IP/geo access restrictions** | **Future** | No access policies |
| **Session management** | **Future** | No admin session control |

### Automation

| Capability | Classification | Current State |
|---|---|---|
| **Workflow automation engine** | **Important** | No triggers, conditions, or actions |
| **Lead scoring rules** | **Important** | No scoring model |
| **Auto-assignment** | **Important** | No round-robin/rules-based assignment |
| **Duplicate detection** | **Important** | No matching logic |
| **Email sequences (drip campaigns)** | **Future** | No sequenced communication |
| **SLA management** | **Future** | No response time tracking |
| **Webhook integration** | **Future** | No outbound event hooks |

### Analytics & Intelligence

| Capability | Classification | Current State |
|---|---|---|
| **Sales forecasting** | **Important** | No forecast model |
| **Pipeline analytics** | **Important** | Basic sum-by-stage only |
| **Conversion analytics** | **Important** | No lead-to-deal conversion rates |
| **Activity analytics** | **Important** | No rep activity reporting |
| **Dashboard customization** | **Important** | No configurable dashboard widgets |
| **Report builder** | **Future** | No custom report generation |
| **Export (CSV/PDF/Excel)** | **Important** | No data export capability |
| **Revenue attribution** | **Future** | No source/channel attribution |
| **AI/ML insights** | **Future** | No predictive lead scoring |
| **Customer 360 view** | **Important** | No unified view across leads, deals, activities, support |

### Integration

| Capability | Classification | Current State |
|---|---|---|
| **REST API** | **Important** | No dedicated CRM API (only Inertia responses) |
| **Webhook support** | **Future** | No webhook events |
| **OAuth / API tokens** | **Future** | No API authentication mechanism |
| **Import (CSV)** | **Important** | No bulk import of leads/contacts |
| **Export** | **Important** | No bulk export |
| **Third-party integrations** | **Future** | No Zapier/Make/APIs for external tools |
| **Bulk operations UI** | **Important** | Only `bulkUpdate` endpoint for stage; no UI bulk select |

---

## 7. Technical Debt & Quality

| Issue | Severity | Details |
|---|---|---|
| No Form Request validation classes | Medium | Validation inline in controllers, not reusable |
| No database indexes beyond defaults | Medium | No indexes on `stage`, `source`, `assigned_to`, `activitable` columns |
| No factory/seeders | Medium | No test data generation |
| No tests | High | Zero tests for any CRM functionality |
| No API resource/collection classes | Low | JSON responses use `response()->json()` directly |
| CrmLead and CrmStage naming inconsistency | Low | `lead.stage` uses string comparison, no enum |
| `strftime` in CrmDashboardController | Medium | SQLite-specific, won't work in production MySQL/PostgreSQL |
| Hard deletes cascade | Medium | Deleting a lead deletes its deals and activities with no recovery |
| No pagination metadata in frontend | Low | Leads pagination meta passed but not displayed in UI |
| No loading states | Low | No skeleton loading for CRM pages |
| No error boundaries | Low | No React error boundaries in CRM pages |
| i18n not applied to CRM | Low | CRM uses hardcoded English strings |
| RTL not tested in CRM | Medium | CRM layout ignores RTL direction |

---

## 8. Scoring Summary

| Category | Coverage | Score |
|---|---|---|
| Entity Model | Basic lead, deal, activity | 3/10 |
| Database Relationships | Minimal, no accounts/contacts | 3/10 |
| Workflow Coverage | Lead pipeline + Deal pipeline | 4/10 |
| Permission Coverage | Auth barrier only, no RBAC | 1/10 |
| Automation Coverage | None | 0/10 |
| Communications | Manual activity logging only | 1/10 |
| Analytics | 5 KPI metrics on dashboard | 2/10 |
| Integration | None | 0/10 |
| Code Quality | No tests, no factories, inline validation | 4/10 |

**Overall Maturity**: **2/10** — Viable internal prototype, not yet an enterprise CRM product.
