# CRM-1-2-3 Architecture

> **Scope**: CRM-1 (Core Foundation) + CRM-2 (Accounts & Contacts) + CRM-3 (Sales Management)
> **Status**: Design phase — no implementation yet
> **Extension**: Designed for CRM-4 (Projects), CRM-5 (Communications), CRM-6 (Automation), CRM-7 (Analytics)

---

## 1. Database Architecture

### 1.1 Naming Conventions

- Tables: `crm_{plural_snake_case}`
- Columns: `snake_case`
- Timestamps: `created_at`, `updated_at` on all tables
- Soft deletes: `deleted_at` on all CRM entity tables
- Foreign keys: `{referenced_table_singular}_id`
- Index naming: `idx_{table}_{column}` for custom, auto for FK

### 1.2 Table Inventory

#### Existing (modified)

| Table | Changes in CRM-1-2-3 |
|---|---|
| `crm_leads` | Add `deleted_at`, `organization_id` (FK→crm_organizations, nullable), indexes on `stage`, `source`, `priority`, `assigned_to`, `deleted_at` |
| `crm_deals` | Add `deleted_at`, `organization_id` (FK→crm_organizations, nullable), `contact_id` (FK→crm_contacts, nullable), indexes on `stage`, `owner_id`, `lead_id`, `organization_id`, `deleted_at` |
| `crm_activities` | Add `deleted_at`, indexes on `activitable_type`, `activitable_id`, `created_by`, `deleted_at`, `due_at`, `completed_at` |

#### New Tables — CRM-1

| Table | Purpose | Key Columns |
|---|---|---|
| `crm_audit_log` | Immutable audit trail | `id`, `user_id` (nullable), `entity_type`, `entity_id`, `event` (created/updated/deleted/stage_changed/assigned), `old_values` (JSON), `new_values` (JSON), `ip_address`, `user_agent`, `created_at` |
| `crm_notifications` | In-app notifications | `id`, `user_id`, `type`, `title`, `body` (nullable), `link` (nullable), `entity_type` (nullable), `entity_id` (nullable), `is_read` (bool, default:false), `read_at` (nullable), `created_at` |
| `crm_notification_preferences` | Per-user notification toggles | `id`, `user_id`, `channel` (email/in-app/sms), `event` (string), `enabled` (bool) |

#### New Tables — CRM-2

| Table | Purpose | Key Columns |
|---|---|---|
| `crm_organizations` | Company/account records | `id`, `name`, `domain`, `industry` (nullable), `size` (nullable), `phone` (nullable), `website` (nullable), `logo_url` (nullable), `notes` (text,nullable), `owner_id` (FK→users,nullable), `created_by` (FK→users), `deleted_at`, timestamps |
| `crm_contacts` | Individual people | `id`, `organization_id` (FK,nullable), `first_name`, `last_name`, `email` (nullable), `phone` (nullable), `mobile` (nullable), `job_title` (nullable), `department` (nullable), `linkedin_url` (nullable), `avatar_url` (nullable), `is_primary` (bool), `owner_id` (FK→users,nullable), `created_by` (FK→users), `deleted_at`, timestamps |
| `crm_organization_contact` | Many-to-many (contacts across orgs) | `id`, `organization_id`, `contact_id`, `role` (nullable), `is_primary` (bool) |
| `crm_addresses` | Polymorphic addresses | `id`, `addressable_type`, `addressable_id`, `label` (billing/shipping/primary), `line_1`, `line_2` (nullable), `city`, `state` (nullable), `postal_code` (nullable), `country`, `is_primary` (bool), timestamps |
| `crm_tags` | Tag definitions | `id`, `name`, `color` (nullable), `created_at` |
| `crm_taggables` | Polymorphic tags | `tag_id`, `taggable_type`, `taggable_id` |
| `crm_imports` | CSV import jobs | `id`, `user_id`, `entity_type` (lead/organization/contact), `filename`, `total_rows`, `processed_rows`, `failed_rows`, `status` (pending/processing/completed/failed), `errors` (JSON), `created_at`, `completed_at` |

#### New Tables — CRM-3

| Table | Purpose | Key Columns |
|---|---|---|
| `crm_product_categories` | Product groups | `id`, `name`, `description` (nullable), `sort_order`, `is_active` (bool), `created_at` |
| `crm_products` | Product/service catalog | `id`, `category_id` (FK,nullable), `name`, `description` (nullable), `unit_price` (decimal:12,2), `currency` (3), `is_active` (bool), `created_by`, `deleted_at`, timestamps |
| `crm_deal_items` | Line items on deals | `id`, `deal_id` (FK), `product_id` (FK,nullable), `product_name`, `description` (nullable), `quantity` (decimal:10,2), `unit_price` (decimal:12,2), `discount_percent` (decimal:5,2,default:0), `total_price` (decimal:12,2), `sort_order`, timestamps |
| `crm_quotations` | Formal quotes | `id`, `deal_id` (FK,nullable), `organization_id` (FK,nullable), `contact_id` (FK,nullable), `quote_number` (unique), `status` (draft/sent/accepted/rejected/expired), `subtotal`, `discount_total`, `tax_total`, `grand_total`, `currency`, `valid_until` (date), `notes` (text,nullable), `terms` (text,nullable), `created_by`, `approved_by` (nullable), `deleted_at`, timestamps |
| `crm_quotation_items` | Line items on quotes | `id`, `quotation_id` (FK), `product_id` (FK,nullable), `product_name`, `description` (nullable), `quantity`, `unit_price`, `discount_percent`, `total_price`, `sort_order`, timestamps |
| `crm_forecasts` | Forecast periods | `id`, `period_type` (monthly/quarterly), `period_start`, `period_end`, `status` (draft/published/archived), `created_by`, `published_by` (nullable), timestamps |
| `crm_forecast_entries` | Per-rep per-period | `id`, `forecast_id`, `user_id` (rep), `pipeline_value`, `weighted_value`, `expected_new_business`, `total_forecast`, `notes` (nullable), timestamps |
| `crm_pipeline_automation_rules` | Pipeline automation config | `id`, `name`, `trigger_event` (string), `conditions` (JSON), `actions` (JSON), `is_active` (bool), `sort_order`, `created_by`, timestamps |

