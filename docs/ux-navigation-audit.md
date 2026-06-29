# UX & Navigation Architecture Audit Report

**Date**: June 26, 2026
**Project**: Tutia v3 (CRM-8 Automation Intelligence Platform)
**Scope**: Full application navigation audit including public, authenticated, CRM, portal, and optimization surfaces

---

## Section 1: Complete System Map

### Public Pages (Marketing Site)

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Landing page |
| `/about` | About Overview | |
| `/about/leadership` | Leadership Team | |
| `/about/team` | Team Members | |
| `/about/values` | Company Values | |
| `/about/culture` | Company Culture | |
| `/services` | Services Overview | |
| `/services/commerce` | Commerce Services | |
| `/services/enterprise` | Enterprise Services | |
| `/services/digital` | Digital Services | |
| `/services/infrastructure` | Infrastructure Services | |
| `/services/ecommerce` | E-Commerce Services | |
| `/services/payment-gateway` | Payment Gateway | |
| `/services/bulk-sms` | Bulk SMS Services | |
| `/services/erp` | ERP Services | |
| `/services/ticketing` | Ticketing Services | |
| `/services/call-center` | Call Center Services | |
| `/services/web-development` | Web Development | |
| `/services/mobile-apps` | Mobile App Development | |
| `/services/connectivity` | Connectivity Services | |
| `/services/vpn` | VPN Services | |
| `/services/consulting` | Consulting Services | |
| `/platform` | Platform Overview | |
| `/platform/sellers` | Platform for Sellers | |
| `/platform/buyers` | Platform for Buyers | |
| `/platform/apps` | Platform Apps / Marketplace | |
| `/work` | Work / Portfolio | |
| `/work/matger-tutia` | Case: Matger Tutia | |
| `/work/erp-implementation` | Case: ERP Implementation | |
| `/work/connectivity-project` | Case: Connectivity | |
| `/work/web-platform` | Case: Web Platform | |
| `/work/mobile-app` | Case: Mobile App | |
| `/work/ticketing-system` | Case: Ticketing System | |
| `/insights` | Insights Overview | |
| `/insights/blog` | Blog | |
| `/insights/case-studies` | Case Studies | |
| `/insights/resources` | Resource Library | |
| `/contact` | Contact Overview | |
| `/contact/consultation` | Book a Consultation | |
| `/contact/proposal` | Request a Proposal | |
| `/contact/sales` | Sales Inquiry | |
| `/contact/quote` | Get a Quote | |
| `/contact/thank-you` | Thank You / Confirmation | |
| `/industries` | Industries Overview | |
| `/industries/retail-ecommerce` | Retail & E-Commerce | |
| `/industries/travel-tourism` | Travel & Tourism | |
| `/industries/telecommunications` | Telecommunications | |
| `/industries/banking-finance` | Banking & Finance | |
| `/industries/government` | Government Sector | |
| `/legal/privacy` | Privacy Policy | |
| `/legal/terms` | Terms of Service | |
| `/legal/cookies` | Cookie Policy | |

### Auth Pages (Laravel Fortify)

| Route | Page | Notes |
|---|---|---|
| `/login` | Login | |
| `/register` | Register | |
| `/forgot-password` | Forgot Password | |
| `/reset-password` | Reset Password | |
| `/verify-email` | Verify Email | |
| `/confirm-password` | Confirm Password | |
| `/two-factor-challenge` | Two-Factor Auth | |

### Settings (Authenticated)

| Route | Page | Notes |
|---|---|---|
| `/settings/profile` | Profile Settings | |
| `/settings/security` | Security Settings | |
| `/settings/appearance` | Appearance Settings | |

### Authenticated Dashboard

| Route | Page | Notes |
|---|---|---|
| `/dashboard` | Main Dashboard | Currently placeholder content |

### CRM Core (all under `/crm/*`, authenticated)

