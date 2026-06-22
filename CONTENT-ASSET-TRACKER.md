# Content & Asset Tracker

> Tracks the status of every required business asset for the TUTIA website.
> Legend: ✅ Available | ⚠️ Partial/Available needs work | ❌ Missing | 🔄 In Progress

---

## 1. Case Studies

| # | Title | Required | Available | Missing | Owner | Status |
|---|-------|----------|-----------|---------|-------|--------|
| 1 | Matger-TUTIA Platform Launch | Full narrative (500-1000w), 3-5 result metrics, hero image, tech stack, client pull-quote | Tech stack (navigation-data.ts), basic service description | Challenge, approach, solution, results narrative, quantified outcomes, testimonial pull-quote, screenshots | TUTIA product team | ❌ |
| 2 | ERP Implementation | Full narrative (500-1000w), 3-5 result metrics, hero image, tech stack, client approval | ERP service description (existing site) | Entire case study content, client identity & approval, result metrics, image | TUTIA delivery team + client | ❌ |
| 3 | Connectivity Solution | Full narrative (500-1000w), 3-5 result metrics, hero image, tech stack, client approval | Connectivity service description (existing site) | Entire case study content, client identity & approval, result metrics, image | TUTIA delivery team + client | ❌ |
| 4 | Web Platform | Full narrative (500-1000w), result metrics, image | — | Everything | TUTIA team | ❌ |
| 5 | Mobile App | Full narrative (500-1000w), result metrics, image | — | Everything | TUTIA team | ❌ |
| 6 | Ticketing System | Full narrative (500-1000w), result metrics, image | — | Everything | TUTIA team | ❌ |

**Case study page routes defined**: `web.php:50-56` — `/work/{slug}` pages exist.

---

## 2. Testimonials

| # | Client | Quote | Author | Company | Photo | Permission | Arabic | Status |
|---|--------|-------|--------|---------|-------|------------|--------|--------|
| 1 | Client 1 (anonymous) | Praised efficiency, quality, professionalism, on-time delivery, competitive tracking, flexibility | Unknown | Unknown | ❌ | ❌ | ❌ | ⚠️ Extract from current site, then get ID + permission |
| 2 | Client 2 (anonymous) | Praised communication, quality of content work, project management, would recommend | Unknown | Unknown | ❌ | ❌ | ❌ | ⚠️ Extract from current site, then get ID + permission |
| 3 | TBD | Need 1-2 more for industry diversity | — | — | ❌ | ❌ | ❌ | ❌ |
| 4 | TBD | Need from Matger-TUTIA seller or buyer | — | — | ❌ | ❌ | ❌ | ❌ |

**Total needed**: 4 minimum (2 existing + 2 new). **Total available**: 0 (need extraction).

---

## 3. Client Logos

| # | Client Name | Logo File | Source | Format | Permission | Status |
|---|-------------|-----------|--------|--------|------------|--------|
| 1-7 | From current tutiasd.com logo grid | Unknown filenames | Extract from tutiasd.com | Unknown (likely PNG/JPG) | ❌ | ❌ Extract & identify |
| 8+ | Additional clients | — | Confirm with TUTIA team | SVG preferred | ❌ | ❌ |

**Total needed**: 5-7 client logos. **Total available**: 0 (images on live site but need extraction).

---

## 4. Product Screenshots

| Asset | For Section | Required Resolution | Source | Status |
|-------|-------------|-------------------|--------|--------|
| Matger-TUTIA Android app UI (2-3 screens) | Matger-TUTIA Showcase | 1080×1920px or higher | Google Play listing or product team | ❌ |
| Matger-TUTIA iOS app UI (2-3 screens) | Matger-TUTIA Showcase | 1284×2778px or higher | App Store listing or product team | ❌ |
| Matger-TUTIA seller dashboard | Platform page | 1920×1080px | Product team | ❌ |
| Matger-TUTIA buyer app flow | Platform page | 1080×1920px | Product team | ❌ |

**Total needed**: 4-8 screenshots. **Total available**: 0.

---

## 5. Team Photos