### 1.3 Index Plan

```sql
-- crm_leads
CREATE INDEX idx_crm_leads_stage ON crm_leads(stage);
CREATE INDEX idx_crm_leads_source ON crm_leads(source);
CREATE INDEX idx_crm_leads_priority ON crm_leads(priority);
CREATE INDEX idx_crm_leads_assigned_to ON crm_leads(assigned_to);
CREATE INDEX idx_crm_leads_organization_id ON crm_leads(organization_id);
CREATE INDEX idx_crm_leads_deleted_at ON crm_leads(deleted_at);
CREATE INDEX idx_crm_leads_created_at ON crm_leads(created_at);

-- crm_deals
CREATE INDEX idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX idx_crm_deals_owner_id ON crm_deals(owner_id);
CREATE INDEX idx_crm_deals_lead_id ON crm_deals(lead_id);
CREATE INDEX idx_crm_deals_organization_id ON crm_deals(organization_id);
CREATE INDEX idx_crm_deals_contact_id ON crm_deals(contact_id);
CREATE INDEX idx_crm_deals_expected_close_date ON crm_deals(expected_close_date);
CREATE INDEX idx_crm_deals_deleted_at ON crm_deals(deleted_at);

-- crm_activities
CREATE INDEX idx_crm_activities_activitable ON crm_activities(activitable_type, activitable_id);
CREATE INDEX idx_crm_activities_type ON crm_activities(type);
CREATE INDEX idx_crm_activities_created_by ON crm_activities(created_by);
CREATE INDEX idx_crm_activities_due_at ON crm_activities(due_at);
CREATE INDEX idx_crm_activities_deleted_at ON crm_activities(deleted_at);

-- crm_audit_log
CREATE INDEX idx_crm_audit_log_entity ON crm_audit_log(entity_type, entity_id);
CREATE INDEX idx_crm_audit_log_user_id ON crm_audit_log(user_id);
CREATE INDEX idx_crm_audit_log_event ON crm_audit_log(event);
CREATE INDEX idx_crm_audit_log_created_at ON crm_audit_log(created_at);

-- crm_notifications
CREATE INDEX idx_crm_notifications_user_id ON crm_notifications(user_id);
CREATE INDEX idx_crm_notifications_is_read ON crm_notifications(is_read);
CREATE INDEX idx_crm_notifications_created_at ON crm_notifications(created_at);

-- crm_organizations
CREATE INDEX idx_crm_organizations_domain ON crm_organizations(domain);
CREATE INDEX idx_crm_organizations_industry ON crm_organizations(industry);
CREATE INDEX idx_crm_organizations_owner_id ON crm_organizations(owner_id);
CREATE INDEX idx_crm_organizations_deleted_at ON crm_organizations(deleted_at);
CREATE INDEX idx_crm_organizations_name ON crm_organizations(name);

-- crm_contacts
CREATE INDEX idx_crm_contacts_organization_id ON crm_contacts(organization_id);
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX idx_crm_contacts_owner_id ON crm_contacts(owner_id);
CREATE INDEX idx_crm_contacts_deleted_at ON crm_contacts(deleted_at);

-- crm_products
CREATE INDEX idx_crm_products_category_id ON crm_products(category_id);
CREATE INDEX idx_crm_products_is_active ON crm_products(is_active);

-- crm_quotations
CREATE INDEX idx_crm_quotations_deal_id ON crm_quotations(deal_id);
CREATE INDEX idx_crm_quotations_organization_id ON crm_quotations(organization_id);
CREATE INDEX idx_crm_quotations_status ON crm_quotations(status);
CREATE INDEX idx_crm_quotations_created_by ON crm_quotations(created_by);
CREATE INDEX idx_crm_quotations_deleted_at ON crm_quotations(deleted_at);

-- crm_forecasts
CREATE INDEX idx_crm_forecasts_period ON crm_forecasts(period_type, period_start, period_end);
CREATE INDEX idx_crm_forecasts_status ON crm_forecasts(status);

-- crm_forecast_entries
CREATE INDEX idx_crm_forecast_entries_forecast_id ON crm_forecast_entries(forecast_id);
CREATE INDEX idx_crm_forecast_entries_user_id ON crm_forecast_entries(user_id);
```

