# CRM Roadmap

> **Date**: 2026-06-19
> **Current Maturity**: 2/10
> **Target Maturity**: 9/10
> **Priority Classification**: Critical → Important → Future

---

## Phase CRM-1: Core CRM Foundation

**Goal**: Production-ready core CRM with proper entity model, security, and quality.

**Priority**: **Critical** — No CRM can be deployed without this.

| Task | Area | Effort |
|---|---|---|
| **1.1** Form Request validation classes for all CRM controllers | Backend | 1d |
| **1.2** Database indexes on `crm_leads.stage`, `crm_leads.source`, `crm_leads.assigned_to`, `crm_activities.activitable_type`, `crm_activities.activitable_id`, `crm_deals.stage`, `crm_deals.owner_id`, `crm_deals.lead_id` | Backend | 0.5d |
| **1.3** Soft deletes on CrmLead, CrmDeal, CrmActivity (add `SoftDeletes` trait + `deleted_at` column) | Backend | 0.5d |
| **1.4** Laravel Policies for CRM entities (`CrmLeadPolicy`, `CrmDealPolicy`, `CrmActivityPolicy`) with `viewAny`, `view`, `create`, `update`, `delete` methods implementing ownership checks | Backend | 1d |
| **1.5** Role-based access control: `admin`, `manager`, `sales_rep`, `viewer` roles via Spatie `laravel-permission` or custom tailgate | Backend | 2d |
| **1.6** Audit trail service: log all stage changes, assignments, deletions to `crm_audit_log` table | Backend | 1.5d |
| **1.7** Replace `strftime` with `DATE_FORMAT`/`EXTRACT` for multi-database compatibility | Backend | 0.5d |
| **1.8** Factories + Seeders for CrmLead, CrmDeal, CrmActivity + 50 sample records | Backend | 1d |
| **1.9** Feature tests for all CRM controllers (minimum: index, show, create, update, delete paths) | Backend | 2d |
| **1.10** Loading skeleton states for all CRM pages (dashboard, leads index, leads show, deals index, deals show) | Frontend | 1d |
| **1.11** Error boundaries for CRM pages | Frontend | 0.5d |
| **1.12** i18n support for CRM hardcoded English strings | Frontend | 1d |
| **1.13** RTL layout support for CRM sidebar, tables, activity feed | Frontend | 0.5d |
| **1.14** Pagination UI in leads list view (currently hidden `leads.meta`) | Frontend | 0.5d |
| **1.15** CSRF + rate limiting on CRM POST/PATCH/DELETE endpoints | Backend | 0.5d |

**Delivery**: 13 days  
**Maturity after phase**: 5/10

---

## Phase CRM-2: Accounts & Contacts

**Goal**: Proper B2B data model with companies, people, and deduplication.

**Priority**: **Critical** — B2B CRM without accounts/contacts is not a CRM.

| Task | Area | Effort |
|---|---|---|
| **2.1** Create `crm_accounts` table: id, name, domain, industry, size, phone, website, address, city, country, logo, notes, owner_id, soft_deletes, timestamps | Backend | 1d |
| **2.2** Create `crm_contacts` table: id, account_id (FK), first_name, last_name, email, phone, mobile, job_title, department, linkedin, avatar, is_primary, owner_id, soft_deletes, timestamps | Backend | 1d |
| **2.3** Create `CrmAccount` model with: `contacts()`, `deals()`, `activities()`, `owner()` relationships | Backend | 0.5d |
| **2.4** Create `CrmContact` model with: `account()`, `deals()`, `activities()`, `owner()` relationships | Backend | 0.5d |
| **2.5** Create `crm_account_contact` pivot table for many-to-many (contacts can work across accounts) | Backend | 0.5d |
| **2.6** Add `account_id` FK to `crm_deals` table (migration) | Backend | 0.5d |
| **2.7** Add `contact_id` FK to `crm_deals` table (migration) | Backend | 0.5d |
| **2.8** Migration: migrate existing `lead.company` → `crm_accounts` and `deal.company` → `crm_accounts` (data migration script) | Backend | 1d |
| **2.9** Create `CrmAccountController` with index, show, store, update, destroy | Backend | 1d |
| **2.10** Create `CrmContactController` with index, show, store, update, destroy | Backend | 1d |
| **2.11** Accounts list page with table view, search, filter by industry/size | Frontend | 2d |
| **2.12** Account detail page with: company info, contacts list, linked deals, activity timeline | Frontend | 2d |
| **2.13** Contacts list page with table view, search, filter by account/department | Frontend | 2d |
| **2.14** Contact detail page with: personal info, account link, linked deals, activity timeline | Frontend | 2d |
| **2.15** Add account/contact sidebar to CRM navigation | Frontend | 0.5d |
| **2.16** Duplicate detection on account creation (match by domain/name) | Backend | 1d |
| **2.17** Account merge workflow (select survivor record, merge data, redirect) | Backend + Frontend | 1.5d |
| **2.18** Bulk CSV import for accounts and contacts | Backend + Frontend | 2d |
| **2.19** Policies for accounts and contacts | Backend | 0.5d |
| **2.20** Tests for accounts and contacts controllers | Backend | 2d |