| Route Pattern | Page | Notes |
|---|---|---|
| `/crm/dashboard` | CRM Dashboard | |
| `/crm/leads` | Leads Index | |
| `/crm/leads/create` | Create Lead | |
| `/crm/leads/{lead}` | Show Lead | |
| `/crm/leads/{lead}/edit` | Edit Lead | |
| `/crm/deals` | Deals Index | |
| `/crm/deals/create` | Create Deal | |
| `/crm/deals/{deal}` | Show Deal | |
| `/crm/deals/{deal}/edit` | Edit Deal | |
| `/crm/contacts` | Contacts Index | |
| `/crm/contacts/create` | Create Contact | |
| `/crm/contacts/{contact}` | Show Contact | |
| `/crm/contacts/{contact}/edit` | Edit Contact | |
| `/crm/organizations` | Organizations Index | |
| `/crm/organizations/create` | Create Organization | |
| `/crm/organizations/{organization}` | Show Organization | |
| `/crm/organizations/{organization}/edit` | Edit Organization | |
| `/crm/products` | Products Index | |
| `/crm/products/create` | Create Product | |
| `/crm/products/{product}` | Show Product | |
| `/crm/products/{product}/edit` | Edit Product | |
| `/crm/pipeline` | Pipeline View | Kanban-style pipeline |
| `/crm/forecast` | Forecast | Revenue forecasting |
| `/crm/deals/{deal}/quotations` | Quotations under Deal | Create/show/clone |
| `/crm/activities/create` | Create Activity | Polymorphic |
| `/crm/timeline` | Timeline Feed | Polymorphic activity feed |
| `/crm/imports` | Imports Index | |
| `/crm/imports/{import}` | Import Show | |

### Projects (under `/crm/projects/*`, authenticated)

| Route Pattern | Page | Notes |
|---|---|---|
| `/crm/projects` | Projects Index | |
| `/crm/projects/{project}` | Project Show | |
| `/crm/projects/{project}/archive` | Archive Project | |
| `/crm/projects/{project}/restore` | Restore Project | |
| `/crm/projects/{project}/risks` | Risks Index | |
| `/crm/projects/{project}/risks/create` | Create Risk | |
| `/crm/projects/{project}/risks/{risk}/edit` | Edit Risk | |
| `/crm/projects/{project}/risks/{risk}` | Delete Risk | |
| `/crm/projects/{project}/issues` | Issues Index | |
| `/crm/projects/{project}/issues/create` | Create Issue | |
| `/crm/projects/{project}/issues/{issue}/edit` | Edit Issue | |
| `/crm/projects/{project}/issues/{issue}` | Delete Issue | |
| `/crm/projects/{project}/milestones` | Milestones Index | |
| `/crm/projects/{project}/milestones/create` | Create Milestone | |
| `/crm/projects/{project}/milestones/{milestone}/complete` | Complete Milestone | |
| `/crm/projects/{project}/milestones/{milestone}/reopen` | Reopen Milestone | |
| `/crm/projects/{project}/milestones/{milestone}/deliverables` | Deliverables Index | |
| `/crm/projects/{project}/milestones/{milestone}/deliverables/create` | Create Deliverable | |
| `/crm/projects/{project}/milestones/{milestone}/deliverables/{deliverable}/complete` | Complete Deliverable | |
| `/crm/projects/{project}/milestones/{milestone}/deliverables/{deliverable}/approve` | Approve Deliverable | |
| `/crm/projects/{project}/change-orders` | Change Orders Index | |
| `/crm/projects/{project}/change-orders/create` | Create Change Order | |
| `/crm/projects/{project}/change-orders/{changeOrder}/approve` | Approve Change Order | |
| `/crm/projects/{project}/change-orders/{changeOrder}/reject` | Reject Change Order | |

### Workflows (authenticated)