---

## 2. Entity Relationships

### 2.1 Entity Relationship Diagram (Text)

```
User
  ├── assigned_leads:       HasMany → CrmLead (assigned_to)
  ├── owned_deals:          HasMany → CrmDeal (owner_id)
  ├── created_activities:   HasMany → CrmActivity (created_by)
  ├── owned_organizations:  HasMany → CrmOrganization (owner_id)
  ├── owned_contacts:       HasMany → CrmContact (owner_id)
  ├── notifications:        HasMany → CrmNotification
  ├── notification_prefs:   HasMany → CrmNotificationPreference
  ├── created_products:     HasMany → CrmProduct (created_by)
  ├── created_quotations:   HasMany → CrmQuotation (created_by)
  ├── created_forecasts:    HasMany → CrmForecast (created_by)
  ├── forecast_entries:     HasMany → CrmForecastEntry (user_id)
  ├── audit_logs:           HasMany → CrmAuditLog (user_id)
  └── imports:              HasMany → CrmImport (user_id)

CrmOrganization
  ├── contacts:             HasMany → CrmContact
  ├── contacts_pivot:       BelongsToMany → CrmContact (via crm_organization_contact)
  ├── leads:                HasMany → CrmLead
  ├── deals:                HasMany → CrmDeal
  ├── quotations:           HasMany → CrmQuotation
  ├── addresses:            MorphMany → CrmAddress
  ├── tags:                 MorphToMany → CrmTag (via crm_taggables)
  ├── activities:           MorphMany → CrmActivity
  └── owner:                BelongsTo → User

CrmContact
  ├── organization:         BelongsTo → CrmOrganization
  ├── organizations_pivot:  BelongsToMany → CrmOrganization (via crm_organization_contact)
  ├── deals:                HasMany → CrmDeal
  ├── quotations:           HasMany → CrmQuotation
  ├── addresses:            MorphMany → CrmAddress
  ├── tags:                 MorphToMany → CrmTag
  ├── activities:           MorphMany → CrmActivity
  └── owner:                BelongsTo → User

CrmLead
  ├── deals:                HasMany → CrmDeal
  ├── activities:           MorphMany → CrmActivity
  ├── assigned_to:          BelongsTo → User
  ├── organization:         BelongsTo → CrmOrganization (CRM-2)
  ├── tags:                 MorphToMany → CrmTag
  └── audit_logs:           MorphMany → CrmAuditLog

CrmDeal
  ├── lead:                 BelongsTo → CrmLead
  ├── owner:                BelongsTo → User
  ├── organization:         BelongsTo → CrmOrganization (CRM-2)
  ├── contact:              BelongsTo → CrmContact (CRM-2)
  ├── items:                HasMany → CrmDealItem
  ├── quotations:           HasMany → CrmQuotation
  ├── activities:           MorphMany → CrmActivity
  ├── tags:                 MorphToMany → CrmTag
  ├── audit_logs:           MorphMany → CrmAuditLog
  └── forecast_entries:     HasMany → CrmForecastEntry (via pipeline value)

CrmProduct
  ├── category:             BelongsTo → CrmProductCategory
  ├── deal_items:           HasMany → CrmDealItem
  └── quotation_items:      HasMany → CrmQuotationItem

CrmQuotation
  ├── deal:                 BelongsTo → CrmDeal
  ├── organization:         BelongsTo → CrmOrganization
  ├── contact:              BelongsTo → CrmContact
  ├── items:                HasMany → CrmQuotationItem
  ├── created_by:           BelongsTo → User
  └── audit_logs:           MorphMany → CrmAuditLog

CrmActivity
  ├── activitable:          MorphTo → CrmLead|CrmDeal|CrmOrganization|CrmContact|CrmQuotation
  └── created_by:           BelongsTo → User

CrmAuditLog
  ├── causer:               MorphTo → User|null
  └── subject:              MorphTo → CrmLead|CrmDeal|CrmOrganization|CrmContact|CrmQuotation|CrmProduct
```

### 2.2 Polymorphic Map

| Morphable | Used By |
|---|---|
| `CrmActivity` (activitable) | CrmLead, CrmDeal, CrmOrganization, CrmContact, CrmQuotation |
| `CrmAddress` (addressable) | CrmOrganization, CrmContact |
| `CrmTag` (taggable) | CrmLead, CrmDeal, CrmOrganization, CrmContact, CrmProduct, CrmQuotation |
| `CrmAuditLog` (subject) | CrmLead, CrmDeal, CrmOrganization, CrmContact, CrmQuotation, CrmProduct |

---

## 3. Permissions Matrix

### 3.1 Roles

| Role | Scope | Description |
|---|---|---|
| `admin` | System-wide | Full CRM access, settings management, user management |
| `manager` | Own team | View/edit all records owned by their team members, manage team pipeline |
| `sales_rep` | Own records | View/edit/create own leads, deals, organizations, contacts |
| `viewer` | Read-only | View all records (no create/edit/delete/stage changes) |

### 3.2 Permissions

Format: `crm.{entity}.{action}`