| Asset | For Section | Required | Source | Status |
|-------|-------------|----------|--------|--------|
| Leadership headshots (2-4) | About / Leadership | Professional headshot, 800×800px min | TUTIA team | ❌ |
| Team culture photo (1-2) | About / Team | Candid, 1920×1080px | TUTIA team | ❌ |
| Office / workspace photo (1) | About / Contact | 1920×1080px | TUTIA team | ❌ |

**Total needed**: 4-7 photos. **Total available**: 0.

---

## 6. Company Metrics

| Metric | Value | Source | Confidence | Status |
|--------|-------|--------|------------|--------|
| Years in Business | 9+ | constants.ts:83 | Medium — need verification | ⚠️ |
| Projects Completed | 100+ | constants.ts:87 | Low — likely estimate | ⚠️ |
| Clients Served | 50+ | constants.ts:93 | Low — likely estimate | ⚠️ |
| Matger-TUTIA Downloads | 500+ | Audit — Google Play listing | Medium — need current number | ⚠️ |
| Active Merchants on Matger-TUTIA | Unknown | — | — | ❌ |
| Team Size | Unknown | — | — | ❌ |
| Mobile Apps Published | 2 (Android + iOS) | Audit | High — confirm both active | ⚠️ |
| Service Categories | 4 | navigation-data.ts | High — confirmed | ✅ |
| Individual Services | 11 | Audit + routes | High — confirmed | ✅ |
| Partner Count | Unknown | — | — | ❌ |
| Client Retention Rate | Unknown | — | — | ❌ |

**Total needed**: 11 metrics. **Total available**: 3 (unverified).

---

## 7. Certifications

| Certification | Issuer | Valid Until | Document | Status |
|--------------|-------|-------------|----------|--------|
| Any ICT/tech certifications | Unknown | Unknown | ❌ | ❌ |
| Partnership certifications | Unknown | Unknown | ❌ | ❌ |
| Quality/ISO certifications | Unknown | Unknown | ❌ | ❌ |

**Total needed**: Unknown. **Total available**: 0. — Verify with TUTIA team if any exist.

---

## 8. Partner Logos

| Partner | Logo File | Source | Format | Status |
|---------|-----------|--------|--------|--------|
| From current tutiasd.com partner grid | Unknown | Extract from tutiasd.com | Unknown | ❌ |
| Technology partners (if any) | — | Confirm with TUTIA | SVG preferred | ❌ |

**Total needed**: 3-5 partner logos. **Total available**: 0 (images on live site need extraction).

---

## 9. Marketing Copy

### 9.1 Hero Section

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Headline (primary) | "Technology that transforms. Trust that endures." | — | ⚠️ EN drafted, AR needed |
| Sub-headline | "Empowering Sudanese businesses with enterprise-grade digital solutions since 2017." | — | ⚠️ EN drafted, AR needed |
| Primary CTA | "Start Your Transformation" | — | ⚠️ EN drafted, AR needed |
| Secondary CTA | "Explore Our Capabilities" | — | ⚠️ EN drafted, AR needed |

### 9.2 Core Capabilities Section

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "Our Core Capabilities" | — | ⚠️ EN drafted, AR needed |
| Section subtitle | "We bridge the gap between where your business is and where it needs to be." | — | ⚠️ EN drafted, AR needed |
| Capability 1 (Digital Commerce) | "Launch and scale your online presence with marketplaces, payment gateways, and e-commerce platforms." | — | ⚠️ EN drafted, AR needed |
| Capability 2 (Enterprise Technology) | "Transform operations with ERP, travel automation, and multi-channel customer engagement." | — | ⚠️ EN drafted, AR needed |
| Capability 3 (Digital Presence) | "Build your brand with world-class websites, mobile apps, and digital marketing." | — | ⚠️ EN drafted, AR needed |
| Capability 4 (Infrastructure & Advisory) | "Secure, connect, and strategize with enterprise-grade infrastructure and expert consulting." | — | ⚠️ EN drafted, AR needed |