**Delivery**: 21 days  
**Maturity after phase**: 6.5/10

---

## Phase CRM-3: Sales Management

**Goal**: Prospecting-grade sales pipeline with quoting, proposals, and forecasting.

**Priority**: **Critical** — Core value proposition of the CRM.

| Task | Area | Effort |
|---|---|---|
| **3.1** Create `crm_products` table: id, name, description, unit_price, currency, category, is_active, timestamps | Backend | 1d |
| **3.2** Create `crm_deal_items` table (line items): id, deal_id, product_id, product_name, quantity, unit_price, total_price, timestamps | Backend | 0.5d |
| **3.3** Add line items to deal creation and editing | Backend + Frontend | 2d |
| **3.4** Stage transition validation (no skipping stages, required fields per stage) | Backend | 1d |
| **3.5** Stage probability automation (auto-set probability by stage) | Backend | 0.5d |
| **3.6** Stage transition reasons / notes required on certain transitions (e.g., lost reason required) | Backend | 0.5d |
| **3.7** Win/loss analysis (structured fields for why deals won/lost) | Backend + Frontend | 1d |
| **3.8** Quote generation: create quote PDF from deal data + line items | Backend | 2d |
| **3.9** Proposal generation: create proposal document (template + deal data) | Backend | 2d |
| **3.10** Quote-to-deal conversion: accept quote → create deal | Workflow | 1d |
| **3.11** Forecast calculation: weighted pipeline (value × probability) by rep, team, overall | Backend | 1.5d |
| **3.12** Forecast visualization in CRM dashboard | Frontend | 1.5d |
| **3.13** Deal aging alerts: stale deals > X days in stage (configurable per stage) | Backend + Notification | 1d |
| **3.14** Lead-to-deal conversion workflow with data mapping | Backend + Frontend | 1.5d |
| **3.15** Lead qualification form with scoring criteria (BANT, CHAMP, or custom) | Backend + Frontend | 2d |
| **3.16** Export deals to CSV/Excel | Backend | 1d |
| **3.17** Email notification on deal stage change (configurable) | Backend | 1d |
| **3.18** API endpoints for deals, products, quotes with token auth | Backend | 1.5d |
| **3.19** Tests for sales management controllers | Backend | 2d |

**Delivery**: 23 days  
**Maturity after phase**: 7.5/10

---

## Phase CRM-4: Projects & Delivery

**Goal**: Track customer delivery, onboarding, and project milestones within the CRM.

**Priority**: **Important** — Leverages TUTIA's service delivery model.

