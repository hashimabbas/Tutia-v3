# TUTIA DIGITAL TRANSFORMATION — PHASE 2: PRODUCT DEFINITION & UX ARCHITECTURE

> **Project**: tutia-updating
> **Source Website**: https://www.tutiasd.com
> **Date**: June 18, 2026
> **Status**: Pre-development — Awaiting final approval

---

## TABLE OF CONTENTS

1. [Product Requirements Document (PRD)](#1-product-requirements-document-prd)
2. [Final Information Architecture](#2-final-information-architecture)
3. [User Journey Mapping](#3-user-journey-mapping)
4. [Page Wireframe Architecture](#4-page-wireframe-architecture)
5. [Design System Specification](#5-design-system-specification)
6. [CRM Architecture](#6-crm-architecture)
7. [Content Migration Plan](#7-content-migration-plan)
8. [Development Blueprint](#8-development-blueprint)

---

## 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1.1 Business Goals

| # | Goal | Priority | Rationale |
|---|------|----------|-----------|
| G1 | Establish TUTIA as Sudan's leading technology & digital transformation partner | ★★★ | Current positioning is "ICT & Trading Company" — must evolve to strategic partner |
| G2 | Increase qualified lead generation by 300% | ★★★ | Current single contact form with no CRM — massive untapped potential |
| G3 | Showcase Matger-TUTIA as a flagship product to prove technical capability | ★★★ | The e-commerce platform is TUTIA's strongest proof of delivery |
| G4 | Enable bilingual self-service (Arabic + English) | ★★★ | Both languages are essential for the Sudanese market |
| G5 | Build content marketing engine (blog + case studies) | ★★ | Thought leadership drives enterprise trust |
| G6 | Reduce bounce rate by 40% | ★★ | Current single-page design causes rapid exit |
| G7 | Increase average session duration to 4+ minutes | ★★ | Deeper content = higher conversion likelihood |
| G8 | Build retargeting/remarketing infrastructure | ★ | Current site has no tracking infrastructure |

### 1.2 User Goals

| # | User Persona | Primary Goal | Secondary Goal |
|---|-------------|--------------|----------------|
| P1 | **Sudanese Business Owner** (retail, SME) | Find ERP/e-commerce solutions to digitize operations | Compare pricing, see local case studies |
| P2 | **Merchant / Seller** | Register on Matger-TUTIA marketplace | Understand fees, delivery logistics |
| P3 | **Enterprise IT Manager** (telco, bank, government) | Evaluate connectivity, VPN, or call center solutions | Verify partner credentials, request proposal |
| P4 | **Startup Founder** | Build a website or mobile app | See portfolio, understand process |
| P5 | **Job Seeker / Talent** | Explore career opportunities at TUTIA | Learn about company culture, apply |
| P6 | **International Partner** | Evaluate partnership/distribution opportunities | Understand TUTIA's market coverage |
| P7 | **Existing Client** | Access support, find contact information | Quick issue resolution |

### 1.3 KPIs

#### Traffic & Engagement

| KPI | Current Baseline | 3-Month Target | 6-Month Target |
|-----|-----------------|----------------|----------------|
| Monthly organic traffic | Unknown | +200% | +500% |
| Bounce rate | Unknown (likely >70%) | <50% | <40% |
| Avg. session duration | Unknown | >3 min | >4 min |
| Pages per session | Unknown | >4 | >6 |
| Returning visitor ratio | Unknown | >25% | >40% |

#### Conversion

| KPI | Current Baseline | 3-Month Target | 6-Month Target |
|-----|-----------------|----------------|----------------|
| Contact form submissions | Unknown (likely <10/month) | >30/month | >50/month |
| Consultation bookings | 0 | >10/month | >20/month |
| Demo requests | 0 | >5/month | >15/month |
| Seller registrations | Unknown | >20/month | >50/month |
| Phone call clicks | Unknown | Tracked & optimized | +50% |

#### SEO

| KPI | Target |
|-----|--------|
| Core Web Vitals pass rate | 100% |
| Pages indexed | 40+ within 3 months |
| Target keyword rankings (Sudan ICT, ERP Sudan, etc.) | Top 5 within 6 months |
| Organic CTR | >5% |

#### Technical

| KPI | Target |
|-----|--------|
| Lighthouse Performance | >95 |
| Lighthouse Accessibility | >95 |
| Lighthouse Best Practices | >95 |
| Lighthouse SEO | >95 |
| Page load time (mobile) | <2s |
| Page load time (desktop) | <1.5s |
| Arabic/RTL correctness | 100% |
| Mobile responsiveness score | 100% |

### 1.4 Conversion Goals

| # | Conversion Event | Page(s) | Form Type | Success Metric |
|---|------------------|---------|-----------|----------------|
| C1 | **Contact Form Submit** | All pages | General inquiry | Submission received + auto-response sent |
| C2 | **Consultation Booked** | Home, Services, Contact | Calendar booking | Confirmed meeting in CRM |
| C3 | **Demo Requested** | ERP, Ticketing, Call Center pages | Demo request | Demo scheduled |
| C4 | **Proposal Requested** | Service pages, Work pages | Project brief | Proposal delivered within 48h |
| C5 | **Seller Registered** | Platform page, For Sellers page | Seller application | Seller onboarded |
| C6 | **Quote Requested** | Web Dev, Connectivity, VPN pages | Quote form | Quote sent within 24h |
| C7 | **App Downloaded** | Platform page | App store link click | Tracked via analytics |
| C8 | **Phone Call** | All pages (click-to-call) | Phone number click | Tracked call duration |
| C9 | **WhatsApp Message** | All pages | WhatsApp click | Conversation started |
| C10 | **Newsletter Signup** | Blog, Resources, Footer | Email only | Confirmed subscriber |

### 1.5 CRM Objectives

| # | Objective | Description |
|---|-----------|-------------|
| CRM1 | **Centralized Lead Database** | All form submissions, calls, and inquiries logged in one CRM |
| CRM2 | **Lead Scoring** | Score leads by service interest, company size, engagement level |
| CRM3 | **Automated Follow-up** | Email/SMS auto-response within 5 minutes of submission |
| CRM4 | **Pipeline Tracking** | Track lead from inquiry → consultation → proposal → close |
| CRM5 | **Segment by Service** | Tag leads by service interest (ERP, Connectivity, E-commerce, etc.) |
| CRM6 | **Activity History** | Log all interactions (form submits, emails, calls, meetings) |
| CRM7 | **Reporting Dashboard** | Weekly/monthly conversion reports, pipeline value, lead sources |

### 1.6 Success Metrics

| Metric | Definition | Target (6 months) |
|--------|------------|-------------------|
| **Lead Volume** | Total qualified leads (all sources) | 50+/month |
| **Lead-to-Consultation** | % of leads that book a consultation | >20% |
| **Consultation-to-Proposal** | % of consultations that receive a proposal | >60% |
| **Proposal-to-Close** | % of proposals that convert to projects | >30% |
| **Revenue Attribution** | Revenue from website-originated leads | Measurable + growing |
| **Cost per Lead** | Marketing cost ÷ qualified leads | Decreasing |
| **Client Retention** | % of existing clients returning for new services | >50% |
| **NPS (Client Satisfaction)** | Post-project survey score | >8/10 |

---

## 2. FINAL INFORMATION ARCHITECTURE

### 2.1 Complete Sitemap

Pages are classified as:
- **Core** — Essential pages every visitor needs
- **Service** — Detailed service information
- **Platform** — Matger-TUTIA ecosystem
- **Work** — Case studies & proof
- **Insights** — Content marketing
- **CRM** — Conversion & contact pages
- **Legal** — Compliance
- **System** — Authentication & technical

```
tutiasd.com/
│
├── [CORE] Home (/) ──────────────────────────────────────
│   ├── Lang: EN + AR
│   └── Purpose: Brand introduction, trust building, conversion hub
│
├── [CORE] About (/) ────────────────────────────────────
│   ├── [CORE] Our Story (/about) ─ EN + AR
│   │   └── Purpose: Company narrative, founding, growth
│   ├── [CORE] Leadership (/about/leadership) ─ EN + AR
│   │   └── Purpose: Executive team bios
│   ├── [CORE] Team (/about/team) ─ EN + AR
│   │   └── Purpose: Full team showcase
│   ├── [CORE] Values (/about/values) ─ EN + AR
│   │   └── Purpose: Trust, Commitment, Integrity, Results
│   └── [CORE] Culture (/about/culture) ─ EN + AR
│       └── Purpose: Work environment, community impact
│
├── [SERVICE] Services (/) ──────────────────────────────
│   ├── [SERVICE] Services Overview (/services) ─ EN + AR
│   │   └── Purpose: All services categorized + top CTA
│   │
│   ├── [SERVICE] Digital Commerce (/services/commerce)
│   │   ├── E-Commerce Solutions (/services/ecommerce) ─ EN + AR
│   │   │   └── Purpose: Matger-TUTIA deep-dive for merchants
│   │   ├── Payment Gateway (/services/payment-gateway) ─ EN + AR
│   │   │   └── Purpose: Payment processing for businesses
│   │   └── Bulk SMS (/services/bulk-sms) ─ EN + AR
│   │       └── Purpose: SMS marketing & notifications
│   │
│   ├── [SERVICE] Enterprise Technology (/services/enterprise)
│   │   ├── ERP Systems (/services/erp) ─ EN + AR
│   │   │   └── Purpose: Full ERP for Sudanese businesses
│   │   ├── Ticketing System (/services/ticketing) ─ EN + AR
│   │   │   └── Purpose: Travel agency automation
│   │   └── Call Center (/services/call-center) ─ EN + AR
│   │       └── Purpose: Multi-channel call center solutions
│   │
│   ├── [SERVICE] Digital Presence (/services/digital)
│   │   ├── Web Development (/services/web-development) ─ EN + AR
│   │   │   └── Purpose: Web design & development
│   │   └── Mobile Applications (/services/mobile-apps) ─ EN + AR
│   │       └── Purpose: Mobile app development
│   │
│   └── [SERVICE] Infrastructure & Consulting (/services/infrastructure)
│       ├── Connectivity Solutions (/services/connectivity) ─ EN + AR
│       │   └── Purpose: Mobile/Wi-Fi coverage solutions
│       ├── VPN Services (/services/vpn) ─ EN + AR
│       │   └── Purpose: Business VPN & security
│       └── ICT Consulting (/services/consulting) ─ EN + AR
│           └── Purpose: Technology strategy & advisory
│
├── [PLATFORM] Matger-TUTIA (/platform) ─────────────────
│   ├── [PLATFORM] Platform Overview (/platform) ─ EN + AR
│   │   └── Purpose: Full marketplace showcase
│   ├── [PLATFORM] For Sellers (/platform/sellers) ─ EN + AR
│   │   └── Purpose: Seller registration & benefits
│   ├── [PLATFORM] For Buyers (/platform/buyers) ─ EN + AR
│   │   └── Purpose: Shopping guide & features
│   ├── [PLATFORM] Mobile Apps (/platform/apps) ─ EN + AR
│   │   └── Purpose: App download & features
│   └── [PLATFORM] Seller Registration (/platform/register) ─ CRM
│       └── Purpose: Multi-step seller application form
│
├── [WORK] Our Work (/) ──────────────────────────────────
│   ├── [WORK] Work Overview (/work) ─ EN + AR
│   │   └── Purpose: Case study grid
│   ├── [WORK] Case Study: Matger-TUTIA (/work/matger-tutia) ─ EN + AR
│   ├── [WORK] Case Study: ERP Implementation (/work/erp-implementation)
│   ├── [WORK] Case Study: Connectivity Project (/work/connectivity-project)
│   ├── [WORK] Case Study: Web Platform (/work/web-platform)
│   ├── [WORK] Case Study: Mobile App (/work/mobile-app)
│   └── [WORK] Case Study: Ticketing System (/work/ticketing-system) ─ all EN + AR
│
├── [INSIGHTS] Insights (/) ─────────────────────────────
│   ├── [INSIGHTS] Insights Hub (/insights) ─ EN + AR
│   │   └── Purpose: Blog + resources + case studies
│   ├── [INSIGHTS] Blog (/insights/blog) ─ EN + AR
│   │   └── Individual articles
│   ├── [INSIGHTS] Case Studies (/insights/case-studies) ─ EN + AR
│   │   └── Filterable library
│   └── [INSIGHTS] Resources (/insights/resources) ─ EN + AR
│       └── Whitepapers, brochures, guides
│
├── [CRM] Contact (/) ───────────────────────────────────
│   ├── [CRM] Contact Hub (/contact) ─ EN + AR
│   │   └── Purpose: Multi-format contact options
│   ├── [CRM] Book Consultation (/contact/consultation) ─ CRM
│   │   └── Purpose: Free consultation booking
│   ├── [CRM] Request Proposal (/contact/proposal) ─ CRM
│   │   └── Purpose: Multi-step project brief
│   ├── [CRM] Get a Quote (/contact/quote) ─ CRM
│   │   └── Purpose: Quick service quote
│   └── [CRM] Thank You (/contact/thank-you) ─ CRM
│       └── Purpose: Post-submission confirmation
│
├── [LEGAL] Legal
│   ├── Privacy Policy (/legal/privacy)
│   ├── Terms of Service (/legal/terms)
│   └── Cookie Policy (/legal/cookies)
│
└── [SYSTEM] Auth (keep existing)
    ├── Login (/auth/login)
    ├── Register (/auth/register)
    ├── Forgot Password (/auth/forgot-password)
    ├── Reset Password (/auth/reset-password)
    ├── Verify Email (/auth/verify-email)
    ├── Two-Factor Challenge (/auth/two-factor-challenge)
    └── Dashboard (/dashboard)
```

### 2.2 Page Classification Summary

| Classification | Count | Example Pages |
|---------------|-------|---------------|
| **Core Pages** | 7 | Home (/), About (/about), Leadership, Team, Values, Culture, 404 |
| **Service Pages** | 13 | Overview, E-Commerce, ERP, Web Dev, Connectivity, VPN, Payment, etc. |
| **Platform Pages** | 5 | Matger-TUTIA overview, For Sellers, For Buyers, Apps, Register |
| **Work Pages** | 7 | Overview + 6 case studies |
| **Insights Pages** | 4 | Hub, Blog, Case Studies, Resources + individual articles |
| **CRM Pages** | 5 | Contact hub, Consultation, Proposal, Quote, Thank You |
| **Legal Pages** | 3 | Privacy, Terms, Cookies |
| **System Pages** | 7 | Auth pages + dashboard |
| **Total** | **~51** | Minimum viable launch |

---

## 3. USER JOURNEY MAPPING

### 3.1 Journey 1: Visitor → Lead (General Inquiry)

**Trigger**: Business owner needs ICT services, searches Google
**Entry Point**: Google / Direct / Social Media → Service Page

```
[Awareness]                          [Consideration]                   [Conversion]
    │                                     │                                │
    ▼                                     ▼                                ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Searches     │                 │  Reads service    │             │  Clicks CTA  │
│  "ERP Sudan"  │ ────────────►  │  detail page      │ ──────────► │  "Request    │
│  "ICT company │                 │  Reviews features │             │  Demo"       │
│  Khartoum"    │                 │  Checks pricing    │             │              │
└──────┬───────┘                 └────────┬─────────┘             └──────┬───────┘
       │                                  │                              │
       ▼                                  ▼                              ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Lands on     │                 │  Scans            │             │  Fills demo  │
│  TUTIA        │                 │  testimonials,    │             │  request     │
│  home page    │                 │  client logos,    │             │  form        │
│  or service   │                 │  partners         │             │              │
│  page         │                 │                    │             │              │
└──────────────┘                 └──────────────────┘             └──────┬───────┘
                                                                         │
                                                                         ▼
                                                                ┌────────────────┐
                                                                │  Form          │
                                                                │  submitted     │
                                                                │  Auto-response │
                                                                │  sent          │
                                                                │  CRM entry     │
                                                                │  created       │
                                                                │  Sales notified │
                                                                └────────────────┘
```

**Touchpoints**: Home → Services/(service) → Contact/Demo Form
**Success**: Form submitted + CRM entry created + auto-response sent
**Friction points to eliminate**: No pricing info, no case studies, no live chat, broken 404 pages

---

### 3.2 Journey 2: Visitor → Consultation (High Intent)

**Trigger**: Enterprise IT manager evaluating technology partners
**Entry Point**: LinkedIn / Referral / Google → About or Work Page

```
[Awareness]                          [Evaluation]                      [Booking]
    │                                     │                                │
    ▼                                     ▼                                ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Hears about  │                 │  Reviews case     │             │  Clicks      │
│  TUTIA from   │ ────────────►  │  studies,         │ ──────────► │  "Book Free  │
│  referral     │                 │  checks team,     │             │  Consult-    │
│               │                 │  verifies partners │             │  ation"      │
└──────┬───────┘                 └────────┬─────────┘             └──────┬───────┘
       │                                  │                              │
       ▼                                  ▼                              ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Visits       │                 │  Reads About     │             │  Calendar    │
│  TUTIA        │                 │  page, values,   │             │  picker      │
│  home page    │                 │  leadership      │             │  opens       │
│               │                 │                   │             │  Time slot   │
│               │                 │                   │             │  selected    │
└──────────────┘                 └──────────────────┘             └──────┬───────┘
                                                                         │
                                                                         ▼
                                                                ┌────────────────┐
                                                                │  Confirmation  │
                                                                │  sent with     │
                                                                │  calendar      │
                                                                │  invite        │
                                                                │  CRM updated   │
                                                                └────────────────┘
```

**Touchpoints**: Referral → Home → About → Work/(case-study) → Contact/Consultation
**Success**: Consultation booked + calendar invite sent
**Friction**: No team/leadership visibility, no detailed case studies

---

### 3.3 Journey 3: Visitor → Proposal Request (B2B Project)

**Trigger**: Business with a defined project (ERP, website, app)
**Entry Point**: Google → Service Page

```
[Research]                         [Shortlist]                       [Proposal]
    │                                     │                                │
    ▼                                     ▼                                ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Google       │                 │  Compares TUTIA   │             │  Fills multi-│
│  "web         │ ────────────►  │  vs competitors   │ ──────────► │  step        │
│  development  │                 │  Checks portfolio  │             │  proposal    │
│  Sudan"       │                 │  Reads testimonials│             │  request     │
└──────┬───────┘                 └────────┬─────────┘             └──────┬───────┘
       │                                  │                              │
       ▼                                  ▼                              ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Land on     │                 │  Reviews service  │             │  Project     │
│  Web Dev     │                 │  page in detail   │             │  brief       │
│  service     │                 │                   │             │  submitted   │
│  page        │                 │                   │             │  Proposal    │
│              │                 │                   │             │  in progress │
└──────────────┘                 └──────────────────┘             └──────┬───────┘
                                                                         │
                                                                         ▼
                                                                ┌────────────────┐
                                                                │  Sales team    │
                                                                │  reviews       │
                                                                │  Proposal sent │
                                                                │  within 48h    │
                                                                └────────────────┘
```

**Touchpoints**: Google → Services → Web Dev/ERP → Contact/Proposal
**Success**: Detailed proposal delivered within 48 hours

---

### 3.4 Journey 4: Visitor → Matger-TUTIA Inquiry (Seller)

**Trigger**: Merchant wants to sell online, discovers Matger-TUTIA
**Entry Point**: Social Media / Word of Mouth / Google → Platform Page

```
[Discovery]                        [Evaluation]                      [Registration]
    │                                     │                                │
    ▼                                     ▼                                ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Sees         │                 │  Browses          │             │  Clicks      │
│  Matger-TUTIA │ ────────────►  │  marketplace,    │ ──────────► │  "Become a   │
│  on Facebook  │                 │  checks product   │             │  Seller"     │
│               │                 │  categories       │             │              │
└──────┬───────┘                 └────────┬─────────┘             └──────┬───────┘
       │                                  │                              │
       ▼                                  ▼                              ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Visits      │                 │  Reads "For      │             │  Seller      │
│  TUTIA       │                 │  Sellers" page   │             │  application │
│  website     │                 │  checks fees,    │             │  form        │
│              │                 │  delivery, support│             │  submitted   │
│              │                 │                   │             │              │
└──────────────┘                 └──────────────────┘             └──────┬───────┘
                                                                         │
                                                                         ▼
                                                                ┌────────────────┐
                                                                │  Operations    │
                                                                │  team reviews  │
                                                                │  Seller        │
                                                                │  onboarded     │
                                                                │  within 48h    │
                                                                └────────────────┘
```

**Touchpoints**: Facebook → Platform → For Sellers → Seller Registration
**Success**: Seller application submitted + onboarding started

---

### 3.5 Journey 5: Visitor → Contact (Quick Inquiry)

**Trigger**: Someone needs immediate help or information
**Entry Point**: Any page → Contact form / Phone / WhatsApp

```
[Need]                             [Action]                          [Resolution]
    │                                     │                                │
    ▼                                     ▼                                ▼
┌──────────────┐                 ┌──────────────────┐             ┌──────────────┐
│  Has urgent   │                 │  Clicks phone    │             │  Quick        │
│  question     │ ────────────►  │  number /        │ ──────────► │  conversation │
│  about        │                 │  WhatsApp icon   │             │  via phone/   │
│  service      │                 │  / fills quick   │             │  WhatsApp     │
│               │                 │  contact form    │             │               │
└──────┬───────┘                 └────────┬─────────┘             └──────┬───────┘
       │                                  │                              │
       ▼                                  │                              │
┌──────────────┐                          │                              │
│  Navigates   │                          │                              │
│  to Contact  │                          │                              │
│  page        │                          │                              │
└──────────────┘                          │                              │
                                          │                              │
                                          ▼                              ▼
                                 ┌──────────────────┐           ┌────────────────┐
                                 │  Inquiry logged   │           │  Issue         │
                                 │  in CRM           │           │  resolved or   │
                                 │  Assigned to      │           │  meeting       │
                                 │  appropriate team │           │  scheduled     │
                                 └──────────────────┘           └────────────────┘
```

**Touchpoints**: Any page → Contact / Phone / WhatsApp
**Success**: Inquiry resolved or meeting scheduled

---

## 4. PAGE WIREFRAME ARCHITECTURE

### 4.1 Home Page (/)

**Purpose**: Brand introduction, immediate trust building, qualified traffic distribution

| Order | Section | Content | Purpose | CTA | Trust Elements |
|-------|---------|---------|---------|-----|----------------|
| 1 | **Hero** | "Unlimited Trust" headline, sub-description, dual CTAs, abstract/hero visual | Immediate value prop, emotional connection | "Explore Services" + "Book Consultation" | Tagline, visual quality |
| 2 | **Trust Bar** | Client logos + partner logos + 3 key stats (years, projects, clients) | Instant credibility | — | Logos, metrics |
| 3 | **About Snapshot** | Brief company intro (2-3 lines), link to About page | Company context | "Learn About TUTIA" | Mission statement |
| 4 | **Matger-TUTIA Showcase** | Platform screenshot + features + app store badges | Product credibility | "Explore Platform" + App Store / Google Play | Real product |
| 5 | **Services Grid** | 10 service cards (categorized), icons + brief description | Capability overview | "Learn More" per card | Icon + description clarity |
| 6 | **Values** | 4 value cards with icons (Trust, Commitment, Integrity, Results) | Brand personality | — | Value statements |
| 7 | **Testimonials** | 2-3 client quotes with names + companies | Social proof | — | Real testimonials |
| 8 | **CTA Section** | Bold headline + primary CTA | Conversion | "Start Your Project" / "Book Free Consultation" | Trust signals |
| 9 | **Footer** | Contact info, services, social, legal | Navigation + credibility | Phone, Email, WhatsApp, Social | Office address, social proof |

---

### 4.2 Service Page Template (/services/{service})

**Purpose**: Detailed service information, capability demonstration, conversion

| Order | Section | Content | Purpose | CTA | Trust Elements |
|-------|---------|---------|---------|-----|----------------|
| 1 | **Hero** | Service name, value proposition, CTA | Immediate relevance | "Request Demo" / "Get Quote" | — |
| 2 | **Breadcrumb** | Home > Services > [Service] | Navigation context | — | — |
| 3 | **Overview** | 2-3 paragraphs describing the service | Inform | "Learn More" | Detailed explanation |
| 4 | **Features** | Feature list with icons (4-6 features) | Capability detail | — | Feature depth |
| 5 | **How It Works** | 4-5 step visual process | Process transparency | — | Process clarity |
| 6 | **Why TUTIA** | 3 differentiators specific to this service | Competitive advantage | — | Differentiation |
| 7 | **Related Case Study** | 1-2 case studies using this service | Proof | "Read Case Study" | Results metrics |
| 8 | **FAQ** | 3-5 common questions | Reduce friction | — | Thoroughness |
| 9 | **CTA Section** | Service-specific CTA | Conversion | "Start Your [Service] Project" | — |
| 10 | **Contact Form** | Name, Email, Phone, Service, Message | Lead capture | "Send Message" | Quick response promise |

---

### 4.3 Platform Page (/platform)

**Purpose**: Showcase Matger-TUTIA as TUTIA's flagship product

| Order | Section | Content | Purpose | CTA | Trust Elements |
|-------|---------|---------|---------|-----|----------------|
| 1 | **Hero** | "Sudan's Growing E-Commerce Marketplace" + app store badges | Product awareness | "Download App" / "Start Selling" | App store ratings |
| 2 | **Overview** | What is Matger-TUTIA, key stats (sellers, products, orders) | Context | — | Metrics |
| 3 | **For Buyers** | Features, categories, how to order, payment methods | Buyer acquisition | "Shop Now" | Security badges |
| 4 | **For Sellers** | Benefits, fees, logistics, support | Seller acquisition | "Become a Seller" | Logistics network |
| 5 | **Categories** | Product category grid | Range demonstration | "Browse [Category]" | Category depth |
| 6 | **Mobile Apps** | Screenshots + features + download buttons | Mobile proof | App Store + Google Play | Ratings, reviews |
| 7 | **Testimonials** | Buyer + seller testimonials | Social proof | — | Real users |
| 8 | **CTA Section** | Dual: "Start Shopping" / "Start Selling" | Dual conversion | Both CTAs | — |

---

### 4.4 Contact Hub (/contact)

**Purpose**: Multi-format conversion point

| Order | Section | Content | Purpose | CTA |
|-------|---------|---------|---------|-----|
| 1 | **Hero** | "Let's Talk" + brief intro | Open communication | — |
| 2 | **Contact Options Grid** | 4 cards: Book Consultation, Request Proposal, Get a Quote, General Inquiry | Choice-based conversion | Per card CTA |
| 3 | **Quick Contact Form** | Name, Email, Phone, Service, Message | Low-friction contact | "Send Message" |
| 4 | **Direct Contact** | Phone (+249912329449), WhatsApp, Email (info@tutiasd.com) | Alternative channels | Click-to-call/WhatsApp |
| 5 | **Office Location** | Khartoum address, map embed | Physical presence | "Get Directions" |
| 6 | **Social Proof** | Testimonial or trust signal near form | Reassurance | — |

---

### 4.5 Case Study Page Template (/work/{slug})

**Purpose**: Demonstrate results, build trust for enterprise decisions

| Order | Section | Content | Purpose | CTA |
|-------|---------|---------|---------|-----|
| 1 | **Hero** | Client name + challenge tagline + key result metric | Immediate impact | "Get Results Like This" |
| 2 | **Challenge** | The client's problem (2-3 paragraphs) | Context | — |
| 3 | **Our Approach** | Strategy + methodology (with visual) | Process transparency | — |
| 4 | **The Solution** | What was built/delivered (with screenshots) | Capability proof | — |
| 5 | **Technologies** | Tech badge grid | Technical credibility | — |
| 6 | **Results** | Key metrics with visual indicators (3-4 metrics) | Proof | — |
| 7 | **Testimonial** | Client quote | Social proof | — |
| 8 | **Related Cases** | 2-3 related case studies | Engagement | "Read More" |
| 9 | **CTA Section** | "Start Your Project" | Conversion | Primary CTA |

---

### 4.6 About Page (/about)

**Purpose**: Company credibility, team showcase, partner validation

| Order | Section | Content | Purpose | CTA |
|-------|---------|---------|---------|-----|
| 1 | **Hero** | "Who We Are" + company tagline | Introduction | — |
| 2 | **Our Story** | Company history, founding (since 2017/2018), growth | Narrative | — |
| 3 | **Mission & Vision** | What we do and where we're going | Purpose | — |
| 4 | **Core Values** | 4 values with descriptions | Company character | — |
| 5 | **Leadership** | 2-3 key leaders with photos + bios | Leadership credibility | — |
| 6 | **Our Team** | Team grid with photos, names, roles | Team credibility | "Join Our Team" (careers) |
| 7 | **Clients & Partners** | Logo grids with names | Social proof | — |
| 8 | **CTA Section** | "Start Your Journey with TUTIA" | Conversion | "Book Consultation" |

---

### 4.7 Services Overview (/services)

**Purpose**: Organize all services, guide visitors to the right service

| Order | Section | Content | Purpose | CTA |
|-------|---------|---------|---------|-----|
| 1 | **Hero** | "Our Services" + capability statement | Context | — |
| 2 | **Service Categories** | 4 category headers with service cards underneath | Organized browsing | "Learn More" per service |
| 3 | **How We Deliver** | Cross-service process/methodology | Operational confidence | — |
| 4 | **Industries** | Key industries we serve | Relevance | "See Our Work" |
| 5 | **CTA Section** | "Not sure which service?" + contact | Guided conversion | "Talk to an Expert" |

---

### 4.8 Insights Hub (/insights)

**Purpose**: Thought leadership, SEO content, lead nurturing

| Order | Section | Content | Purpose | CTA |
|-------|---------|---------|---------|-----|
| 1 | **Hero** | "Insights & Resources" | Context | — |
| 2 | **Featured** | 1-2 featured articles | Highlight best content | "Read Article" |
| 3 | **Filter** | By category, by tag | Discovery | — |
| 4 | **Article Grid** | Cards with image, title, excerpt, date, read time | Content browsing | "Read More" |
| 5 | **Newsletter CTA** | Email signup | Lead nurturing | "Subscribe" |
| 6 | **Resources** | Whitepapers, brochures downloads | Value exchange | "Download" |

---

## 5. DESIGN SYSTEM SPECIFICATION

### 5.1 Typography System

#### Primary Font: Instrument Sans (Latin) / Tajawal (Arabic)

| Level | Size (Desktop) | Size (Tablet) | Size (Mobile) | Weight | Line Height | Letter Spacing | Usage |
|-------|---------------|---------------|---------------|--------|-------------|----------------|-------|
| Display | 64px / 4rem | 48px / 3rem | 36px / 2.25rem | 700 | 1.05 | -0.02em | Hero headlines |
| H1 | 48px / 3rem | 40px / 2.5rem | 28px / 1.75rem | 700 | 1.1 | -0.015em | Page titles |
| H2 | 36px / 2.25rem | 28px / 1.75rem | 24px / 1.5rem | 600 | 1.15 | -0.01em | Section headings |
| H3 | 24px / 1.5rem | 20px / 1.25rem | 18px / 1.125rem | 600 | 1.25 | -0.005em | Card titles |
| H4 | 20px / 1.25rem | 18px / 1.125rem | 16px / 1rem | 600 | 1.3 | 0 | Sub-section headings |
| Body-LG | 18px / 1.125rem | 16px / 1rem | 16px / 1rem | 400 | 1.6 | 0 | Lead paragraphs |
| Body | 16px / 1rem | 15px / 0.9375rem | 15px / 0.9375rem | 400 | 1.6 | 0 | Default text |
| Body-SM | 14px / 0.875rem | 13px / 0.8125rem | 13px / 0.8125rem | 400 | 1.5 | 0 | Captions, metadata |
| Caption | 12px / 0.75rem | 12px / 0.75rem | 12px / 0.75rem | 400 | 1.4 | 0 | Footers, labels |
| Overline | 14px / 0.875rem | 13px / 0.8125rem | 12px / 0.75rem | 600 | 1.2 | 0.05em | Section labels |
| Button | 16px / 1rem | 15px / 0.9375rem | 14px / 0.875rem | 600 | 1 | 0.01em | All buttons |

#### Arabic Font: Tajawal

| Level | Size (Desktop) | Weight | Line Height | Notes |
|-------|---------------|--------|-------------|-------|
| Arabic Display | 64px | 700 | 1.2 | RTL-adjusted |
| Arabic H1 | 48px | 700 | 1.25 | |
| Arabic H2 | 36px | 600 | 1.3 | |
| Arabic H3 | 24px | 600 | 1.4 | |
| Arabic Body | 16px | 400 | 1.8 | Arabic needs more line height |
| Arabic Body-SM | 14px | 400 | 1.6 | |

### 5.2 Color System

#### Primary Palette — Trust & Authority

```
Primary Navy:
  50:  #F0F4FA
  100: #E0E7F5
  200: #B0C3E8
  300: #7A9BD6
  400: #4D73BE
  500: #2B4C8C  ← Primary brand color
  600: #1E3A6E
  700: #1A2D5A
  800: #0F1F3D
  900: #0A1628

Usage:
  - Primary 500: Buttons, links, icons, primary accents
  - Primary 700: Hover states
  - Primary 900: Headings (dark mode)
  - Primary 50: Backgrounds, sections
```

#### Accent Palette — Energy & Commerce

```
Gold Accent:
  50:  #FFF8E1
  100: #FFECB3
  200: #FFD54F
  300: #FFCA28
  400: #FFC107
  500: #D4A017  ← Accent color
  600: #B8860B

Usage:
  - Accent 500: Highlights, special CTAs, badges, icons
  - Accent 100: Light backgrounds, callout sections
  - Use sparingly — 10% of UI max
```

#### Neutral Palette

```
Neutral:
  50:  #F9FAFB
  100: #F3F4F6
  200: #E5E7EB
  300: #D1D5DB
  400: #9CA3AF
  500: #6B7280
  600: #4B5563
  700: #374151
  800: #1F2937
  900: #111827

Usage:
  - Neutral 50: Page backgrounds
  - Neutral 100: Card backgrounds, muted sections
  - Neutral 300: Borders, dividers
  - Neutral 500: Secondary text
  - Neutral 700: Body text
  - Neutral 900: Headings
```

#### Semantic Colors

```
Success:  #16A34A  — Confirmations, success states
Warning:  #D97706  — Warnings, alerts
Error:    #DC2626  — Errors, required field indicators
Info:     #2563EB  — Information, tooltips
```

#### Dark Mode Adjustments

```
Dark Background:  #0F172A  (slate-900)
Dark Surface:     #1E293B  (slate-800)
Dark Border:      #334155  (slate-700)
Dark Text:        #F1F5F9  (slate-100)
Dark Muted:       #94A3B8  (slate-400)
```

### 5.3 Spacing System

```
--space-1:   4px   (0.25rem)
--space-2:   8px   (0.5rem)
--space-3:   12px  (0.75rem)
--space-4:   16px  (1rem)
--space-5:   20px  (1.25rem)
--space-6:   24px  (1.5rem)
--space-8:   32px  (2rem)
--space-10:  40px  (2.5rem)
--space-12:  48px  (3rem)
--space-14:  56px  (3.5rem)
--space-16:  64px  (4rem)
--space-20:  80px  (5rem)
--space-24:  96px  (6rem)
--space-28:  112px (7rem)
--space-32:  128px (8rem)

Section Top/Bottom Padding:
  Desktop:  --space-20 (80px)
  Tablet:   --space-16 (64px)
  Mobile:   --space-12 (48px)

Gap Scale (for flex/grid):
  xs: --space-2
  sm: --space-4
  md: --space-6
  lg: --space-8
  xl: --space-12
```

### 5.4 Grid System

```
Container Max Width:
  Desktop (≥1280px):  1280px
  Desktop (1024-1279): 100% - 64px padding
  Tablet (768-1023):   100% - 48px padding
  Mobile (<768px):     100% - 24px padding

Column Grid:
  Desktop:  12 columns, 20px gap
  Tablet:   8 columns, 16px gap
  Mobile:   4 columns, 12px gap

Layout Patterns:
  Single column:  max-w-3xl (768px) centered
  Two columns:    grid-cols-2 (desktop), 1 (mobile)
  Three columns:  grid-cols-3 (desktop), 1-2 (tablet/mobile)
  Four columns:   grid-cols-4 (desktop), 2 (tablet), 1 (mobile)
  Full-width:     edge-to-edge with container padding
  Hero:           full viewport width, content inside container
```

### 5.5 Responsive Rules

```
Breakpoints (min-width):
  sm:   640px   — Large mobile
  md:   768px   — Tablet portrait
  lg:   1024px  — Tablet landscape / small desktop
  xl:   1280px  — Desktop
  2xl:  1536px  — Large desktop

Mobile-first approach:
  - Base styles = mobile
  - Override at each breakpoint
  - Avoid max-width breakpoints

Responsive patterns:
  ├── Navigation: Hamburger (mobile) → Full menu (desktop)
  ├── Grids: 1 col (mobile) → 2 cols (tablet) → 3-4 cols (desktop)
  ├── Sections: Full padding (desktop) → Reduced padding (mobile)
  ├── Font sizes: Scale down 30-40% on mobile
  ├── Images: aspect-ratio, object-fit, responsive srcset
  └── Forms: Single column on mobile, inline on desktop
```

### 5.6 Component Taxonomy

#### Layer 1: Primitives (shadcn/ui — keep existing)

```
Button, Input, Label, Card, Badge, Avatar, Dialog, DropdownMenu,
NavigationMenu, Separator, Sheet, Skeleton, Tooltip, Checkbox,
Select, Toggle, ToggleGroup, Collapsible, Sonner (toast)
```

#### Layer 2: Branded Primitives

```
Container      — Max-width wrapper
Section        — Section with vertical padding + optional bg color
Heading        — H1-H4 with responsive sizing
Text           — Body, Body-SM, Caption, Overline variants
GradientText   — Text with gradient fill
MetricCard     — Number + label display
StatCounter    — Animated counting number
LogoCloud      — Client/partner logo grid
IconWrapper    — Icon container with background
BadgeGroup     — Row of badges/tags
Divider        — Section divider with optional label
```

#### Layer 3: Composite Components

```
Header          — Full site header
  └─ MegaMenu   — Service dropdown with categories
  └─ NavLink    — Single navigation link
  └─ LanguageSwitcher — EN/AR toggle
  └─ MobileNav  — Mobile hamburger menu
Footer          — Full site footer
  └─ FooterColumn
  └─ SocialLinks
Breadcrumbs     — Breadcrumb navigation
HeroSection     — Page hero with optional CTA
ServiceCard     — Service preview card
ServiceGrid     — Grid of service cards
ProcessSteps    — How-it-works numbered steps
TestimonialCard — Quote + author + photo
TestimonialCarousel — Rotating testimonials
CaseStudyCard   — Case study preview
CaseStudyHero   — Case study page header
ResultsMetrics  — Metrics dashboard display
ContactForm     — Standard form
MultiStepForm   — Step-by-step form (proposal)
FormProgress    — Step indicator
FormConfirmation — Thank you / success state
PlatformFeature — Feature card for Matger-TUTIA
AppStoreBadge   — App Store / Google Play button
ValueCard       — Value with icon
TeamCard        — Team member profile
ArticleCard     — Blog/article preview
NewsletterForm  — Email signup
CookieBanner    — GDPR consent
SearchDialog    — Site search
SEOHead         — Meta tags
StructuredData  — JSON-LD script
LoadingState    — Skeleton/spinner
ErrorState      — Error display
EmptyState      — No results display
```

#### Layer 4: Page Compositions

```
HomePage         — Full page composition
ServicesPage     — Services overview
ServiceDetailPage — Individual service
PlatformPage     — Matger-TUTIA showcase
CaseStudyPage    — Individual case study
AboutPage        — Company about
ContactPage      — Multi-format contact
InsightsHub      — Blog + resources
ArticlePage      — Individual article
LegalPage        — Privacy, terms, cookies
```

---

## 6. CRM ARCHITECTURE

### 6.1 Lead Stages

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                         LEAD PIPELINE                                           │
├──────────┬───────────┬────────────┬────────────┬───────────┬───────────────────┤
│ NEW      │ CONTACTED │ QUALIFIED  │ PROPOSAL   │ NEGOTIATE │  CLOSED           │
├──────────┼───────────┼────────────┼────────────┼───────────┼───────────────────┤
│ Form     │ Email     │ Discovery  │ Proposal   │ Contract  │ Won / Lost /      │
│ submit   │ sent      │ call done  │ sent       │ review    │ On Hold           │
│          │           │            │            │           │                   │
│ Auto     │ Phone     │ Needs      │ Follow-up  │ Legal     │ Revenue           │
│ response │ reached   │ assessed   │ scheduled  │ review    │ recorded          │
└──────────┴───────────┴────────────┴────────────┴───────────┴───────────────────┘
```

### 6.2 Form Types

| # | Form Type | Trigger | Fields | Automation |
|---|-----------|---------|--------|------------|
| F1 | **Quick Contact** | Generic inquiry | Name, Email, Phone, Service Interest, Message | Auto-response email + SMS notification to sales |
| F2 | **Demo Request** | ERP/Ticketing/Call Center | Name, Email, Phone, Company, Service, Preferred Date | Calendar invite + sales notification |
| F3 | **Consultation Booking** | High intent | Name, Email, Phone, Company, Brief, Time slot | Calendar booking + confirmation + CRM entry |
| F4 | **Proposal Request** | Project-based | Step 1: Project type, budget, timeline. Step 2: Requirements. Step 3: Contact info | Multi-step, auto-save, notification to sales |
| F5 | **Quote Request** | Web Dev/Connectivity/VPN | Name, Email, Phone, Service, Requirements summary | Auto-response + sales queue |
| F6 | **Seller Registration** | Matger-TUTIA | Business name, owner name, phone, email, category, location | Operations team notification + onboarding sequence |
| F7 | **Newsletter** | Content engage | Email only | Welcome email + nurture sequence |
| F8 | **Resource Download** | Whitepaper/brochure | Name, Email | Download link sent via email + added to nurture |

### 6.3 CRM Entities

| Entity | Fields | Relationships |
|--------|--------|---------------|
| **Lead** | id, name, email, phone, company, source, service_interest, stage, score, created_at, notes | Belongs to pipeline |
| **Contact** | id, lead_id, name, email, phone, company, position, address (Khartoum), notes | Created from qualified lead |
| **Account** | id, contact_id, company_name, industry, size, website, address | Company record |
| **Opportunity** | id, account_id, service_type, value, stage, probability, close_date, notes | Sales tracking |
| **Activity** | id, entity_type, entity_id, type (email, call, meeting, form), description, date, user_id | Activity history |
| **Deal** | id, opportunity_id, value, contract_date, services, status | Closed revenue |

### 6.4 Pipeline Rules

| Stage | Entry Criteria | Exit Criteria | Time Limit | Owner |
|-------|---------------|---------------|------------|-------|
| **New** | Form submission received | Contacted by sales | <1 hour | Auto-assigned |
| **Contacted** | Sales reaches out | Discovery call scheduled | <24 hours | Sales rep |
| **Qualified** | Discovery call complete, needs assessed | Proposal requested | <48 hours | Sales rep |
| **Proposal Sent** | Proposal delivered | Client responds | <5 business days | Sales rep + tech lead |
| **Negotiating** | Client shows strong interest | Contract signed | <2 weeks | Sales manager |
| **Closed Won** | Contract signed | Project kickoff | <1 week | Project manager |
| **Closed Lost** | Client declines / no response | — | — | Sales rep |
| **On Hold** | Client delays decision | Reactivated | Per agreement | Sales rep |

### 6.5 Automation Opportunities

| # | Trigger | Action | Delay |
|---|---------|--------|-------|
| A1 | Form submitted | Auto-response email with next steps | Immediate |
| A2 | Form submitted | Sales team Slack/email notification | Immediate |
| A3 | Consultation booked | Calendar invite with details | Immediate |
| A4 | Lead uncontacted > 24h | Escalation alert to sales manager | 24 hours |
| A5 | Proposal sent, no response > 5 days | Follow-up email sequence | Day 5, 10, 15 |
| A6 | Seller registered | Welcome email + onboarding guide | Immediate |
| A7 | Newsletter subscribed | Welcome email + first article | Immediate |
| A8 | Resource downloaded | Download link via email | Immediate |
| A9 | Lead inactive > 30 days | Re-engagement email | 30 days |
| A10 | Closed won | Project kickoff notification to ops | Immediate |

---

## 7. CONTENT MIGRATION PLAN

### 7.1 Existing → New Mapping

| # | Existing Content (tutiasd.com) | Location | New Destination | Content Type | Action |
|---|-------------------------------|----------|-----------------|--------------|--------|
| 1 | Company name "TUTIA Trading Services" | Home header | Home + About | Brand text | Keep, reframe |
| 2 | Tagline "Unlimited Trust" | Hero section | Home hero, site-wide tagline | Brand text | **STRENGTHEN** — make central |
| 3 | Phone: +249912329449 | Top bar, footer | Header, Footer, Contact | Contact data | Migrate as-is |
| 4 | Email: info@tutiasd.com | Top bar, footer | Header, Footer, Contact | Contact data | Migrate as-is |
| 5 | Social media icons | Top bar, footer | Header, Footer | Social links | Migrate as-is |
| 6 | Hero slider | Home hero | Home hero | Visual | Replace with premium hero |
| 7 | Matger-TUTIA app links | Home hero | Home + Platform page | App badges | Expand into full section |
| 8 | About paragraph | Home about section | About page / Our Story | Narrative | Expand with more detail |
| 9 | Mission statement | Home mission tab | About / Mission | Mission text | Migrate as-is |
| 10 | Vision statement | Home vision tab | About / Vision | Vision text | Migrate as-is |
| 11 | Values (Trust, Commitment, etc.) | Home values section | About / Values | Value cards | Keep, improve visuals |
| 12 | E-Commerce service | Service card + /ecommerce page | Services / E-Commerce | Service detail | Expand content |
| 13 | Bulk SMS service | Service card (404 link) | Services / Bulk SMS | Service detail | **CREATE** — new content needed |
| 14 | Web Development service | Service card + /web page | Services / Web Development | Service detail | Expand with portfolio |
| 15 | Connectivity Solution service | Service card + /connectivity page | Services / Connectivity | Service detail | Expand content |
| 16 | ICT Consulting service | Service card (404 link) | Services / Consulting | Service detail | **CREATE** — new content needed |
| 17 | Call Center service | Service card (404 link) | Services / Call Center | Service detail | **CREATE** — new content needed |
| 18 | Ticketing System service | Service card + /ticketing page | Services / Ticketing | Service detail | Expand content |
| 19 | VPN service | Service card + /vpn page | Services / VPN | Service detail | Expand content |
| 20 | Payment Gateway service | Service card + /payment page | Services / Payment Gateway | Service detail | Expand content |
| 21 | ERP System service | Service card + /erp page | Services / ERP | Service detail | Expand content |
| 22 | Matger-TUTIA marketplace | /ecommerce page | Platform / Matger-TUTIA | Platform page | **MAJOR EXPANSION** |
| 23 | Matger-TUTIA Android app | Google Play link | Platform / Mobile Apps | App page | Migrate + add details |
| 24 | Matger-TUTIA iOS app | Apple App Store link | Platform / Mobile Apps | App page | Migrate + add details |
| 25 | Customer logos | Home customers section | About / Clients | Logo grid | Keep, add names |
| 26 | Partner logos | Home partners section | About / Partners | Logo grid | Keep, add names |
| 27 | Testimonial 1 | Home testimonials | Home + Work pages | Testimonial | Migrate as-is |
| 28 | Testimonial 2 | Home testimonials | Home + Work pages | Testimonial | Migrate as-is |
| 29 | Contact form | Home + subpages | Contact | Form | Upgrade to multi-format |
| 30 | Address: Khartoum, Sudan | Footer | Footer + Contact | Location | Migrate as-is |
| 31 | Copyright notice | Footer | Footer | Legal | Migrate as-is |
| 32 | Service page descriptions | Individual service pages | New service pages | Body text | Keep, rewrite for quality |

### 7.2 New Content Required

| # | Content | Type | Priority | Assigned To |
|---|---------|------|----------|-------------|
| N1 | Case Study: Matger-TUTIA platform | Full case study | ★★★ | Content team |
| N2 | Case Study: ERP implementation | Full case study | ★★★ | Content team |
| N3 | Case Study: Connectivity project | Full case study | ★★ | Content team |
| N4 | Team member bios & photos (11 people) | Profile content | ★★★ | HR / team leads |
| N5 | Leadership bios (2-3 leaders) | Profile content | ★★★ | CEO / leadership |
| N6 | Company story / founding narrative | Narrative text | ★★★ | CEO |
| N7 | 10 service page descriptions (rewritten) | Service text | ★★★ | Content team |
| N8 | FAQ per service (3-5 questions each) | FAQ content | ★★ | Sales team |
| N9 | Blog articles (initial 5-10) | Blog content | ★★ | Content team |
| N10 | Photo library (office, team, workspace) | Visual assets | ★★ | Photography |
| N11 | Partner/customer logo assets | Visual assets | ★★ | Sales team |
| N12 | Matger-TUTIA screenshots & app images | Visual assets | ★★★ | Product team |
| N13 | Privacy policy, terms, cookies | Legal pages | ★★ | Legal / admin |
| N14 | Seller registration form content | Form text | ★★ | Operations team |
| N15 | Bulk SMS service description | Service text | ★★★ | Content team |
| N16 | ICT Consulting service description | Service text | ★★★ | Content team |
| N17 | Call Center service description | Service text | ★★★ | Content team |

### 7.3 Content Migration Rules

1. **Nothing is deleted** — Every existing piece of content has a destination
2. **Broken pages (404) are fixed** — Bulk SMS, ICT Consulting, Call Center get new content
3. **All content is rewritten for quality** — No copy-paste from old site
4. **Bilingual from day one** — All content created in English + Arabic
5. **Visual content is recreated** — New photography, screenshots, graphics
6. **Metrics are added** — Every claim should have a number where possible
7. **Testimonials are kept** — Existing testimonials are gold, add more over time
8. **Brand voice is elevated** — From "ICT services" to "technology partnership"

---

## 8. DEVELOPMENT BLUEPRINT

### 8.1 Route Structure (web.php)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PlatformController;
use App\Http\Controllers\CrmController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Core Pages
Route::inertia('/', 'home')->name('home');
Route::inertia('/about', 'about/index')->name('about');
Route::inertia('/about/leadership', 'about/leadership')->name('about.leadership');
Route::inertia('/about/team', 'about/team')->name('about.team');
Route::inertia('/about/values', 'about/values')->name('about.values');
Route::inertia('/about/culture', 'about/culture')->name('about.culture');

// Services Overview
Route::inertia('/services', 'services/index')->name('services');

// Service Categories (optional overviews)
Route::inertia('/services/commerce', 'services/categories/commerce')->name('services.commerce');
Route::inertia('/services/enterprise', 'services/categories/enterprise')->name('services.enterprise');
Route::inertia('/services/digital', 'services/categories/digital')->name('services.digital');
Route::inertia('/services/infrastructure', 'services/categories/infrastructure')->name('services.infrastructure');

// Individual Services
Route::inertia('/services/ecommerce', 'services/ecommerce')->name('services.ecommerce');
Route::inertia('/services/payment-gateway', 'services/payment-gateway')->name('services.payment-gateway');
Route::inertia('/services/bulk-sms', 'services/bulk-sms')->name('services.bulk-sms');
Route::inertia('/services/erp', 'services/erp')->name('services.erp');
Route::inertia('/services/ticketing', 'services/ticketing')->name('services.ticketing');
Route::inertia('/services/call-center', 'services/call-center')->name('services.call-center');
Route::inertia('/services/web-development', 'services/web-development')->name('services.web-development');
Route::inertia('/services/mobile-apps', 'services/mobile-apps')->name('services.mobile-apps');
Route::inertia('/services/connectivity', 'services/connectivity')->name('services.connectivity');
Route::inertia('/services/vpn', 'services/vpn')->name('services.vpn');
Route::inertia('/services/consulting', 'services/consulting')->name('services.consulting');

// Platform (Matger-TUTIA)
Route::inertia('/platform', 'platform/index')->name('platform');
Route::inertia('/platform/sellers', 'platform/sellers')->name('platform.sellers');
Route::inertia('/platform/buyers', 'platform/buyers')->name('platform.buyers');
Route::inertia('/platform/apps', 'platform/apps')->name('platform.apps');

// Work / Case Studies
Route::inertia('/work', 'work/index')->name('work');
Route::inertia('/work/matger-tutia', 'work/matger-tutia')->name('work.matger-tutia');
Route::inertia('/work/erp-implementation', 'work/erp-implementation')->name('work.erp');
Route::inertia('/work/connectivity-project', 'work/connectivity-project')->name('work.connectivity');
Route::inertia('/work/web-platform', 'work/web-platform')->name('work.web');
Route::inertia('/work/mobile-app', 'work/mobile-app')->name('work.mobile');
Route::inertia('/work/ticketing-system', 'work/ticketing-system')->name('work.ticketing');

// Insights
Route::inertia('/insights', 'insights/index')->name('insights');
Route::inertia('/insights/blog', 'insights/blog')->name('insights.blog');
Route::inertia('/insights/case-studies', 'insights/case-studies')->name('insights.case-studies');
Route::inertia('/insights/resources', 'insights/resources')->name('insights.resources');

// Contact / CRM
Route::inertia('/contact', 'contact/index')->name('contact');
Route::inertia('/contact/consultation', 'contact/consultation')->name('contact.consultation');
Route::inertia('/contact/proposal', 'contact/proposal')->name('contact.proposal');
Route::inertia('/contact/quote', 'contact/quote')->name('contact.quote');
Route::inertia('/contact/thank-you', 'contact/thank-you')->name('contact.thank-you');

// Legal
Route::inertia('/legal/privacy', 'legal/privacy')->name('legal.privacy');
Route::inertia('/legal/terms', 'legal/terms')->name('legal.terms');
Route::inertia('/legal/cookies', 'legal/cookies')->name('legal.cookies');

// Platform Registration (CRM post route)
Route::post('/platform/register', [PlatformController::class, 'register'])->name('platform.register');
Route::post('/contact/submit', [CrmController::class, 'submit'])->name('contact.submit');
Route::post('/contact/consultation', [CrmController::class, 'consultation'])->name('contact.consultation.book');
Route::post('/contact/proposal', [CrmController::class, 'proposal'])->name('contact.proposal.submit');
Route::post('/contact/quote', [CrmController::class, 'quote'])->name('contact.quote.submit');
Route::post('/newsletter/subscribe', [CrmController::class, 'subscribe'])->name('newsletter.subscribe');

/*
|--------------------------------------------------------------------------
| Auth Routes (Keep existing)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
```

### 8.2 Page Structure (resources/js/pages/)

```
resources/js/pages/
│
├── home.tsx                         # Home page (was welcome.tsx)
├── dashboard.tsx                    # Keep existing
│
├── about/
│   ├── index.tsx                    # About overview
│   ├── leadership.tsx               # Leadership team
│   ├── team.tsx                     # Full team
│   ├── values.tsx                   # Core values
│   └── culture.tsx                  # Company culture
│
├── services/
│   ├── index.tsx                    # Services overview
│   ├── categories/
│   │   ├── commerce.tsx             # Digital Commerce category
│   │   ├── enterprise.tsx           # Enterprise Technology category
│   │   ├── digital.tsx              # Digital Presence category
│   │   └── infrastructure.tsx       # Infrastructure category
│   ├── ecommerce.tsx                # E-Commerce Solutions
│   ├── payment-gateway.tsx          # Payment Gateway
│   ├── bulk-sms.tsx                 # Bulk SMS
│   ├── erp.tsx                      # ERP Systems
│   ├── ticketing.tsx                # Ticketing System
│   ├── call-center.tsx              # Call Center
│   ├── web-development.tsx          # Web Development
│   ├── mobile-apps.tsx              # Mobile Applications
│   ├── connectivity.tsx             # Connectivity Solutions
│   ├── vpn.tsx                      # VPN Services
│   └── consulting.tsx               # ICT Consulting
│
├── platform/
│   ├── index.tsx                    # Matger-TUTIA overview
│   ├── sellers.tsx                  # For Sellers
│   ├── buyers.tsx                   # For Buyers
│   └── apps.tsx                     # Mobile Apps
│
├── work/
│   ├── index.tsx                    # Work overview (case study grid)
│   ├── matger-tutia.tsx             # Case: Matger-TUTIA
│   ├── erp-implementation.tsx       # Case: ERP
│   ├── connectivity-project.tsx     # Case: Connectivity
│   ├── web-platform.tsx             # Case: Web Platform
│   ├── mobile-app.tsx               # Case: Mobile App
│   └── ticketing-system.tsx         # Case: Ticketing System
│
├── insights/
│   ├── index.tsx                    # Insights hub
│   ├── blog.tsx                     # Blog listing
│   ├── case-studies.tsx             # Case studies library
│   └── resources.tsx                # Resources library
│
├── contact/
│   ├── index.tsx                    # Contact hub
│   ├── consultation.tsx             # Book consultation
│   ├── proposal.tsx                 # Request proposal
│   ├── quote.tsx                    # Get a quote
│   └── thank-you.tsx                # Post-submission
│
├── legal/
│   ├── privacy.tsx                  # Privacy policy
│   ├── terms.tsx                    # Terms of service
│   └── cookies.tsx                  # Cookie policy
│
└── auth/                            # Keep existing
    ├── login.tsx
    ├── register.tsx
    ├── forgot-password.tsx
    ├── reset-password.tsx
    ├── verify-email.tsx
    ├── confirm-password.tsx
    └── two-factor-challenge.tsx
```

### 8.3 Shared Layouts

```typescript
// resources/js/layouts/

// Primary layout — used by all public pages
main-layout.tsx
  ├── SkipLink (accessibility)
  ├── Header
  │   ├── TopBar (phone, email, social, language switcher)
  │   ├── Logo
  │   ├── MainNav
  │   │   ├── NavLink: Home
  │   │   ├── MegaMenu: Services
  │   │   ├── NavLink: Platform (Matger-TUTIA)
  │   │   ├── NavLink: Work
  │   │   ├── NavLink: Insights
  │   │   ├── NavLink: About
  │   │   └── NavLink: Contact
  │   ├── MobileNav (hamburger + drawer)
  │   └── CTA Button: "Book Consultation"
  ├── Main (children + page content)
  ├── Footer
  │   ├── FooterColumn: Contact Info
  │   ├── FooterColumn: Services
  │   ├── FooterColumn: Links
  │   ├── SocialLinks
  │   └── FooterBottom (copyright, legal)
  ├── CookieBanner (GDPR)
  └── BackToTop

// Minimal layout — for legal pages, auth pages
blank-layout.tsx
  ├── Logo
  ├── Main (children)
  └── Footer (minimal)
```

### 8.4 Component Hierarchy

```
App.tsx
└── router (Inertia)
    └── layouts/main-layout.tsx
        ├── header.tsx
        │   ├── top-bar.tsx
        │   ├── logo.tsx
        │   ├── navigation/mega-menu.tsx
        │   ├── navigation/nav-link.tsx
        │   ├── navigation/language-switcher.tsx
        │   ├── navigation/header-mobile.tsx
        │   └── ui/button.tsx (CTA)
        │
        ├── Page Content (from pages/)
        │   ├── design-system/
        │   │   ├── container.tsx
        │   │   ├── section.tsx
        │   │   ├── heading.tsx
        │   │   └── text.tsx
        │   │
        │   ├── home/
        │   │   ├── hero.tsx
        │   │   ├── trust-bar.tsx
        │   │   ├── services-grid.tsx
        │   │   ├── platform-showcase.tsx
        │   │   ├── values-cards.tsx
        │   │   ├── client-stories.tsx
        │   │   └── cta-section.tsx
        │   │
        │   ├── services/
        │   │   ├── service-card.tsx
        │   │   ├── service-grid.tsx
        │   │   └── process-steps.tsx
        │   │
        │   ├── platform/
        │   │   ├── platform-hero.tsx
        │   │   ├── feature-list.tsx
        │   │   ├── app-badges.tsx
        │   │   └── category-grid.tsx
        │   │
        │   ├── work/
        │   │   ├── case-study-card.tsx
        │   │   ├── case-study-hero.tsx
        │   │   ├── challenge-block.tsx
        │   │   ├── solution-block.tsx
        │   │   ├── results-metrics.tsx
        │   │   └── tech-badges.tsx
        │   │
        │   ├── about/
        │   │   ├── company-story.tsx
        │   │   ├── mission-vision.tsx
        │   │   ├── values-list.tsx
        │   │   ├── leadership-card.tsx
        │   │   └── team-grid.tsx
        │   │
        │   ├── crm/
        │   │   ├── contact-form.tsx
        │   │   ├── demo-request-form.tsx
        │   │   ├── consultation-form.tsx
        │   │   ├── proposal-form.tsx (multi-step)
        │   │   ├── quote-form.tsx
        │   │   ├── seller-form.tsx
        │   │   ├── newsletter-form.tsx
        │   │   ├── form-step.tsx
        │   │   ├── form-progress.tsx
        │   │   └── form-confirmation.tsx
        │   │
        │   └── shared/
        │       ├── animate-in.tsx
        │       ├── fade-in.tsx
        │       ├── counter.tsx
        │       ├── carousel.tsx
        │       ├── breadcrumbs.tsx
        │       ├── seo-head.tsx
        │       ├── structured-data.tsx
        │       ├── skip-link.tsx
        │       ├── loading.tsx
        │       └── error-state.tsx
        │
        └── footer.tsx
            ├── footer-column.tsx
            ├── social-links.tsx
            └── footer-bottom.tsx
```

### 8.5 Domain-Driven Folder Organization

```
resources/js/
│
├── types/                  # Domain types
│   ├── brand.ts            # Brand, colors, typography
│   ├── navigation.ts       # Nav items, breadcrumbs
│   ├── services.ts         # Service, ServiceCategory
│   ├── platform.ts         # PlatformFeature, AppInfo
│   ├── work.ts             # CaseStudy, Result, Tech
│   ├── about.ts            # TeamMember, Leadership, Value
│   ├── insights.ts         # Article, Resource, Category
│   ├── testimonial.ts      # Testimonial
│   ├── crm.ts              # Form, Lead, Pipeline
│   └── i18n.ts             # Locale, Direction
│
├── lib/                    # Utilities
│   ├── utils.ts            # cn(), formatDate(), etc.
│   ├── constants.ts        # NAV_ITEMS, SERVICES, VALUES
│   └── locales/
│       ├── en.ts           # All English strings
│       └── ar.ts           # All Arabic strings
│
├── hooks/                  # Custom hooks
│   ├── use-direction.ts    # RTL/LTR detection
│   ├── use-scroll.ts       # Scroll position, direction
│   ├── use-intersection.ts # Intersection Observer
│   └── use-form.ts         # Form state management
│
├── layouts/                # Layouts
│   ├── main-layout.tsx
│   └── blank-layout.tsx
│
├── components/             # Components organized by domain
│   ├── ui/                 # shadcn primitives
│   ├── design-system/      # Brand primitives
│   ├── navigation/         # Header, footer, menus
│   ├── home/               # Home page sections
│   ├── services/           # Service components
│   ├── platform/           # Matger-TUTIA components
│   ├── work/               # Case study components
│   ├── about/              # About page components
│   ├── insights/           # Blog/resource components
│   ├── crm/                # Form/lead components
│   └── shared/             # Cross-domain components
│
├── pages/                  # Page compositions (by domain)
│   ├── home.tsx
│   ├── about/
│   ├── services/
│   ├── platform/
│   ├── work/
│   ├── insights/
│   ├── contact/
│   ├── legal/
│   └── auth/
│
├── app.tsx                 # App entry
├── app.css                 # Global styles
├── boot.ts                 # Inertia boot
└── ssr.tsx                 # SSR entry
```

---

## DELIVERABLE COMPLETION CHECKLIST

| # | Deliverable | Status | Approved |
|---|-------------|--------|----------|
| 1 | **Product Requirements Document** | ✅ Complete | ⬜ |
| 2 | **Final Information Architecture** | ✅ Complete (51 pages planned) | ⬜ |
| 3 | **User Journey Mapping** | ✅ Complete (5 journeys) | ⬜ |
| 4 | **Page Wireframe Architecture** | ✅ Complete (8 page types) | ⬜ |
| 5 | **Design System Specification** | ✅ Complete | ⬜ |
| 6 | **CRM Architecture** | ✅ Complete | ⬜ |
| 7 | **Content Migration Plan** | ✅ Complete (32 items mapped, 17 new needed) | ⬜ |
| 8 | **Development Blueprint** | ✅ Complete | ⬜ |

**Next Step**: All 8 deliverables are complete. Review and approve to proceed with Phase 3: Implementation.