| Entity | view | create | edit | delete | stage_change | assign | export | import |
|---|---|---|---|---|---|---|---|---|
| **leads** | admin, manager, sales_rep, viewer | admin, manager, sales_rep | admin, manager, sales_rep (own) | admin, manager | admin, manager, sales_rep (own) | admin, manager | admin, manager, sales_rep, viewer | admin, manager |
| **deals** | admin, manager, sales_rep, viewer | admin, manager, sales_rep | admin, manager, sales_rep (own) | admin, manager | admin, manager, sales_rep (own) | admin, manager | admin, manager, sales_rep, viewer | admin, manager |
| **organizations** | admin, manager, sales_rep, viewer | admin, manager, sales_rep | admin, manager, sales_rep (own) | admin, manager | — | admin, manager | admin, manager, sales_rep, viewer | admin, manager |
| **contacts** | admin, manager, sales_rep, viewer | admin, manager, sales_rep | admin, manager, sales_rep (own) | admin, manager | — | admin, manager | admin, manager, sales_rep, viewer | admin, manager |
| **products** | admin, manager, sales_rep, viewer | admin, manager | admin, manager | admin, manager | — | — | admin, manager, sales_rep, viewer | admin, manager |
| **quotations** | admin, manager, sales_rep (own), viewer | admin, manager, sales_rep | admin, manager, sales_rep (own) | admin, manager | — | — | admin, manager, sales_rep, viewer | — |
| **forecasts** | admin, manager, sales_rep (own) | admin, manager, sales_rep (own) | admin, manager, sales_rep (own) | admin, manager | — | — | admin, manager, sales_rep | — |
| **audit_log** | admin, manager | — | — | — | — | admin | admin | — |
| **reports** | admin, manager, sales_rep, viewer | — | — | — | — | — | admin, manager, sales_rep | — |
| **settings** | admin | admin | admin | admin | — | — | — | admin |

### 3.3 Row-Level Access Logic

```
admin:   no row restrictions
manager: user_id IN (own_team_users) OR user_id = self
sales_rep: user_id = self (owner/assigned_to/created_by)
viewer:  read-only on all visible rows
```

### 3.4 Implementation Approach

Use **Spatie Laravel Permissions** (`spatie/laravel-permission`) for:
- Role/permission registration via seeder
- `$user->hasPermissionTo('crm.leads.edit')` gate checks
- `$user->hasRole('sales_rep')` role checks
- Policy methods calling Spatie gates for entity-level access
- Custom `CrmOwnershipScope` global scope for row-level filtering

Policies per entity:
- `CrmLeadPolicy`
- `CrmDealPolicy`
- `CrmOrganizationPolicy`
- `CrmContactPolicy`
- `CrmProductPolicy`
- `CrmQuotationPolicy`
- `CrmForecastPolicy`

Each policy implements: `viewAny`, `view`, `create`, `update`, `delete`. The `update` method includes ownership scope logic.

---

## 4. Navigation Structure

### 4.1 Sidebar

```
                          ┌──────────────────────┐
                          │   T                  │  (logo, links to dashboard)
                          ├──────────────────────┤
                          │   ◻                  │  Dashboard
                          │   ◻                  │  Leads
                          │   ◻                  │  Deals
                          ├──────────────────────┤
                          │   ◻                  │  Organizations     ← CRM-2
                          │   ◻                  │  Contacts          ← CRM-2
                          ├──────────────────────┤
                          │   ◻                  │  Products          ← CRM-3
                          │   ◻                  │  Quotations        ← CRM-3
                          ├──────────────────────┤
                          │   ◻                  │  Forecasting       ← CRM-3
                          ├──────────────────────┤
                          │   ◻                  │  Settings
                          └──────────────────────┘
```

### 4.2 Page Hierarchy

```
/crm/
├── dashboard                    → Command Center (KPIs + pipeline + activity)
│
├── leads                        → Leads kanban (default) / list view
├── leads/{id}                   → Lead detail (info + timeline + actions)
│
├── deals                        → Pipeline kanban (6 stages)
├── deals/{id}                   → Deal detail (info + line items + timeline)
│
├── organizations                → Organization table
├── organizations/create         → New organization form
├── organizations/{id}           → Organization detail (profile + contacts + deals + timeline)
├── organizations/{id}/edit      → Edit organization
│
├── contacts                     → Contact table
├── contacts/create              → New contact form
├── contacts/{id}                → Contact detail (profile + deals + timeline)
├── contacts/{id}/edit           → Edit contact
│
├── products                     → Product catalog
├── products/create              → New product
├── products/{id}                → Product detail
├── products/{id}/edit           → Edit product
│
├── quotations                   → Quotation list
├── quotations/create            → New quotation (from deal or standalone)
├── quotations/{id}              → Quotation detail (view + PDF download)
├── quotations/{id}/edit         → Edit quotation
│
├── forecasting                  → Forecast overview (current period)
├── forecasting/history          → Past forecasts
│
└── settings
    ├── pipeline                 → Pipeline stage configuration
    ├── automation               → Pipeline automation rules
    ├── team                     → Team management (admin only)
    └── imports                  → Import history & upload
```

---

## 5. UX Workflows

### 5.1 Lead Intake → Qualification → Deal Creation

