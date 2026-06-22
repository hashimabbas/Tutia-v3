# CRM-3 — Sales Operating System Vision

## Mandate

CRM-3 is not a "Deals CRUD" upgrade. It transforms the CRM into a **Sales Operating System** — the daily command center for opportunity management, product configuration, quotation lifecycle, and pipeline intelligence.

All four mandates below must ship together. No partial delivery.

---

## Part 1: Opportunity Workspace

This is the most important screen in the entire CRM. Every other workspace feeds into or from it.

### Layout: 3-Panel (Deal Command Center)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Deals  /  {Deal Title}                         [Edit]   │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│  LEFT    │  CENTER                          │  RIGHT        │
│  280px   │  flex-1                          │  320px        │
│          │                                  │               │
│ Products │  Header                          │  Timeline     │
│  - item  │    Title · Value · Stage         │  (filtered    │
│  - item  │    Health · Owner · Close date   │   to deal)    │
│          │                                  │               │
│ Quotes   │  NBA Strip                       │               │
│  v1      │  (contextual to deal:            │               │
│  v2      │   missing champion, stall,       │               │
│          │   competitor risk, etc.)         │               │
│ Risks    │                                  │               │
│  - risk  │  Stakeholder Map                 │               │
│  - risk  │  (SVG graph of deal contacts     │               │
│          │   with influence encoding)        │               │
│          │                                  │               │
│ Competi- │  Products Lineup                 │               │
│ tors     │  (table: product, qty,           │               │
│  - comp  │   list price, discount, total)   │               │
│          │                                  │               │
│ Forecast │  Quotation Versions              │               │
│  Commit  │  (version history with           │               │
│  Best    │   status: draft/sent/accepted)   │               │
│  Pipe    │                                  │               │
│          │  Activity Log (compact)          │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

### Data Model Requirements

| Field | Type | Notes |
|---|---|---|
| `name` | string | Deal title |
| `value` | decimal | Current deal value (sum of quoted products) |
| `stage` | string | Funnel stage |
| `expected_close_date` | date | Nullable |
| `probability` | integer | 0–100, auto-calculated from stage or manual |
| `forecast_category` | enum | `commit`, `best_case`, `pipeline` |
| `health_score` | computed | Reuse CRM-2 health engine |
| `notes` | text | |
| `owner_id` | FK → User | |
| `organization_id` | FK → CrmOrganization | |
| `primary_contact_id` | FK → CrmContact | Main stakeholder |

### Stakeholder Map (Left Panel)
- SVG graph with the deal at center
- Connected contacts with influence encoding (DM=red, CH=green, BL=purple, IN=yellow)
- Edge thickness = relationship strength
- Empty state: "No stakeholders mapped yet. Add key contacts to build your deal team."

### Stakeholder Coverage Index
A computed 0–100% metric shown at the top of the left panel:

| Factor | Weight | Criteria |
|---|---|---|
| Decision Maker identified | 40% | `influence_type.slug = 'decision_maker'` among deal/org contacts |
| Champion identified | 30% | `influence_type.slug = 'champion'` among deal/org contacts |
| Influencer identified | 15% | `influence_type.slug = 'influencer'` among deal/org contacts |
| Blocker known | 15% | `influence_type.slug = 'blocker'` is mapped (positive even if present — awareness matters) |

Display: `Stakeholder Coverage: 75%` with a thin progress bar.

This index feeds into:
- **Health Score** — low coverage penalizes health
- **Forecast Confidence** — low coverage downgrades confidence tier
- **NBA Engine** — missing DM/champion triggers specific recommendations

### Products Lineup (Center Panel)
- Table: Product name, version, quantity, unit price, discount %, total
- Inline editing for qty & discount
- "Add product" button opens product catalog modal
- Total auto-calculates → updates deal value

### Quotation Versions (Center Panel)
- Vertical timeline of quote versions
- Each version: version number, total, status (draft/sent/accepted/rejected), created date
- Click to expand full quote
- "New version" button (clones latest, increments version)

### Risks (Left Panel)
- List: risk description, severity (high/med/low), mitigation, owner
- "Add risk" inline form
- Color-coded severity badges

### Competitors (Left Panel)
- List: competitor name, position (leading/competitive/losing), notes
- "Add competitor" inline form
- Win rate tracking (future: link to won/lost deals)

---

## Part 2: Quotation Workspace

### Layout: Full-width document view