| Task | Area | Effort |
|---|---|---|
| **4.1** Create `crm_projects` table: id, deal_id, name, description, status, start_date, target_date, completed_date, owner_id, soft_deletes, timestamps | Backend | 1d |
| **4.2** Create `crm_project_milestones` table: id, project_id, name, description, due_date, completed_date, status, sort_order, timestamps | Backend | 0.5d |
| **4.3** Create `crm_onboarding_tasks` table: id, deal_id, task_name, assigned_to, due_date, completed_at, timestamps | Backend | 0.5d |
| **4.4** `CrmProject` model with milestones, deal, owner relationships | Backend | 0.5d |
| **4.5** `CrmProjectMilestone` model with project relationship | Backend | 0.5d |
| **4.6** Project creation from won deal (auto-create on close-won) | Automation | 0.5d |
| **4.7** Project list page with status filters, search | Frontend | 1.5d |
| **4.8** Project detail page with: milestones, timeline, team, activity feed | Frontend | 2d |
| **4.9** Milestone checklist with progress bar | Frontend | 1d |
| **4.10** Onboarding task list per deal | Frontend | 1d |
| **4.11** Delivery status visible on deal detail page | Frontend | 0.5d |
| **4.12** Email notification on milestone completion | Backend | 0.5d |
| **4.13** Add projects to CRM sidebar navigation | Frontend | 0.5d |
| **4.14** Policies + tests for project controllers | Backend | 1.5d |

**Delivery**: 12 days  
**Maturity after phase**: 8/10

---

## Phase CRM-5: Communications Center

**Goal**: Integrated email, SMS, WhatsApp, and calendar for the Sudanese market.

**Priority**: **Important** — TUTIA's competitive advantage with local telco integration.

| Task | Area | Effort |
|---|---|---|
| **5.1** Email sync via IMAP: read incoming emails to lead/deal activity feed | Backend | 3d |
| **5.2** Send email from CRM: compose UI, send via SMTP/API, store sent items as activities | Backend + Frontend | 3d |
| **5.3** Email templates: create/edit/use templates for common communications | Backend + Frontend | 2d |
| **5.4** Email tracking: open/click tracking via embedded pixel + redirect | Backend | 2d |
| **5.5** Calendar sync: Google Calendar + Outlook Calendar integration (events → activities) | Backend | 3d |
| **5.6** Meeting scheduler: send booking links, log scheduled meetings as activities | Frontend + Backend | 1.5d |
| **5.7** SMS integration via TUTIA Bulk SMS API (send + log SMS from CRM) | Backend | 2d |
| **5.8** WhatsApp integration (send + receive via WhatsApp Business API) | Backend | 3d |
| **5.9** Communication timeline: unified timeline across email, SMS, WhatsApp, calls, meetings | Frontend | 2d |
| **5.10** Call logging with duration, outcome, follow-up fields | Backend + Frontend | 1d |
| **5.11** Activity reminders: email/in-app notifications for due tasks and follow-ups | Backend + Frontend | 2d |
| **5.12** Quick actions: one-click email, SMS, call from lead/deal detail | Frontend | 1d |
| **5.13** Tests for communication controllers | Backend | 2d |

**Delivery**: 25.5 days  
**Maturity after phase**: 8.5/10

---

## Phase CRM-6: Automation Engine

**Goal**: No-code workflow builder, lead scoring, auto-assignment, and sequence campaigns.

**Priority**: **Important** — Scales sales without proportional headcount growth.

| Task | Area | Effort |
|---|---|---|
| **6.1** Workflow definition model: triggers, conditions, actions (JSON config) | Backend | 2d |
| **6.2** Workflow triggers: `lead.created`, `lead.stage_changed`, `deal.stage_changed`, `activity.completed`, `contact.created` | Backend | 1.5d |
| **6.3** Workflow conditions: lead source, stage, priority, deal value, date fields | Backend | 1d |
| **6.4** Workflow actions: change stage, assign to user, send email, send SMS, create activity, create deal, webhook | Backend | 2d |
| **6.5** Workflow execution engine: queued, retry on failure, audit log | Backend | 2d |
| **6.6** Workflow builder UI: visual rule builder (no-code) | Frontend | 3d |
| **6.7** Lead scoring model: configurable points per attribute (source, page, engagement, etc.) | Backend | 1.5d |
| **6.8** Lead scoring UI: configure scoring rules, view scores, threshold-based routing | Frontend | 2d |
| **6.9** Auto-assignment rules: round-robin, least-loaded, skill-based, region-based | Backend | 1.5d |
| **6.10** Duplicate detection matching rules: email, phone, company domain | Backend | 1d |
| **6.11** Duplicate resolution UI: suggest merges, approve/reject | Frontend | 1.5d |
| **6.12** Email sequences (drip campaigns): multi-step timed email campaigns | Backend + Frontend | 3d |
| **6.13** Sequence enrollment: add lead/contact to sequence based on workflow trigger | Backend | 1d |
| **6.14** SLA tracking: response time targets per source, breach alerts | Backend | 1.5d |
| **6.15** Webhook integration: send CRM events to external systems | Backend | 1d |
| **6.16** Webhook management UI: add/edit webhook endpoints, view delivery logs | Frontend | 1.5d |
| **6.17** Tests for automation engine | Backend | 3d |