```
Website form submission
  │
  ▼
Lead created (stage: new, source: website)
  │  Assigned via auto-assignment rule (CRM-6)
  │  Welcome email sent via automation (CRM-5/6)
  ▼
Sales rep opens lead →
  ┌────────────────────────────────────────┐
  │  Left panel: contact info, source,     │
  │  priority, organization, tags          │
  │  Right panel: activity timeline        │
  │  Top: stage dropdown, quick actions    │
  └────────────────────────────────────────┘
  │
  ├── Rep contacts lead → stage: contacted
  │     └─ Log activity: call/email/meeting
  │
  ├── Lead qualifies → stage: qualified
  │     └─ Set priority, add organization+contact
  │
  ├── Need proposal → stage: proposal
  │     └─ Create deal from lead
  │
  └── Lead disqualified → stage: lost
        └─ Record lost reason
```

### 5.2 Deal Management → Quote → Close

```
Deal created (from lead or manual)
  │
  ▼
Deal appears in pipeline kanban (stage: qualification)
  │
  ├── Add products as line items
  │     └─ Select from product catalog, set qty/discount
  │
  ├── Schedule meeting → stage: meeting
  │     └─ Log meeting as activity
  │
  ├── Generate quotation
  │     └─ Select deal items → create quote
  │     └─ Preview quote → download PDF
  │     └─ Send to customer (email from CRM in CRM-5)
  │
  ├── Send proposal → stage: proposal
  │     └─ Attach quote PDF
  │
  ├── Negotiate → stage: negotiation
  │     └─ Adjust value/probability/expected close
  │
  └── Outcome:
      ├── Won → stage: closed_won
      │     └─ Auto-set: closed_at, probability=100
      │     └─ Option: create project (CRM-4)
      │
      └── Lost → stage: closed_lost
            └─ Required: lost_reason
            └─ Auto-set: closed_at
```

### 5.3 Organization & Contact Creation

```
Lead becomes qualified:
  │
  ├── Option A: Create organization during lead→deal conversion
  │     └─ Prompted: "Create organization for {company}?"
  │     └─ If yes: auto-fill name+domain from lead, create contact
  │
  ├── Option B: Manual creation
  │     └─ Organization form → name, domain, industry, etc.
  │     └─ Contact form → name, email, phone, job title, etc.
  │
  └── Result: Organization linked to deals + contacts
```

### 5.4 Dashboard Views

```
COMMAND CENTER (default)
┌────────────────────────────────────────────────────────┐
│  Total Leads  │  Qualified  │  Pipeline  │  Won/Month  │
│      47       │     12      │   $340K    │    $85K     │
├────────────────────────────────────────────────────────┤
│  Pipeline by Stage                 │  Recent Activity  │
│  ████████░░  Qualification  $50K  │  ○ Sara called    │
│  ████████░░  Meeting        $80K  │  ○ Ahmed emailed  │
│  ████████░░  Proposal      $120K  │  ○ Deal won: ERP  │
│  ████████░░  Negotiation    $90K  │  ○ Lead created   │
├────────────────────────────────────────────────────────┤
│  Recent Deals                                          │
│  ERP Platform  │  Telecom  │  $75K  │  Negotiation     │
│  Mobile App    │  Finance  │  $45K  │  Proposal Sent   │
└────────────────────────────────────────────────────────┘
```

### 5.5 Quick Actions (top bar)

```
[Search... ⌘K]                    [＋ New] [🔔] [👤]
                                    │
                                    ├── New Lead
                                    ├── New Deal
                                    ├── New Organization
                                    ├── New Contact
                                    └── New Quotation
```

---

## 6. API Boundaries

### 6.1 API Design Principles

- RESTful URLs with standard HTTP verbs
- JSON responses with consistent envelope: `{ data, meta, errors }`
- Pagination via `?page=N&per_page=N` (default 25, max 100)
- Sorting via `?sort=field&dir=asc|desc`
- Filtering via `?filter[field]=value`
- Include relationships via `?include=organization,contact,items`
- All responses return 200/201/204 for success, 4xx for client errors, 500 for server errors

### 6.2 Route Structure