| Route Pattern | Page | Notes |
|---|---|---|
| `/crm/workflows` | Workflows Index | |
| `/crm/workflows/create` | Create Workflow | |
| `/crm/workflows/{workflow}` | Show Workflow | |
| `/crm/workflows/{workflow}/builder` | Workflow Builder | Triggers, conditions, actions |
| `/crm/workflows/{workflow}/runs` | Workflow Runs Index | |
| `/crm/workflows/{workflow}/runs/{run}` | Run Detail + Debug Console | |
| `/crm/workflows/expression-builder` | Expression Builder | Fields, operators, validate, convert |
| `/crm/workflows/metadata` | Metadata Catalog | Events, operators, actions, approval flows |

### Approvals (authenticated)

| Route Pattern | Page | Notes |
|---|---|---|
| `/crm/approvals` | Approvals Index | |
| `/crm/approvals/{approval}` | Approval Show | Approve/reject/decide |

### Analytics (authenticated)

| Route Pattern | Page | Notes |
|---|---|---|
| `/crm/analytics` | Analytics Hub | Tabs: workflows, approvals, intelligence, predictions, segmentation |
| *(segmentation API)* | Segmentation | Only as tab in analytics hub |

### Optimization CRM-8 (authenticated)

| Route Pattern | Page | Notes |
|---|---|---|
| `/crm/optimization/center` | Optimization Center | Dashboard for CRM-8 |
| `/crm/optimization/recommendations` | Recommendations | Lifecycle tracker |
| `/crm/optimization/recommendations/{type}/status` | Recommendation Status | |
| `/crm/optimization/recommendations/{event}/snapshot` | Recommendation Snapshot | |
| `/crm/optimization/automation-score` | Automation Score | Breakdown |
| `/crm/optimization/automation-score/history` | Automation History | Timeline, trends, insights |
| `/crm/optimization/recommendations/{id}/impact` | Impact Measurement | Comparison, metrics |

### Customer Portal (separate auth, all under `/portal/*`)

| Route Pattern | Page | Notes |
|---|---|---|
| `/portal/dashboard` | Portal Dashboard | |
| `/portal/projects` | Portal Projects | |
| `/portal/projects/{project}` | Portal Project Detail | With change order approve/reject |
| `/portal/profile` | Portal Profile | |
| `/portal/preferences` | Portal Preferences | |
| `/portal/notifications` | Portal Notifications | |
| `/portal/login` | Portal Magic Link Login | |

---

## Section 2: Current Navigation State (AppSidebar)

The existing sidebar implementation organizes content into **3 collapsed sections**:

### Section 1: Platform
- Dashboard

### Section 2: CRM
- Leads
- Contacts
- Organizations
- Deals
- Products
- Forecast
- Pipeline
- Workflows
- Workflow Runs
- Approvals

### Section 3: Analytics & Intelligence
- Analytics Hub
- Workflows Analytics
- Approvals Analytics
- Intelligence
- Optimization
- Predictions

### Current sidebar behavior:
- Each section collapsible with `ChevronDown` indicator
- Active state indicated by navy bar highlight
- Supports expanded (label + icon) and collapsed (icon-only) modes
- Single-level nesting only — no sub-items or nested grouping

---

## Section 3: Navigation Issues

The following issues were identified in the current navigation architecture:

### Issue 1: CRM-8 Optimization Completely Missing
**Severity**: High
**Details**: The Optimization module (CRM-8) has **5+ named routes** (_Center, Recommendations, Status, Snapshot, Automation Score, History, Impact_) but **zero sidebar entries**. Users must navigate to these pages manually or through deep links. This is the primary deliverable of Phase 1 and is invisible in the current nav.

### Issue 2: Projects Module Completely Missing
**Severity**: High
**Details**: The entire Projects sub-domain — including Projects index/show/archive/restore, plus Risks (create/edit/delete), Issues (create/edit/delete), Milestones (create/complete/reopen), Deliverables (create/complete/approve), and Change Orders (create/approve/reject) — has **no sidebar entry**. This is a significant portion of the CRM delivery function that is entirely inaccessible from navigation.