**Delivery**: 29 days  
**Maturity after phase**: 9/10

---

## Phase CRM-7: Analytics & Forecasting

**Goal**: Enterprise-grade reporting, dashboards, revenue intelligence, and AI insights.

**Priority**: **Important** — Turns data into decisions.

| Task | Area | Effort |
|---|---|---|
| **7.1** Report builder: customizable report with date range, filters, grouping, metrics | Backend + Frontend | 4d |
| **7.2** Pre-built reports: lead source breakdown, conversion funnel, win/loss, rep activity, pipeline health | Backend + Frontend | 3d |
| **7.3** Dashboard builder: drag-and-drop widgets, multiple dashboards per user | Frontend | 3d |
| **7.4** Dashboard widgets library: KPI, funnel chart, bar/line/pie chart, table, heatmap | Frontend | 2.5d |
| **7.5** Sales forecasting engine: weighted pipeline, historical trends, manual overrides | Backend | 2d |
| **7.6** Forecast visualization: by rep, team, product line, month/quarter | Frontend | 2d |
| **7.7** Conversion funnel analytics: lead → qualified → deal → won with drop-off rates | Backend + Frontend | 2d |
| **7.8** Revenue attribution: first-touch, last-touch, multi-touch attribution models | Backend | 2.5d |
| **7.9** Rep performance dashboard: activities, deals closed, conversion rates, rankings | Frontend | 2d |
| **7.10** Cohort analysis: lead conversion by source, campaign, month | Backend + Frontend | 2d |
| **7.11** CSV/PDF/Excel export for all reports | Backend | 1.5d |
| **7.12** Scheduled report delivery via email | Backend | 1d |
| **7.13** Custom metric definitions (formula-based) | Backend | 1.5d |
| **7.14** AI lead scoring (predictive: trained on historical conversion data) | Backend (ML) | 4d |
| **7.15** AI deal insights: next-best-action, risk flags, recommended actions | Backend | 3d |
| **7.16** Natural language query on CRM data (e.g., "How many leads from Google this month?") | Backend + Frontend | 3d |
| **7.17** Tests for analytics controllers | Backend | 3d |

**Delivery**: 40 days  
**Maturity after phase**: 9.5/10

---

## Summary

| Phase | Focus | Critical | Important | Future | Effort |
|---|---|---|---|---|---|
| **CRM-1** | Core Foundation | 10 | 4 | 1 | 13 days |
| **CRM-2** | Accounts & Contacts | 14 | 6 | 0 | 21 days |
| **CRM-3** | Sales Management | 12 | 7 | 0 | 23 days |
| **CRM-4** | Projects & Delivery | 0 | 11 | 3 | 12 days |
| **CRM-5** | Communications Center | 0 | 11 | 2 | 25.5 days |
| **CRM-6** | Automation Engine | 0 | 14 | 3 | 29 days |
| **CRM-7** | Analytics & Forecasting | 0 | 12 | 5 | 40 days |
| **Total** | | **36** | **65** | **14** | **163.5 days** |

### Recommended Prioritization

1. **Phase CRM-1** — Non-negotiable. No CRM deployment without RBAC, soft deletes, audit, tests.
2. **Phase CRM-2** — Non-negotiable B2B CRM requirement. Accounts and contacts are the foundation.
3. **Phase CRM-3** — Core value prop. Sales management is what the CRM is for.
4. **Phase CRM-4** — TUTIA differentiator. Project delivery tracking matches the service delivery model.
5. **Phase CRM-5** — TUTIA's unique advantage with SMS integration for the Sudanese market.
6. **Phase CRM-6** — Scale multiplier. Automation makes the CRM efficient.
7. **Phase CRM-7** — Intelligence layer. Turns CRM from operational to strategic.