```
┌─────────────────────────────────────────────────────────────┐
│  ← {Deal Title}  /  Quote v{version}          [Send] [PDF] │
├─────────────────────────────────────────────────────────────┤
│  Header: Quote #{id} · Version {v} · Status · Created ·    │
│          Valid until · Total                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Products                                                    │
│  ┌──────────┬────┬────────┬────────┬──────┬──────────┐     │
│  │ Product  │ Qty│ Unit $ │ Disc % │ Net  │ Total    │     │
│  ├──────────┼────┼────────┼────────┼──────┼──────────┤     │
│  │ ERP Pro  │ 1  │ 15,000 │ 10%    │13,500│ 13,500   │     │
│  │ Bulk SMS │ 2  │ 500    │ 0%     │ 500  │ 1,000    │     │
│  │ Consulting│ 40h│ 200/h  │ 15%   │ 170  │ 6,800    │     │
│  └──────────┴────┴────────┴────────┴──────┴──────────┘     │
│                                                             │
│  Subtotal:        21,300                                    │
│  Discount total:  1,500                                     │
│  Tax (15%):       2,970                                     │
│  Grand Total:     22,770                                    │
│                                                             │
│  Terms & Notes                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │ Payment terms: 50% upfront, 50% on delivery      │      │
│  │ Valid until: 2026-08-20                          │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  Version History (right rail)                               │
│  v3  (sent)   2026-06-20  Total: $22,770                   │
│  v2  (draft)  2026-06-18  Total: $19,500                   │
│  v1  (sent)   2026-06-15  Total: $25,000                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Model Requirements

**Products Catalog** (`crm_products`):
| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `name` | string | Product name |
| `description` | text | |
| `category` | string | erp, connectivity, vpn, bulk_sms, payment_gateway, custom_development, consulting |
| `type` | enum | `product`, `service`, `subscription`, `package` — Tutia products span all four |
| `unit_price` | decimal | Default unit price |
| `unit_type` | string | unit, hour, license |
| `version` | SMALLINT | Product version number |
| `parent_id` | FK → self NULL | Version chain parent |
| `is_active` | boolean | |
| `created_at` | timestamp | |

**Quotation** (`crm_quotations`):
| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `deal_id` | FK → CrmDeal | |
| `version` | SMALLINT | Auto-increment per deal |
| `status` | string | draft, internal_review, sent, viewed, accepted, rejected, expired |
| `subtotal` | decimal | |
| `discount_total` | decimal | |
| `tax_rate` | decimal | Default 15% |
| `tax_total` | decimal | |
| `grand_total` | decimal | |
| `payment_terms` | text | |
| `valid_until` | date | |
| `notes` | text | |
| `created_by` | FK → User | |
| `created_at` | timestamp | |

**Quotation Line Items** (`crm_quotation_items`):
| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `quotation_id` | FK → CrmQuotation | |
| `product_id` | FK → CrmProduct | |
| `product_name` | string | Snapshot of product name at quote time |
| `description` | text | |
| `quantity` | decimal | |
| `unit_price` | decimal | Price at time of quote |
| `discount_percent` | decimal | 0–100 |
| `net_price` | decimal | unit_price * (1 - discount/100) |
| `total` | decimal | net_price * quantity |
| `sort_order` | integer | |

### UX Principles
- Quotation is a **document**, not a form — it should look like a quote when viewed, with edit controls appearing on hover
- Version cloning: "New version" copies all line items, increments version, resets status to draft
- PDF export button generates a clean print view
- Status workflow: **draft → internal_review → sent → viewed → accepted/rejected/expired** (full lifecycle)
- Sent quotes track `viewed` status (viewed_at timestamp) to know when the customer opened it
- Expired quotes auto-flag when `valid_until` passes
- Each version is immutable after being sent (archived)

---

## Part 3: Forecast Workspace

### Layout: 2-Panel (Forecast + Pipeline Intelligence)

```
┌─────────────────────────────────────────────────────────────┐
│  Forecast Q3 2026                    [Q2] [Q3*] [Q4] [Next]│
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  QUARTER SUMMARY     │  DEAL LEVEL FORECAST                 │
│                      │                                      │
│  Commit    $120,000  │  ┌────────┬──────┬────┬────┬──────┐ │
│  Best Case $210,000  │  │ Deal   │Value │Stage│Cat │WS%  │ │
│  Pipeline  $380,000  │  ├────────┼──────┼────┼────┼──────┤ │
│                      │  │ Acme   │ 50K  │Neg │C   │ 90%  │ │
│  Weighted   $187,000 │  │ Beta   │ 70K  │Prop│BC  │ 60%  │ │
│  (by stage prob)     │  │ Gamma  │ 90K  │Qual│P   │ 20%  │ │
│                      │  │ ...    │      │    │    │      │ │
│  Gap to Quota         │  └────────┴──────┴────┴────┴──────┘ │
│  (if quota set)      │                                      │
│                      │  Filters: [Owner] [Stage] [Category] │
│  Health Distribution │                                      │
│  ┌──────────────────┐│  Quick Actions:                      │
│  │ 🟢 Healthy 12    ││  → Stale deals (no activity 14d)    │
│  │ 🟡 At Risk  5    ││  → Stuck stages (no movement 14d)   │
│  │ 🔴 Critical 2    ││  → Missing stakeholders             │
│  └──────────────────┘│                                      │
│                      │                                      │
│  TEAM BREAKDOWN      │                                      │
│  ┌─────────┬────┬────┴──────┬────┬─────────────────────────┐│
│  │Rep      │C   │BC  │Pipe  │Total│                         ││
│  ├─────────┼────┼────┼──────┼────┤                         ││
│  │Ahmed    │50K │80K │120K  │250K│                         ││
│  │Sara     │40K │60K │150K  │250K│                         ││
│  │Omar     │30K │70K │110K  │210K│                         ││
│  └─────────┴────┴────┴──────┴────┘                         ││
└──────────────────────┴──────────────────────────────────────┘
```

### Data Model Requirements

No new tables needed. `CrmDeal` already has `value`, `stage`, `expected_close_date`, `probability`. The forecast is computed from these fields plus the new `forecast_category` column.

**Forecast Additions to CrmDeal:**
| Field | Type | Notes |
|---|---|---|
| `forecast_category` | enum | commit, best_case, pipeline |
| `quota_id` | FK → CrmQuota NULL | Optional quota target link |

**CrmQuota (new):**
| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `user_id` | FK → User | |
| `period` | string | 2026-Q3, 2026-M07, 2026 |
| `type` | string | quarterly, monthly, annual |
| `amount` | decimal | Target amount |
| `created_at` | timestamp | |

### Forecast Tiers (user-selectable per deal, confidence-assisted)

The category is user-selected, but the system shows a **confidence score** to validate or challenge the rep's selection.

| Category | Criteria | Confidence Range |
|---|---|---|
| **Commit** | Verbal commitment from DM, or signed documents pending | 90%+ |
| **Best Case** | Strong champion, active eval, no blockers | 50–89% |
| **Pipeline** | Early stage, qualification in progress | <50% |

**Forecast Confidence** is a computed score (0–100) that factors:

| Factor | Weight | Source |
|---|---|---|
| Deal stage probability | 30% | Stage-based probability weight |
| Health score | 25% | CRM-2 HealthScore engine |
| Days since last activity | 15% | Activity stall check — penalty if >14d idle |
| Stakeholder Coverage Index | 20% | DM + champion + influencer + blocker coverage |
| Time in current stage | 10% | Penalty if stalled >14d without progression |

Formula: `confidence = Σ(factor_weight × factor_score) / total_weight`

Displayed as: `Confidence: 78% — Aligns with Best Case`

If confidence deviates significantly from the user-selected category (e.g., user picks Commit but confidence is 45%), the UI surfaces a soft warning: "This deal may not qualify as Commit yet. Consider moving to Best Case."

Weighted forecast = sum of (deal.value × (confidence/100)) per category.

### UX Principles
- Primary view is **current quarter** with next/previous navigation
- Rep can drill into their own forecast or view team rollup (manager)
- Color-coded health distribution is clickable → filtered deal list
- Gap analysis: if quota is set, show bar chart of (commit + best case) vs target
- Stale/stuck deals section is actionable: click → jump to deal workspace
- Weekly snapshot: auto-save weekly forecast snapshots for historical accuracy tracking (future)

---

## Part 4: Pipeline Command Center

### Layout: Full-width analytical dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Pipeline Dashboard                             [Export]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STAGE FUNNEL (SVG)                                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Qualification    ████████████████████████  12 ($380K)│  │
│  │  Meeting          ████████████████           8 ($210K)│  │
│  │  Proposal         ██████████                  5 ($140K)│  │
│  │  Negotiation      ██████                       3 ($95K)│  │
│  │  Closed Won       ████                         2 ($50K)│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ VELOCITY     │ BOTTLENECKS  │ HEALTH OVERVIEW          │ │
│  │              │              │                          │ │
│  │ Avg time     │ Proposal >  │ 🟢 Healthy   12           │ │
│  │ to close:    │ Neg: 18d    │ 🟡 At Risk    5           │ │
│  │ 45 days      │ (above avg) │ 🔴 Critical   2           │ │
│  │              │              │                          │ │
│  │ Win rate:    │ Top reason:  │ NBA Engine               │ │
│  │ 34%          │ pricing     │ → 3 deals missing DM     │ │
│  │              │              │ → 2 deals inactive 14d   │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│                                                             │
│  Filters: [Owner] [Stage] [Category] [Organization]        │
│  View: Board | Table | Funnel                              │
└─────────────────────────────────────────────────────────────┘
```