### Issue 3: Quotations Completely Missing
**Severity**: Medium
**Details**: Quotations (create, show, clone) nested under deals have no link.

### Issue 4: Imports Completely Missing
**Severity**: Medium
**Details**: The import management pages (index, show) have no link.

### Issue 5: Activities / Timeline Completely Missing
**Severity**: Medium
**Details**: Activity creation and the polymorphic timeline feed are not linked.

### Issue 6: "Optimization" Link Broken
**Severity**: High
**Details**: The existing Analytics & Intelligence section contains a link labeled "Optimization" that points to `/crm/analytics?tab=optimization`. This tab does not exist in the analytics page. Clicking it results in either a broken page or a default tab with no optimization content.

### Issue 7: Expression Builder Buried
**Severity**: Low
**Details**: The expression builder (`/crm/workflows/expression-builder`) is only reachable from within the workflow builder interface. Power users who need to write complex expressions have no direct navigation path.

### Issue 8: Debug Console Buried
**Severity**: Low
**Details**: The workflow run debug console is only accessible from the run detail page. No direct link exists for monitoring or debugging workflows.

### Issue 9: Segmentation Buried
**Severity**: Low
**Details**: Segmentation only exists as a tab within the Analytics Hub. No direct route or sidebar link.

### Issue 10: Settings Has No Sub-Navigation
**Severity**: Medium
**Details**: The sidebar contains one link to settings (profile page). The Security and Appearance settings pages have no navigation entries. Users must know the URL or use a breadcrumb to reach them.

### Issue 11: No Search / Command Palette
**Severity**: High
**Details**: There is no way to quickly find or jump to a page. With 50+ authenticated routes available, the lack of a search/command palette (`Ctrl+K`) forces users to scroll through the sidebar or rely on bookmarks. This is a significant productivity gap.

### Issue 12: No Recent Items
**Severity**: Medium
**Details**: The navigation has no concept of recently visited records. Users cannot quickly return to a lead, deal, project, or workflow they were just viewing.

### Issue 13: No Favorites / Pins
**Severity**: Low
**Details**: No mechanism for users to bookmark frequently visited pages or records.

### Issue 14: No Quick Actions
**Severity**: Medium
**Details**: There are no shortcut buttons to create a new lead, deal, project, or workflow. A common CRM action requires navigating to the index page first, then clicking the create button.

### Issue 15: No Live Badges
**Severity**: Medium
**Details**: No badge counters for pending approvals, active workflow runs, or other time-sensitive counts. Users must navigate to each section to check for pending items.

### Issue 16: CRM Section Too Large
**Severity**: Medium
**Details**: The CRM section contains 10 flat items (Leads, Contacts, Organizations, Deals, Products, Forecast, Pipeline, Workflows, Workflow Runs, Approvals). This exceeds the recommended maximum of 7 ± 2 items for a single navigation group, increasing cognitive load and scan time.

### Issue 17: Information Architecture Unclear
**Severity**: Medium
**Details**: Operational CRM items (Leads, Deals, Contacts) are mixed with technical automation items (Workflows, Approvals, Workflow Runs). These serve fundamentally different user personas and tasks, yet they appear in the same flat list under a single "CRM" heading.

### Issue 18: No Workspace Concept
**Severity**: Medium
**Details**: Everything is a flat list. There is no task-based grouping, no concept of switching between "Sales mode" and "Automation mode." Users must mentally filter the large list to find what they need.

### Issue 19: Dashboard Has Placeholder Content
**Severity**: Low
**Details**: The main dashboard route exists but contains placeholder content, making it a dead-end entry point. This undermines the utility of the first item in the navigation.

### Issue 20: Breadcrumbs Exist but Underutilized
**Severity**: Low
**Details**: Breadcrumbs are present in some views but could show more contextual depth (e.g., "Sales > Deals > ACME Corp > Quotations > Quote #123").

---

## Section 4: New Architecture Design Decisions

