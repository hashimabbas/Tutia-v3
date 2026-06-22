# TUTIA — Phase 2 Executive Review

> **Purpose**: Decision-friendly summary of all architecture deliverables
> **Status**: Pending approval → Phase 3 (Implementation)
> **Date**: June 18, 2026

---

## 1. Final Sitemap — 51 Pages

```
tutiasd.com/
│
├── HOME
│   └── /                              [Core]
│
├── ABOUT (5 pages)
│   ├── /about                         [Core]
│   ├── /about/leadership              [Core]
│   ├── /about/team                    [Core]
│   ├── /about/values                  [Core]
│   └── /about/culture                 [Core]
│
├── SERVICES (14 pages)
│   ├── /services                      [Service]   — Overview with categories
│   ├── /services/commerce             [Service]   — Digital Commerce category
│   ├── /services/enterprise           [Service]   — Enterprise Technology category
│   ├── /services/digital              [Service]   — Digital Presence category
│   ├── /services/infrastructure       [Service]   — Infrastructure & Consulting category
│   ├── /services/ecommerce            [Service]
│   ├── /services/payment-gateway      [Service]
│   ├── /services/bulk-sms             [Service]   ★ NEW (was 404)
│   ├── /services/erp                  [Service]
│   ├── /services/ticketing            [Service]
│   ├── /services/call-center          [Service]   ★ NEW (was 404)
│   ├── /services/web-development      [Service]
│   ├── /services/mobile-apps          [Service]   ★ NEW
│   ├── /services/connectivity         [Service]
│   ├── /services/vpn                  [Service]
│   └── /services/consulting           [Service]   ★ NEW (was 404)
│
├── PLATFORM — Matger-TUTIA (4 pages)
│   ├── /platform                      [Platform]
│   ├── /platform/sellers              [Platform]
│   ├── /platform/buyers               [Platform]
│   └── /platform/apps                 [Platform]
│
├── WORK (7 pages)
│   ├── /work                          [Work]
│   ├── /work/matger-tutia             [Work]
│   ├── /work/erp-implementation       [Work]
│   ├── /work/connectivity-project     [Work]
│   ├── /work/web-platform             [Work]
│   ├── /work/mobile-app               [Work]
│   └── /work/ticketing-system         [Work]
│
├── INSIGHTS (4 pages)
│   ├── /insights                      [Insights]
│   ├── /insights/blog                 [Insights]
│   ├── /insights/case-studies         [Insights]
│   └── /insights/resources            [Insights]
│
├── CONTACT — CRM (5 pages)
│   ├── /contact                       [CRM]
│   ├── /contact/consultation          [CRM]
│   ├── /contact/proposal              [CRM]
│   ├── /contact/quote                 [CRM]
│   └── /contact/thank-you             [CRM]
│
├── LEGAL (3 pages)
│   ├── /legal/privacy                 [Legal]
│   ├── /legal/terms                   [Legal]
│   └── /legal/cookies                 [Legal]
│
└── SYSTEM — Auth (7 pages, keep existing)
    ├── /auth/login
    ├── /auth/register
    ├── /auth/forgot-password
    ├── /auth/reset-password
    ├── /auth/verify-email
    ├── /auth/two-factor-challenge
    └── /dashboard
```

**Count**: 51 pages — Every page has EN + AR variants via route prefix.

---

## 2. Complete Navigation Structure

### Primary Nav (desktop)
```
[LOGO: TUTIA]   Home   Services ▼   Platform ▼   Work   Insights   About   Contact   [Book Consultation]
                                                                    ↓
                                                    [Top Bar: Phone | Email | Social | EN/AR]
```

