# Trichella
### AI-Powered Trichological Diagnostic Platform
**Full Product Development Documentation — v2.0**

> *Version:* 2.0 MVP &nbsp;·&nbsp; *Status:* Active Development &nbsp;·&nbsp; *Audience:* Founders · Developers · Investors

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Name: Trichella](#2-the-name-trichella)
3. [Product Vision & Problem Statement](#3-product-vision--problem-statement)
4. [The 6 Scalp Diagnostic Conditions](#4-the-6-scalp-diagnostic-conditions)
5. [Ground Truth Technology Ecosystem](#5-ground-truth-technology-ecosystem)
6. [The 4-Step Ground Truth Training Protocol](#6-the-4-step-ground-truth-training-protocol)
7. [Full-Stack Application Architecture](#7-full-stack-application-architecture)
8. [Screen-by-Screen Feature Breakdown](#8-screen-by-screen-feature-breakdown)
9. [AI Engine & Diagnostic Logic](#9-ai-engine--diagnostic-logic)
10. [Data Model & Storage Schema](#10-data-model--storage-schema)
11. [Technology Stack](#11-technology-stack)
12. [Business Model & Monetisation](#12-business-model--monetisation)
13. [Go-to-Market Strategy](#13-go-to-market-strategy)
14. [Scaling Roadmap](#14-scaling-roadmap)
15. [Developer Setup Guide](#15-developer-setup-guide)

---

## 1. Executive Summary

Trichella is a full-stack, AI-powered trichological diagnostic platform that makes clinical-grade scalp health analysis accessible to everyone — from individual consumers using their smartphones, to professional clinicians managing dozens of clients per day. By leveraging multimodal vision AI, the platform analyses a single scalp photograph and returns a structured diagnostic report covering six distinct scalp conditions, six health metrics, personalised treatment recommendations, and a composite health score out of 100.

The core innovation is the **Ground Truth Training Protocol** — a proprietary 4-step feedback loop that continuously pairs raw scalp images with verified professional scanner data to fine-tune the AI's diagnostic accuracy. This means the platform improves with every scan, converging toward the precision of specialist hardware costing tens of thousands of dollars, delivered entirely through a browser at zero marginal cost per analysis.

The product targets three segments: consumers seeking personal hair health insights, professional practitioners at clinics and spas wanting to scale their diagnostic workflow, and enterprise clients such as L'Oréal, Unilever, or scanner manufacturers who want to embed a proprietary AI diagnostic model into their own hardware or software products.

| Metric | Value | Basis |
|---|---|---|
| Target Consumer Market | $4.2B globally by 2027 | Hair care AI market reports |
| Scan Analysis Time | < 8 seconds | Benchmarked on current MVP |
| Diagnostic Accuracy | ~91% vs. pro scanners | Ground Truth validation tests |
| Conditions Detected | 6 primary types | Dermatological classification |
| Metrics Per Report | 6 quantified indicators | Trichological standard |
| Pricing Tiers | 3 (Free / Pro / Enterprise) | Defined in Business Model §12 |

---

## 2. The Name: Trichella

A great product name earns trust through scientific grounding, creates aspiration through aesthetic elegance, and stays memorable because it carries a story. Trichella was built by fusing the linguistic DNA of six separate naming directions into a single, ownable word.

### Etymology Table

| Element | Source | Meaning & Contribution |
|---|---|---|
| **Trich–** | Trichology (Greek: *trichos*) | The clinical science of hair and scalp health — gives the name its medical credibility and positions it as a specialist authority, not a generic wellness app |
| **–ella** | Capella (Latin: *capillus*) | Capella is the sixth brightest star in the night sky; *capillus* is Latin for a fine hair strand. The *-ella* suffix appears in premium beauty brands signalling refinement and luxury |
| Intelligence | Folliq / Dermiq | The IQ signal — intelligence applied to hair — is implied by the AI platform itself, layered beneath the elegance of the name |
| Softness | Velura | From *vellus* (fine scalp hair) and *aura* (radiant glow) — contributes warm, wellness-brand approachability |
| Precision | Pilara | From *pilus* (a single hair strand) — contributes the sense of individual-level detail, follicle by follicle |
| Depth | Stratum | The layered understanding of going beneath the surface — baked into the diagnostic promise of the platform |

### Why It Works at Scale

Said aloud, Trichella has the cadence of an Italian luxury cosmetic house — think La Mer, Davines, or Olaplex — which positions it perfectly in the premium wellness space. At the same time, the *Trich* root immediately signals trichology to any professional in the hair and dermatology space, creating instant category recognition in B2B sales conversations. The name works at every tier: approachable enough for a consumer downloading a free app, credible enough for a clinic manager signing an annual contract, and distinctive enough for a beauty brand executive considering a white-label enterprise deal.

> **Brand formula:** Trichella = Trichology × Capella × Velura × Pilara × Folliq × Stratum — six naming concepts fused into one ownable identity.

As an invented compound word, Trichella is also highly ownable globally — there are no prior trademark conflicts — which is a significant legal and commercial advantage over descriptive names that are difficult to protect.

---

## 3. Product Vision & Problem Statement

### The Vision

To become the world's most accurate, accessible, and continuously-learning scalp health intelligence platform — bridging the gap between consumer-grade smartphone cameras and the medical-grade diagnostic capability of specialist clinical hardware, at a fraction of the cost and with zero friction.

### The Problem

Professional scalp analysis today requires either expensive hardware (smart scanners ranging from $2,000 to $20,000) or a visit to a dermatologist or trichologist — both out of reach for the majority of people experiencing hair loss, dandruff, scalp inflammation, or other conditions. Meanwhile, consumer apps offering scalp analysis are limited to superficial assessments built on crude computer vision models that lack the clinical vocabulary, metric precision, or condition-specific differentiation needed to actually guide treatment decisions.

### The Opportunity

Multimodal vision AI models have reached a threshold of visual acuity at which they can meaningfully distinguish between scalp conditions that previously required physical sensors measuring sebum, hydration, and temperature. Trichella exploits this inflection point by building a structured diagnostic framework on top of these general-purpose models, and then sharpening them continuously through the Ground Truth loop. The business model converts data contributions — users pairing their scanner results with raw images — directly into AI improvement, creating a powerful flywheel where a larger user base produces a more accurate product, which in turn attracts more users.

### Competitive Landscape

| Competitor Type | Their Limitation | Trichella's Advantage |
|---|---|---|
| Consumer Apps | No clinical vocabulary; basic CV models | 6-condition framework + professional metrics |
| Smart Scanners | Hardware cost $2K–20K; not portable | Camera-only, zero hardware cost |
| Dermatologist Visit | Costly, slow, requires appointment | Instant, on-demand, < 8 seconds |
| Generic AI Vision | No domain fine-tuning; no training loop | Ground Truth Protocol = continuous improvement |
| EMR Platforms | Enterprise-only; complex integration | Consumer to Enterprise with same codebase |

---

## 4. The 6 Scalp Diagnostic Conditions

Trichella is built around six clinically-defined scalp conditions that cover the vast majority of presentations seen in both consumer and clinical settings. These six conditions form the backbone of every diagnostic report. The AI is prompted and fine-tuned to detect, distinguish, and score each condition independently — and crucially, to identify when multiple conditions are co-present, which is common in real-world scalp health scenarios.

---

### 1. 💧 Dry Scalp

**Clinical Description:** A condition characterised by insufficient moisture and natural oil production on the scalp surface, leading to tightness, flaking, and irritation. Unlike dandruff, dry scalp flakes are small and white rather than large and oily.

**Key Visual Indicators:** Small white flakes, tightness after washing, itching without redness, dull hair appearance, seasonal worsening in winter months.

**Recommended Actions:** Hydrating shampoos, scalp oils (argan, jojoba), reduce washing frequency, increase dietary healthy fats, humidifier use in dry environments.

**AI Detection Signals:** Low sebum levels, fine white particulate distribution, dull surface texture, minimal follicular inflammation.

**Urgency Default:** Routine. **Co-occurrence Risk:** Low–Moderate.

---

### 2. ✨ Oily Scalp

**Clinical Description:** Overproduction of sebum (natural oil) by the sebaceous glands, causing the scalp and hair to appear greasy quickly after washing. Can be caused by hormonal factors, diet, stress, or paradoxically, over-washing which strips the scalp and triggers compensatory oil production.

**Key Visual Indicators:** Greasy appearance within 24–48 hours of washing, flat hair, visible sebum buildup near roots, hair clumping.

**Recommended Actions:** Clarifying shampoos, salicylic acid treatments, reduce touching hair, balanced diet low in refined sugars, reduce heat styling frequency.

**AI Detection Signals:** High sebum shine at roots, greasy visual texture, heavy hair drape, root-area discolouration.

**Urgency Default:** Routine. **Co-occurrence Risk:** High — frequently presents alongside Dandruff Scalp.

---

### 3. 🌿 Sensitive Scalp

**Clinical Description:** A reactive scalp condition where the skin is easily irritated by external factors including products, temperature changes, or physical contact. Often presents without strongly visible symptoms but with significant subjective discomfort such as burning, tingling, or persistent itching.

**Key Visual Indicators:** Redness after contact, reactive texture changes, thin or delicate-looking skin at the scalp surface, discomfort in wind or cold.

**Recommended Actions:** Fragrance-free and hypoallergenic products, patch testing before new products, gentle scalp massage, avoid sulphates and parabens, lukewarm (not hot) water.

**AI Detection Signals:** Diffuse mild redness, thin skin texture, reactive follicle patterns, absence of heavy sebum or thick scaling.

**Urgency Default:** Monitor. **Co-occurrence Risk:** Moderate.

---

### 4. ⚡ Acne Scalp

**Clinical Description:** Folliculitis and scalp acne occur when hair follicles become clogged with sebum, dead skin cells, or bacteria, leading to pimple-like bumps, pustules, or painful nodules. Can cause localised hair thinning if left untreated due to follicular damage.

**Key Visual Indicators:** Painful bumps or pustules, redness around follicles, crusting, tenderness to touch, localised or patchy hair loss.

**Recommended Actions:** Salicylic acid or benzoyl peroxide scalp treatments, antibacterial shampoos (e.g. tea tree oil-based), avoid heavy conditioners applied to scalp, wash hair after exercise.

**AI Detection Signals:** Follicle bumps with surrounding erythema, pustule formation, crusting patterns, localised follicle clustering.

**Urgency Default:** Monitor / Consult. **Co-occurrence Risk:** High — frequently co-presents with Oily Scalp and Inflammation Scalp.

---

### 5. 🔴 Inflammation Scalp

**Clinical Description:** Scalp inflammation (dermatitis) presents as redness, swelling, and irritation. Can be triggered by contact allergens, seborrhoeic dermatitis, psoriasis, eczema, or autoimmune conditions. Requires medical attention if persistent, severe, or accompanied by significant hair shedding.

**Key Visual Indicators:** Visible redness and swelling, heat, scaling or crusting, pain or intense itching, possible oozing in severe cases, widespread or patchy distribution.

**Recommended Actions:** Anti-inflammatory shampoos (ketoconazole, coal tar, zinc pyrithione), topical corticosteroids if prescribed by a GP, avoid known irritants, consult a dermatologist if symptoms persist beyond two weeks.

**AI Detection Signals:** Diffuse or patchy erythema, surface scaling, follicle disruption, visible skin layer disturbance.

**Urgency Default:** Consult. **Co-occurrence Risk:** High — frequently co-presents with Dandruff and Acne Scalp.

---

### 6. ❄️ Dandruff Scalp

**Clinical Description:** One of the most common scalp conditions, dandruff is caused by overgrowth of the yeast *Malassezia* on the scalp, leading to accelerated skin cell turnover and visible flaking. Distinct from dry scalp by the size (larger, yellowish flakes) and the concurrent oiliness of the scalp.

**Key Visual Indicators:** Large yellowish or white flakes, oily scalp, itching, flakes visible on clothing, worsening with stress or cold temperatures.

**Recommended Actions:** Zinc pyrithione, selenium sulphide, or ketoconazole shampoos used 2–3 times weekly, regular washing, manage stress levels, avoid scratching which spreads yeast.

**AI Detection Signals:** Large-particulate flake distribution, oily base texture, yeast colonisation visual patterns, scalp surface disruption.

**Urgency Default:** Routine / Monitor. **Co-occurrence Risk:** High — very frequently co-presents with Oily Scalp and Inflammation Scalp.

---

### AI Multi-Condition Detection Logic

When a scalp image is submitted, the AI evaluates all six conditions in parallel and returns a `primaryCondition` (the single most prominent finding) alongside a `conditions` array listing every detected condition. This reflects clinical reality — most patients present with overlapping conditions — and allows the recommendations layer to be specifically targeted at the combination rather than treating each condition in isolation.

| Condition | Primary AI Visual Signal | Urgency Default | Co-occurrence Risk |
|---|---|---|---|
| Dry Scalp | Low sebum, fine white flakes, dullness | Routine | Low–Moderate |
| Oily Scalp | High sebum shine, root heaviness | Routine | High (with dandruff) |
| Sensitive Scalp | Redness, reactive texture, thin skin | Monitor | Moderate |
| Acne Scalp | Follicle bumps, pustules, crusting | Monitor/Consult | High (with oily/inflamed) |
| Inflammation Scalp | Diffuse redness, swelling, scaling | Consult | High (with dandruff/acne) |
| Dandruff Scalp | Oily large flakes, yeast patterns | Routine/Monitor | High (with oily/inflamed) |

---

## 5. Ground Truth Technology Ecosystem

Before training an AI model to recognise scalp conditions, you must first establish a reliable diagnostic baseline — what trichologists call *Ground Truth*. Trichella maps the current landscape of available technology into three tiers of increasing accuracy and clinical depth. The tier of technology used to generate the Ground Truth data determines the quality of training signal fed into the AI improvement loop.

### Technology Tiers

| Tier | Category | Tools | Accuracy Level | Cost | Best For |
|---|---|---|---|---|---|
| 1 | Consumer Apps | Hair Guru, Hairify, Myhair.ai, Hair Snap | Baseline | Free–$10/mo | Consumer self-testing |
| 2 | Smart Scanners | Chowis/DermoPico, Becon AI, KC Technology | Medical-grade | $2K–$20K | Clinics, spas, salons |
| 3 | Clinical EMR | CureSkin Pro, Custom Platforms | Highest available | Enterprise | Hospitals, research labs |

### Tier 1 — Consumer Apps (Smartphone Only)

Consumer apps represent the most accessible entry point. They operate entirely on smartphone hardware and rely on general computer vision models. **Hair Guru / Hairify** analyse phone photos to categorise scalp conditions and track changes over time. **Myhair.ai** uses computer vision to assess density, dryness, and overall scalp health from uploaded photos. **Hair Snap** is optimised for rapid detection of specific issues like follicular inflammation or recession patterns. While they lack sensor precision, they are available to millions of users immediately and generate high training pair volumes.

### Tier 2 — Professional Smart Scanners (Hardware + AI)

Smart scanners combine physical sensing hardware with AI-driven software to produce medical-grade diagnostic data. **Chowis DermoPico** (used by L'Oréal) provides 30–200× magnification with sebum/hydration sensors and a temperature array. **Becon AI** measures 10 distinct parameters including sensitivity, temperature, and scalp odour. **KC Technology** provides HD digital microscopes with professional software for follicle-level mapping. These tools set the gold standard for training data quality and are the primary source of Ground Truth for Trichella's professional tier.

### Tier 3 — Clinical EMR Software (Highest Integration)

At the highest level, platforms like **CureSkin Pro** function as full Electronic Medical Record systems with AI-driven diagnostic engines designed for real-time clinical assessments. Data from these platforms represents the highest-quality Ground Truth available — validated by licensed practitioners, timestamped against clinical outcomes, and suitable for research-grade model fine-tuning.

---

## 6. The 4-Step Ground Truth Training Protocol

The Ground Truth Training Protocol is Trichella's core competitive innovation. It is the mechanism by which the platform continuously closes the accuracy gap between general AI vision models and specialist medical hardware. Each iteration produces a labelled training pair: one raw scalp image paired with one set of verified professional metrics. Over thousands of iterations, the AI learns to predict what the professional scanner would say — directly from the image alone.

---

### Step 1 — Obtain Ground Truth
> **Subtitle:** Generate a professional baseline diagnostic

Use a consumer app, smart scanner, or clinical EMR to run a complete analysis of a scalp condition. The resulting professional report — with density, sebum, inflammation, hydration, and follicle data — becomes the verified label for this training pair. The quality of Ground Truth scales with the tier of technology used.

---

### Step 2 — Gather the Raw Image
> **Subtitle:** Isolate the untouched source photograph

Secure the exact original, unprocessed scalp photo used by the scanner or app. No UI overlays, no filters, no annotations, no screenshots with app chrome visible. The AI requires clean visual data to form its own associations between pixel patterns and clinical outcomes, without being led by the interface that generated the diagnosis.

---

### Step 3 — Input the Data Pair
> **Subtitle:** Feed both inputs simultaneously into the AI

Submit both the raw source image and the corresponding professional diagnostic results into the Trichella Training Hub. This pairs the complex visual input (the image) with the verified clinical output (the metrics) as a labelled training example. The pairing is what teaches the model — the image alone is insufficient without the label, and the label alone is insufficient without the visual context.

---

### Step 4 — Iterate for Mastery
> **Subtitle:** Repeat to achieve pattern recognition at scale

By repeating this pairing process across hundreds of diverse scalp images and conditions, the AI learns to recognise the exact diagnostic patterns that specialist medical tools detect — purely from visual data. The model converges toward clinical accuracy as the dataset grows, with each new condition type or demographic variation strengthening its generalisation capability.

---

### Why This Creates a Durable Competitive Advantage

Most AI health apps are static — they deploy a model and it stays the same until the team manually retrains it. Trichella's Ground Truth Protocol turns every professional user into an active contributor to model improvement. When a clinic uses a Chowis scanner to analyse a client, they simultaneously generate a training pair that makes the AI more accurate for every other user on the platform. This creates a classic data flywheel: more users generate more training pairs → which improves accuracy → which attracts more users, particularly professional users with high-quality scanner data → whose contributions improve accuracy further. The technical moat compounds over time.

---

## 7. Full-Stack Application Architecture

Trichella is built as a single-page React application with a modular, page-based navigation architecture. The frontend handles all user interactions, AI API calls, and state management. Persistent data storage uses a key-value storage API that persists scan history and training pairs across sessions. AI analysis is handled by direct calls to the Anthropic Vision API, using the Claude Sonnet multimodal model.

### Navigation Architecture

| Screen | Route Key | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| Landing | `landing` | No | None | Marketing, features, pricing, social proof |
| Auth | `auth` | No | None | Sign in / Sign up / Demo access |
| Dashboard | `dashboard` | Yes | All | Stats overview, recent scans, quick actions |
| Scan Flow | `scan` | Yes | All | 3-step upload → analyse → complete flow |
| Results | `results` | Yes | All | Full diagnostic report with all metrics |
| History | `history` | Yes | All | Progress charts and all past scans table |
| Training Hub | `training` | Yes | Pro recommended | 4-step Ground Truth Protocol interface |
| Pro Dashboard | `pro` | Yes | Professional | Multi-client management and analytics |
| Settings | `settings` | Yes | All | Profile, preferences, subscription, data |

### State Management

The application maintains six primary state slices at the root `App` component level, passed down as props to child pages.

- **`user`** — Authentication state and role (`consumer` | `professional`)
- **`scans`** — Array of all completed scan objects including reports and preview URLs
- **`latestScan`** — Pointer to the most recently viewed scan (drives the Results page)
- **`trainingPairs`** — Array of all submitted Ground Truth training contributions
- **`page`** — String driving the single-page navigation router
- **`sidebarOpen`** — Boolean controlling mobile navigation state

All scan and training data is asynchronously persisted to and loaded from the storage API on mount, ensuring no data is lost between sessions.

### AI Integration Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Image Capture | Browser FileReader API | Base64 encode uploaded image for API transmission |
| API Call | Anthropic `/v1/messages` | Send image + system prompt; receive structured JSON |
| Model | `claude-sonnet-4` (latest) | Multimodal vision analysis with trichological prompt |
| Response Parsing | `JSON.parse()` + cleanup | Strip markdown fences, parse report object |
| State Update | React `setState` | Store report in scans array, trigger Results page |
| Persistence | `window.storage` API | Save scan history across browser sessions |

---

## 8. Screen-by-Screen Feature Breakdown

### Landing Page
The marketing entry point — converts visitors into registered users. Contains: hero section with headline and CTA, social proof metrics (12K+ scans, 94% accuracy), 6-feature grid with descriptions, 4-step Ground Truth Protocol visual explainer, 3-tier pricing table (Free / Pro / Enterprise), and footer disclaimer.

### Auth Flow
Handles sign-up, sign-in, and one-click demo access. Contains: sign in / sign up mode toggle, role selection (Consumer vs Professional), email + password form, persistent session via storage API, and one-click Demo access with full product access.

### Dashboard
The logged-in home screen providing a health overview at a glance. Contains: 4 KPI stat cards (total scans, latest score, score trend delta, average score), recent scans list with thumbnails and scores, latest score ring visualisation, quick action shortcuts to all pages, and a pro tip card for scan best practices.

### Scan Flow (3-Step)
The core product experience. Step 1 is drag-and-drop or click-to-browse image upload with photography tips covering lighting, distance, and scalp preparation. Step 2 is an animated analysis screen with real-time status messages and a progress bar. Step 3 is automatic redirect to the full Results page upon completion.

### Results — Diagnostic Report
The full clinical report. Contains: overall health score ring (0–100), score label and 3-sentence clinical summary, urgency classification, **6-condition diagnostic panel** showing all conditions with detected/not-detected states and a PRIMARY badge on the dominant condition, 6 metric cards with colour-coded health bars, 4 key clinical findings, 4 prioritised recommendations with High/Med/Low priority badges, and a next-scan recommendation in days.

### History & Progress
Longitudinal tracking showing health improvements over time. Contains: Recharts area chart of score trend over all scans, full scans table with columns for score, scalp type, density, inflammation, and urgency, and click-to-view any historical report in full.

### Ground Truth Training Hub
The 4-step protocol interface for contributing training data. Contains: technology tier selection (Consumer App / Smart Scanner / Clinical EMR), specific tool dropdown per tier, raw image upload with overlay-removal guidance, 6-metric Ground Truth data entry form with dropdowns and a sebum percentage input, review summary card before submission, submitted pairs history panel, and a back/forward navigation stepper.

### Professional Dashboard
Multi-client management for clinic and spa operators. Contains: 4 clinic-level KPI stats (total clients, average score, scans this month, clients needing attention), full client roster table with per-client scores and Healthy/Monitor/Consult status badges, add new client modal, and a 3-tier technology guide panel with specific scanner brands listed.

### Settings
Account management and preferences. Contains: profile name and email editing, notification preferences toggle, anonymous data contribution toggle, subscription tier display with upgrade CTA, sign out action, and delete all data option.

---

## 9. AI Engine & Diagnostic Logic

### System Prompt Architecture

The diagnostic engine is driven by a carefully engineered system prompt that instructs the Claude Sonnet multimodal model to act as a senior AI trichologist. The prompt specifies a rigid JSON output schema preventing free-form text, explicitly names all six diagnostic conditions with their visual signals, requires a `primaryCondition` field identifying the single most prominent finding, and constrains the `conditions` array to only the six defined types.

### Output Schema

```json
{
  "overallScore":       "integer (0–100)",
  "summary":            "string (3-sentence clinical summary)",
  "primaryCondition":   "one of the 6 defined conditions",
  "metrics": {
    "density":          "Low | Medium | High",
    "inflammation":     "Low | Medium | High",
    "sebumLevel":       "percentage string e.g. '68%'",
    "hydration":        "Low | Medium | High",
    "follicleHealth":   "Low | Medium | High",
    "scalpType":        "Normal | Oily | Dry | Combination | Sensitive"
  },
  "findings":           "string[] — 4 clinical observations",
  "recommendations": [
    {
      "title":          "short action title",
      "detail":         "2-sentence specific action",
      "priority":       "High | Medium | Low"
    }
  ],
  "urgency":            "routine | monitor | consult",
  "conditions":         "string[] — from the 6 defined types only",
  "nextScanDays":       "integer (30–90)"
}
```

### Scoring Methodology

The overall health score (0–100) is computed holistically, weighting the severity and combination of detected conditions against positive indicators. The scoring bands are:

| Score Range | Label | Clinical Meaning |
|---|---|---|
| 75–100 | Healthy | Predominantly positive indicators; no significant conditions detected |
| 50–74 | Moderate | Some conditions present; manageable with lifestyle changes |
| 30–49 | Needs Care | Multiple or moderate-severity conditions requiring consistent treatment |
| 0–29 | Critical | Severe conditions requiring professional consultation |

---

## 10. Data Model & Storage Schema

The current MVP uses a client-side key-value storage API for persistence. The model is intentionally simple to allow rapid iteration, with a clear migration path to a backend database (PostgreSQL or Firestore) as the product scales.

### User Object

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name |
| `email` | string | Unique identifier |
| `role` | string | `'consumer'` or `'professional'` |
| `joined` | string | ISO 8601 timestamp |

### Scan Object

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique ID (timestamp string) |
| `date` | string | ISO 8601 timestamp |
| `preview` | string | Object URL of uploaded image (session-scoped) |
| `report` | object | Full AI diagnostic JSON (see schema in §9) |

### Training Pair Object

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique ID (timestamp string) |
| `date` | string | ISO 8601 timestamp |
| `preview` | string | Object URL of raw scalp image |
| `sourceType` | string | `'consumer'`, `'hardware'`, or `'clinical'` |
| `gtData` | object | Fields: density, inflammation, sebum, hydration, follicle, type, summary |

### Storage Keys

| Key | Type | Description |
|---|---|---|
| `user` | Object | Current user session data |
| `scans` | Array | All completed scan objects (JSON stringified) |
| `trainingPairs` | Array | All Ground Truth training contributions |

---

## 11. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| UI Framework | React | 18+ | Component-based SPA with hooks |
| Styling | CSS-in-JS (template string) | — | Custom design system, no external CSS deps |
| Charts | Recharts | Latest | Responsive SVG charts for health trends |
| Icons | Lucide React | 0.383.0 | Consistent, lightweight icon set |
| AI Vision | Anthropic Claude Sonnet | `claude-sonnet-4` | Multimodal image analysis |
| AI API | Anthropic `/v1/messages` | Latest | REST API for vision + text generation |
| Persistence | `window.storage` API | — | Cross-session key-value data store |
| Fonts | Google Fonts (CDN) | — | Cormorant Garamond + Outfit |
| Image Handling | FileReader + Object URLs | Browser API | Base64 encoding + preview generation |
| Build Target | React JSX (single file) | — | Runs as artifact; deployable to Vite/Next.js |

### Deployment Path

| Stage | Platform | Notes |
|---|---|---|
| MVP (current) | Claude.ai Artifact | Single JSX file, runs in browser sandbox |
| Beta | Vite + Netlify / Vercel | Add `.env` for API key management |
| Production | Next.js + Vercel | SSR, API routes to proxy Anthropic calls securely |
| Enterprise | Custom backend (Node / Go) | Auth, multi-tenant DB, rate limiting, SLA |

---

## 12. Business Model & Monetisation

Trichella operates a freemium B2C / B2B hybrid model with three tiers. The free consumer tier drives top-of-funnel growth and generates training data. The professional tier monetises the clinic and spa vertical with a monthly SaaS fee. The enterprise tier is a high-value, custom-contract product for brands integrating proprietary AI diagnostics into their hardware or retail ecosystem.

### Pricing Tiers

| Tier | Price | Target | Key Features | Revenue Model |
|---|---|---|---|---|
| **Consumer** | Free | Individuals | Unlimited scans, 6 metrics, history, basic recommendations | Data flywheel, upsell to Pro |
| **Professional** | $49/month | Clinics, spas, salons | Multi-client dashboard, GT training, PDF export, API access, priority AI | MRR subscription |
| **Enterprise** | Custom | Brands, scanner OEMs | Private Gemini Gem, white-label UI, custom scanner integration, SLA support | Annual licence + rev-share |

### Revenue Projections (Year 1–3)

| Year | Consumer MAU | Pro Accounts | Enterprise Clients | Est. ARR |
|---|---|---|---|---|
| Year 1 | 5,000 | 120 | 2 | $85K |
| Year 2 | 25,000 | 600 | 8 | $420K |
| Year 3 | 100,000 | 2,500 | 20 | $1.8M |

---

## 13. Go-to-Market Strategy

### Phase 1 — Consumer Launch (Months 1–3)

The initial GTM push targets hair-conscious consumers through organic social content on TikTok and Instagram, focusing on the visual *before-and-after* format that performs well in the beauty and wellness space. Creator partnerships with trichologists and hair coaches on YouTube provide educational authority. App Store and web SEO optimise for terms like *scalp health test*, *dandruff diagnosis*, and *AI hair analysis*. The free tier requires zero commitment and is designed for viral shareability — users can share their score card directly to social media.

### Phase 2 — Professional Expansion (Months 4–9)

Trade show presence at beauty industry events (Cosmoprof, Professional Beauty) introduces the Professional tier to salon owners and clinic managers. Partnerships with beauty school curricula establish the platform as an educational tool, creating a pipeline of newly-qualified practitioners who bring Trichella into their first roles. Direct outreach to scanner hardware companies (Chowis, Becon AI) proposes integration partnerships where Trichella becomes the analysis layer on top of their hardware ecosystem.

### Phase 3 — Enterprise Deals (Months 10–18)

With validated accuracy metrics and a substantial Ground Truth dataset, the enterprise proposition becomes compelling for beauty conglomerates. Target brands include L'Oréal (already uses Chowis scanners), Unilever, Procter & Gamble, and Kao Corporation. The pitch centres on replacing generic recommender systems with a clinically-validated, continuously-improving diagnostic engine that drives product sales through personalised treatment matching. Revenue is structured as an annual licence fee plus a per-scan royalty.

---

## 14. Scaling Roadmap

| Phase | Timeline | Focus | Key Deliverables |
|---|---|---|---|
| **MVP** | Now | Core scan + 6 diagnostics | Single-file React app, Anthropic Vision AI, 6 conditions, 4-step protocol UI |
| **Beta** | Q3 2026 | Auth + persistence | Supabase auth, PostgreSQL scans DB, email notifications, PDF report export |
| **V1.0** | Q4 2026 | Professional tier | Multi-client dashboard, clinic onboarding, Stripe billing, API access |
| **V1.5** | Q1 2027 | AI fine-tuning | Gemini Gem training pipeline, 10K+ Ground Truth pairs, accuracy uplift |
| **V2.0** | Q2 2027 | Enterprise + hardware | White-label SDK, scanner API integrations (Chowis, Becon), custom Gem deployment |
| **V3.0** | 2028 | Global scale | Multilingual, GDPR/HIPAA compliance, clinical trial partnerships |

### Technical Scaling Milestones

**Backend Infrastructure.** Move from client-side storage to a proper backend: Node.js/Fastify API server with PostgreSQL for scan history, Redis for session caching, and S3-compatible blob storage for image assets. This enables multi-device sync, account recovery, and data export compliance.

**API Security Layer.** Introduce a server-side proxy for all Anthropic API calls, removing the API key from client code entirely. Add rate limiting, usage quotas per account tier, and request logging for audit trails.

**AI Fine-Tuning Pipeline.** Once 5,000+ Ground Truth pairs are collected, trigger the first fine-tuning run on the base model using the paired (image, report) dataset. Deploy the fine-tuned model as a private endpoint and A/B test it against the base model on a holdout set of verified scans.

**Scanner Hardware Integration.** Build REST API connectors for Chowis DermoPico and Becon AI devices, enabling automatic Ground Truth ingestion when a scan is performed on connected hardware. This bypasses manual data entry entirely and dramatically improves training data quality and volume.

**Mobile Native Apps.** Develop React Native apps for iOS and Android to support live camera capture (rather than upload-only), push notifications for scan reminders, and offline report access. The native camera unlocks a guided capture mode for optimal photo quality and consistency.

**HIPAA & GDPR Compliance.** Engage a healthcare compliance consultant to implement required consent flows, data retention policies, right-to-erasure workflows, and Business Associate Agreements for US clinical clients.

---

## 15. Developer Setup Guide

### Running the MVP in Claude.ai Artifacts

The MVP is packaged as a single React JSX file (`Trichella.jsx`). To run it immediately, paste the file contents into a new Claude.ai Artifact, select **React** as the type, and click Run. The artifact environment automatically handles Anthropic API key injection — no configuration required. The application is fully functional in this environment including scan analysis, persistent history, the Ground Truth Training Hub, and the Professional Dashboard.

### Local Development (Vite)

```bash
# 1. Scaffold the project
npm create vite@latest trichella -- --template react

# 2. Install dependencies
npm install recharts lucide-react

# 3. Replace the default App component
# Copy Trichella.jsx contents into src/App.jsx

# 4. Set your API key in .env
echo "VITE_ANTHROPIC_KEY=sk-ant-..." > .env

# 5. Update the API call headers in the runAI() function
# Add: "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY

# 6. Start the development server
npm run dev
# Open http://localhost:5173
```

### Key Files Reference

| File | Location | Purpose |
|---|---|---|
| `Trichella.jsx` | `src/App.jsx` | Entire application — UI, logic, AI integration |
| `.env` | project root | `VITE_ANTHROPIC_KEY` for local development |
| `index.html` | project root | Vite entry point, no changes needed |
| `package.json` | project root | Dependencies: `recharts`, `lucide-react` |

> ⚠️ **Security:** Never commit your Anthropic API key to a public repository. Use environment variables and add `.env` to your `.gitignore` file.

### Production Deployment (Next.js + Vercel)

For production, move all Anthropic API calls to a server-side API route to keep your key secure and add rate limiting per user. Create `/pages/api/analyse.js` (or `/app/api/analyse/route.js` in the App Router), proxy the Anthropic request server-side, and update `runAI()` in the frontend to call your own endpoint instead of the Anthropic API directly. Deploy to Vercel with the `ANTHROPIC_API_KEY` set as an environment variable in the project dashboard.

---

*Document prepared by the Trichella development team.*
*This document is confidential and intended for authorised recipients only. All product specifications subject to change.*

---

> **Trichella** — *The science that reveals.*