```
# Leads
GET       /api/crm/leads                  → index (paginated + filtered)
POST      /api/crm/leads                  → store
GET       /api/crm/leads/{lead}           → show (with includes)
PATCH     /api/crm/leads/{lead}           → update
DELETE    /api/crm/leads/{lead}           → destroy (soft)
POST      /api/crm/leads/bulk-update      → bulkUpdate (stage/assign)

# Deals
GET       /api/crm/deals                  → index
POST      /api/crm/deals                  → store
GET       /api/crm/deals/{deal}           → show (with items, org, contact)
PATCH     /api/crm/deals/{deal}           → update
DELETE    /api/crm/deals/{deal}           → destroy (soft)

# Deal Items
GET       /api/crm/deals/{deal}/items     → list items
POST      /api/crm/deals/{deal}/items     → add item
PATCH     /api/crm/deals/{deal}/items/{item} → update item
DELETE    /api/crm/deals/{deal}/items/{item} → remove item

# Organizations
GET       /api/crm/organizations          → index
POST      /api/crm/organizations          → store
GET       /api/crm/organizations/{org}    → show (with contacts, deals)
PATCH     /api/crm/organizations/{org}    → update
DELETE    /api/crm/organizations/{org}    → destroy (soft)
POST      /api/crm/organizations/merge    → merge duplicates

# Contacts
GET       /api/crm/contacts               → index
POST      /api/crm/contacts               → store
GET       /api/crm/contacts/{contact}     → show
PATCH     /api/crm/contacts/{contact}     → update
DELETE    /api/crm/contacts/{contact}     → destroy (soft)

# Products
GET       /api/crm/products               → index
POST      /api/crm/products               → store
GET       /api/crm/products/{product}     → show
PATCH     /api/crm/products/{product}     → update
DELETE    /api/crm/products/{product}     → destroy (soft)

# Quotations
GET       /api/crm/quotations             → index
POST      /api/crm/quotations             → store (from deal or standalone)
GET       /api/crm/quotations/{quote}     → show (with items, PDF URL)
PATCH     /api/crm/quotations/{quote}     → update
DELETE    /api/crm/quotations/{quote}     → destroy (soft)
POST      /api/crm/quotations/{quote}/send    → mark sent
POST      /api/crm/quotations/{quote}/accept  → mark accepted
POST      /api/crm/quotations/{quote}/reject  → mark rejected
GET       /api/crm/quotations/{quote}/pdf     → download PDF

# Activities
GET       /api/crm/activities                    → index (by entity)
POST      /api/crm/activities                    → store
POST      /api/crm/activities/{activity}/complete → mark done
DELETE    /api/crm/activities/{activity}          → destroy (soft)

# Forecasting
GET       /api/crm/forecasts                    → index
POST      /api/crm/forecasts                    → create period
GET       /api/crm/forecasts/{forecast}         → show (with entries)
POST      /api/crm/forecasts/{forecast}/publish → publish
GET       /api/crm/forecasts/current            → current period summary

# Forecast Entries
GET       /api/crm/forecast-entries                    → index (by forecast)
POST      /api/crm/forecast-entries                    → upsert entry
PATCH     /api/crm/forecast-entries/{entry}            → update

# Import
POST      /api/crm/imports/upload             → upload CSV
GET       /api/crm/imports                    → list imports
GET       /api/crm/imports/{import}           → show import details
GET       /api/crm/imports/{import}/download-errors → download error CSV

# Audit Log
GET       /api/crm/audit-log                  → index (by entity or global)

# Notifications
GET       /api/crm/notifications              → index (current user)
POST      /api/crm/notifications/{id}/read    → mark read
POST      /api/crm/notifications/read-all     → mark all read

# Settings
GET       /api/crm/settings/pipeline          → get stage config
PATCH     /api/crm/settings/pipeline          → update stage config
GET       /api/crm/settings/team              → list team (admin)
POST      /api/crm/settings/team              → add user (admin)

# Inertia (server-rendered page routes)
GET       /crm/*                              → Inertia page responses
```

### 6.3 Response Envelope

```json
// Success
{
    "data": { ... },
    "meta": {
        "current_page": 1,
        "per_page": 25,
        "total": 100,
        "last_page": 4
    }
}

// Error
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "The given data was invalid.",
        "errors": {
            "email": ["The email field is required."]
        }
    }
}

// Collection
{
    "data": [
        {
            "id": 1,
            "name": "Acme Corp",
            "domain": "acme.com",
            ...
        }
    ],
    "meta": { ... }
}
```

### 6.4 Authentication & Authorization

- **Inertia routes**: session-based auth (existing Laravel auth)
- **API routes**: session-based for same-origin, Sanctum tokens for external
- **Rate limiting**: 100 req/min for API, 30 req/min for bulk/import endpoints
- **CORS**: configured for TUTIA domain + dev origins

---

## 7. Future Compatibility

### 7.1 CRM-4 (Projects & Delivery)

- **Trigger**: `crm_deals.stage = closed_won` → auto-create project
- **Leverages**: `crm_organizations` for client data, `crm_contacts` for stakeholders
- **Data**: `crm_projects` table references `crm_deals.deal_id`, `crm_organizations.organization_id`
- **Timeline**: Project milestones ready for Gantt/view integration
- **Activities**: Reuses `crm_activities` (activitable: project)

### 7.2 CRM-5 (Communications Center)

- **Email**: `crm_contacts.email` is the primary address. `crm_activities.type = email` exists already.
- **SMS**: TUTIA's Bulk SMS API consumers read `crm_contacts.phone` + `crm_contacts.mobile`
- **Calendar**: Meeting activities (`crm_activities.type = meeting`) extend to sync with Google/Outlook
- **Activity timeline**: Already polymorphic, new activitable types just register the model
- **Notification foundation**: `crm_notifications` and `crm_notification_preferences` tables ready for email/SMS channels

### 7.3 CRM-6 (Automation Engine)

- **Triggers**: `crm_audit_log` events are the trigger source (`event` column: created, stage_changed, etc.)
- **Conditions**: `crm_pipeline_automation_rules.conditions` (JSON) evaluate against entity state
- **Actions**: `crm_pipeline_automation_rules.actions` (JSON) — change stage, assign, create activity, send notification
- **Scoring**: Lead scoring adds `score` column to `crm_leads` via migration
- **Sequences**: Uses `crm_notifications` for delivery, `crm_contacts.email` for targeting

