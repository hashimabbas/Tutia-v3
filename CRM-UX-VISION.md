# CRM-UX-VISION

> **Scope**: CRM-2 (Accounts & Contacts) + CRM-3 (Sales Management)
> **Status**: Pre-implementation design reference
> **Philosophy**: Command-center product experience, not admin panel

---

## 1. Design Principles

### 1.1 Command Center, Not Dashboard
- Every screen serves a decision, not a lookup
- Information density is high but scannable — hierarchy before decoration
- Users manage relationships and progress opportunities, they do not fill forms
- The interface answers: *What needs attention? What changed? What should I do next?*

### 1.2 Multi-Panel as Default
- Split-panel layouts are the primary pattern, not single-column pages
- Left panel: navigation, list, or index
- Center/right panels: detail, timeline, actions
- Panels are resizable and, where useful, detachable into standalone windows

### 1.3 Workflow Over CRUD
- Every entity page is organised around the work to be done, not the record to be edited
- A contact page is a command center for the relationship with that person — activities, deals, notes, next steps
- Form fields are embedded in context, not isolated in modal dialogs
- Inline editing everywhere: click a value to edit it without leaving the page

### 1.4 Visual Language
- Dark command-center theme (`#0a0a0f` surface, `#1e1e2a` borders, `#e8e8ed` primary text)
- Accent: `#3b6cdb` (blue) — used sparingly for primary actions and focus states
- Semantic colours: emerald (won/converted), amber (warning/meeting), rose (negotiation), red (lost), violet (qualified)
- Typography: 11px–13px UI text, 15px–24px headings, tight leading
- No card shadows, no gradient backgrounds, no decorative illustrations
- Every pixel earns its place — whitespace is structural, not cosmetic

---

## 2. Navigation Model

### 2.1 Shell Structure

```
┌──────┬─────────────────────────────────────────────────────────┐
│      │  Top Bar: search ⌘K · notifications · quick create ·   │
│      │           user menu · locale toggle (AR/EN)            │
│  S   ├─────────────────────────────────────────────────────────┤
│  I   │                                                         │
│  D   │  Main Content Area (multi-panel as needed)              │
│  E   │                                                         │
│  B   │  ┌──────────────┬────────────────────┬──────────────┐   │
│  A   │  │ Index/List   │ Detail / Workspace │ Timeline /   │   │
│  R   │  │ (collapsible)│ (primary panel)    │ Sidebar      │   │
│      │  └──────────────┴────────────────────┴──────────────┘   │
│      │                                                         │
└──────┴─────────────────────────────────────────────────────────┘
```

### 2.2 Sidebar

Compact icon sidebar (56px), same as current CRM-1 design, expanded with CRM-2/CRM-3 items:

```
┌──────┐
│   T  │  Logo
├──────┤
│  ◻   │  Command Center (dashboard)
│  ◻   │  Opportunities (deals pipeline)
│  ◻   │  Leads
│  ◻   │  Organizations   ← CRM-2
│  ◻   │  Contacts        ← CRM-2
├──────┤
│  ◻   │  Products        ← CRM-3
│  ◻   │  Quotations      ← CRM-3
├──────┤
│  ◻   │  Forecasting     ← CRM-3
├──────┤
│  ⚙   │  Settings
└──────┘
```

The sidebar is always visible at 56px on desktop. A secondary expanded mode (220px with labels) is available via hover or toggle for discoverability. On mobile, the sidebar becomes a slide-out drawer with labels.

### 2.3 Top Bar

Three zones:

| Left | Center | Right |
|---|---|---|
| Breadcrumb / page context label | — | Global search ⌘K · Notifications · Quick create (+) · User menu · AR/EN toggle |

- Search is a command palette (⌘K): search across leads, deals, organizations, contacts, products, quotations
- Quick create (+) offers: New Lead, New Deal, New Organization, New Contact, New Quotation
- Locale toggle is a single button showing current locale flag/code — switching preserves the current page route with locale prefix

### 2.4 Breadcrumb Convention

Pages that are a workspace (detail view of a single entity) show a breadcrumb in the top bar:

```
Opportunities  /  ERP Platform  /  Quotation #Q-0042
```

The breadcrumb tracks the navigation history but can be clicked to jump up a level. The current entity name is never a link.

---

## 3. Organization Workspace (CRM-2)

### 3.1 Purpose

Understand, manage, and act on every company relationship. The organization workspace is the hub for all interactions with a company — its people, its deals, its history.

### 3.2 Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Organizations / Acme Corp                             │
│  ┌──────────┬───────────────────────────────────┬─────────────────┐ │
│  │ Related  │  Primary Panel                    │  Activity       │ │
│  │ Records  │                                   │  Timeline       │ │
│  │          │  ┌─────────────────────────────┐  │                 │ │
│  │ Contacts │  │ Profile Header              │  │  Today          │ │
│  │  · Sara  │  │ Name, domain, industry      │  │  ○ Call logged  │ │
│  │  · Ahmed │  │ size, owner, tags [edit]    │  │  ○ Email sent   │ │
│  │          │  └─────────────────────────────┘  │                 │ │
│  │ Deals    │  ┌─────────────────────────────┐  │  Yesterday      │ │
│  │  · ERP   │  │ Key Metrics                 │  │  ○ Stage change │ │
│  │  · App   │  │ Active deals · Pipeline     │  │  ○ Note added   │ │
│  │          │  │ value · Open activities     │  │                 │ │
│  │ Tags     │  └─────────────────────────────┘  │                 │ │
│  │  ██      │  ┌─────────────────────────────┐  │                 │ │
│  │  ██      │  │ Deals at this Organization  │  │                 │ │
│  │          │  │ [Stage bar] [Value] [Owner] │  │                 │ │
│  │          │  └─────────────────────────────┘  │                 │ │
│  │          │  ┌─────────────────────────────┐  │                 │ │
│  │          │  │ Recent Activities            │  │                 │ │
│  │          │  │ Inline timeline (last 5)     │  │                 │ │
│  │          │  └─────────────────────────────┘  │                 │ │
│  └──────────┴───────────────────────────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Left Panel: Relationship Graph (Default) / Related Records (Secondary)

The left panel defaults to the **Relationship Graph** (see §8.2), showing contacts as color-coded influence nodes connected by relationship weight edges. A tab switcher at the top toggles between:

| Tab | Content |
|---|---|
| **Relationship Graph** | Interactive node/edge visualization (default) |
| **Contacts** | List with avatar, name, job title, influence badge, primary indicator |
| **Deals** | Compact list with stage badge, value |
| **Tags** | Color-coded pills |

- The panel is 320px wide when showing the graph, 280px for list views
- Graph view includes a legend (DM/IN/CH/BL) at the bottom
- Quick actions row: +Add Contact, +Link Deal, +Add Tag
- Collapsible via narrow handle — colored dots indicate unread activity when collapsed

### 3.4 Primary Panel: Profile + Metrics + Deals

Three stacked sections:

1. **Profile Header**
   - Editable inline fields: name, domain, industry, size, phone, website
   - **Organization Health Score** badge (see §9.2) displayed next to the name — color-coded with trend sparkline
   - Owner assignment dropdown
   - Status indicator (active/inactive)
   - Edit mode is toggled: one click enters edit, fields become inline inputs, save/cancel appear in the header bar
   - No full-page redirect for editing

2. **Key Metrics Strip**
   - Horizontal row: Active Deals (count) · Pipeline Value (currency) · Open Activities (count) · Won This Year (currency)
   - Each metric is a tappable filter — click "Active Deals" filters the deals section below

3. **Next Best Action Strip** (see §10)
   - Horizontal strip between key metrics and deals, showing up to 3 recommendations
   - Each: icon + title + context line + [Dismiss] [Take Action →]
   - Empty state: "All caught up — no actions needed right now"
   - Prioritized: high-urgency items first, medium, low

4. **Deals at this Organization**
   - Horizontal pipeline mini-kanban showing deals at each stage
   - Each deal card shows: title, value, contact name, probability bar
   - Clicking a deal navigates in-place (pushes to left panel stack) or opens in new tab via ⌘+click
   - Empty states show a "Create first deal" button inline

4. **Contact Roster** (optional section, toggleable)
   - Full table of contacts at this org: name, title, email, phone, last activity date
   - Sortable columns, inline phone/email click-to-copy

### 3.5 Right Panel: Universal Timeline

Persistent timeline panel (320px) powered by the **Universal Timeline Architecture** (see §11). Shows events scoped to the organization, its contacts, and its deals:

- Single `<ActivityTimeline>` component with `entityType="organization"`
- Quick-add note input at the top (textarea + submit, creates activity without leaving page)
- Filter bar: All / Calls / Emails / Notes / Meetings / System / Quotes
- Events grouped by date (Today, Yesterday, This Week, Earlier)
- Each event row: icon by type, timestamp, actor, summary, entity breadcrumb
- Click to expand details inline
- Cursor-based infinite scroll pagination

### 3.6 Organization List (Index Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Organizations                          [+ New] [Import CSV]       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Search...                                      [Filter by...]  ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ Name          │ Domain      │ Industry │ Deals │ Owner │ Last   ││
│  │─────────────────────────────────────────────────────────────────││
│  │ Acme Corp     │ acme.com    │ Tech     │   3   │ Sara  │ 2h ago ││
│  │ Nile Ltd      │ nile.sd     │ Finance  │   1   │ Ahmed │ 1d ago ││
│  │ ...           │ ...         │ ...      │  ...  │ ...   │ ...    ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ [Page 1 of 5]                                          [25 ▼]  ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

Features:
- Search-as-you-type (debounced, 300ms) across name, domain, industry
- Filter: by industry, owner, tag, date range
- Sortable columns (click header to toggle asc/desc)
- Each row is clickable → pushes org detail into a split-panel view (no full-page navigation)
- Bulk actions: select rows → assign owner, add tag, delete, export CSV
- Compact density: 40px row height, minimal chrome
- No pagination buttons — infinite scroll with a "Loading..." indicator at the bottom
- Inline domain verification: green checkmark if domain resolves, grey if unknown

---

## 4. Contact Workspace (CRM-2)

### 4.1 Purpose

A 360° command center for every person relationship — who they are, what deals they're involved in, what communications have happened, and what needs to happen next.

### 4.2 Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Contacts / Sara Ahmed                                 │
│  ┌──────────┬───────────────────────────────────┬─────────────────┐ │
│  │ Related  │  Primary Panel                    │  Activity       │ │
│  │ Records  │                                   │  Timeline       │ │
│  │          │  ┌─────────────────────────────┐  │                 │ │
│  │ Linked   │  │ Contact Card                │  │  Today          │ │
│  │ Orgs     │  │ Avatar, name, title, org    │  │  ○ Meeting log  │ │
│  │  · Acme  │  │ Email, phone, mobile        │  │  ○ Email sent   │ │
│  │          │  │ LinkedIn, notes [edit]      │  │                 │ │
│  │ Deals    │  └─────────────────────────────┘  │  Yesterday      │ │
│  │  · ERP   │  ┌─────────────────────────────┐  │  ○ Note added   │ │
│  │          │  │ Involvement                 │  │                 │ │
│  │ Tags     │  │ Deals · Activities · Quotes │  │                 │ │
│  │  ██      │  │ (aggregated counts)         │  │                 │ │
│  │          │  └─────────────────────────────┘  │                 │ │
│  │          │  ┌─────────────────────────────┐  │                 │ │
│  │          │  │ Deals with this Contact     │  │                 │ │
│  │          │  │ [Stage] [Title] [Value]     │  │                 │ │
│  │          │  └─────────────────────────────┘  │                 │ │
│  │          │  ┌─────────────────────────────┐  │                 │ │
│  │          │  │ Quick Actions               │  │                 │ │
│  │          │  │ [Log Call] [Log Email] [Add │  │                 │ │
│  │          │  │  Note] [Create Deal]        │  │                 │ │
│  │          │  └─────────────────────────────┘  │                 │ │
│  └──────────┴───────────────────────────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Contact Card (Primary Panel Header)

- Avatar (initials fallback with color derived from name hash — deterministic per contact)
- Name (first + last, inline editable)
- Job title + department (inline editable)
- Organization link (clickable → navigates to org workspace)
- Email (click to compose in system default mail client, with copy icon)
- Phone / Mobile (click to reveal full number, copy icon)
- LinkedIn URL (click to open, with LinkedIn icon)
- Primary indicator badge (if this contact is primary for their org)
- Tags (color-coded pills, clickable filter)
- Notes section (expandable textarea, auto-saves on blur)

### 4.4 Primary Panel Sections

1. **Involvement Strip**
   - Horizontal counters: Deals (N) · Quotes (N) · Activities (N) · Open Items (N)
   - Each counter is clickable and scrolls the relevant section into view

2. **Deals with this Contact**
   - Same mini-kanban pattern as Organization workspace
   - Shows only deals where this contact is the primary contact
   - Each card: deal title, stage badge, value, owner, expected close date

3. **Quick Actions Toolbar**
   - Persistent row above the timeline section
   - [Log Call] opens a compact inline form: duration, notes, outcome dropdown
   - [Log Email] opens a compact form: subject, notes, send timestamp
   - [Add Note] opens a textarea below the toolbar
   - [Create Deal] pushes a new deal creation form into a right slide-over panel (not a new page)
   - [Send Email] — placeholder for CRM-5, shows "Coming in Communications Center"

### 4.5 Right Panel: Universal Timeline

Same `<ActivityTimeline>` component as Organization (see §11), scoped to this contact: `entityType="contact"`. Inherits all the same patterns — quick-add, filtering, infinite scroll, entity breadcrumbs to related deals and organizations.

### 4.6 Contact List (Index Page)

Same design as Organization list with these columns:
- Name (with avatar) · Organization · Email · Phone · Deals (count) · Last Activity · Owner

Additional features:
- Quick-filter buttons: All / With Deals / No Organization / Recently Active (last 7 days)
- "Merge Duplicates" button in the header bar — selects contacts with matching email or name similarity, presents a side-by-side comparison, lets user choose which fields to keep
- Export: CSV download of filtered list

---

## 5. Opportunity Workspace (CRM-3)

### 5.1 Purpose

The opportunity workspace is the primary tool for deal progression — managing relationships, building quotes, tracking competition, and making data-driven decisions to close.

### 5.2 Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Opportunities / ERP Platform                          │
│  ┌──────────┬───────────────────────────────────┬─────────────────┐ │
│ │ Related  │  Primary Panel                    │  Context        │ │
│ │ Entities │                                   │  Panel          │ │
│ │          │  ┌─────────────────────────────┐  │                 │ │
│ │ Lead     │  │ Deal Header                 │  │  Key Details    │ │
│ │  · Web   │  │ Title, stage, owner, value │  │  Stage: Meeting │ │
│ │          │  │ Probability, close date     │  │  Prob: 40%      │ │
│ │ Contact  │  │ [all inline editable]       │  │  Value: $75K    │ │
│ │  · Sara  │  └─────────────────────────────┘  │  Close: Oct 31  │ │
│ │          │  ┌─────────────────────────────┐  │                 │ │
│ │ Org      │  │ Stage Progress Bar          │  │  Contact        │ │
│ │  · Acme  │  │ [Q]─[M]─[P]─[N]──[● Won]  │  │  Sara Ahmed     │ │
│ │          │  │    ● = current stage          │  │  +249 91...    │ │
│ │ Tags     │  └─────────────────────────────┘  │                 │ │
│ │  ██      │  ┌─────────────────────────────┐  │  Organization   │ │
│ │          │  │ Line Items                   │  │  Acme Corp      │ │
│ │          │  │ Product │ Qty │ Price │ Disc │  │  3 deals total │ │
│ │          │  │─────────│─────│───────│──────│  │                 │ │
│ │          │  │ ERP     │  1  │ $50K  │  0%  │  │  Quotes         │ │
│ │          │  │ Hosting │ 12  │ $2.5K │ 10%  │  │  Q-0042 (Draft) │ │
│ │          │  │ [+ Add Item]                  │  │                 │ │
│ │          │  └─────────────────────────────┘  │  │  Timeline       │ │
│ │          │  ┌─────────────────────────────┐  │  │  (scoped to    │ │
│ │          │  │ Quote Preview               │  │  │   deal)        │ │
│ │          │  │ Total: $77K · Generate PDF  │  │  │                 │ │
│ │          │  └─────────────────────────────┘  │  │                 │ │
│ │          │  ┌─────────────────────────────┐  │  │                 │ │
│ │          │  │ Activity Quick-Add          │  │  │                 │ │
│ │          │  │ [Call] [Email] [Note] [Meeting]│  │                 │ │
│ │          │  └─────────────────────────────┘  │  │                 │ │
│ │          └───────────────────────────────────┘  │                 │ │
│ └──────────┴─────────────────────────────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Primary Panel

1. **Deal Header**
   - Title (inline editable)
   - Stage dropdown — changing stage animates the progress bar below and auto-updates probability
   - Owner (dropdown, triggers notification to new owner)
   - Value (currency input, inline)
   - Expected close date (date picker, inline)
   - Probability (percentage slider 0–100, auto-set by stage, manually overridable)