### Mega Menu — Services (expanded)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Digital Commerce              │  Enterprise Technology    │ Digital Presence │
│  ├── E-Commerce Solutions      │  ├── ERP Systems          │ ├── Web Dev      │
│  ├── Payment Gateway           │  ├── Ticketing System     │ ├── Mobile Apps  │
│  └── Bulk SMS                  │  └── Call Center          │                   │
│                                │                           │  Infrastructure  │
│                                │                           │  ├── Connectivity│
│                                │                           │  ├── VPN         │
│                                │                           │  └── Consulting  │
└──────────────────────────────────────────────────────────────┴────────────────┘
```

### Platform Mega Menu (expanded)
```
┌──────────────────────────────────────────────────────┐
│  Platform Overview     For Sellers     For Buyers     │
│  Mobile Apps           App Store      Google Play     │
└──────────────────────────────────────────────────────┘
```

### Mobile Nav (hamburger drawer)
- Full vertical list with collapsible accordion groups
- CTA button "Book Consultation" at bottom
- Language switcher at top

---

## 3. Home Page Wireframe — 9 Sections in Order

| # | Section | Content | CTA | Trust Element |
|---|---------|---------|-----|---------------|
| 1 | **Hero** | "Unlimited Trust" + sub-text + abstract visual | "Explore Services" / "Book Consultation" | Tagline + visual quality |
| 2 | **Trust Bar** | Client logos + partner logos + 3 stats (years, projects, clients) | — | Instant credibility |
| 3 | **About Snapshot** | Brief intro (2-3 lines) + link | "Learn About TUTIA" | Mission statement |
| 4 | **Matger-TUTIA Showcase** | Platform screenshot + features + app store badges | "Explore Platform" + App Store / Google Play | Real product proof |
| 5 | **Services Grid** | 10 service cards in 4 categories, icons + brief | "Learn More" per card | Capability breadth |
| 6 | **Values** | 4 cards: Trust, Commitment, Integrity, Results | — | Brand character |
| 7 | **Testimonials** | 2-3 client quotes with names + companies | — | Social proof |
| 8 | **CTA Section** | Bold headline + primary action | "Start Your Project" / "Book Free Consultation" | Trust signals |
| 9 | **Footer** | Full footer (see section 12) | Phone, Email, WhatsApp, Social | Office address |

---

## 4. Services Structure & Categorization

10 existing services + 1 new (Mobile Apps) — organized into 4 categories:

### Digital Commerce
| Service | Description | Lead CTA |
|---------|-------------|----------|
| E-Commerce Solutions | B2C marketplace + online store setup | "Start Selling" |
| Payment Gateway | Multi-currency, recurring billing | "Accept Payments" |
| Bulk SMS | SMS marketing & notifications ★ NEW CONTENT | "Send Campaigns" |

### Enterprise Technology
| Service | Description | Lead CTA |
|---------|-------------|----------|
| ERP Systems | Accounting, inventory, CRM, HR | "Request Demo" |
| Ticketing System | Travel agency automation (sales, ops, finance) | "Schedule Demo" |
| Call Center | Multi-channel call center ★ NEW CONTENT | "Get a Quote" |

### Digital Presence
| Service | Description | Lead CTA |
|---------|-------------|----------|
| Web Development | Websites, portals, award-winning agency | "Get a Quote" |
| Mobile Applications | iOS & Android app development ★ NEW | "Build My App" |

### Infrastructure & Consulting
| Service | Description | Lead CTA |
|---------|-------------|----------|
| Connectivity Solutions | Mobile/Wi-Fi coverage, site assessment | "Request Survey" |
| VPN Services | Business VPN, remote access, security | "Secure My Business" |
| ICT Consulting | Technology strategy & advisory ★ NEW CONTENT | "Talk to an Expert" |

---

## 5. Solutions Structure

The "Solutions" concept is embedded in two ways:

1. **Work/Portfolio** (`/work`) — 6 case studies proving delivery across services
2. **Industry pages** (future phase) — Retail, Travel, Telecom, Banking, Government

For the MVP, **industry pages are deferred** per the audit. Case studies serve as the primary solution evidence.

---

## 6. Matger-TUTIA Positioning Strategy

### Current State
- Tucked inside `/ecommerce` page as a sub-service
- App store badges in hero slider
- No dedicated platform presence on website

### New Positioning
- **Elevated from service to standalone platform** — its own top-level nav item
- **Positioned as TUTIA's flagship product** — real proof of technical capability
- **Primary messaging**: "Sudan's Growing E-Commerce Marketplace"
- **Dual audience**: Buyers + Sellers with dedicated sub-pages
- **Key stats to feature**: 500+ downloads, multi-vendor, multi-payment, multi-language

### Platform Page Structure
```
/platform → Overview (stats, features, value prop)
/platform/sellers → Benefits, fees, logistics, registration
/platform/buyers → Shopping guide, categories, payment
/platform/apps → App store badges, screenshots, ratings
```

### Where It Appears
1. **Nav**: Top-level "Platform" link
2. **Home**: Dedicated showcase section (section 4)
3. **Work**: Case study `/work/matger-tutia`
4. **Services**: Still linked from E-Commerce service page

---

## 7. CRM Funnel Architecture

### Pipeline Stages
```
NEW → CONTACTED → QUALIFIED → PROPOSAL SENT → NEGOTIATING → CLOSED (Won/Lost/On Hold)
```

### Stage Rules
| Stage | Entry | Exit | Time Limit |
|-------|-------|------|------------|
| **New** | Form submitted | Sales contacts | <1 hour |
| **Contacted** | Sales reaches out | Discovery call done | <24 hours |
| **Qualified** | Needs assessed | Proposal requested | <48 hours |
| **Proposal Sent** | Proposal delivered | Client responds | <5 days |
| **Negotiating** | Strong interest | Contract signed | <2 weeks |
| **Closed Won** | Contract signed | Project kickoff | <1 week |

### 10 Automation Triggers
| Trigger | Action | Delay |
|---------|--------|-------|
| Form submitted | Auto-response email + sales notification | Immediate |
| Consultation booked | Calendar invite + CRM entry | Immediate |
| Lead uncontacted >24h | Escalation alert | 24h |
| Proposal sent, no response | Follow-up email sequence | Day 5, 10, 15 |
| Seller registered | Welcome + onboarding guide | Immediate |
| Lead inactive >30 days | Re-engagement email | 30 days |
| Closed won | Project kickoff notification | Immediate |

---

## 8. Lead Capture Strategy

### 8 Form Types
| # | Form | Trigger | Fields |
|---|------|---------|--------|
| F1 | **Quick Contact** | Any page — generic inquiry | Name, Email, Phone, Service, Message |
| F2 | **Demo Request** | ERP/Ticketing/Call Center pages | + Company, Preferred Date |
| F3 | **Consultation Booking** | High-intent pages | + Brief, Time slot (calendar) |
| F4 | **Proposal Request** | Project-based pages | Multi-step: type, budget, timeline, requirements, contact |
| F5 | **Quote Request** | Web Dev/Connectivity/VPN | + Requirements summary |
| F6 | **Seller Registration** | Platform pages | Business name, owner, category, location |
| F7 | **Newsletter** | Insights, Footer | Email only |
| F8 | **Resource Download** | Whitepapers/brochures | Name, Email |

### CTA Strategy by Page
| Page | Primary CTA | Secondary CTA |
|------|-------------|---------------|
| Home | Book Free Consultation | Explore Services |
| ERP | Request ERP Demo | Download Brochure |
| E-Commerce | Join Matger-TUTIA | Start Selling |
| Web Dev | Get a Quote | See Portfolio |
| Connectivity | Request Site Assessment | Contact Sales |
| VPN | Set Up Business VPN | Talk to Expert |
| Contact | Send Message | Call +249912329449 |

### Conversion Goals (10 total)
- Contact Form Submit → Consultation Booked → Demo Requested
- Proposal Requested → Seller Registered → Quote Requested
- App Downloaded → Phone Call → WhatsApp Message → Newsletter Signup

---

## 9. Arabic/English Localization Strategy

### Approach: Route-Prefixed Bilingual
```
tutiasd.com/en/services/erp   → English (LTR)
tutiasd.com/ar/services/erp   → Arabic (RTL)
tutiasd.com/en/about          → English
tutiasd.com/ar/about          → Arabic
```

### Implementation Details
| Aspect | Approach |
|--------|----------|
| **Locale detection** | Browser detect → `/en` default, `/ar` if Arabic preferred |
| **Persistence** | Cookie + URL — user's choice remembered across sessions |
| **App locale** | `config/app.php` → set dynamically via middleware |
| **Translation strategy** | JSON translation files (`resources/js/lib/locales/{en,ar}.ts`) — not Laravel's PHP translations |
| **RTL handling** | `dir="rtl"` on `<html>` for Arabic — Tailwind v4 RTL utilities |
| **Font stack** | Instrument Sans (Latin) → Tajawal (Arabic) — swapped via CSS when `[dir="rtl"]` |
| **Typography** | Arabic needs +0.2 line height vs Latin. Same font sizes. |
| **Images/Media** | Some assets mirrored for RTL (hero visuals, icons with direction) |
| **Content parity** | Every page available in both languages from day one |

### Font Loading Strategy
- **Instrument Sans**: Already configured in Vite — preload for Latin
- **Tajawal**: Must be added — Google Fonts via CSS `@import` or self-hosted
- **Fallback stacking**: `font-family: 'Instrument Sans', system-ui, sans-serif`

---

## 10. Design System Visual Direction Summary

### Color System
| Role | Hex | Usage |
|------|-----|-------|
| **Primary Navy** | `#2B4C8C` | Buttons, links, icons, primary accents |
| **Primary Dark** | `#1A2D5A` | Hover states, headings (dark mode) |
| **Primary Light** | `#F0F4FA` | Backgrounds, section fills |
| **Gold Accent** | `#D4A017` | Highlights, special CTAs, badges (≤10% of UI) |
| **Gold Light** | `#FFECB3` | Callout backgrounds |
| **Neutral 900** | `#111827` | Headings |
| **Neutral 700** | `#374151` | Body text |
| **Neutral 50** | `#F9FAFB` | Page backgrounds |