### 7.4 CRM-7 (Analytics & Forecasting)

- **Reporting**: All entity tables feed into reporting via the `crm_audit_log` for historical trends
- **Forecasts**: `crm_forecasts` + `crm_forecast_entries` already designed for weighted pipeline calculations
- **Attribution**: `crm_leads.source` + `crm_audit_log` provide conversion funnel data
- **Exports**: CSV export endpoints architected for all entity lists
- **Dashboards**: Widget configuration stored as JSON per-user (future `crm_dashboard_widgets` table)

---

## 8. Implementation Order (Within CRM-1-2-3)

### Phase CRM-1 Tasks (Sequential)

| Step | Task | Dependencies |
|---|---|---|
| 1.1 | Install `spatie/laravel-permission`, create role/permission migrations | None |
| 1.2 | Create `Role` and `Permission` seeders (admin, manager, sales_rep, viewer) | 1.1 |
| 1.3 | Add soft deletes to `crm_leads`, `crm_deals`, `crm_activities` + add indexes | None |
| 1.4 | Create `crm_audit_log` migration + `CrmAuditLog` model | None |
| 1.5 | Create `CrmAuditLogService` with `log(event, entity, old, new)` | 1.4 |
| 1.6 | Add audit logging to all Lead/Deal controller mutations | 1.5 |
| 1.7 | Create `crm_notifications` + `crm_notification_preferences` migrations + models | None |
| 1.8 | Create `CrmNotificationService` with `send(user, type, title, body, link)` | 1.7 |
| 1.9 | Add notification on lead assignment and deal stage change | 1.8 |
| 1.10 | Create CRM Policies (Lead, Deal, Activity) with Spatie permission checks | 1.2 |
| 1.11 | Add ownership scope to Lead/Deal queries for row-level filtering | 1.10 |
| 1.12 | Create factories for all CRM entities | None |
| 1.13 | Feature tests for CRM-1 controllers + policies | 1.6, 1.10, 1.12 |

### Phase CRM-2 Tasks (Sequential)

| Step | Task | Dependencies |
|---|---|---|
| 2.1 | Create organizations + contacts + address + tag migrations | CRM-1 Complete |
| 2.2 | Create `CrmOrganization`, `CrmContact`, `CrmAddress`, `CrmTag` models | 2.1 |
| 2.3 | Add `organization_id` to `crm_leads` + `crm_deals`, `contact_id` to `crm_deals` | 2.1 |
| 2.4 | Data migration: existing `company` text → `CrmOrganization` records | 2.3 |
| 2.5 | Create OrganizationController + ContactController | 2.2 |
| 2.6 | Create organization + contact Policies | 2.2 |
| 2.7 | Add audit logging to org/contact mutations | 1.5 |
| 2.8 | Duplicate detection on org/contact creation (email + domain + name matching) | 2.2 |
| 2.9 | Org merge controller + UI action | 2.8 |
| 2.10 | Create `crm_imports` + `crm_import_rows` migrations + CSV import service | 2.2 |
| 2.11 | Frontend: organizations list + detail pages | 2.5 |
| 2.12 | Frontend: contacts list + detail pages | 2.5 |
| 2.13 | Frontend: link org/contact to lead/deal | 2.3 |
| 2.14 | Frontend: import UI (upload, map columns, preview, execute) | 2.10 |
| 2.15 | Factories + seeders for organizations, contacts | 2.2 |
| 2.16 | Feature tests for CRM-2 controllers + policies | 2.5, 2.6 |

### Phase CRM-3 Tasks (Sequential)

| Step | Task | Dependencies |
|---|---|---|
| 3.1 | Create products + categories + deal_items + quotations + forecast migrations | CRM-2 Complete |
| 3.2 | Create `CrmProduct`, `CrmProductCategory`, `CrmDealItem`, `CrmQuotation`, `CrmQuotationItem`, `CrmForecast`, `CrmForecastEntry` models | 3.1 |
| 3.3 | Create `crm_pipeline_automation_rules` migration + model | CRM-1 Complete |
| 3.4 | Create ProductController + QuotationController + ForecastController | 3.2 |
| 3.5 | Create Policies for products, quotations, forecasts | 3.2 |
| 3.6 | Add audit logging to product/quote/forecast mutations | 1.5 |
| 3.7 | Deal items: add/manage line items from product catalog | 3.4 |
| 3.8 | Quotation: create from deal, generate quote number, preview, accept/reject | 3.4 |
| 3.9 | Quotation PDF generation (Laravel DomPDF or similar) | 3.8 |
| 3.10 | Forecasting: create period, weighted pipeline calculation, rep entry | 3.4 |
| 3.11 | Pipeline automation rule execution engine (trigger → evaluate → act) | 3.3 |
| 3.12 | Auto-probability by stage, auto stage transitions | 3.11 |
| 3.13 | Revenue tracking: won deal value aggregation by period | 3.4 |
| 3.14 | Frontend: product catalog page | 3.4 |
| 3.15 | Frontend: quotation management pages | 3.4 |
| 3.16 | Frontend: forecasting pages | 3.4 |
| 3.17 | Frontend: pipeline settings UI | 3.3 |
| 3.18 | Factories + seeders for products, quotations, forecasts | 3.2 |
| 3.19 | Feature tests for CRM-3 controllers + policies | 3.4, 3.5 |