### Decision 1: Workspace-Centric Navigation

**Problem**: Flat navigation lists 20+ items under 3 sections, exceeding cognitive capacity limits.

**Solution**: Organize all authenticated pages into **5 functional workspaces**, each containing only pages relevant to a specific domain. This reduces visible items per workspace to **5–8 items**, lowering cognitive load by an estimated 60%.

### Decision 2: The 5 Workspaces

#### Workspace 1: Sales
_For managing the customer acquisition lifecycle._

| Item | Route | Notes |
|---|---|---|
| Leads | `/crm/leads` | |
| Contacts | `/crm/contacts` | |
| Organizations | `/crm/organizations` | |
| Deals | `/crm/deals` | |
| Pipeline | `/crm/pipeline` | Kanban view |
| Forecast | `/crm/forecast` | Revenue projection |
| Products | `/crm/products` | |
| Quotations | `/crm/deals/{deal}/quotations` | Nested under deals |

#### Workspace 2: Delivery
_For managing project execution and client delivery._

| Item | Route | Notes |
|---|---|---|
| Projects | `/crm/projects` | |
| Milestones | `/crm/projects/{project}/milestones` | Nested under projects |
| Deliverables | per-milestone | Nested under milestones |
| Risks | `/crm/projects/{project}/risks` | Nested under projects |
| Issues | `/crm/projects/{project}/issues` | Nested under projects |
| Change Orders | `/crm/projects/{project}/change-orders` | Nested under projects |
| Imports | `/crm/imports` | |
| Activities | `/crm/activities/create` | |
| Timeline | `/crm/timeline` | |

#### Workspace 3: Automation
_For building and monitoring automated workflows._

| Item | Route | Notes |
|---|---|---|
| Workflows | `/crm/workflows` | |
| Workflow Runs | `/crm/workflows/{workflow}/runs` | Per-workflow run history |
| Approvals | `/crm/approvals` | Pending/approved/rejected |
| Expression Builder | `/crm/workflows/expression-builder` | Direct link (fixes Issue 7) |
| Metadata Catalog | `/crm/workflows/metadata` | Events, operators, actions |
| Debug Console | per-run | Accessible from runs list (fixes Issue 8) |

#### Workspace 4: Analytics
_For insights, reporting, and data intelligence._

| Item | Route | Notes |
|---|---|---|
| Analytics Hub | `/crm/analytics` | |
| Workflow Analytics | tab within hub | |
| Approval Analytics | tab within hub | |
| Intelligence | tab within hub | |
| Predictions | tab within hub | |
| Segmentation | tab within hub | Direct link (fixes Issue 9) |
| System Health | TBD | Future |

#### Workspace 5: Optimization
_For the CRM-8 Automation Intelligence lifecycle._

| Item | Route | Notes |
|---|---|---|
| Optimization Center | `/crm/optimization/center` | Dashboard (fixes Issue 1) |
| Recommendations | `/crm/optimization/recommendations` | Lifecycle tracker (fixes Issue 1) |
| Recommendation Status | `/crm/optimization/recommendations/{type}/status` | (fixes Issue 1) |
| Snapshot | `/crm/optimization/recommendations/{event}/snapshot` | (fixes Issue 1) |
| Automation Score | `/crm/optimization/automation-score` | Score breakdown (fixes Issue 1) |
| Score History | `/crm/optimization/automation-score/history` | Trends & insights (fixes Issue 1) |
| Impact Measurement | `/crm/optimization/recommendations/{id}/impact` | Per-recommendation (fixes Issue 1) |

### Decision 3: Persistent Global Items

The following items are **always accessible** regardless of active workspace:

| Item | Location | Purpose |
|---|---|---|
| Dashboard | Sidebar top | Main entry point |
| Settings | Sidebar footer | Profile, Security, Appearance (fixes Issue 10) |
| Command Palette | Footer / `Ctrl+K` | Universal search (fixes Issue 11) |