### Visual Direction
- **Clean, spacious** — generous whitespace, max container 1280px
- **Navy + Gold palette** — conveys authority (navy) + commerce/vitality (gold)
- **Premium typography** — Instrument Sans (modern, open-source geometric sans-serif)
- **Subtle gradients** — limited to hero and key CTA areas
- **Bordered card components** — light borders, subtle shadows, consistent border-radius
- **Animated counter metrics** — stats animate on scroll (years, projects, clients)
- **Dark mode** — slate-900 backgrounds, slate-100 text, ready for future toggle

### Component Taxonomy (4 Layers)
| Layer | Example | Count |
|-------|---------|-------|
| **1. Primitives** (shadcn/ui) | Button, Input, Card, Badge, Dialog | Keep existing |
| **2. Brand Primitives** | Container, Section, Heading, Text, GradientText, MetricCard, LogoCloud | ~15 |
| **3. Composite Components** | Header, MegaMenu, Footer, HeroSection, ServiceCard, TestimonialCarousel, ContactForm | ~35 |
| **4. Page Compositions** | HomePage, ServiceDetailPage, PlatformPage, CaseStudyPage, AboutPage | ~15 |

---

## 11. Mega Menu Structure

### Services Mega Menu (3-column layout)
```
┌────────────────────────────────────────────────────────────────────────┐
│  DIGITAL COMMERCE    │  ENTERPRISE TECH     │  DIGITAL PRESENCE        │
│                       │                       │                          │
│  🛒 E-Commerce       │  🏢 ERP Systems      │  🌐 Web Development      │
│  Solutions            │  Accounting, CRM, HR  │  Websites, Portals       │
│                       │                       │                          │
│  💳 Payment Gateway   │  🎫 Ticketing System  │  📱 Mobile Applications  │
│  Multi-currency       │  Travel Automation    │  iOS & Android Apps      │
│                       │                       │                          │
│  📨 Bulk SMS          │  📞 Call Center      │  ─────────────────────── │
│  Marketing & Notif.   │  Multi-channel        │  INFRASTRUCTURE          │
│                       │                       │                          │
│                       │                       │  📡 Connectivity         │
│                       │                       │  🔒 VPN Services         │
│                       │                       │  💡 ICT Consulting       │
└────────────────────────────────────────────────────────────────────────┘
```

