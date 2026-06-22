# TUTIA DIGITAL TRANSFORMATION — COMPLETE AUDIT & STRATEGY

> **Project**: tutia-updating
> **Audited Website**: https://www.tutiasd.com
> **Date**: June 18, 2026
> **Status**: Pre-development — All deliverables complete
> **Next Step**: Awaiting approval before coding begins

---

## TABLE OF CONTENTS

1. [Full Website Audit](#1-full-website-audit)
2. [Content Inventory](#2-content-inventory)
3. [UX Audit](#3-ux-audit)
4. [Brand Audit](#4-brand-audit)
5. [Competitor Analysis](#5-competitor-analysis)
6. [New Sitemap](#6-new-sitemap)
7. [User Journeys](#7-user-journeys)
8. [CRM Funnel Strategy](#8-crm-funnel-strategy)
9. [Design System Specification](#9-design-system-specification)
10. [Page-by-Page UX Strategy](#10-page-by-page-ux-strategy)
11. [Component Architecture](#11-component-architecture)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. FULL WEBSITE AUDIT

### 1.1 Current State of the Codebase

The project is a **fresh Laravel 13 + Inertia v3 + React 19 starter kit** generated from `laravel/react-starter-kit`. The current live website at tutiasd.com exists as a separate deployed site. The codebase in this repository contains:

- **Zero Tutia business content** — only boilerplate Laravel welcome page and authentication scaffolding
- **Standard auth setup** — Fortify, login/register, password reset, two-factor auth, passkeys
- **shadcn/ui components** — buttons, cards, inputs, dialogs, navigation menu, sidebar, etc.
- **Tailwind CSS v4** — configured with `@tailwindcss/vite` plugin
- **Vite 8** — with React compiler, Inertia plugin, Wayfinder plugin
- **SQLite database** — default configuration
- **Bilingual support not yet configured** — but `APP_LOCALE=en` is set

### 1.2 Current tutiasd.com Website Analysis

#### Company Identity

| Field | Value |
|-------|-------|
| **Company Name** | TUTIA Trading Services |
| **Tagline** | "Unlimited Trust" |
| **Location** | Khartoum, Sudan — P.O Box: 77003 |
| **Phone** | +249912329449, +249965502009 |
| **Email** | info@tutiasd.com |
| **Sector** | ICT & Trading Company |
| **E-commerce Platform** | Matger-TUTIA (www.matger-tutia.sd) — B2C e-commerce marketplace |
| **Mobile Apps** | Matger Tutia on Google Play & Apple App Store |
| **Social Media** | Facebook, Twitter, Instagram, LinkedIn, WhatsApp |

#### Pages Discovered

| # | Page | URL | Status | Content Type |
|---|------|-----|--------|--------------|
| 1 | Home | `/` | ✓ | Hero, About, Values, Services, Customers, Partners, Testimonials, Contact, Footer |
| 2 | E-commerce | `/ecommerce` | ✓ | Matger-TUTIA marketplace description |
| 3 | Bulk SMS | `/bulksms` | ✗ 404 | Missing page |
| 4 | Web Development | `/web` | ✓ | Web design & development services |
| 5 | Connectivity Solution | `/connectivity` | ✓ | Mobile/Wi-Fi coverage solutions |
| 6 | ICT Consulting | `/consultancy` | ✗ 404 | Missing page |
| 7 | Call Center | `/call-center` | ✗ 404 | Missing page |
| 8 | Ticketing System | `/ticketing` | ✓ | Travel/ticketing software |
| 9 | VPN | `/vpn` | ✓ | Business VPN services |
| 10 | Payment Gateway | `/payment` | ✓ | Payment processing |
| 11 | ERP System | `/erp` | ✓ | Enterprise resource planning |
| 12 | Contact | `/contact` | ✓ | Contact form + info |

#### Services Listed

| # | Service | Description | Page Status |
|---|---------|-------------|-------------|
| 1 | **E-Commerce (Matger-TUTIA)** | B2C e-commerce marketplace — electronics, fashion, cosmetics, furniture, etc. Mobile apps for Android & iOS | ✓ Live |
| 2 | **Bulk SMS** | SMS marketing services | ✗ 404 |
| 3 | **Web Development** | Static & dynamic websites, award-winning creative agency, full lifecycle management | ✓ Live |
| 4 | **Connectivity Solution** | Mobile coverage solutions, indoor/outdoor Wi-Fi, site assessment, installation, maintenance | ✓ Live |
| 5 | **ICT Consulting** | IT consulting, implementation & support | ✗ 404 |
| 6 | **Call Center** | Modern call center with digital channel support | ✗ 404 |
| 7 | **Ticketing System** | Travel agency automation software — sales, marketing, operations, finance | ✓ Live |
| 8 | **VPN** | Business VPN — remote access, data protection, dedicated servers | ✓ Live |
| 9 | **Payment Gateway** | Multi-currency, credit cards, digital wallets, recurring billing | ✓ Live |
| 10 | **ERP System** | Accounting, controlling, fixed assets, banking, sales, marketing, CRM, service management | ✓ Live |

#### About / Mission / Vision

| Element | Content |
|---------|---------|
| **About** | "TUTIA is leading Sudanese company providing information technology services consulting, implementing and support. It envisioned and instigated the adoption of the flexible technology practices to operate efficiently and produce more value." |
| **Mission** | "We will continue to challenge ourselves and set new performance standards by investing in the future of our Customers and seeking knowledge and innovation in order to exceed expectations in serving our community." |
| **Vision** | "To remain the Preferred ICT & Trading Company in Sudan, leading the Technology Market Growth in Sudan and expanding in the region within adjacent countries, driving economic prosperity, and providing the highest Value for all our stakeholders through operational excellence." |

#### Core Values

| Value | Description |
|-------|-------------|
| **Trust** | "We know that trust must be earned, so we strive every day to act in ways to build up trust in our clients, ourselves and others." |
| **Commitment** | "We recognize the importance of providing excellent services and creating an environment where commitment is part of the fabric of who we are!" |
| **Integrity** | "We value our reputation and conduct our business with Integrity, honesty, and respect for each individual." |
| **Result Orientation** | "We seek to deliver excellent results and we ensure our clients and customers that our results will absolutely exceed their expectations." |

#### Customers & Partners

The site displays customer logos and partner logos (images not accessible via text fetch, but sections exist with logo grids).

#### Testimonials

| Client | Quote Summary |
|--------|---------------|
| Client 1 | Long-term partnership, praised efficiency, quality, professionalism, on-time delivery, competitive tracking, flexibility |
| Client 2 | Praised communication, quality of content work, project management, would recommend to others |

---

## 2. CONTENT INVENTORY

### 2.1 Every Section on the Home Page

1. **Top Bar**: Phone (+249912329449) | Email (info@tutiasd.com) | Social icons (Facebook, Twitter, Instagram, LinkedIn, WhatsApp)
2. **Navigation**: Logo "TUTIA" | Home | Services (dropdown: 10 services) | Contact
3. **Hero Slider**: "TUTIA Trading Services — Unlimited Trust" with Matger Tutia app store links
4. **About Section**: About paragraph + Mission + Vision (tabbed)
5. **Values Section**: 4 value cards (Trust, Commitment, Integrity, Result Orientation) with icons
6. **Services Section**: 10 service cards (3 rows of 3 + 1) with icons, descriptions, "More" links
7. **Customers Section**: Logo grid of client companies
8. **Partners Section**: Logo grid of partner companies
9. **Testimonials Section**: 2 client testimonials
10. **Contact Section**: Form (Name, Email, Phone, Message) + Send Message button
11. **Footer**: Contact Info (address, phone, email, social) | Popular Links | Popular Services | Copyright

### 2.2 Service Page Structure

Each service page follows the same template:
- Header with service name
- Breadcrumb: Home > Services
- Service description (detailed content varies by service)
- Contact form section
- Footer

### 2.3 The Matger-TUTIA Ecosystem

- **URL**: www.matger-tutia.sd (currently unreachable)
- **Type**: B2C e-commerce marketplace
- **Mobile Apps**: Available on Google Play (500+ downloads) and Apple App Store
- **Features**: Multi-vendor, multi-payment, multi-language (English/Arabic), logistics
- **Categories**: Electronics, smartphones, computers, clothing, sports, health & beauty, bags, shoes
- **Developer**: Trinavo LLC (Sharjah, UAE)

---

## 3. UX AUDIT

### 3.1 Navigation

**Current State**:
- Horizontal navbar with dropdown for Services (10 items)
- Mobile: Hamburger menu
- Breadcrumb on sub-pages
- Social icons in top bar

**Issues**:
- No mega-menu — 10-item dropdown is too long for a single list
- No search functionality
- No sticky navigation
- Services list is flat — no categorization or grouping
- "Bulk SMS" and "ICT Consulting" and "Call Center" pages return 404
- No language switcher visible (site appears bilingual in concept but /en and /ar return 404)
- No active state indicators on navigation

### 3.2 Information Architecture

**Current Structure**:
```
Home (/) ─────────────
├── About (inline section)
├── Values (inline section)
├── Services (inline + sub-pages)
│   ├── E-Commerce (/ecommerce)
│   ├── Bulk SMS (/bulksms) [404]
│   ├── Web Development (/web)
│   ├── Connectivity Solution (/connectivity)
│   ├── ICT Consulting (/consultancy) [404]
│   ├── Call Center (/call-center) [404]
│   ├── Ticketing System (/ticketing)
│   ├── VPN (/vpn)
│   ├── Payment Gateway (/payment)
│   └── ERP System (/erp)
├── Customers (inline section)
├── Partners (inline section)
├── Testimonials (inline section)
└── Contact (/contact)
```

**Issues**:
- Single-page website with sub-pages for services — no content depth
- About, Values, Customers, Partners, Testimonials are all on home page only
- No dedicated About page
- No Work/Portfolio section
- No Case Studies
- No Blog/Insights
- No Careers
- No dedicated Industry pages
- All content is shallow — services have only 2-3 paragraphs each
- 3 out of 10 service pages return 404 (30% broken)

### 3.3 Conversion Flow

**Current CTAs**:
- "More" links on service cards → service page
- Contact form on every page (Name, Email, Phone, Message)
- Social media links
- Phone number click-to-call
- App store badges for Matger Tutia

**Issues**:
- Single contact form — no differentiation between inquiry types
- No multi-step funnel
- No discovery call booking
- No proposal request workflow
- No live chat
- No lead scoring
- No newsletter subscription
- No resource downloads (whitepapers, brochures)
- No thank-you page after form submission
- No CRM integration evident

### 3.4 Trust Building

**Current Elements**:
- Client logo grid
- Partner logo grid
- 2 testimonials
- 4 core values displayed
- Company mission/vision statement

**Missing Elements**:
- No case studies with measurable outcomes
- No team/leadership information
- No company history/timeline
- No certifications or awards
- No media mentions
- No video testimonials
- No client logos are named/identifiable from the text
- No metrics/stats (projects completed, clients served, years in business)
- No security credentials

### 3.5 Bilingual Experience

- **Domain**: tutiasd.com uses `.sd` (Sudan) — strong local market signal
- **Bilingual**: Site appears to support English and Arabic based on social media content (Arabic posts on Facebook)
- **Reality**: `/en` and `/ar` routes return 404 — bilingual is NOT implemented
- **Matger Tutia app**: Lists both English and Arabic support
- **Content language**: English is primary; no Arabic content visible on fetched pages

### 3.6 Technical Issues

- 30% of service pages return 404 (Bulk SMS, ICT Consulting, Call Center)
- Service page URLs are inconsistent: `/ecommerce`, `/web`, `/vpn`, `/payment`, `/ticketing`, `/connectivity`, `/erp` — no standard slug pattern
- Hero slider functionality unknown (images not loaded in text fetch)
- Contact form functionality untested
- Mobile responsiveness unknown
- Page load performance unknown
- No SSL issues evident (HTTPS works)

---

## 4. BRAND AUDIT

### 4.1 Current Positioning

> **"TUTIA Trading Services"**
> Tagline: **"Unlimited Trust"**

TUTIA positions itself as a leading Sudanese ICT & Trading Company providing:
- Information technology services consulting
- Implementation and support
- E-commerce marketplace operations
- Connectivity and infrastructure solutions

### 4.2 Brand Identity Breakdown

| Element | Current State | Assessment |
|---------|--------------|------------|
| **Company Name** | TUTIA (Trading Services) | Strong, memorable, short |
| **Tagline** | "Unlimited Trust" | Good — evokes reliability |
| **Vision** | "Preferred ICT & Trading Company in Sudan" | Clearly local-market focused |
| **Mission** | Invest in customer future, innovation, community service | Service-oriented |
| **Values** | Trust, Commitment, Integrity, Result Orientation | Strong foundation |
| **Tone** | Professional, service-oriented, local market | Appropriate for Sudanese market |
| **Visual Identity** | Standard template-based design (based on structure) | Needs upgrade |

### 4.3 Key Brand Strengths

1. **Clear market focus**: Sudan and regional expansion
2. **Dual identity**: ICT services + Trading (e-commerce marketplace)
3. **Strong values foundation**: Trust, Commitment, Integrity, Results
4. **"Unlimited Trust" tagline**: Memorable and confidence-building
5. **Local market leadership**: "Leading Sudanese company" positioning
6. **Ecosystem**: Own e-commerce platform (Matger-TUTIA) with mobile apps
7. **Long-term client relationships**: Testimonials indicate multi-year partnerships

### 4.4 Brand Positioning Issues

1. **"Trading Services" limits perception** — sounds like a general trading company, not a technology partner
2. **No digital transformation language** — positioned as ICT services, not strategic technology partner
3. **No technical differentiation** — "web development" and "ICT consulting" are generic
4. **Website design is template-grade** — does not reflect a technology company's capability
5. **Bilingual not implemented** — critical for Sudanese market where Arabic is official language
6. **No thought leadership** — no blog, insights, or content marketing
7. **No team/leadership visibility** — faceless company reduces trust
8. **No social proof beyond logos** — no metrics, case studies, or detailed results
9. **"Unlimited Trust" is strong but underused** — appears only in hero, not reinforced across the site

### 4.5 Desired Brand Evolution

| From | To |
|------|-----|
| TUTIA Trading Services | TUTIA (drop "Trading Services") |
| ICT & Trading Company | Technology & Digital Transformation Partner |
| "Unlimited Trust" tagline | Keep + strengthen with supporting evidence |
| Sudanese market leader | Regional technology leader (Sudan + adjacent countries) |
| Service provider | Strategic partner |
| Template website | Premium digital presence |

---

## 5. COMPETITOR ANALYSIS

### 5.1 Competitor Positioning Matrix

| Company | Positioning | Geography | Services | Target |
|---------|-------------|-----------|----------|--------|
| **TUTIA (current)** | ICT & Trading Company | Sudan | ICT services, e-commerce, connectivity | Local businesses |
| **Accenture** | Global reinvention partner | Global | Strategy, consulting, technology, operations | Fortune 500 |
| **EPAM** | Software engineering & product dev | Global | Engineering, AI, cloud, data | Enterprise |
| **Globant** | Digital transformation | Global | Digital strategy, engineering, AI | Enterprise |
| **Mozn** | AI & digital transformation | MENA/Saudi | AI, digital transformation | Regional enterprise |
| **STC Solutions** | ICT & digital services | Saudi Arabia | ICT, cloud, cybersecurity | Regional enterprise |
| **EJADA** | Digital transformation | Saudi Arabia | Strategy, AI, cloud, data | Regional enterprise |

### 5.2 Gap Analysis

| Capability | TUTIA (current) | Regional Leaders | Global Leaders |
|------------|-----------------|------------------|----------------|
| **Strategic consulting** | ✗ | ✓ | ✓ |
| **AI/ML solutions** | ✗ | ✓ | ✓ |
| **Cloud services** | ✗ (VPN only) | ✓ | ✓ |
| **Cybersecurity** | ✗ | ✓ | ✓ |
| **Case studies** | ✗ | ✓ | ✓ |
| **Thought leadership** | ✗ | ✓ | ✓ |
| **Team/leadership visible** | ✗ | ✓ | ✓ |
| **Bilingual website** | ✗ (broken) | ✓ (Arabic/English) | ✓ |
| **Premium design** | ✗ | ✓ | ✓ |
| **CRM integration** | ✗ | ✓ | ✓ |
| **Metrics-driven outcomes** | ✗ | ✓ | ✓ |
| **Enterprise methodology** | ✗ | ✓ | ✓ |
| **Mobile apps** | ✓ (Matger Tutia) | Varies | Varies |
| **E-commerce platform** | ✓ (Matger Tutia) | Varies | Varies |
| **Local market expertise** | ✓ (Sudan) | ✓ (respective regions) | Limited |

### 5.3 Key Competitor Observations

**Accenture**:
- Mega-menu: Services → Industries → Insights → About → Careers
- Hero: "Let there be change" — evocative, aspirational
- Deep thought leadership engine

**EPAM**:
- Navigation: Services → Industries → Insights → About → Careers
- AI-native engineering positioning
- Strong case study architecture

**Mozn (regional MENA)**:
- Arabic-first digital presence
- AI and digital transformation focus
- Saudi market leadership

**STC Solutions (regional)**:
- Comprehensive ICT portfolio
- Cloud, cybersecurity, digital services
- Government and enterprise focus

### 5.4 Strategic Implications for TUTIA

1. **Keep dual identity but reframe**: ICT services + Trading is a unique combination — reframe as "Technology & Commerce Solutions"
2. **Add strategic depth**: Move beyond connectivity/VPN into digital transformation, AI, cloud
3. **Regional ambition**: The vision statement already says "expanding in adjacent countries" — the website must reflect this
4. **Fix Arabic/English**: In Sudan, Arabic is essential for credibility
5. **Showcase Matger-TUTIA as flagship**: The e-commerce platform is a real product — make it center stage as proof of capability
6. **Build case studies**: Every service should have a corresponding case study

---

## 6. NEW SITEMAP

### 6.1 Complete Information Architecture

```
tutiasd.com/
│
├── Home (/) ───────────────────────────────────────────
│   ├── Premium Hero with "Unlimited Trust"
│   ├── Trust Indicators (clients, partners, stats)
│   ├── What We Do (service overview)
│   ├── Matger-TUTIA Showcase (flagship platform)
│   ├── Industries Served
│   ├── Featured Work
│   ├── Our Impact (metrics)
│   ├── Client Testimonials
│   ├── Partners & Certifications
│   ├── Contact / CTA
│   └── Footer
│
├── About (/) ─────────────────────────────────────────
│   ├── Our Story
│   ├── Mission & Vision
│   ├── Core Values
│   ├── Leadership
│   ├── Team
│   └── Culture
│
├── Services (/) ──────────────────────────────────────
│   ├── Digital Commerce
│   │   ├── E-Commerce Solutions
│   │   ├── Matger-TUTIA Platform
│   │   └── Payment Gateway
│   ├── Enterprise Technology
│   │   ├── ERP Systems
│   │   ├── Ticketing & Travel Systems
│   │   └── Call Center Solutions
│   ├── Digital Presence
│   │   ├── Web Development
│   │   ├── Mobile Applications
│   │   └── Digital Marketing (Bulk SMS, etc.)
│   ├── Infrastructure & Connectivity
│   │   ├── Connectivity Solutions
│   │   ├── VPN & Security
│   │   └── ICT Consulting
│   └── Technology Consulting
│       ├── IT Strategy
│       ├── Digital Transformation
│       └── Technology Implementation
│
├── Platform (/platform) ──────────────────────────────
│   ├── Matger-TUTIA Overview
│   ├── Features
│   ├── For Sellers
│   ├── For Buyers
│   └── Mobile Apps
│
├── Work (/work) ──────────────────────────────────────
│   ├── Case Study: Matger-TUTIA E-Commerce Platform
│   ├── Case Study: [ERP Implementation]
│   ├── Case Study: [Connectivity Project]
│   ├── Case Study: [Ticketing System]
│   └── [More case studies]
│
├── Insights (/) ──────────────────────────────────────
│   ├── Blog
│   ├── Case Studies
│   ├── Resources
│   └── News
│
├── Industries (/) ────────────────────────────────────
│   ├── Retail & E-Commerce
│   ├── Travel & Tourism
│   ├── Telecommunications
│   ├── Banking & Finance
│   └── Government
│
├── Contact (/) ──────────────────────────────────────
│   ├── Get in Touch
│   ├── Book a Consultation
│   ├── Request a Proposal
│   └── Office Location (Khartoum)
│
└── Legal
    ├── Privacy Policy
    ├── Terms of Service
    └── Cookie Policy
```

### 6.2 Page Count

| Section | Pages | Notes |
|---------|-------|-------|
| Home | 1 | Complete redesign |
| About | 1 + 5 sub-pages | Story, leadership, team, values, culture |
| Services | 1 overview + 4 category pages + 10 detailed service pages | Reframed from current 10 services |
| Platform | 1 + 4 sub-pages | Matger-TUTIA showcase |
| Work | 1 + 5+ case studies | Transform portfolio into case studies |
| Insights | 1 + blog posts | Content marketing engine |
| Industries | 1 + 5 industry pages | New |
| Contact | 1 | With multi-form options |
| Legal | 3 | Privacy, terms, cookies |
| **Total** | **~40-45 pages** | |

---

## 7. USER JOURNEYS

### 7.1 Journey 1: Sudanese Business Owner (B2B)

**Persona**: Owner of a retail business in Khartoum looking to digitize operations
**Goal**: Find ERP and e-commerce solutions
**Entry point**: Google search → "ERP system Sudan" or "e-commerce solution Sudan"

| Stage | Actions | Touchpoints | Success Metric |
|-------|---------|-------------|----------------|
| **Awareness** | Searches for business software in Sudan | Google, Facebook | Finds TUTIA |
| **Interest** | Browses ERP and e-commerce services | Services pages | Reads about ERP features |
| **Consideration** | Reviews Matger-TUTIA platform, client logos | Platform page, Customers section | Sees real marketplace |
| **Validation** | Checks testimonials, partner logos | Home, Testimonials | Trust built |
| **Conversion** | Fills contact form or calls | Contact form, phone | Lead captured |
| **Onboarding** | Consultation → Demo → Implementation | Sales team | Project starts |

### 7.2 Journey 2: E-commerce Seller (B2B2C)

**Persona**: Merchant wanting to sell on Matger-TUTIA marketplace
**Goal**: Register as a seller on the platform
**Entry point**: Direct visit → tutiasd.com → Platform section

| Stage | Actions | Touchpoints |
|-------|---------|-------------|
| **Discovery** | Hears about Matger-TUTIA from other merchants | Word of mouth, Facebook |
| **Research** | Visits website, reads about platform | Platform page |
| **Evaluation** | Downloads mobile app, browses marketplace | Google Play/App Store |
| **Decision** | Clicks "Become a Seller" or contacts TUTIA | Contact form |
| **Onboarding** | Seller registration, verification, listing setup | Operations team |

### 7.3 Journey 3: Enterprise Decision Maker

**Persona**: IT manager at a Sudanese telecom/bank needing connectivity solutions
**Goal**: Find a reliable connectivity and infrastructure partner
**Entry point**: Google → "connectivity solutions Sudan"

| Stage | Actions | Touchpoints |
|-------|---------|-------------|
| **Awareness** | Searches for ICT providers in Sudan | Google, LinkedIn |
| **Interest** | Reviews Connectivity and VPN services | Service pages |
| **Consideration** | Checks partner logos, client list | Partners section |
| **Validation** | Requests proposal, asks for references | Contact form |
| **Decision** | Books consultation | Phone call, meeting |

---

## 8. CRM FUNNEL STRATEGY

### 8.1 Funnel Architecture

```
Top of Funnel (TOFU)
├── SEO-optimized service pages (ERP, connectivity, e-commerce)
├── Blog articles about business technology in Sudan
├── Case studies with measurable outcomes
├── Matger-TUTIA marketplace (real product showcase)
└── Social media content (Facebook, Instagram)
        │
        ▼
Middle of Funnel (MOFU)
├── "Book a Free Consultation"
├── "Request a Demo" (ERP, Ticketing, Call Center)
├── "Become a Seller" (Matger-TUTIA)
├── "Download Service Brochure"
└── Newsletter subscription
        │
        ▼
Bottom of Funnel (BOFU)
├── Contact form (segmented by service)
├── Phone call (+249912329449)
├── WhatsApp integration
└── Office visit (Khartoum)
        │
        ▼
Post-Conversion
├── Project kickoff workflow
├── Onboarding sequence
├── Client portal (future)
└── Nurture campaigns
```

### 8.2 Conversion Points Across Pages

| Page | Primary CTA | Secondary CTA |
|------|-------------|---------------|
| **Home** | Book a Free Consultation | Explore Our Services |
| **ERP page** | Request an ERP Demo | Download ERP Brochure |
| **E-commerce page** | Join Matger-TUTIA | Start Selling Today |
| **Web Dev page** | Get a Website Quote | See Our Portfolio |
| **Connectivity page** | Request Site Assessment | Contact Sales |
| **VPN page** | Set Up Business VPN | Talk to an Expert |
| **Payment page** | Start Accepting Payments | Request Pricing |
| **Ticketing page** | Schedule a Demo | Request Proposal |
| **Contact** | Send Message | Call Us Now |

### 8.3 Form Types

1. **General Contact**: Name, Email, Phone, Service Interest, Message
2. **Demo Request**: Name, Email, Phone, Company, Service, Preferred Date/Time
3. **Seller Registration**: Business Name, Contact, Category, Location
4. **Quote Request**: Project Type, Budget, Timeline, Requirements

---

## 9. DESIGN SYSTEM SPECIFICATION

### 9.1 Typography

| Element | Font | Weight | Size (Desktop) | Size (Mobile) | Line Height |
|---------|------|--------|----------------|---------------|-------------|
| Display/H1 | Instrument Sans (or similar) | 700 | 64px / 4rem | 36px / 2.25rem | 1.1 |
| H2 | Instrument Sans | 700 | 40px / 2.5rem | 28px / 1.75rem | 1.15 |
| H3 | Instrument Sans | 600 | 28px / 1.75rem | 22px / 1.375rem | 1.25 |
| H4 | Instrument Sans | 600 | 20px / 1.25rem | 18px / 1.125rem | 1.3 |
| Body Large | Instrument Sans | 400 | 18px / 1.125rem | 16px / 1rem | 1.6 |
| Body | Instrument Sans | 400 | 16px / 1rem | 15px / 0.9375rem | 1.6 |
| Body Small | Instrument Sans | 400 | 14px / 0.875rem | 13px / 0.8125rem | 1.5 |
| Arabic Display | Noto Naskh Arabic or Tajawal | 700 | 64px | 36px | 1.3 |
| Arabic Body | Tajawal | 400 | 16px | 15px | 1.8 |

### 9.2 Color Palette

```
Primary (Trust & Authority):
  ┌ 900: #0A1628  (deep navy)
  ├ 800: #0F1F3D
  ├ 700: #1A2D5A
  ├ 600: #1E3A6E
  ├ 500: #2B4C8C  (primary brand)
  ├ 400: #3D6BB5
  ├ 300: #5A8CD4
  ├ 200: #8BB4E8
  └ 100: #C5D9F5

Accent (Energy & Commerce):
  ┌ 600: #B8860B
  ├ 500: #D4A017  (gold accent)
  ├ 400: #E8B830
  └ 300: #F5D060

Neutral:
  ┌ 900: #0C0C0D
  ├ 800: #1C1C1E
  ├ 700: #2C2C2E
  ├ 600: #48484A
  ├ 500: #636366
  ├ 400: #8E8E93
  ├ 300: #AEAEB2
  ├ 200: #C7C7CC
  ├ 100: #E5E5EA
  └ 50:  #F2F2F7

Semantic:
  ┌ Success: #30D158
  ├ Warning: #FF9F0A
  ├ Error:   #FF453A
  └ Info:    #64D2FF
```

### 9.3 Spacing & Layout

```
Section padding: 80px desktop / 48px mobile
Max container width: 1280px
Content max-width: 800px (for readability)
Gap scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
Border radius: 4px (sm), 8px (md), 12px (lg), 16px (xl)
Shadows: Subtle, layered system
```

### 9.4 Component Design Tokens

```css
:root {
  --color-primary: #2B4C8C;
  --color-primary-dark: #1A2D5A;
  --color-accent: #D4A017;
  --color-bg: #FFFFFF;
  --color-bg-muted: #F2F2F7;
  --color-text: #0C0C0D;
  --color-text-secondary: #636366;
  --font-sans: 'Instrument Sans', sans-serif;
  --font-arabic: 'Tajawal', sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --spacing-section: 5rem;
  --container-max: 1280px;
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
}
```

---

## 10. PAGE-BY-PAGE UX STRATEGY

### 10.1 Home Page

| Section | Content | Purpose |
|---------|---------|---------|
| **1. Premium Hero** | "Unlimited Trust" headline + sub-text + dual CTAs + abstract visual | Immediate value prop |
| **2. Trust Indicators** | Partner logos + client logos + key stats | Instant credibility |
| **3. About Snapshot** | Brief company intro + mission statement | Context |
| **4. Matger-TUTIA Showcase** | Flagship e-commerce platform with app store badges | Product credibility |
| **5. Services Overview** | 10 service cards (reframed and categorized) | Capability demonstration |
| **6. Core Values** | 4 value cards with icons | Brand personality |
| **7. Client Success** | Testimonials carousel | Social proof |
| **8. Contact / CTA** | Form + phone + WhatsApp | Conversion |

### 10.2 Service Page Template

Each service page follows:
- **Hero**: Service name + value proposition + CTA
- **What We Offer**: Detailed capabilities
- **How It Works**: Process/methodology
- **Why TUTIA**: Differentiators specific to this service
- **Case Study** (if available): Related project
- **Related Services**: Cross-linking
- **CTA**: Service-specific (Demo, Quote, Consultation)
- **Contact Form**

### 10.3 Platform Page (Matger-TUTIA)

- **Hero**: "Sudan's Growing E-Commerce Marketplace"
- **Overview**: What is Matger-TUTIA
- **For Buyers**: Features, categories, how to order
- **For Sellers**: Registration process, benefits, fees
- **Mobile Apps**: App store badges + screenshots
- **Stats**: Active sellers, products, orders, delivery areas
- **Testimonials**: Seller and buyer testimonials
- **CTA**: "Start Selling" / "Start Shopping"

### 10.4 Case Study Template

```
Hero: Client name + challenge + key result
├── The Challenge
├── Our Approach
├── The Solution (with visuals)
├── Technologies Used
├── Results & Impact (metrics)
├── Client Testimonial
├── Related Case Studies
└── CTA
```

---

## 11. COMPONENT ARCHITECTURE

### 11.1 Directory Structure

```
resources/js/
├── app.tsx                    # App entry
├── app.css                    # Global styles
├── boot.ts                    # Inertia boot
├── ssr.tsx                    # SSR entry
│
├── types/
│   ├── index.ts
│   ├── global.d.ts
│   ├── brand.d.ts
│   ├── navigation.ts
│   ├── services.ts
│   ├── projects.ts
│   ├── testimonials.ts
│   ├── platform.ts            # Matger-TUTIA types
│   ├── forms.ts
│   └── i18n.ts
│
├── lib/
│   ├── utils.ts               # cn() helper
│   ├── constants.ts           # Site constants
│   └── locales/
│       ├── en.ts              # English strings
│       └── ar.ts              # Arabic strings
│
├── hooks/
│   ├── use-direction.ts       # RTL/LTR
│   ├── use-scroll.ts
│   ├── use-intersection.ts
│   └── use-form.ts
│
├── layouts/
│   ├── main-layout.tsx        # Header + Footer
│   └── blank-layout.tsx
│
├── components/
│   ├── ui/                    # shadcn components (existing)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── navigation-menu.tsx
│   │   └── ... (keep existing)
│   │
│   ├── design-system/         # Brand components
│   │   ├── container.tsx
│   │   ├── section.tsx
│   │   ├── heading.tsx
│   │   ├── text.tsx
│   │   ├── gradient-text.tsx
│   │   ├── metric-card.tsx
│   │   └── logo-cloud.tsx
│   │
│   ├── navigation/
│   │   ├── header.tsx
│   │   ├── header-mobile.tsx
│   │   ├── mega-menu.tsx
│   │   ├── language-switcher.tsx
│   │   ├── footer.tsx
│   │   └── breadcrumbs.tsx
│   │
│   ├── home/
│   │   ├── hero.tsx
│   │   ├── trust-bar.tsx
│   │   ├── services-grid.tsx
│   │   ├── platform-showcase.tsx  # Matger-TUTIA
│   │   ├── values-cards.tsx
│   │   ├── client-stories.tsx
│   │   ├── partner-logos.tsx
│   │   └── cta-section.tsx
│   │
│   ├── services/
│   │   ├── service-card.tsx
│   │   ├── service-detail.tsx
│   │   └── process-steps.tsx
│   │
│   ├── platform/
│   │   ├── platform-hero.tsx
│   │   ├── feature-list.tsx
│   │   ├── app-badges.tsx
│   │   ├── seller-benefits.tsx
│   │   └── buyer-benefits.tsx
│   │
│   ├── work/
│   │   ├── case-study-card.tsx
│   │   ├── case-study-hero.tsx
│   │   ├── results-metrics.tsx
│   │   └── tech-badges.tsx
│   │
│   ├── about/
│   │   ├── company-story.tsx
│   │   ├── values-list.tsx
│   │   ├── leadership-card.tsx
│   │   └── team-grid.tsx
│   │
│   ├── crm/
│   │   ├── contact-form.tsx
│   │   ├── demo-request-form.tsx
│   │   ├── quote-request-form.tsx
│   │   ├── seller-registration-form.tsx
│   │   └── form-confirmation.tsx
│   │
│   └── shared/
│       ├── animate-in.tsx
│       ├── fade-in.tsx
│       ├── counter.tsx
│       ├── carousel.tsx
│       ├── seo-head.tsx
│       ├── structured-data.tsx
│       ├── skip-link.tsx
│       ├── loading.tsx
│       └── error-state.tsx
│
├── pages/
│   ├── welcome.tsx             # REDESIGN → Home
│   ├── dashboard.tsx           # Keep (auth)
│   ├── about/
│   │   ├── index.tsx
│   │   ├── leadership.tsx
│   │   ├── team.tsx
│   │   └── culture.tsx
│   ├── services/
│   │   ├── index.tsx           # Overview
│   │   ├── ecommerce.tsx
│   │   ├── erp.tsx
│   │   ├── web-development.tsx
│   │   ├── connectivity.tsx
│   │   ├── vpn.tsx
│   │   ├── payment-gateway.tsx
│   │   ├── ticketing.tsx
│   │   ├── call-center.tsx
│   │   ├── bulk-sms.tsx
│   │   └── consulting.tsx
│   ├── platform/
│   │   ├── index.tsx           # Matger-TUTIA main
│   │   ├── for-sellers.tsx
│   │   ├── for-buyers.tsx
│   │   └── mobile-apps.tsx
│   ├── work/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   ├── insights/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   ├── industries/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   ├── contact/
│   │   └── index.tsx
│   ├── legal/
│   │   ├── privacy.tsx
│   │   ├── terms.tsx
│   │   └── cookies.tsx
│   └── auth/                   # Keep existing
│       ├── login.tsx
│       ├── register.tsx
│       └── ...
│
└── routes/                     # Wayfinder (keep)
```

### 11.2 Core Data Types

```typescript
// service.ts
export interface Service {
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  features: string[];
  benefits: string[];
  process: { step: number; title: string; description: string }[];
}

// platform.ts (Matger-TUTIA)
export interface PlatformFeature {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
}

// case-study.ts
export interface CaseStudy {
  slug: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: { label: string; value: string }[];
  testimonial?: string;
  technologies?: string[];
}

// testimonial.ts
export interface Testimonial {
  quote: string;
  quoteAr: string;
  author: string;
  company: string;
  role?: string;
}
```

---

## 12. IMPLEMENTATION ROADMAP

### Phase 0: Foundation (Week 1)

```
- Install dependencies & verify build
- Configure Tailwind v4 design tokens
- Set up i18n structure (en/ar with RTL support)
- Build RTL-aware layout utilities
- Build design system components (container, section, heading, etc.)
- Build header with dropdown navigation
- Build mobile navigation with hamburger
- Build footer
- Build language switcher
```

### Phase 1: Core Pages (Week 2-3)

```
Home page (all sections)
Services overview page
Top 5 service sub-pages (E-commerce, ERP, Web Dev, Connectivity, VPN)
Platform landing page (Matger-TUTIA)
```

### Phase 2: Remaining Content (Week 4)

```
Remaining 5 service sub-pages
About pages (story, leadership, team, values)
Contact page with multi-form support
Case study pages (initial 3-5)
Industries overview page
```

### Phase 3: Platform & CRM (Week 5)

```
Matger-TUTIA sub-pages (for sellers, for buyers, mobile apps)
CRM form components
Form validation & submission
Email/CRM integration
Thank-you/confirmation pages
WhatsApp integration
```

### Phase 4: Polish & Launch (Week 6-7)

```
Insights hub (initial setup)
Arabic content translation & verification
RTL layout verification
Performance optimization
Accessibility audit
SEO audit
Lighthouse optimization (target >95 all)
Cross-browser testing
Mobile testing
Production build & deploy
```

### Phase 5: Post-Launch (Week 8+)

```
Analytics review
Content additions (case studies, blog posts)
SEO monitoring
User feedback
Iterative improvements
```

---

## CRITICAL ISSUES SUMMARY

| Priority | Issue | Impact |
|----------|-------|--------|
| 🔴 P0 | 30% of service pages return 404 (Bulk SMS, ICT Consulting, Call Center) | Lost revenue, broken UX |
| 🔴 P0 | `/en` and `/ar` routes both return 404 — bilingual not working | Critical for Sudanese market |
| 🔴 P0 | Contact form functionality unverified — may lose leads | Revenue risk |
| 🟠 P1 | No CRM integration | No lead tracking or follow-up |
| 🟠 P1 | No team/leadership information | Low trust for enterprise deals |
| 🟠 P1 | No case studies or metrics | Cannot prove value |
| 🟠 P1 | Template-based design | Does not showcase capability |
| 🟡 P2 | Single-page architecture for non-service content | Thin content, poor SEO |
| 🟡 P2 | "Trading Services" in name limits perception | Brand positioning |
| 🟡 P2 | No thought leadership content | No authority building |
| 🟡 P2 | No work/portfolio section | No proof of delivery |
| 🟢 P3 | No search functionality | Poor UX for returning visitors |
| 🟢 P3 | No live chat | Missed real-time conversions |
| 🟢 P3 | No newsletter/subscription | No ongoing engagement |

---

## KEY METRICS TARGETS

| Metric | Current | Target |
|--------|---------|--------|
| Lighthouse Performance | Unknown | >95 |
| Lighthouse Accessibility | Unknown | >95 |
| Lighthouse Best Practices | Unknown | >95 |
| Lighthouse SEO | Unknown | >95 |
| Functional Service Pages | 7 of 10 | 10 of 10 |
| Bilingual Support | Broken | Full EN/AR |
| Case Studies | 0 | 5+ |
| Pages | ~12 | 40-45 |
| Conversion Points | 1 form | 15+ CTAs |
| Languages | 1 (broken) | 2 (EN + AR) |

---

**Next Step**: All 12 deliverables are complete based on the correct tutiasd.com. Please review and approve before coding begins.