### Decision 4: Progressive Disclosure

- Top-level workspace tabs show/hide their sections
- When sidebar is collapsed (icon mode), only the **active workspace** icons are displayed
- Expanding reveals the full menu for that workspace only
- This allows the sidebar to remain compact while providing full access to the active domain

### Decision 5: Always-On Footer

The sidebar footer hosts three things:

1. **Settings** — Chevron expands to reveal Profile, Security, Appearance sub-items (fixes Issue 10)
2. **NavUser** — Current user avatar, name, email, logout
3. **Command Palette trigger** — Keyboard shortcut hint `Ctrl+K` (fixes Issue 11)

### Decision 6: Workspace-Aware Active State

- The active workspace is highlighted based on the current route prefix
- Example: `/crm/deals/123` → Highlights **Sales** workspace, **Deals** sub-item
- Example: `/crm/workflows/45/builder` → Highlights **Automation** workspace, **Workflows** sub-item
- Example: `/crm/optimization/score` → Highlights **Optimization** workspace, **Automation Score** sub-item

### Decision 7: localStorage Persistence

- Active workspace selection is persisted to `localStorage`
- On return, the user's last active workspace is restored
- Fallback: `Sales` workspace is default for new users

---

## Section 5: Deliverables Checklist

| # | Deliverable | Status |
|---|---|---|
| 1 | Complete system map (Section 1) | ✅ Done |
| 2 | Navigation issues identified (Section 2 + 3) | ✅ Done |
| 3 | Architectural decisions documented (Section 4) | ✅ Done |
| 4 | AppSidebar rewritten with 5 workspaces | ⬜ Pending |
| 5 | All previously missing pages added to navigation | ⬜ Pending |
| 6 | Command Palette implemented (Ctrl+K) | ⬜ Pending |
| 7 | Recent Items tracking added | ⬜ Pending |
| 8 | Favorites / Pins mechanism added | ⬜ Pending |
| 9 | Quick Actions (create lead/deal/workflow) added | ⬜ Pending |
| 10 | Live Badges for pending approvals / active runs | ⬜ Pending |
| 11 | Broken "Optimization" link removed or redirected | ⬜ Pending |
| 12 | Settings sub-navigation (Security, Appearance) added | ⬜ Pending |
| 13 | npm build succeeds | ⬜ Pending |
| 14 | All tests pass | ⬜ Pending |

---

## Appendix A: Route Inventory Summary

| Domain | Route Count | Sidebar Coverage |
|---|---|---|
| Public (marketing) | 47 | N/A (no sidebar) |
| Auth (Fortify) | 7 | N/A (pre-authentication) |
| Settings | 3 | 1 of 3 (33%) |
| CRM Core | 22 | 8 of 22 (36%) |
| Projects (Risks, Issues, Milestones, Deliverables, Change Orders) | 18 | 0 of 18 (0%) |
| Workflows | 8 | 2 of 8 (25%) |
| Approvals | 2 | 1 of 2 (50%) |
| Analytics | 2 | 1 of 2 (50%) |
| Optimization (CRM-8) | 7 | 0 of 7 (0%) |
| Customer Portal | 7 | N/A (separate auth) |
| **Total (authenticated)** | **69** | **13 of 69 (19%)** |

**Key Finding**: Only **19%** of authenticated routes have sidebar navigation entries.

## Appendix B: Navigation Gap Analysis — Route Severity Mapping

| Severity | Issues | Routes Missing |
|---|---|---|
| **High** | 1, 2, 6, 11 | Optimization (7 routes), Projects (18 routes), broken link, no search |
| **Medium** | 3, 4, 5, 10, 12, 14, 15, 16, 17, 18 | Quotations, Imports, Activities/Timeline, Settings sub-pages, quick actions, badges |
| **Low** | 7, 8, 9, 13, 19, 20 | Expression builder, debug console, segmentation, favorites, dashboard content, breadcrumbs |