---

## 9. Directory Structure (Post-Implementation)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Crm/
│   │   │   ├── CrmDashboardController.php
│   │   │   ├── LeadController.php
│   │   │   ├── DealController.php
│   │   │   ├── ActivityController.php
│   │   │   ├── OrganizationController.php          ← NEW
│   │   │   ├── ContactController.php               ← NEW
│   │   │   ├── ProductController.php               ← NEW
│   │   │   ├── QuotationController.php             ← NEW
│   │   │   └── ForecastController.php              ← NEW
│   │   └── CrmController.php
│   ├── Requests/
│   │   └── Crm/                                    ← NEW
│   │       ├── StoreLeadRequest.php
│   │       ├── UpdateLeadRequest.php
│   │       ├── StoreDealRequest.php
│   │       ├── BulkUpdateLeadsRequest.php
│   │       ├── StoreOrganizationRequest.php
│   │       ├── UpdateOrganizationRequest.php
│   │       ├── MergeOrganizationsRequest.php
│   │       ├── StoreContactRequest.php
│   │       ├── UpdateContactRequest.php
│   │       ├── StoreProductRequest.php
│   │       ├── UpdateProductRequest.php
│   │       ├── StoreQuotationRequest.php
│   │       ├── UpdateQuotationRequest.php
│   │       ├── StoreForecastRequest.php
│   │       └── ImportRequest.php
│   └── Policies/                                   ← NEW
│       ├── CrmLeadPolicy.php
│       ├── CrmDealPolicy.php
│       ├── CrmOrganizationPolicy.php
│       ├── CrmContactPolicy.php
│       ├── CrmProductPolicy.php
│       ├── CrmQuotationPolicy.php
│       └── CrmForecastPolicy.php
├── Models/
│   ├── CrmLead.php
│   ├── CrmDeal.php
│   ├── CrmActivity.php
│   ├── CrmAuditLog.php                             ← NEW
│   ├── CrmNotification.php                         ← NEW
│   ├── CrmNotificationPreference.php               ← NEW
│   ├── CrmOrganization.php                         ← NEW
│   ├── CrmContact.php                              ← NEW
│   ├── CrmAddress.php                              ← NEW
│   ├── CrmTag.php                                  ← NEW
│   ├── CrmProduct.php                              ← NEW
│   ├── CrmProductCategory.php                      ← NEW
│   ├── CrmDealItem.php                             ← NEW
│   ├── CrmQuotation.php                            ← NEW
│   ├── CrmQuotationItem.php                        ← NEW
│   ├── CrmForecast.php                             ← NEW
│   ├── CrmForecastEntry.php                        ← NEW
│   └── CrmPipelineAutomationRule.php               ← NEW
├── Services/                                       ← NEW
│   ├── CrmAuditLogService.php
│   ├── CrmNotificationService.php
│   ├── CrmOwnershipFilter.php
│   ├── CrmDuplicateDetectionService.php
│   ├── CrmImportService.php
│   └── CrmForecastCalculationService.php
├── Observers/                                      ← NEW
│   ├── CrmLeadObserver.php
│   ├── CrmDealObserver.php
│   ├── CrmOrganizationObserver.php
│   └── CrmContactObserver.php
└── Console/Commands/                               ← NEW
    └── CrmForecastRecalculateCommand.php

resources/js/
├── components/crm/
│   ├── crm-layout.tsx
│   ├── crm-sidebar.tsx
│   ├── crm-top-bar.tsx
│   ├── crm-kpi-card.tsx
│   ├── lead-kanban-card.tsx
│   ├── lead-stage-column.tsx
│   ├── pipeline-stage.tsx
│   ├── activity-timeline.tsx
│   ├── organization-card.tsx                       ← NEW
│   ├── contact-card.tsx                            ← NEW
│   ├── contact-list.tsx                            ← NEW
│   ├── deal-item-row.tsx                           ← NEW
│   ├── product-selector.tsx                        ← NEW
│   └── quotation-preview.tsx                       ← NEW
├── pages/crm/
│   ├── dashboard.tsx
│   ├── leads/
│   │   ├── index.tsx
│   │   └── show.tsx
│   ├── deals/
│   │   ├── index.tsx
│   │   └── show.tsx
│   ├── organizations/                              ← NEW
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── show.tsx
│   │   └── edit.tsx
│   ├── contacts/                                   ← NEW
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── show.tsx
│   │   └── edit.tsx
│   ├── products/                                   ← NEW
│   │   ├── index.tsx
│   │   └── create.tsx
│   ├── quotations/                                 ← NEW
│   │   ├── index.tsx
│   │   ├── show.tsx
│   │   └── create.tsx
│   └── forecasting/                                ← NEW
│       ├── index.tsx
│       └── history.tsx
└── types/
    └── crm.ts                                      ← UPDATE with new type interfaces

routes/
├── web.php                                         ← UPDATE with CRM-2/CRM-3 Inertia routes
└── api.php                                         ← NEW CRM API routes
```