### Pipeline Metrics (all computed, no new tables)

| Metric | Formula |
|---|---|
| Pipeline velocity | (sum of days-in-stage per deal) / number of deals |
| Stage conversion | (deals that advanced) / (deals that entered stage) |
| Win rate | closed_won / (closed_won + closed_lost) |
| Average deal size | sum(value of won deals) / count(won deals) |
| Bottleneck detection | stage with highest avg dwell time |
| Stale deal ratio | deals with no activity in 14d / total active deals |
| Missing stakeholder ratio | deals without DM or champion / total active deals |

### Views

| View | When to use |
|---|---|
| **Funnel** | Default — stage distribution with value bars |
| **Board** | Kanban — drag deals between stages |
| **Table** | Sortable/filterable list for analysis |

### UX Principles
- SVG funnel is the hero element — responsive, interactive (hover stage → highlight deals)
- Bottleneck detection is automatic: flag the stage with highest average dwell time
- NBA engine fires here too: pipeline-level recommendations (not just per-deal)
- All numbers are clickable → filtered deal list
- Export to CSV/PDF for weekly sales meetings

---

## CRM-3 Mandatory UX Debt (from CRM-2) + CRM-3 Additions

These items are **blocking CRM-2 final approval** and must be delivered within CRM-3 scope:

| # | Item | Where | Priority |
|---|---|---|---|
| 1 | **Relationship Intelligence Rewrite** — SVG graph with nodes/edges, influence clusters (champion/blocker/DM), strength encoding | Organization Workspace left panel | Critical |
| 2 | **Contact Workspace Above-Fold Reflow** — User sees influence, org, active deals, health, next action without scrolling | Contact Workspace center panel | High |
| 3 | **Real KPI Metrics** — Replace placeholder (contacts with phone) with: Open Deals, Active Contacts, Last Activity Age, Stakeholder Coverage, Relationship Strength | Organization Workspace KPI grid | High |
| 4 | **Activity Stall NBA Rewrite** — Title changes from "Follow up with {name}" to "No activity with {name} for {X} days" or "Relationship cooling off ({X} days idle)" | NBA engine `ActivityStallRule` | Medium |
| 5 | **Product Catalog Type System** — `type` enum: product, service, subscription, package | `crm_products` table | High |
| 6 | **Stakeholder Coverage Index** — Computed 0–100% metric feeding health, forecast, NBA | Opportunity Workspace | High |
| 7 | **Forecast Confidence Engine** — Multi-factor (stage, health, activity, stakeholder coverage, stall) not just stage | Forecast Workspace | High |

---

## CRM-3 Product Catalog

Tutia services to model as products (seed data):

| Category | Products |
|---|---|
| ERP | ERP Pro, ERP Basic, ERP Module (per module) |
| Connectivity | Dedicated Internet, MPLS, SD-WAN, Fiber Lease |
| VPN | Site-to-Site VPN, Remote Access VPN, SSL VPN |
| Bulk SMS | Standard SMS, Premium SMS, OTP SMS, SMS API |
| Payment Gateway | Standard Gateway, Recurring Billing, Invoice Link |
| Custom Development | Hourly consulting, Fixed-price project, Retainer |
| Consulting | Strategy, Implementation, Migration, Audit |

All seeded with version=1, parent_id=null, is_active=true.

---

## Delivery Order

1. **Design approval** — this document ✅
2. **Migration 200000** — Products catalog (with `type` enum) + products seeding + quotation tables (with full lifecycle status) + deal additions (risks, competitors, forecast_category, quota) + stakeholder coverage index service
3. **Models** — CrmProduct, CrmQuotation, CrmQuotationItem, CrmQuota, CrmDealRisk, CrmDealCompetitor
4. **Stakeholder Coverage Index Service** — Computational service feeding health, forecast, NBA
5. **Forecast Confidence Engine** — Multi-factor confidence calculator
6. **Controllers** — ProductCatalogController, QuotationController (versioned), ForecastController, PipelineController
7. **Relationship Intelligence Rewrite** — SVG graph component with influence clusters
8. **Opportunity Workspace** — 3-panel with stakeholder map, products, quotations, risks, competitors
9. **Quotation Workspace** — Document view with version history, PDF, full lifecycle
10. **Contact Workspace reflow** — Above-fold UX fix (influence, orgs, deals, health, NBA visible immediately)
11. **KPI metric fix** — Real metrics replacing placeholders
12. **Forecast Workspace** — 2-panel with confidence-assisted categories
13. **Pipeline Command Center** — Funnel, velocity, bottlenecks, health distribution, NBA feed
14. **Activity stall NBA fix** — Title rewrite
15. **Tests** — Full coverage all new features
16. **CRM-3 Completion Report****