### Platform Mega Menu (simple row)
```
┌────────────────────────────────────────────────────────────────────────┐
│  📦 Platform Overview  │  🏪 For Sellers  │  🛍️ For Buyers  │  📱 Apps  │
└────────────────────────────────────────────────────────────────────────┘
```

### Implementation Notes
- Trigger: Hover (desktop) / Click (touch devices)
- Category headers are bold, not clickable (unless category page exists)
- Service names link to individual service pages
- Each service has a brief 2-3 word description underneath
- Icons next to each service (Lucide icons)
- Fade-in animation on open, no delay on close
- Accessible: keyboard navigation, aria-expanded, aria-controls

---

## 12. Footer Structure

### 4-Column Layout
```
┌───────────────────────────────────────────────────────────────────────────┐
│  CONTACT US             │  OUR SERVICES           │  QUICK LINKS          │
│                          │                          │                       │
│  TUTIA                   │  E-Commerce Solutions   │  About Us             │
│  Khartoum, Sudan         │  ERP Systems            │  Our Work             │
│  P.O Box: 77003          │  Web Development        │  Platform             │
│                          │  Connectivity           │  Insights             │
│  📞 +249912329449        │  VPN Services           │  Contact Us           │
│  📞 +249965502009        │  Mobile Apps            │  Careers              │
│  ✉️ info@tutiasd.com     │  Ticketing System       │                       │
│                          │  Payment Gateway        │  FOLLOW US            │
│  WhatsApp Business       │  Bulk SMS               │  [Facebook] [Twitter] │
│                          │  ICT Consulting         │  [Instagram] [LinkedIn]│
│                          │  Call Center            │                       │
├───────────────────────────────────────────────────────────────────────────┤
│  © 2026 TUTIA. All rights reserved.    Privacy Policy · Terms · Cookies  │
│                                                                           │
│  "Unlimited Trust"                                                        │
└───────────────────────────────────────────────────────────────────────────┘
```