2. **Stage Progress Bar**
   - Horizontal bar showing all pipeline stages: Qualification → Meeting → Proposal → Negotiation → Closed Won / Closed Lost
   - Current stage highlighted with accent color
   - Completed stages shown in green
   - Future stages dimmed
   - Each stage is clickable — clicking a stage that is ahead of current opens a confirmation: "Move to [Stage]?"
   - Clicking a stage behind current: "Move back to [Stage]?"
   - Won/Lost are endpoints with distinct visual treatment (green checkmark / red X)

3. **Line Items Table**
   - Full editable table: product, description, quantity, unit price, discount %, total
   - Product column: autocomplete search against product catalog (CRM-3)
   - Adding a new item appends a row with inline editing
   - Footer row: subtotal, discount total, grand total
   - Drag-and-drop reorder items via handle on the left
   - Bulk actions: clear all, apply discount to all

4. **Quote Preview**
   - Embedded compact preview of the most recent quotation for this deal
   - Shows: quote number, status badge, total, valid until date
   - Actions: View Full Quote (slide-over), Generate PDF, Send (placeholder for CRM-5)
   - If no quote exists: "Generate Quote from items" button that creates a draft quotation in one click

5. **Activity Quick-Add**
   - Four icon buttons at the bottom: Call, Email, Note, Meeting
   - Clicking expands a compact inline form specific to each type
   - No page navigation or modal — activity is logged directly into the timeline in real-time

### 5.4 Left Panel: Related Entities

Shows the entities linked to this deal:
- **Lead** (source lead if converted) — clickable, navigates to lead workspace
- **Primary Contact** — clickable, shows mini-card with avatar, name, email, phone
- **Organization** — clickable, shows mini-card with name, domain, deal count
- **Tags** — color-coded pills, clickable to filter
- **Quotations** — list of quotations for this deal with status badges
- Each item is clickable → navigates the main content to that entity's workspace (pushes current onto a navigation stack for back-navigation)

### 5.5 Right Panel: Context Panel

A contextual sidebar (320px) with:
1. **Key Details** — read-only summary of the most critical deal fields
2. **Contact card** — primary contact with quick actions (call, email)
3. **Organization mini-profile** — name, domain, active deals count
4. **Recent Quotes** — latest 3 quotations with expandable detail
5. **Timeline** — the same `<ActivityTimeline>` component (see §11), scoped to this deal: `entityType="deal"`. Shows deal events with entity breadcrumbs to linked contact and organization.

This panel is designed as a persistent reference surface — the user keeps it open while working in the primary panel.

---

## 6. Sales Cockpit (CRM-3)

### 6.1 Purpose

A dedicated command surface for sales managers and reps to understand pipeline health, forecast accuracy, team performance, and where to focus attention. This is not a dashboard — it is an interactive decision-support tool.

### 6.2 Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Sales Cockpit                                       [Period ▼]     │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ Pipeline Kanban (collapsible sections per stage)                ││
│  │                                                                ││
│  │ ┌────────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐ ┌─────┐ ││
│  │ │Qualification│ │Meeting │ │ Proposal │ │Negotiation │ │Won  │ ││
│  │ │    3       │ │   5    │ │    4     │ │     2      │ │  1  │ ││
│  │ │  $150K     │ │ $200K  │ │  $180K   │ │   $120K    │ │$75K │ ││
│  │ │ [card] [..] │ │[..][..]│ │ [..][..] │ │  [..]      │ │[..] │ ││
│  │ └────────────┘ └────────┘ └──────────┘ └────────────┘ └─────┘ ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌────────────────────────────────────┬─────────────────────────────┐│
│  │ Weighted Pipeline                   │  Team Performance           ││
│  │                                     │                             ││
│  │  Total: $530K · Weighted: $310K     │  Rep     │ Deals │ Won │ % ││
│  │                                     │  ────────│───────│─────│───││
│  │  ┌──────────────────────────────┐   │  Sara    │   8   │  3  │37%││
│  │  │ Bar chart: pipeline by rep   │   │  Ahmed   │   6   │  2  │33%││
│  │  │ [Sara ████████░░ $180K]      │   │  Omar    │   4   │  1  │25%││
│  │  │ [Ahmed ██████░░░░ $120K]     │   │  Total   │  18   │  6  │33%││
│  │  │ [Omar  ████░░░░░░ $80K]      │   └─────────────────────────────┘│
│  │  └──────────────────────────────┘                                  │
│  └────────────────────────────────────┴─────────────────────────────┘│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ Forecast                              [Publish Forecast]        ││
│  │  Period: Q4 2026 · Status: Draft                                ││
│  │  ┌──────────────┬──────────┬──────────┬──────────────────────┐  ││
│  │  │ Rep          │ Pipeline │ Weighted │ Expected New Biz     │  ││
│  │  ├──────────────┼──────────┼──────────┼──────────────────────┤  ││
│  │  │ Sara         │  $300K   │  $180K   │  $50K                │  ││
│  │  │ Ahmed        │  $200K   │  $120K   │  $30K                │  ││
│  │  │ Omar         │  $150K   │   $80K   │  $20K                │  ││
│  │  ├──────────────┼──────────┼──────────┼──────────────────────┤  ││
│  │  │ Total        │  $650K   │  $380K   │  $100K               │  ││
│  │  └──────────────┴──────────┴──────────┴──────────────────────┘  ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### 6.3 Pipeline Kanban

The kanban is the primary view — it occupies the full width and shows all pipeline stages as horizontal columns:
- Each column header: stage name, deal count, total value
- Deal cards are compact: title, value, contact/organization, days in stage, probability bar
- Drag and drop between columns moves the deal to that stage with a confirmation toast (undoable)
- Cards with high priority or approaching close date get a subtle left-border accent (red for past due, amber for due this week)
- Filter bar above kanban: by owner, by tag, by value range, by close date range
- Toggle between kanban and table view (table view is compact, sortable, for bulk operations)
- When dragging, a ghost card remains in the source column until the drop is confirmed server-side
- Optimistic UI: card moves immediately, reverts if the server rejects the stage change

### 6.4 Lower Panels

Two equal-width panels below the kanban:

1. **Weighted Pipeline** — visual breakdown of pipeline value by rep, with a horizontal bar chart showing total vs. weighted. A sparkline shows the trend over the last 6 periods.

2. **Team Performance** — table of reps with key metrics: active deals, won this period, win rate %, total pipeline, forecast attainment %. Each rep name is clickable → filters the kanban above to show only that rep's deals.

### 6.5 Forecast Section

Full-width table below the panels:
- Editable cells: each rep's expected new business for the period
- Total row auto-calculates
- "Publish Forecast" button locks the forecast and notifies stakeholders
- Published forecasts are read-only with a "Revise" action that creates a new draft version
- Forecast versions are tracked (draft → published → revised)

---

## 7. Interaction Patterns

### 7.1 Inline Editing

- Click any displayed value (text, number, select, date) to enter edit mode
- Edit controls replace the value in-place — no modal, no page transition
- Tab moves to the next editable field
- Enter confirms, Escape cancels
- Changes auto-save on blur (debounced 800ms) with a subtle saving indicator (pulsing dot)
- On save failure: the field shows a red border with a retry button — data is not lost

### 7.2 Split-Panel Navigation

- Clicking a list item opens its workspace in the same view — the left panel remains as context
- The list panel is always present (collapsible) as a navigation reference
- Deep links (from notifications or search) open the full workspace, with the left panel showing the parent index
- Back navigation returns to the previous workspace, not a full page reload

### 7.3 Slide-Over Panels

- Secondary actions (create, edit, import, merge) open in a slide-over panel from the right edge
- The slide-over overlays the right panel, keeping the primary panel visible
- Width: 480px for forms, 640px for comparison views (merge, diff)
- Slide-overs have a dark scrim and a close button
- Form submissions in a slide-over close the panel on success and update the underlying data in-place
- Slide-overs can stack (max 2 deep): e.g., create a deal from a contact workspace → deal form slide-over

### 7.4 Command Palette (⌘K)

Global search and command palette:
- Search all entities: leads, deals, organizations, contacts, products, quotations
- Results grouped by entity type with icons
- Keyboard navigation: ↑↓ arrows, Enter to select, Esc to dismiss
- Quick actions: type "new lead", "goto settings", "create deal"
- Recent searches shown when palette opens with no query
- Supports Arabic text input with correct RTL rendering within the search field

### 7.5 Undo / Toast System