### 9.3 Featured Services Section

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "Featured Services" | — | ⚠️ EN drafted, AR needed |
| Section subtitle | "Focused solutions for Sudan's most critical business needs." | — | ⚠️ EN drafted, AR needed |
| ERP features (3 bullets) | "Streamline operations from finance to HR" + 2 more | — | ⚠️ EN drafted, AR needed |
| E-Commerce features (3 bullets) | "Launch your online marketplace with Matger-TUTIA" + 2 more | — | ⚠️ EN drafted, AR needed |
| Connectivity features (3 bullets) | "Reliable mobile and Wi-Fi coverage, anywhere in Sudan" + 2 more | — | ⚠️ EN drafted, AR needed |

### 9.4 Matger-TUTIA Showcase

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "Matger-TUTIA" (from platform.title) | "متجر توتيا" | ✅ |
| Section subtitle | "Sudan's Growing E-Commerce Marketplace" | — | ⚠️ Exists, AR needed |
| Seller benefit 1 | — | — | ❌ |
| Seller benefit 2 | — | — | ❌ |
| Seller benefit 3 | — | — | ❌ |
| Buyer benefit 1 | — | — | ❌ |
| Buyer benefit 2 | — | — | ❌ |
| Buyer benefit 3 | — | — | ❌ |

### 9.5 Industries Served

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "Industries We Serve" | — | ⚠️ EN drafted, AR needed |
| Section subtitle | "Deep expertise across Sudan's key economic sectors." | — | ⚠️ EN drafted, AR needed |
| Industry 1 (Retail) | "Digital storefronts, marketplaces, payment integration" | — | ⚠️ EN drafted, AR needed |
| Industry 2 (Travel) | "Ticketing systems, booking automation, travel agency solutions" | — | ⚠️ EN drafted, AR needed |
| Industry 3 (Telecom) | "Connectivity infrastructure, VPN, network solutions" | — | ⚠️ EN drafted, AR needed |
| Industry 4 (Finance) | "Payment gateways, ERP, secure systems" | — | ⚠️ EN drafted, AR needed |
| Industry 5 (Government) | "ICT consulting, digital transformation, infrastructure" | — | ⚠️ EN drafted, AR needed |