### Footer Elements
| Column 1 | Column 2 | Column 3 | Column 4 |
|----------|----------|----------|----------|
| Logo + tagline | All 11 services listed | About, Work, Platform, Insights, Contact, Careers | Social media icons |
| Address + P.O Box | (grouped links) | | |
| Phone (2 lines) | | | |
| Email | | | |
| WhatsApp CTA | | | |

### Footer Bottom Bar
- Copyright: "© 2026 TUTIA. All rights reserved."
- Legal links: Privacy Policy, Terms of Service, Cookie Policy
- Tagline reinforcement: "Unlimited Trust"

---

## Summary of Key Decisions for Approval

| # | Decision | Proposed Direction | Your Call |
|---|----------|-------------------|-----------|
| 1 | **Brand name** | Drop "Trading Services" → just "TUTIA" | ✅ / 🔄 |
| 2 | **Tagline** | Keep "Unlimited Trust" — strengthen site-wide | ✅ / 🔄 |
| 3 | **Positioning** | "Technology & Digital Transformation Partner" | ✅ / 🔄 |
| 4 | **Services** | Preserve all 10 + add Mobile Apps (11 total) — fix 3 broken pages | ✅ / 🔄 |
| 5 | **Matger-TUTIA** | Elevate from sub-service to standalone top-level platform | ✅ / 🔄 |
| 6 | **Page count** | 51 pages for MVP | ✅ / 🔄 |
| 7 | **Bilingual** | Route-prefixed `/en`, `/ar` — every page in both | ✅ / 🔄 |
| 8 | **CRM** | 6-stage pipeline, 8 form types, 10 automations | ✅ / 🔄 |
| 9 | **Design** | Navy + Gold, Instrument Sans + Tajawal, shadcn/ui | ✅ / 🔄 |
| 10 | **Implementation** | Phase 0 (Foundation) → Phase 1-4 (incremental) | ✅ / 🔄 |

---

**Next Step**: Review the decisions above. If you approve, I'll proceed to Phase 3 — Phase 0 (Foundation): dependencies, Tailwind v4 tokens, i18n, design system components, layouts, header/mega-menu, footer, language switcher.