- Every destructive or bulk action shows a toast with [Undo] button
- Toast appears in the bottom-left corner (respects RTL: bottom-right)
- Duration: 5 seconds for informational, 10 seconds for destructive (longer undo window)
- Undo actions are optimistic: the UI reverts immediately, server reverts on confirmation

### 7.6 Bulk Operations

- Index pages support checkbox selection with a floating action bar
- Floating bar appears at the bottom of the viewport when ≥1 item selected
- Shows count and available actions: Assign Owner, Add Tag, Delete, Export, Change Stage (deals)
- Select-all checkbox in the header (with "All N items on this page" / "All N items matching filter" toggle)

### 7.7 Empty States

Every list and section has a deliberate empty state, not a blank area:
- **Organizations**: illustration-free, just text: "No organizations yet. Import your first company list or create one manually." + [Create Organization] [Import CSV]
- **Contacts**: "Contacts are the people you do business with. Add them manually or import from a spreadsheet."
- **Deals**: "Deals track your sales opportunities. Convert a qualified lead or create a deal directly."
- Each empty state is contextual — suggests the next action, not a generic "Nothing here"

---

## 8. Relationship Intelligence Layer

### 8.1 Purpose

Surface the hidden structure in every business relationship — who influences whom, which contacts drive decisions, how organizations connect to each other, and where the relationship risks and opportunities are. The relationship layer transforms a flat list of contacts into a decision-making map.

### 8.2 Organization Relationship Graph

Inside the Organization Workspace, a dedicated "Relationships" section replaces the generic related-records list as the primary left-panel view:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Organizations / Acme Corp                              │
│  ┌────────────────┬───────────────────────────┬──────────────────┐   │
│  │ RELATIONSHIP   │  Primary Panel             │  Timeline       │   │
│  │ GRAPH          │                            │                 │   │
│  │                │  Acme Corp      [Edit]     │  Today          │   │
│  │   ┌──┐         │  acme.com · Tech · 50-200 │  ○ Deal won     │   │
│  │   │CN│─┐       │  Owner: Sara               │  ○ Note added   │   │
│  │   └──┘ │       │                            │                 │   │
│  │        │┌──┐   │  ◇ 4 Deals  ◇ $340K Pipe  │  Yesterday      │   │
│  │   ┌──┐ └│DM│   │  ───────── ORG HEALTH ─── │  ○ Email sent   │   │
│  │   │IN│──└──┘   │  Relationship Strength     │                 │   │
│  │   └──┘         │  ●●●●○○○○○○ 42%            │                 │   │
│  │                │  Decision Access: 3/5      │                 │   │
│  │   [Legend]     │  Active Engagement: High   │                 │   │
│  │   ● DM         │  ───────── CONTACTS ─────  │                 │   │
│  │   ● IN         │  [DM] Sara Ahmed (CEO)     │                 │   │
│  │   ● CH         │  [CH] Ahmed Ali (CTO)      │                 │   │
│  │   ● BL         │  [IN] Omar Hassan (Head)   │                 │   │
│  │                │  [BL] Nada Ibrahim (Proc)  │                 │   │
│  └────────────────┴────────────────────────────┴──────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

- The relationship graph panel (320px) replaces the static related-records list as the default left-panel view for organizations
- Nodes represent contacts, color-coded by influence role
- Edges represent relationship weight (deal involvement, activity frequency, quote history)
- Hovering a node highlights all connections and shows a tooltip with contact name, role, influence classification
- Clicking a node navigates to that contact's workspace or opens a quick-preview card
- Legend at the bottom: DM (Decision Maker), IN (Influencer), CH (Champion), BL (Blocker)
- Empty state: "No relationship data yet — add contacts and log activities to build your relationship map"

### 8.3 Contact Influence Model

Every contact is classified into one of four influence roles, displayed as a badge on the contact card, in the relationship graph, and in lists:

| Role | Badge | Color | Description |
|---|---|---|---|
| **Decision Maker** | DM | Red (#f87171) | Has authority to approve budget and sign contracts. Final decision power. |
| **Influencer** | IN | Amber (#fbbf24) | Shapes the decision through recommendations, requirements, or technical evaluation. |
| **Champion** | CH | Emerald (#34d399) | Internally advocates for your solution. Provides access, intel, and positive framing. |
| **Blocker** | BL | Violet (#a78bfa) | Resists the deal — may be a competitor advocate, risk-averse stakeholder, or budget guardian. |

**Classification UX:**
- Default: Unclassified (no badge shown, grey dot indicator)
- Manually set via dropdown on the contact card: "Influence: [Select role ▼]"
- A contact can have multiple roles (e.g., Champion + Influencer) — shown as stacked badges
- Workspace-level summary: "Influence Map" mini-section in the organization workspace showing count of each role type
- When a Blocker is identified, a subtle notification appears: "Blocker detected: Nada Ibrahim (Procurement) — consider a strategy session with the champion to address concerns"

**Data model consideration:**
- `crm_contacts.influence_role` column: `enum('decision_maker', 'influencer', 'champion', 'blocker', null)`
- `crm_organization_contact.role` (the pivot) stores the context-specific role within that organization relationship

### 8.4 Organizational Relationship Visualization

Beyond individual contacts, organizations themselves have relationships:

| Relationship Type | Example | Visual Treatment |
|---|---|---|
| **Parent / Subsidiary** | TUTIA Group → TUTIA Telecom | Hierarchical tree connector |
| **Partner** | Acme Corp ↔ Nile Ltd (reseller) | Dashed bidirectional line |
| **Competitor** | Acme Corp ↔ Beta Corp (competing for deal) | Red dotted line |
| **Supplier** | Beta Corp → Acme Corp (provides services) | Arrow from supplier to buyer |

- Shown as a secondary graph view within the Organization Workspace, toggled by a "Company Network" tab in the relationship panel
- Manual relationship creation: "Link to Organization" with type selector
- Auto-suggested relationships: shared domain patterns, common contacts, deal overlap — presented as "Suggested Links" with accept/dismiss
- CRM-7 enhancement: graph analytics — centrality scoring, path length analysis, influence propagation

---

## 9. Health Score Framework

### 9.1 Purpose

Quantify the health of every organization and every deal on a single intuitive scale. A health score answers "Is this relationship getting better or worse?" at a glance — no need to read through timelines or cross-reference metrics. Health scores drive prioritization, alerting, and the Next Best Action system.

### 9.2 Organization Health Score

A composite score (0–100) displayed in the Organization Workspace header next to the name:

```
Acme Corp                 89 ● Healthy
```

**Score tiers:**

| Range | Label | Color | Visual |
|---|---|---|---|
| 80–100 | Healthy | Emerald | Green glow on score badge |
| 50–79 | At Risk | Amber | Amber left-border accent on card |
| 0–49 | Critical | Red | Red left-border accent, pulsing indicator |

**CRM-2 scoring rules (rule-based):**

| Rule | Weight | Logic |
|---|---|---|
| Recent activity | 25 pts | ≥3 activities in last 14 days = 25pts. 1–2 = 15pts. 0 = 0pts. |
| Deal pipeline | 25 pts | Active deals exist = 15pts. Deal closed won in last 90d = +10pts. No deals = 0pts. |
| Contact coverage | 20 pts | ≥3 contacts = 20pts. 1–2 = 10pts. 0 = 0pts. |
| Decision maker identified | 15 pts | At least one contact marked as Decision Maker = 15pts. |
| Engagement recency | 15 pts | Last activity < 7 days = 15pts. 7–30 days = 10pts. > 30 days = 5pts. Never = 0pts. |

**Example:** Acme Corp has 4 activities this week (25pts), 3 active deals worth $340K (25pts), 5 contacts (20pts), Sara marked as DM (15pts), last activity today (15pts) = **100/100 ● Healthy**

**Display:**
- Large score badge in the workspace header
- Breakdown tooltip on hover: "89 — Healthy: Recent activity ✓ · Pipeline ✓ · Contacts ✓ · DM identified ✓ · Engagement ✓"
- Score history sparkline (last 6 snapshots) beneath the badge
- Score is recalculated on every relevant event (activity logged, deal created, contact added)

### 9.3 Deal Health Score

A separate score (0–100) for each deal, shown in the Opportunity Workspace header and on kanban cards:

```
ERP Platform              72 ● At Risk
```

**CRM-2 scoring rules:**

| Rule | Weight | Logic |
|---|---|---|
| Stage recency | 30 pts | Stage changed in last 7 days = 30pts. 7–14 days = 20pts. 14–30 days = 10pts. > 30 days = 0pts. |
| Activity momentum | 25 pts | ≥2 activities this week = 25pts. 1 = 15pts. 0 = 0pts. |
| Expected close proximity | 20 pts | Close date > 30 days away = 20pts. 15–30 days = 15pts. < 15 days = 5pts. Past due = 0pts. |
| Champion identified | 15 pts | Linked contact with Champion role = 15pts. |
| Blocker identified | 10 pts | Blocker exists = subtract 10pts (negative rule). No blocker = 0pts (neutral). |

**Example:** ERP Platform last stage change 3 days ago (30pts), 3 activities this week (25pts), close date 45 days away (20pts), Ahmed identified as Champion (15pts), no blocker (0pts) = **90/100 ● Healthy**

**Display on kanban cards:**
```
┌──────────────────────────────┐
│ ERP Platform            72 ● │  ← Score badge top-right
│ $75K · Acme Corp             │
│ Sara · Close: Oct 31         │
│ ██████████░░░░░ 60%          │  ← Probability bar
│ ●●●●●●●○○○ 7d in stage       │  ← Stage stall indicator
└──────────────────────────────┘
```

- Score badge color follows the same tier system (green/amber/red)
- Cards sorted within a kanban column by health score (unhealthy deals rise to the top)
- Manager view: deals sorted by health score ascending (worst-first) across all reps

### 9.4 CRM-7 Predictive Scoring Architecture

The CRM-2 rule-based scoring is designed as a foundation that CRM-7's machine learning scoring can replace without changing the display layer:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Health Score Pipeline                        │
│                                                                     │
│  Event occurs                                                        │
│  (activity, stage change, etc.)                                     │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────┐                                            │
│  │  CrmHealthService   │  ← Single service class, injected          │
│  │  ::recalculate(     │    into observers and controllers           │
│  │    $entity          │                                            │
│  │  )                  │                                            │
│  └────────┬────────────┘                                            │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────────┐  ┌──────────────────────┐                  │
│  │ RuleBasedScorer     │  │ PredictiveScorer     │  ← CRM-7:       │
│  │ (CRM-2 default)     │  │ (interface-matched)  │    swap in      │
│  │                     │  │                      │    without       │
│  │ Rules from 9.2/9.3  │  │ ML model inference   │    changing     │
│  │ Hardcoded weights   │  │ Trained on historical│    consumers     │
│  └────────┬────────────┘  │ audit/outcome data   │                  │
│           │              └────────┬─────────────┘                  │
│           ▼                       ▼                                 │
│  ┌───────────────────────────────────────┐                          │
│  │  Interface: HealthScorerInterface     │                          │
│  │  + calculate(Entity): HealthResult    │                          │
│  │  + factors(): HealthFactor[]          │                          │
│  └───────────────────┬───────────────────┘                          │
│                      │                                              │
│                      ▼                                              │
│  ┌───────────────────────────────────────┐                          │
│  │  HealthResult {                       │                          │
│  │    score: int (0–100),               │                          │
│  │    tier: 'healthy'|'at_risk'|'critical',     │                  │
│  │    factors: [{name, weight, score}]   │                          │
│  │    trend: 'improving'|'stable'|'declining'  │                   │
│  │  }                                     │                          │
│  └───────────────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

- `CrmHealthService` dispatches to the configured scorer via the `HealthScorerInterface`
- CRM-2 uses `RuleBasedScorer` — scores are calculated server-side on every relevant event
- CRM-7 replaces with `PredictiveScorer` — the interface is identical, the frontend never changes
- Scores are cached per entity with a staleness TTL; cache invalidated on scoring events
- Score history is persisted in a `crm_health_snapshots` table (entity_type, entity_id, score, factors JSON, created_at) for trend analysis and the sparkline display

---

## 10. Next Best Action Framework

### 10.1 Purpose

Every workspace surface should answer the question "What should I do next?" with a specific, actionable recommendation. Not a generic notification — a context-aware suggestion that moves the relationship or deal forward. In CRM-2, these are rule-based. In CRM-7, rules are augmented or replaced by ML inference.

### 10.2 Workspace Recommendation Area

Positioned as a dedicated panel within each workspace, between the header and the content sections:

```
┌────────────────────────────────────────────┐
│  Acme Corp                 89 ● Healthy    │
├────────────────────────────────────────────┤
│  NEXT BEST ACTION                          │
│  ┌────────────────────────────────────────┐│
│  │ ◆ Follow up with Sara Ahmed (DM)      ││
│  │   Last activity: 14 days ago           ││
│  │   Suggested: Schedule quarterly review ││
│  │   [Dismiss] [Log Activity →]           ││
│  └────────────────────────────────────────┘│
│  ┌────────────────────────────────────────┐│
│  │ ◆ Introduce champion to decision maker││
│  │   Ahmed Ali (CH) has not met Sara      ││
│  │   Ahmed (DM) this quarter              ││
│  │   [Dismiss] [Schedule Meeting →]       ││
│  └────────────────────────────────────────┘│
├────────────────────────────────────────────┤
│  KEY METRICS                               │
```

**Layout rules:**
- The recommendation area appears as a horizontal strip directly below the workspace header
- Maximum 3 recommendations shown at a time (prioritized by urgency)
- Each recommendation is a compact row: icon + title + context line + action buttons
- "Dismiss" removes the recommendation for 7 days (stored in `crm_dismissed_actions`)
- "Log Activity →" opens the quick-add form pre-configured for the suggested action
- Empty state when no recommendations: "All caught up. Acme Corp looks healthy — no actions needed right now."
- Recommendations appear in all three workspaces: Organization, Contact, Opportunity

### 10.3 Rule-Based Recommendations (CRM-2)

| Trigger | Recommendation | Priority | Workspace |
|---|---|---|---|
| No activity in ≥14 days | "Follow up with {contact name}" — shows last activity date | High | Organization, Contact |
| No activity in ≥7 days on a deal | "Log an activity on {deal title} — {N} days since last update" | High | Opportunity |
| Deal stage not changed in ≥14 days | "Move {deal title} forward — stage unchanged for {N} days. Try scheduling a meeting or sending a proposal." | High | Opportunity |
| Blocker identified, no engagement in ≥30 days | "Address blocker {name} — schedule a meeting with them and the champion" | Medium | Organization, Opportunity |
| Decision maker not identified | "Identify the decision maker at {org name}" | Medium | Organization |
| No champion on active deal | "Find a champion for {deal title} — deals with a champion are 3x more likely to close" | Medium | Opportunity |
| Close date approaching (<15 days), no activity this week | "{Deal title} closes in {N} days — increase activity to maintain momentum" | High | Opportunity |
| Organization health declining (score drop >15 pts in 30 days) | "{Org name} health score dropped {N} points — review recent activity and re-engage" | High | Organization |
| New contact added, no welcome outreach | "Welcome {contact name} — send a brief introduction email" | Low | Contact |
| Won deal, no follow-up in ≥30 days | "Re-engage {org name} — {N} days since deal closed. Check for expansion or referral opportunities." | Medium | Organization |

**Rule engine architecture:**
```
┌──────────────────────────────────────────┐
│           CrmNextBestActionService        │
│                                           │
│  → collect(Entity, User): Action[]        │
│                                           │
│  Iterates registered rules:               │
│    - ActivityStallRule                    │
│    - StageStallRule                       │
│    - BlockerDetectedRule                  │
│    - MissingRoleRule                      │
│    - CloseDateApproachingRule             │
│    - HealthDeclineRule                    │
│    - NewContactRule                       │
│    - WonDealFollowUpRule                  │
│                                           │
│  Each rule returns:                       │
│    Action {                               │
│      priority: high|medium|low           │
│      title: string                       │
│      context: string                     │
│      entityType: string                  │
│      entityId: int                       │
│      suggestedAction: string             │
│    }                                      │
│                                           │
│  Output: sorted by priority, max 3,       │
│    filtered by user_dismissed_actions     │
└──────────────────────────────────────────┘
```

- Rules are registered in a service provider; CRM-6 (Automation) can add new rule types
- Each rule receives the entity and the current user context
- Dismissed actions are stored in `crm_dismissed_actions` (user_id, entity_type, entity_id, rule_key, dismissed_until)
- Recommendations are recalculated on page load and on any event within the workspace

### 10.4 Future AI Compatibility

The rule engine is designed for CRM-7 augmentation:

- The `NextBestActionInterface` allows swapping rule-based → AI inference
- Each `Action` object includes an `origin` field (`'rule'` | `'ai'`) for transparency
- AI-augmented actions show a sparkle icon (✦) instead of the rule gear icon (⚙)
- The AI model receives the same entity context as rules plus historical action outcomes (which recommendations were acted on, which were dismissed)
- Action feedback loop: "Was this helpful?" thumbs up/down on AI recommendations trains the model
- All recommendation data (triggered, acted on, dismissed) is logged to a `crm_action_events` table for training data collection from day one

---

## 11. Universal Timeline Architecture

### 11.1 Purpose

A single, unified timeline component shared across the Organization, Contact, and Opportunity workspaces. Every event type — activities, system changes, communications — renders in one chronological feed with consistent visual treatment, filtering, and interaction patterns. No entity-specific timeline variants.

### 11.2 Component Specification

```
┌──────────────────────────────────────┐
│  ACTIVITY TIMELINE                   │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  Write a note...       [Send]   ││  ← Quick-add input (top)
│  └──────────────────────────────────┘│
│                                      │
│  [All ▼] [Calls] [Emails] [Notes]   │  ← Filter bar
│  [Meetings] [System] [Quotes]       │
│                                      │
│  ─── Today ─────────────────────────  │  ← Date group header
│                                      │
│  ○ Call                              │  ← Event row: icon + type
│    10:30 AM · Sara logged 15min call  │     timestamp + actor + summary
│    "Discussed timeline concerns"     │     expandable detail
│    → Acme Corp · ERP Platform        │     entity breadcrumb (context)
│  │                                   │
│  ◎ Stage changed                     │  ← System event (different icon)
│    9:15 AM · Ahmed moved deal        │
│    "Qualification → Meeting"         │
│    → ERP Platform                    │
│  │                                   │
│  ○ Email                             │
│    Yesterday · Sara sent proposal    │
│    "Proposal attached — awaiting     │
│    feedback"                         │
│    → Sara Ahmed · Acme Corp          │
│                                      │
│  ─── Yesterday ─────────────────────  │
│                                      │
│  ◆ Note                              │  ← Note event (document icon)
│    Yesterday · Omar added note       │
│    "Client prefers phased rollout."  │
│    → ERP Platform                    │
│  │                                   │
│  ◎ Quote generated                   │  ← System event (quote icon)
│    Yesterday · System generated      │
│    "Quotation Q-0042 created —       │
│    Total: $77,000"                   │
│    → ERP Platform                    │
│                                      │
│                     [Load more...]   │  ← Infinite scroll trigger
└──────────────────────────────────────┘
```

### 11.3 Event Model

Every timeline event conforms to a single interface:

```typescript
interface TimelineEvent {
    id: string;
    type: EventType;
    icon: string;           // icon name for renderer
    color: string;          // semantic color for icon
    timestamp: string;      // ISO 8601
    actor: {
        id: number | null;
        name: string;
        avatar: string | null;
    };
    summary: string;        // single-line title
    description: string | null;  // expandable detail
    entity_breadcrumb: {   // contextual parent links
        type: string;
        id: number;
        name: string;
        href: string;
    }[];
    metadata: Record<string, unknown>;  // type-specific payload
}
```

### 11.4 Supported Event Types

| Type | Icon | Color | Source | CRM Availability |
|---|---|---|---|---|
| `note` | FileText | Grey (#555570) | Manual user input | CRM-1 |
| `call` | Phone | Amber (#fbbf24) | Manual user input | CRM-1 |
| `email` | Mail | Blue (#3b6cdb) | Manual user input (CRM-1), sent via CRM-5 (future) | CRM-1+ |
| `meeting` | Calendar | Violet (#a78bfa) | Manual user input | CRM-1 |
| `stage_change` | ArrowRight | Emerald (#34d399) | Observer on stage update | CRM-1 |
| `assignment` | UserCheck | Amber (#fbbf24) | Observer on assignment change | CRM-1 |
| `quote_generated` | FileText | Blue (#3b6cdb) | Observer on quotation create | CRM-3 |
| `quote_accepted` | CheckCircle | Emerald (#34d399) | Observer on quotation accept | CRM-3 |
| `quote_rejected` | XCircle | Red (#f87171) | Observer on quotation reject | CRM-3 |
| `deal_won` | Trophy | Emerald (#34d399) | Observer on deal stage → closed_won | CRM-1 |
| `deal_lost` | ThumbsDown | Red (#f87171) | Observer on deal stage → closed_lost | CRM-1 |
| `contact_added` | UserPlus | Blue (#3b6cdb) | Observer on contact creation linked to org | CRM-2 |
| `organization_linked` | Building2 | Blue (#3b6cdb) | Observer on org linking | CRM-2 |
| `import_completed` | Upload | Grey (#555570) | Observer on import finish | CRM-2 |
| `email_sent` | Send | Blue (#3b6cdb) | CRM-5 integration point | CRM-5 |
| `sms_sent` | MessageSquare | Amber (#fbbf24) | CRM-5 integration point | CRM-5 |
| `whatsapp_sent` | MessageCircle | Emerald (#34d399) | CRM-5 integration point | CRM-5 |
| `system` | Settings | Grey (#555570) | Generic system event | Any |

### 11.5 Entity Scoping

The timeline adapts its scope based on the workspace:

| Workspace | Scope | Entity Breadcrumb |
|---|---|---|
| Organization | All events for this org + its contacts + its deals | Shows contact/deal name as breadcrumb |
| Contact | All events for this contact + deals they're on | Shows org + deal as breadcrumb |
| Opportunity | All events for this deal + linked contact + org | Shows contact + org as breadcrumb |
| Lead | All events for this lead | Shows source entity if converted |

### 11.6 Event Source Architecture

All events flow through a single pipeline:

```
User action (or system event)
        │
        ▼
  ┌─────────────────────┐
  │ Observer fires       │  ← CrmLeadObserver, CrmDealObserver,
  │                      │    CrmOrganizationObserver, CrmContactObserver,
  │                      │    CrmQuotationObserver
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐
  │ CrmAuditLogService   │  ← Creates audit log entry
  │ ::log($event, ...)   │
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐  ← NEW: Timeline service, not a separate table
  │ CrmTimelineService   │
  │ ::collect(           │  ← Aggregates from audit_log +
  │   $entity,           │    activities + future communication tables
  │   $scope             │    into a unified TimelineEvent[]
  │ ) → TimelineEvent[]  │
  └────────┬────────────┘
           │
           ▼
  ┌─────────────────────┐
  │ Inertia response     │  ← Serialized as JSON, consumed by
  │ → React Timeline     │    <ActivityTimeline events={...} />
  │   component          │
  └─────────────────────┘
```

- `CrmTimelineService` is a read-only aggregation service — it does not create a separate timeline table
- It queries from existing sources: `crm_audit_log`, `crm_activities`, and future `crm_emails`, `crm_sms`, `crm_whatsapp` tables
- Each source is fetched via a `TimelineProvider` interface, allowing new sources to register without modifying the service
- The service handles deduplication, sorting, date grouping, and pagination
- Filtering is server-side for performance; all 18 event types are filterable
- Timeline data is paginated with cursor-based pagination (20 items per page), infinite scroll on the client
- The timeline component is rendered inside each workspace via `<ActivityTimeline entityType={...} entityId={...} />` — a single React props interface

### 11.7 Component Props

```typescript
interface ActivityTimelineProps {
    entityType: 'organization' | 'contact' | 'deal' | 'lead';
    entityId: number;
    initialEvents: TimelineEvent[];
    initialCursor: string | null;
    hasMore: boolean;
    filters?: EventType[];       // pre-applied filters
    showQuickAdd?: boolean;      // show note input at top (default true)
    maxHeight?: string;          // constrain panel height (default none)
}
```

### 11.8 Future Event Sources

The `TimelineProvider` contract ensures any future communication channel can contribute to the timeline without modifying existing code:

```php
interface TimelineProvider
{
    public function supports(string $entityType, int $entityId): bool;
    public function getEvents(
        string $entityType,
        int $entityId,
        ?string $cursor,
        int $limit,
        array $filters
    ): TimelineCollection;
}
```

- CRM-5 registers `EmailTimelineProvider`, `SmsTimelineProvider`, `WhatsAppTimelineProvider`
- Each provider handles its own query logic and returns `TimelineEvent` DTOs
- The timeline component renders new event types automatically via the `type` field
- No schema changes, no component changes — new event types just need an icon + color mapping in the frontend renderer

---

## 12. Information Hierarchy

### 12.1 Visual Weight System

| Element | Weight | Example |
|---|---|---|
| Entity title | 15px semibold | "Acme Corp" |
| Section heading | 11px uppercase tracking-wider | "KEY METRICS" |
| Body text | 13px regular | Field values, descriptions |
| Secondary text | 11px muted | Timestamps, metadata |
| Labels | 10px medium | Badges, stage names |

### 12.2 Section Spacing

- 24px padding within panels
- 16px gap between sections
- 8px between related items (e.g., fields in a group)
- 4px between label and value
- No unnecessary borders — vertical spacing alone creates separation
- Sections are not wrapped in cards — they sit directly on the panel background with only a bottom border separating them

### 12.3 Color Usage

- **Blue (#3b6cdb)**: Primary actions, active states, links, selected items
- **Emerald**: Won, converted, positive metrics
- **Red**: Lost, deleted, errors, past-due items
- **Amber**: Meeting stage, warnings, approaching deadlines
- **Rose**: Negotiation stage, high attention
- **Violet**: Qualified stage
- **Grey (#555570)**: Secondary text, inactive, placeholders
- **White (#e8e8ed)**: Primary text
- Color is used sparingly and meaningfully — never as decoration

---

## 13. Mobile Strategy

### 13.1 Breakpoints

| Breakpoint | Layout |
|---|---|
| ≥1280px | Full 3-panel command center |
| 1024–1279px | 2-panel (no left related-records panel, merged into top tabs) |
| 768–1023px | Single panel with bottom navigation bar |
| <768px | Single panel, bottom nav, slide-over menus |

### 13.2 Adaptive Patterns

- **Index pages** become search-first: the filter bar is always visible, the list is scrollable, and the CTA (create) is a floating action button
- **Workspace pages** stack vertically: profile header, then metrics, then related records as collapsible sections, then timeline
- **Activity timeline** becomes the bottom section, reachable by scrolling
- **Kanban** becomes a horizontal swipeable carousel: swipe left/right between stages, tap a card to see detail
- **Slide-over panels** become full-screen sheets from the bottom
- **Command palette** opens with a tap on the search bar at the top (always visible)
- **Quick actions toolbar** collapses into a floating "+" button that expands into an action radial
- **Tables** horizontally scrollable with sticky first column (name/avatar)

### 13.3 Multi-Panel on Mobile

Mobile uses a navigation stack rather than split panels:
- Index → tap item → pushes detail onto stack (with back button)
- Detail → tap related entity → pushes that entity onto stack (nested navigation)
- The stack is managed like a native mobile nav: swipe right to go back, or tap back button
- Deep links (from notifications) start a fresh stack

---

## 14. RTL Considerations & Arabic/English Parity

### 14.1 RTL as a First-Class Layout, Not a Mirror

- RTL is not a CSS flip — it is an intentional layout model
- The entire layout system uses logical properties (`padding-inline-start`, `margin-inline-end`, `inset-inline-start`) rather than physical ones (`padding-left`, `margin-right`, `left`)
- Tailwind CSS RTL support via `rtl:` and `ltr:` modifiers for any asymmetric styling
- Flexbox direction reverses automatically via `dir="rtl"` on the root element

### 14.2 Layout Adaptations for RTL

| English (LTR) | Arabic (RTL) |
|---|---|
| Sidebar on the left | Sidebar on the right |
| Left panel (related records) on the left | Related records panel on the right |
| Right panel (timeline) on the right | Timeline panel on the left |
| Breadcrumb: left-aligned, chevron separator | Breadcrumb: right-aligned, reversed chevron separator |
| Table columns: left-aligned text | Table columns: right-aligned text, left-aligned numbers |
| Activity timeline: dot on left, content on right | Timeline: dot on right, content on left |
| Slide-over panels: slide in from right | Slide-over panels: slide in from left |
| Toasts: bottom-left corner | Toasts: bottom-right corner |
| Search bar: icon on left | Search bar: icon on right |
| Pagination: Previous on left, Next on right | Pagination: Previous on right, Next on left |

### 14.3 Form & Input Considerations for Arabic

- All text inputs accept Arabic script natively — no special "Arabic mode" required
- Number inputs remain LTR even in RTL mode (1234 is rendered LTR within an RTL form)
- Date pickers: locale-aware weekday/month names. Arabic calendar is Gregorian (not Hijri) unless Hijri toggle is enabled in settings
- Phone number inputs: +249 prefix is common for Sudan — input mask accommodates variable-length numbers
- Email inputs: Latin-only for the domain portion (@example.com), but local part can contain Arabic characters (per internationalized email standards)
- Validation error messages appear in the active locale

### 14.4 Typography for Arabic

- Arabic UI font: Noto Naskh Arabic or IBM Plex Sans Arabic (clean, modern, readable at 11–13px)
- Line height for Arabic: 1.6 (vs 1.4 for Latin) — Arabic text needs more vertical space for readability
- Font weight: Arabic Regular (400) maps to Latin Regular (400); Arabic Bold (700) maps to Latin Semibold (600) — Arabic bold is visually heavier than Latin bold at the same weight
- Mixed text (Arabic + English in the same string): Arabic text uses the Arabic font, English text and numbers use the Latin font, rendered inline with correct baseline alignment
- UI labels in the sidebar and buttons shorter in Arabic than English (Arabic is more concise) — layout accommodates via `min-width` rather than fixed widths

### 14.5 Locale Management

- Locale is persisted in the user's profile and sent as a cookie + URL prefix (`/ar/crm/...`, `/en/crm/...`)
- Switching locale preserves the current route and all query parameters
- Inertia server-rendered pages receive the locale as a prop and pass it to React context
- Date/time formatting: `Intl.DateTimeFormat` with the user's locale
- Number/currency formatting: `Intl.NumberFormat` with the user's locale (Arabic uses Arabic-Indic digits if the user prefers, configurable in profile)
- Currency: SDG (Sudanese Pound) is the primary display currency, with USD toggle per workspace
- All hardcoded strings (labels, placeholders, empty states, validation messages) use Laravel translation strings (`__('crm.leads.title')`) — no inline English strings

### 14.6 Testing for Parity

- Every UI component test runs in both LTR and RTL modes automatically
- Visual regression tests capture both layouts
- E2E tests verify that all workflows are completable in both locales
- Keyboarding: Tab order follows visual order in both directions
- Screen reader: `dir` attribute is set on the root and all directional containers — ARIA attributes remain in English (spec standard), content is localized

---

## 15. Component Inventory (CRM-2/CRM-3 New)

| Component | Purpose | Workspace |
|---|---|---|
| `OrganizationCard` | Compact org profile card | Organization, Contact, Opportunity |
| `OrganizationRoster` | Contact listing within org | Organization |
| `ContactCard` | Compact person profile with actions | All workspaces |
| `ContactRoster` | Contact list with filters | Contacts index |
| `DuplicateComparison` | Side-by-side merge UI | Contacts index |
| `InlineEditableField` | Click-to-edit text/number/select | All workspaces |
| `StageProgressBar` | Pipeline stage progression visual | Opportunity |
| `LineItemsTable` | Editable deal items with totals | Opportunity |
| `QuotePreview` | Compact quotation summary | Opportunity |
| `KanbanColumn` | Pipeline stage column | Sales Cockpit |
| `KanbanCard` | Deal card in kanban | Sales Cockpit |
| `PipelineBarChart` | Weighted pipeline by rep | Sales Cockpit |
| `TeamPerformanceTable` | Rep metrics table | Sales Cockpit |
| `ForecastTable` | Period forecast with editable entries | Sales Cockpit |
| `SplitPanel` | Resizable multi-panel container | Shell |
| `SlideOverPanel` | Right/left sliding secondary panel | Shell |
| `ActivityTimeline` | Polymorphic activity feed | All workspaces |
| `TimelineEvent` | Single event row in timeline (18 types) | ActivityTimeline |
| `HealthScoreBadge` | Score badge with tier color + trend | All workspaces |
| `RelationshipGraph` | Interactive node/edge org map | Organization |
| `InfluenceBadge` | DM/IN/CH/BL role badge on contact | Contact, Organization |
| `RecommendationCard` | Next best action suggestion row | All workspaces |
| `QuickActionBar` | Contextual action buttons | All workspaces |
| `CommandPalette` | ⌘K global search + commands | Shell |
| `FloatingActionBar` | Bulk selection actions | All index pages |
| `EmptyState` | Contextual empty state with CTA | All index pages |

---

## 16. Visual Reference: Key Screens

### 16.1 Organization Workspace (Canonical)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Organizations / Acme Corp                                         │
│  ┌────────┬─────────────────────────────────────┬──────────────────┐│
│ │CONTA│  │ Acme Corp                  [Edit]   │  ACTIVITY        ││
│ │CTS  │  │ acme.com · Technology · 50-200 emp  │  TIMELINE        ││
│ │     │  │ Owner: Sara                        │                  ││
│ │Sara │  │                                     │  Today           ││
│ │Ahmed│  │ ◇ 4 Deals  ◇ $340K Pipeline  ◇ 3   │  ○ 10:30 - Call  ││
│ │     │  │   Open Activities                   │     logged by    ││
│ │DEAL│  │                                     │     Sara - 15min ││
│ │S   │  │ ────────── DEALS ──────────         │     "Discussed   ││
│ │     │  │ Qual│Meeting│Propos│Negot│Won│Lost │     timeline..." ││
│ │ERP │  │ [2] │ [1]   │ [1]  │ [0]  │[1]│[0] │                  ││
│ │App │  │ ERP Platform · $75K · Negotiation  │  ○ 09:15 - Email  ││
│ │     │  │ Mobile App · $45K · Proposal      │     sent by Ahmed ││
│ │TAGS│  │                     Show all →     │     "Proposal     ││
│ │███ │  │ ────────── RECENT ──────────       │     attached"     ││
│ │███ │  │ [Log Call] [Log Email] [Add Note]  │                  ││
│ │    │  │ ○ Sara: Meeting scheduled Oct 15   │  Yesterday       ││
│ └────┴──┴─────────────────────────────────────┴──────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 16.2 Opportunity Workspace (Canonical)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Opportunities / ERP Platform                                      │
│  ┌──────┬─────────────────────────────────────┬───────────────────┐│
│ │LINKED│ │ ERP Platform              [Edit]   │  KEY DETAILS      ││
│ │      │ │ Stage: Meeting ▼  Owner: Sara ▼   │                   ││
│ │Lead  │ │ Value: $75,000  Prob: 60%  Close:  │  Stage: Meeting   ││
│ │Con→  │ │ Oct 31                            │  Probability: 60% ││
│ │Org→  │ │ ┌────────────────────────────────┐ │  Value: $75K      ││
│ │      │ │ │ Q ──● M ── P ── N ── Won ──   │ │  Close: Oct 31    ││
│ │Quotes│ │ └────────────────────────────────┘ │                   ││
│ │Q-042 │ │ ──────── LINE ITEMS ────────      │  CONTACT          ││
│ │      │ │ Product    │ Qty │ Price  │ Total │  Sara Ahmed       ││
│ │TAGS  │ │ ERP Suite  │  1  │ $50K   │ $50K  │  sarah@acme.com   ││
│ │██    │ │ Cloud Host │ 12  │ $2.5K  │ $30K  │  +249 912 345 678 ││
│ │      │ │ [+ Add]    │     │        │       │                   ││
│ │      │ │ Total: $80,000                    │  ORG              ││
│ │      │ │ ──────── QUOTE ─────────          │  Acme Corp        ││
│ │      │ │ Q-042 · Draft · $77K              │  3 deals total    ││
│ │      │ │ [View] [Generate PDF]             │                   ││
│ │      │ │ ──────────────────────            │  ── QUOTES ──     ││
│ │      │ │ [Call] [Email] [Note] [Meeting]   │  Q-042 · Draft    ││
│ └──────┴──────────────────────────────────────┴───────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 16.3 Sales Cockpit (Canonical)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Sales Cockpit                        Q4 2026 ▼  [Refresh] [Export]│
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌─────────┐ │
│  │Qualificat│ │ Meeting  │ │ Proposal │ │Negotiation │ │   Won   │ │
│  │    3     │ │    5     │ │    4     │ │     2      │ │   1     │ │
│  │  $150K   │ │  $200K   │ │  $220K   │ │   $120K    │ │  $75K   │ │
│  │          │ │          │ │          │ │            │ │         │ │
│  │App for.. │ │ERP Plat..│ │Cloud Mi..│ │Telecom P.. │ │SMS Gat..│ │
│  │$45K · 20d│ │$75K · 10d│ │$60K · 5d │ │$55K · 2d  │ │$75K ·.. │ │
│  │[Ahmed]   │ │[Sara]    │ │[Ahmed]   │ │[Sara]     │ │[Sara]   │ │
│  │●●●●●●●○○○│ │●●●●●●●●○○│ │●●●●●●●●●○│ │●●●●●●●●●●│ │         │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ └─────────┘ │
│                                                                      │
│  ┌──────────────────────────────────┬──────────────────────────────┐│
│  │ Pipeline by Rep                  │  Team Performance            ││
│  │ Sara:    ████████████░░░░ $280K  │  Rep   │ Dls │ Won │ Rate   ││
│  │ Ahmed:   ████████░░░░░░░░ $200K  │  Sara  │  8  │  3  │ 37%    ││
│  │ Omar:    ██████░░░░░░░░░░░ $150K  │  Ahmed │  6  │  2  │ 33%    ││
│  │                                  │  Omar  │  4  │  1  │ 25%    ││
│  │ Weighted: $350K of $630K         │──────────────────────────────││
│  └──────────────────────────────────┴──────────────────────────────┘│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ Forecast — Q4 2026 (Draft)                         [Publish]    ││
│  │  Rep        │ Pipeline │ Weighted │ New Biz │ Total Forecast    ││
│  │  Sara       │  $280K   │  $160K   │  $50K   │  $210K            ││
│  │  Ahmed      │  $200K   │  $110K   │  $30K   │  $140K            ││
│  │  Omar       │  $150K   │   $80K   │  $20K   │  $100K            ││
│  │  Total      │  $630K   │  $350K   │  $100K  │  $450K            ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 17. Implementation Boundaries

### 17.1 CRM-2 Deliverables (Current Phase)

- Organization and Contact models, migrations, relationships, factories, seeders
- Organizations index + workspace (multi-panel as specified)
- Contacts index + workspace (multi-panel as specified)
- Address and Tag polymorphic systems
- Organization/Contact policies with ownership scoping
- Duplicate detection service (email + domain + name)
- Org merge controller + UI
- CSV import service for organizations and contacts
- Add `organization_id` to leads + deals, `contact_id` to deals
- Data migration: existing `company` text → `CrmOrganization` records
- All features tested (Pest, coverage targets)

### 17.2 CRM-3 Deliverables (Next Phase)

- Product catalog (categories, products, deal items)
- Quotation system (create from deal, generate PDF, accept/reject workflow)
- Forecasting (periods, weighted pipeline, per-rep entries, publish flow)
- Pipeline kanban with drag-and-drop stage transitions
- Sales Cockpit with pipeline, team performance, forecast table
- Pipeline automation rule engine (CRM-6 foundation)
- All features tested

### 17.3 Non-Goals (Out of Scope)

- Email integration (CRM-5 — Communications)
- Calendar sync (CRM-5)
- SMS sending from CRM (CRM-5)
- Automation sequences (CRM-6)
- Advanced analytics dashboards (CRM-7)
- Mobile native apps (responsive web only for CRM-2/CRM-3)

---

## 18. Visual Language Reference Code

### 18.1 Tailwind CSS Conventions

```css
/* Surface colors */
.bg-surface       { background-color: #0a0a0f; }   /* main background */
.bg-surface-raised { background-color: #0f0f14; }  /* panels */
.bg-surface-hover  { background-color: #1a1a24; }  /* hover states */
.border-subtle    { border-color: #1e1e2a; }       /* borders */

/* Text colors */
.text-primary     { color: #e8e8ed; }
.text-secondary   { color: #8b8b9e; }
.text-muted       { color: #555570; }

/* Accent */
.accent           { color: #3b6cdb; background-color: #3b6cdb; }

/* Semantic stages (for stage badges/progress) */
.stage-new         { color: #60a5fa; background: #60a5fa20; }  /* blue-400 */
.stage-contacted   { color: #fbbf24; background: #fbbf2420; }  /* amber-400 */
.stage-qualified   { color: #a78bfa; background: #a78bfa20; }  /* violet-400 */
.stage-proposal    { color: #fb923c; background: #fb923c20; }  /* orange-400 */
.stage-negotiation { color: #fb7185; background: #fb718520; }  /* rose-400 */
.stage-won         { color: #34d399; background: #34d39920; }  /* emerald-400 */
.stage-lost        { color: #f87171; background: #f8717120; }  /* red-400 */
```

### 18.2 Spacing Scale

| Token | Rem | Pixels | Usage |
|---|---|---|---|
| `space-1` | 0.25rem | 4px | Between label and value |
| `space-2` | 0.5rem | 8px | Between related items |
| `space-3` | 0.75rem | 12px | Between unrelated items in same section |
| `space-4` | 1rem | 16px | Between sections |
| `space-6` | 1.5rem | 24px | Panel padding |
| `space-8` | 2rem | 32px | Between major layout blocks |

---

*This document is the UX reference for CRM-2 and CRM-3 implementation. Every component, layout, and interaction pattern must conform to this vision. Deviations require a documented exception.*