### 9.6 Why TUTIA

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "Why TUTIA" | — | ⚠️ EN drafted, AR needed |
| Section subtitle | "Global standards. Local expertise. Real results." | — | ⚠️ EN drafted, AR needed |
| Differentiator 1 (Sudan's Partner) | "We're not a global consultancy with a local office. We're a Sudanese company building Sudan's digital future." | — | ⚠️ EN drafted, AR needed |
| Differentiator 2 (Proven Platform) | "Matger-TUTIA is live, with 500+ downloads and real merchants. We don't just advise — we build." | — | ⚠️ EN drafted, AR needed |
| Differentiator 3 (End-to-End) | "From strategy to implementation to support. One partner, full accountability." | — | ⚠️ EN drafted, AR needed |
| Differentiator 4 (Bilingual) | "Arabic and English, equally polished. Your team, your clients, your stakeholders — we speak their language." | — | ⚠️ EN drafted, AR needed |

### 9.7 Success Metrics

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "By the Numbers" | — | ⚠️ EN drafted, AR needed |
| 3 existing stat labels | Years, Projects, Clients | — | ✅ In locales |
| Additional stats | Team size, downloads, apps, etc. | — | ❌ Pending verification |

### 9.8 Case Studies Preview

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "Case Studies" | — | ⚠️ EN drafted, AR needed |
| Section subtitle | "Real projects. Real results. Real impact." | — | ⚠️ EN drafted, AR needed |
| 3 card headlines | Per case study | — | ❌ |
| 3 card summaries | 1 line each | — | ❌ |
| 3 result metrics | Per case study | — | ❌ |

### 9.9 Testimonials

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "What Our Clients Say" | — | ⚠️ EN drafted, AR needed |
| 2 existing testimonial quotes | Need extraction | — | ❌ |
| 1-2 additional quotes | — | — | ❌ |
| Author names + companies | Unknown | — | ❌ |

### 9.10 CRM Conversion Section

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Section title | "Ready to transform your business?" | — | ⚠️ EN drafted, AR needed |
| Section subtitle | "Tell us about your project." | — | ⚠️ EN drafted, AR needed |
| Form field labels | Name, Email, Phone, Message (existing) | ✅ | ✅ In locales |
| Auto-response template | "Thank you for contacting TUTIA..." | — | ❌ |
| Trust line | "Response within 24 hours" | — | ❌ |

### 9.11 Final CTA

| Asset | EN | AR | Status |
|-------|----|----|--------|
| Headline | "Let's build something great together." | — | ⚠️ EN drafted, AR needed |
| Sub-text | — | — | ❌ |
| Primary CTA | "Book a Free Consultation" (from cta.bookConsultation) | — | ✅ |
| Secondary CTA | "Request a Proposal" (from contact.requestProposal) | — | ✅ |

---

## 10. Arabic Translations

| Category | Total Keys | Translated | Missing | Status |
|----------|-----------|------------|---------|--------|
| Navigation | 12 | 12 | 0 | ✅ Complete |
| Services | 34 | 34 | 0 | ✅ Complete |
| Platform | 9 | 9 | 0 | ✅ Complete |
| Work | 10 | 10 | 0 | ✅ Complete (needs case study content) |
| About | 13 | 13 | 0 | ✅ Complete |
| Insights | 8 | 8 | 0 | ✅ Complete |
| Contact / CRM | 13 | 13 | 0 | ✅ Complete |
| CTAs | 7 | 7 | 0 | ✅ Complete |
| Footer | 14 | 14 | 0 | ✅ Complete |
| Common | 12 | 12 | 0 | ✅ Complete |
| Values | 8 | 8 | 0 | ✅ Complete |
| Stats | 3 | 3 | 0 | ✅ Complete |
| Language | 4 | 4 | 0 | ✅ Complete |
| Cookie Banner | 3 | 3 | 0 | ✅ Complete |
| **Homepage sections (new)** | ~40 | 0 | ~40 | ❌ Not yet added |

**New keys needed for homepage**: Hero (4 keys), Core Capabilities (10 keys), Featured Services (8 keys), Matger Showcase (6+ keys), Industries (12 keys), Why TUTIA (10 keys), Metrics (6+ keys), Case Studies (8+ keys), Testimonials (4+ keys), CRM (6+ keys), Final CTA (4+ keys).

---

## 11. Visual Assets Summary

| Asset Type | Needed | Have | % Complete |
|------------|--------|------|-----------|
| Client logos (vector/raster) | 5-7 | 0 | 0% |
| Partner logos | 3-5 | 0 | 0% |
| App screenshots | 4-8 | 0 | 0% |
| Team photos | 4-7 | 0 | 0% |
| Hero visual (abstract/geometric) | 1 | 0 | 0% |
| Case study images | 6 | 0 | 0% |
| TUTIA logo (SVG) | 2 (full + icon) | 0 | 0% |
| App store badge images | 2 (Play + Apple) | 0 | 0% |
| Social share OG image | 1 | 0 | 0% |
| Favicon assets | 3 | 3 | 100% |
| Icons (Lucide) | ~30+ | ~30+ | 100% |

---

## 12. Priority Action Items

### Immediate (blocking homepage launch)
- [ ] Extract 2 existing testimonials from tutiasd.com with client names
- [ ] Obtain permission to publish testimonials
- [ ] Draft all new EN marketing copy (hero, capabilities, industries, differentiators)
- [ ] Translate all new copy to AR (professional, not machine)
- [ ] Verify 3 core metrics (years, projects, clients) with TUTIA team
- [ ] Obtain Matger-TUTIA app screenshots
- [ ] Obtain client/partner logos in usable format
- [ ] Obtain TUTIA logo as SVG

### Short-term (before Phase 2 completion)
- [ ] Source 1-2 additional testimonials from different industries
- [ ] Obtain 3 case study narratives with client approval
- [ ] Configure email/SMTP for CRM auto-response
- [ ] Write auto-response email templates (EN/AR)
- [ ] Verify Matger-TUTIA download count
- [ ] Source team photos

### Medium-term
- [ ] Design hero visual (CSS/SVG geometric pattern)
- [ ] Create OG social share image
- [ ] Source additional metrics (team size, merchants, retention)
- [ ] Create case study card images
- [ ] Check for any certifications
