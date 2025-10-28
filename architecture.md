# InterviewLab — Full Architecture (Next.js + Supabase) — **New Entry System Integrated**

> **Scope:** This replaces/updates the previous `architecture.md` to include the **Complimentary Assessment Funnel** (“New Entry System”) while preserving the premium **Full Professional Simulation** flow. Any conflicting/obsolete parts of the older architecture are called out under **Deprecations & Replacements**.

---

## Executive Summary

InterviewLab now has **three complementary flows** within a unified system:

1. **Zero-Friction Preview Widget (New)** — a 1-question, no-auth experience embedded directly on the landing page to demonstrate the product's value in 60 seconds or less. Client-side only, no database interaction.
2. **Complimentary Assessment Funnel (Free, no credit card)** — the default entry path for new users landing from social traffic. Delivers a believable 3‑question demo with **Q1 voice playback only**, hides transcript, and shows a **partial** results card that nudges users to **Access the Full Professional Simulation**.
3. **Full Professional Simulation (Premium)** — the existing multi‑stage, fully adaptive interview with voice input/output and a comprehensive report, gated by **time‑based access passes** (Stripe + entitlements).

All three flows share the same backend (Next.js server actions), Supabase (Auth/DB/Storage), and AI providers (OpenAI LLM, Whisper STT, TTS provider). The Preview Widget operates entirely client-side for maximum speed and zero friction.

---

## Preview Widget Flow — Zero-Friction Entry Point

### Purpose

Convert skeptical, low-intent traffic from social media (TikTok, IG) with zero commitment and sub-30s time-to-value.

### User Journey

```
Landing Page
   ↓
[1-Question Preview Widget — No Auth]
   ↓
Get Instant Feedback → CTA to Full Assessment
   ↓
[Signup / Auth] → 3Q Setup Form (role prefilled)
   ↓
Complimentary Assessment (3 Questions)
   ↓
Results (1 Metric) → Premium CTA
```

### Widget UI Components

- **Role Selector:** Dropdown with 6 roles (Engineer, PM, Marketing, Analyst, Sales, UX)
- **Question Display:** Pre-written, realistic behavioral question
- **Answer Input:** Textarea with 200 char min, live counter
- **Instant Feedback Engine:** Client-only JS logic for STAR format, specificity, quantification
- **Feedback Display:** 3–5 points with ✅, ❌, 💡 icons
- **CTA:** "Get Your Full 3-Question Assessment"

### Technical Details

- **All logic is client-side** (no API/LLM calls, no database)
- Uses static question set (6 total, one per role)
- sessionStorage carries role + answer forward to assessment setup
- Metrics tracked via `lib/analytics.ts`
- Widget loads in <3s, interactive immediately

### Mobile UX Requirements

- Widget must be full-width on mobile
- Text inputs: 44px tap targets
- Sticky CTA after feedback shown
- Hero copy reduced 30–40% for mobile
- Must be interactive within 3 seconds

### Component Files

- `components/landing/QuickTryWidget.tsx` — Main widget component
- `lib/preview-feedback.ts` — Client-side heuristics for STAR, specificity, quantification
- `app/(marketing)/page.tsx` — Landing page with embedded widget

### Analytics Events for Preview Widget

Track these events:

- `preview_widget_load`
- `preview_role_selected`
- `preview_answer_typed` (>200 chars)
- `preview_submit_clicked`
- `preview_feedback_shown`
- `preview_cta_clicked` (to full assessment)
- `preview_signup_completed`

---

## Brand, UX & Visual System (Global)

- **Background:** Soft gradient (light blue → cyan) reused across Landing, Pre‑Assessment, Assessment, and Results.
- **Palette:** Logo gradient tokens for primary CTAs; white cards, 2xl rounded, soft shadow.
- **Typography:** Inter/SF; headings medium; high‑legibility body.
- **Motion:** Subtle 300–400ms fades; progress ring fills; no “gamey” effects.
- **Tone:** Executive, calm, credible. “Access the full professional simulation” (avoid “buy/upgrade” language).
- **Accessibility:** WCAG AA; keyboard navigable; captions/transcripts for TTS; mobile‑first.
- **Performance:** First interaction < 10s. Q1 audio only when user initiates (autoplay rules).

---

## High‑Level Architecture

```
[Browser/Next.js UI]
   |
   |---> [Preview Widget: Client-only, no backend]
   |        (Static questions, JS feedback, sessionStorage)
   |
   |  (Supabase Auth; device fingerprint; Turnstile)
   v
[Next.js Route Handlers / Server Actions]
   |---> Supabase (Auth, Postgres, Storage, RLS)
   |---> OpenAI (LLM, Whisper STT)
   |---> TTS (OpenAI/ElevenLabs)  [Q1 playback in free funnel]
   '--- Stripe (Checkout, Webhooks) [Premium]
```

- **Preview Widget:** Entirely client-side, no API calls, no database. Uses static questions and heuristic feedback.
- **Security:** All sensitive operations happen server‑side behind RLS; device fingerprint & bot‑check verified server‑side.
- **State:** UI state is ephemeral; session/turn/result stored in Postgres; files in Supabase Storage with presigned URLs.

---

## File & Folder Structure (Monorepo Top‑Level)

```
/ (repo root)
├─ app/
│  ├─ (marketing)/
│  │  └─ page.tsx                         # Landing — CTA starts Complimentary Assessment
│  ├─ assessment/                         # NEW: Complimentary Assessment Funnel
│  │  ├─ setup/
│  │  │  ├─ page.tsx                      # Pre‑Assessment (3‑question preview briefing)
│  │  │  └─ actions.ts                    # initFreeSession(), verifyTurnstile(), bindDevice()
│  │  ├─ run/
│  │  │  ├─ [sessionId]/
│  │  │  │  ├─ page.tsx                   # One‑question‑at‑a‑time runner (no history)
│  │  │  │  └─ actions.ts                 # askFree(), submitFree(), synthesizeQ1TTS()
│  │  ├─ results/
│  │  │  ├─ [sessionId]/
│  │  │  │  └─ page.tsx                   # Partial results + locked metrics + CTA→/pricing
│  │  └─ layout.tsx                       # Gradient background, providers
│  ├─ pricing/
│  │  └─ page.tsx                         # Plans & benefits. CTA→ Stripe session create
│  ├─ setup/
│  │  ├─ page.tsx                         # PREMIUM: intake for full simulation (kept)
│  │  └─ actions.ts                       # startPremiumSession(), presigned uploads, research
│  ├─ interview/
│  │  ├─ [sessionId]/
│  │  │  ├─ page.tsx                      # PREMIUM: chat/voice interface
│  │  │  └─ actions.ts                    # startInterview(), submitAnswer(), replayQuestion()
│  ├─ report/
│  │  ├─ [sessionId]/
│  │  │  └─ page.tsx                      # PREMIUM: full scored feedback
│  ├─ api/
│  │  ├─ tts/route.ts                     # synthesize TTS (Q1 in free; full in premium)
│  │  ├─ transcribe/route.ts              # POST Whisper STT (premium only; disabled for free)
│  │  ├─ stripe-webhook/route.ts          # Entitlement updates
│  │  └─ turnstile-verify/route.ts        # Server verification for bot‑protection
│  ├─ layout.tsx
│  └─ middleware.ts                       # Optional: device detection, UTM capture
│
├─ components/
│  ├─ landing/
│  │  └─ QuickTryWidget.tsx               # NEW: Preview widget (client-only, no auth)
│  ├─ marketing/
│  │  ├─ Hero.tsx                         # Headline + sub + CTA
│  │  └─ MicroIdentity.tsx                # Inline "What should we call you?" prompt
│  ├─ assessment/
│  │  ├─ PreparingOverlay.tsx             # 2s “preparing environment…” overlay
│  │  ├─ ProgressStrip.tsx                # “Warm‑Up • Q x of 3” + progress ring
│  │  ├─ QuestionStage.tsx                # Single active question view
│  │  ├─ AnswerComposerText.tsx           # Text input only (free trial)
│  │  ├─ VoicePlayback.tsx                # Q1 playback only (guards tier)
│  │  ├─ BridgeLine.tsx                   # Human‑like transition line between Qs
│  │  ├─ ResultCardPartial.tsx            # Shows one metric; locks others
│  │  └─ TrialPolicyNote.tsx              # “1 assessment / 7 days” copy
│  ├─ premium/
│  │  ├─ ChatThread.tsx
│  │  ├─ QuestionBubble.tsx
│  │  ├─ AnswerComposer.tsx               # Text + mic recording (premium)
│  │  ├─ TimerRing.tsx
│  │  └─ ReplayButton.tsx
│  ├─ paywall/
│  │  ├─ Paywall.tsx                      # Reusable gating component
│  │  └─ PerkDisplay.tsx                  # Benefit matrix for plans
│  ├─ ui/…                                # shadcn/ui wrappers
│  └─ analytics/
│     └─ Track.tsx                        # Simple event helper
│
├─ lib/
│  ├─ supabase-client.ts                  # Browser supabase client (no service key)
│  ├─ supabase-server.ts                  # Server supabase client (RLS‑safe ops)
│  ├─ openai.ts                           # LLM, STT, TTS helpers
│  ├─ storage.ts                          # Presigned URLs for Storage
│  ├─ entitlements.ts                     # Time‑pass gating (premium)
│  ├─ research.ts                         # PREMIUM: company/role snapshot
│  ├─ interview.ts                        # PREMIUM: adaptive state machine
│  ├─ assessment.ts                       # NEW: 3Q free runner (no context memory)
│  ├─ preview-feedback.ts                 # NEW: Client-side heuristics for widget feedback
│  ├─ scoring.ts                          # Premium rubric scoring
│  ├─ results.ts                          # Assemble partial vs full results
│  ├─ antiabuse/
│  │  ├─ device.ts                        # Hash device fingerprint (client helper + server bind)
│  │  ├─ trial.ts                         # 1 / 7 day allowance; seeded Q variability
│  │  └─ turnstile.ts                     # Verify tokens server‑side
│  ├─ variability.ts                      # Seeded randomization of warm‑up prompts
│  ├─ schema.ts                           # Types for DB rows & DTOs
│  ├─ analytics.ts                        # Event dispatcher (e.g., PostHog or custom)
│  └─ utils.ts                            # Zod schemas, guards, formatting
│
├─ db/
│  ├─ migrations/                         # SQL migrations for new/changed tables
│  └─ seed.ts                             # Seed warm‑up prompt bank
│
├─ styles/                                # Tailwind + gradient tokens
├─ public/                                # Logos, audio chimes, static assets
├─ env.d.ts                               # Typed env
├─ package.json
└─ README.md
```

---

## What Each Part Does (By Area)

### 1) Marketing Landing `app/(marketing)/page.tsx`

**Updated Landing Page Structure:**

**Section 1: Hero with Preview Widget**

- Widget loads in <3s, embedded directly on page
- Headline: "Try a Real Interview Question Now"
- Subheadline: "No signup required. Instant feedback."
- Trust tags: "10,000+ real interviews", "2,847 practiced this week"

**Section 2: Social Proof (post-widget emphasis)**

- Grid showing benefits of full assessment
- Strong CTA: **"Start My Free 3-Question Assessment →"**

**Section 3: How It Works**

- Visual timeline: Setup → 3Q Assessment → Results

**Section 4: Premium Teaser**

- Comparison: Free vs Premium features
- Time-based passes and benefits

**Section 5: Final CTA**

- Reinforce: "Ready to See How You'd Perform?"

**Preview Widget Interaction Flow:**

- User selects role (Engineer, PM, Marketing, Analyst, Sales, UX)
- Sees pre-written behavioral question specific to role
- Answers in textarea (200 char minimum)
- Gets instant client-side feedback (STAR format, specificity, quantification)
- CTA: **"Get Your Full 3-Question Assessment"** → routes to `/assessment/setup` with role prefilled

**Full Assessment CTA:**

- Shows **PreparingOverlay** for ≤2s
- Inline **MicroIdentity** prompt (first name)
- Creates/updates lightweight user record (anonymous or authed)
- Routes to `/assessment/setup`

### 2) Complimentary Assessment — **Pre‑Assessment** `app/assessment/setup`

- Frames the experience: "3 questions · Text‑only · Takes ~5 minutes".
- If user came from Preview Widget, job title is prefilled from sessionStorage
- **Server actions**:
  - `verifyTurnstile(token)` — bot protection.
  - `bindDevice(fingerprint)` — hashes device ID and links it to the user (soft limit enforcement).
  - `initFreeSession({ firstName, utm })` — creates **Session** with constraints:
    ```json
    {
      "plan_tier": "free_trial",
      "stages_planned": ["warmup"],
      "questions_limit": 3,
      "context_memory": false,
      "voice_playback": "q1_only",
      "voice_input": false
    }
    ```
- Success → `/assessment/run/[sessionId]`.

### 3) Complimentary Assessment — **Runner** `app/assessment/run/[sessionId]`

- One question on screen at a time; no prior history.
- **Q1** plays TTS via `VoicePlayback` (guarded by tier check). Answers are **text only**.
- **Q2–Q3** delivered with gentle time nudges and a short **BridgeLine** between questions.
- Each turn is saved immediately; no live transcript.
- On finish: “Analyzing your responses…” then redirect to results.

**Actions:**

- `askFree(sessionId)` — seeded prompt selection from `variability.ts`.
- `synthesizeQ1TTS(sessionId, question)` — stores audio key; enforces playback‑only for Q1.
- `submitFree(sessionId, { text })` — saves `turns` row; computes brief `answer_digest`; moves index.
- `finalizeFree(sessionId)` — computes **partial** metrics and persists `results` (see Data Model).

### 4) Complimentary Assessment — **Results** `app/assessment/results/[sessionId]`

- **ResultCardPartial** shows e.g. **Communication Clarity** 74% and locks other metrics (blur/lock icon).
- Clear CTA: **Access the Full Professional Simulation →** `/pricing`.
- Secondary: **Replay Assessment** (1 / 7 days).
- Optional email capture: “Send my full report when you upgrade.”
- Tracks events: `cta_clicked_upgrade`, `trial_replay`, etc.

### 5) Pricing `app/pricing/page.tsx`

- Highlights premium benefits: multi‑stage, voice input, adaptive context, detailed report, time‑passes.
- CTA triggers server action → Stripe Checkout → webhook updates **entitlements**.

### 6) Premium — **Setup** `app/setup`

- (Unchanged) Collects Job Title, Company, Location, CV, Job Description.
- Kicks off **research** and creates a premium **Session** (different `limits`, enables voice input).

### 7) Premium — **Interview** `app/interview/[sessionId]`

- Full adaptive state machine with voice in/out, replays, timers.
- Uses `interview.ts` (not `assessment.ts`).

### 8) Premium — **Report** `app/report/[sessionId]`

- Full rubric, dimensions, exemplars, optional PDF.

### 9) API Routes

- **`/api/tts`** — Synthesize TTS (both tiers). Free tier: only for Q1.
- **`/api/transcribe`** — Whisper STT (premium only). Free tier disabled by guard.
- **`/api/stripe-webhook`** — Entitlement updates on successful checkout.
- **`/api/turnstile-verify`** — Server verification for bot‑check.

### 10) Libraries

- `lib/preview-feedback.ts` — NEW: Client-side heuristics for Preview Widget. Checks for STAR format, specificity, quantification, answer length. No API calls, pure JavaScript logic.
- `lib/assessment.ts` — Free 3Q runner orchestration. No context memory; simple bridges; partial scoring.
- `lib/antiabuse/*` — Device hash bind, 1/7‑day allowance checks, and Turnstile verification.
- `lib/variability.ts` — Seeded randomization for warm‑up prompts.
- `lib/results.ts` — Assembles **partial** vs **full** result DTOs for the UI.

---

## Data Model (Supabase Postgres)

### Users

Supabase Auth manages identities. Optional profile extension:

```
profiles (
  id uuid pk,
  user_id uuid unique,
  first_name text,
  created_at timestamptz default now()
)
```

### Device Binding (NEW)

```
device_fingerprints (
  id uuid pk,
  user_id uuid fk → auth.uid(),
  device_hash text,             -- hashed fingerprint
  created_at timestamptz default now(),
  unique(user_id, device_hash)
)
```

> Used for gentle enforcement of the **1 complimentary assessment / 7 days** policy.

### Sessions (Updated)

```
sessions (
  id uuid pk,
  user_id uuid fk → auth.uid(),
  status text check (status in ('active','completed','expired','ready','running','feedback','intake','research')),
  plan_tier text,               -- 'free_trial' | 'premium'
  stages_planned jsonb,
  questions_limit int,
  context_memory boolean,
  voice_playback text,          -- 'q1_only' | 'all'
  voice_input boolean,          -- free=false, premium=true
  job_title text, company text, location text,  -- mostly premium
  research_snapshot jsonb,      -- premium
  created_at timestamptz default now(),
  completed_at timestamptz
)
```

### Turns (Shared)

```
turns (
  id uuid pk,
  session_id uuid fk,
  user_id uuid fk,
  index int,                            -- 0-based
  turn_type text check (turn_type in ('question','bridge')),
  question_text text,
  tts_key text,                         -- Q1 audio in free; per question in premium
  answer_text text,
  answer_audio_key text,                -- premium
  answer_digest jsonb,                  -- compact context memo
  duration_sec int,
  created_at timestamptz default now()
)
```

### Results (Updated to support partial/locked)

```
results (
  id uuid pk,
  session_id uuid fk,
  user_id uuid fk,
  communication_score int,              -- visible in free
  locked_metrics jsonb,                 -- e.g., ["confidence","structure","analytical_depth"]
  report_locked boolean default false,  -- true for free
  overall int,                          -- premium only
  dimensions jsonb,                     -- premium
  tips jsonb,                           -- premium
  exemplars jsonb,                      -- premium
  created_at timestamptz default now()
)
```

### Entitlements (Premium — unchanged)

```
entitlements (
  id uuid pk,
  user_id uuid fk → auth.uid(),
  tier text,                            -- 48h | 7d | 30d | lifetime
  expires_at timestamptz,               -- null for lifetime
  stripe_session_id text,
  created_at timestamptz default now()
)
```

### Events / Analytics (Optional but recommended)

```
events (
  id uuid pk,
  user_id uuid fk,
  session_id uuid fk,
  name text,                            -- Preview Widget: 'preview_widget_load','preview_role_selected','preview_answer_typed','preview_submit_clicked','preview_feedback_shown','preview_cta_clicked','preview_signup_completed'
                                        -- Free Assessment: 'funnel_start','assessment_started','assessment_completed','cta_clicked_upgrade','trial_replay','voice_playback_used_q1','timeout_returned'
                                        -- Premium: 'checkout_initiated','entitlement_granted','interview_started','interview_completed','report_viewed','pdf_downloaded'
  payload jsonb,
  created_at timestamptz default now()
)
```

**RLS:** All tables enforce `user_id = auth.uid()` for CRUD. Server actions use service role only for controlled writes that remain user‑scoped.

---

## Where State Lives

### Client (Ephemeral)

- **Preview Widget:** Role selection, answer text, feedback display. sessionStorage holds role + answer for carryover to full assessment.
- Micro‑identity input; short‑lived preparing overlay flag.
- Runner UI state: current question rendering, textbox value, progress ring animation.
- **No** transcript/history displayed in free tier.

### Server (Authoritative)

- **Session** constraints (tier, limits, voice flags).
- **Turns** written after every answer.
- **Results** computed server‑side (partial for free, full for premium).
- **Device binding** rows and last‑trial window to enforce 1/7 rule.
- **Entitlements** for premium access.
- **Files:** Supabase Storage (audio for Q1 in free; all audio & PDFs in premium).

---

## How Services Connect

1. **Preview Widget (Client-Only)**
   - No authentication required
   - Static question set (6 questions, one per role)
   - Client-side JS heuristics for feedback
   - sessionStorage for state carryover to full assessment
   - Analytics events tracked via `lib/analytics.ts`
   - No API calls, no database interaction

2. **Auth & Micro‑Identity**
   - Anonymous or email‑based Supabase sessions allowed.
   - First name captured as lightweight profile field and tagged to session.

3. **Bot Protection & Device Binding**
   - **Turnstile** token verified via `/api/turnstile-verify` → `lib/antiabuse/turnstile.ts`.
   - `lib/antiabuse/device.ts` hashes a client fingerprint (no PII) and binds to `user_id`.
   - `lib/antiabuse/trial.ts` checks rolling 7‑day window (per user + device).

4. **Free Runner**
   - `lib/assessment.ts` selects warm‑up prompts via `lib/variability.ts` (seeded by session).
   - `Q1` -> `api/tts` synthesizes playback; **voice input disabled**.
   - `submitFree` saves turns + digest; on index==3 computes **partial** results via `lib/results.ts`.
   - Redirect to `/assessment/results/[sessionId]`.

5. **Premium System**
   - Unchanged interview loop: voice in/out, Whisper STT, adaptive questions, full scoring via `lib/scoring.ts`.
   - **Stripe** creates time‑pass → webhook writes `entitlements` → routes gate via `lib/entitlements.ts`.

6. **Pricing Hand‑Off**
   - Results page CTA leads to `/pricing`.
   - Successful checkout returns user to premium setup/interview based on entitlement status.

---

## Deprecations & Replacements

- **Old Landing CTA ("Go to /setup") → REPLACED.**  
  The landing page now features a **Preview Widget** for instant 1-question demo, followed by CTAs to start the **Complimentary Assessment** → `/assessment/setup`. The premium `/setup` route stays available but is no longer the default entry for new users.

- **Free Trial Voice Input → REMOVED.**  
  The new free experience is **text‑only answers**, with **voice playback for Q1 only**.

- **Transcript During Free Interview → REMOVED.**  
  The free runner hides history; only one active question is visible.

- **Free Full Report → REMOVED.**  
  Free tier shows **one visible metric** and locks others; the full detailed report is premium‑only.

- **Any credit‑based trial logic → REMOVED.**  
  Free usage policy is **1 complimentary assessment / 7 days** via device+user checks.

---

## API / Server Actions (Key Signatures)

```ts
// assessment/setup/actions.ts
export async function verifyTurnstile(token: string): Promise<{ ok: boolean }>;
export async function bindDevice(fpHash: string): Promise<void>;
export async function initFreeSession(args: {
  firstName?: string;
  utm?: Record<string, string>;
}): Promise<{ sessionId: string }>;

// assessment/run/[sessionId]/actions.ts
export async function askFree(
  sessionId: string
): Promise<{ index: number; question: string; ttsUrl?: string }>;
export async function synthesizeQ1TTS(
  sessionId: string,
  question: string
): Promise<{ ttsUrl: string }>;
export async function submitFree(
  sessionId: string,
  input: { text: string }
): Promise<{ done: boolean }>;
export async function finalizeFree(
  sessionId: string
): Promise<{ resultId: string }>;

// pricing
export async function createCheckoutSession(
  tier: '48h' | '7d' | '30d' | 'lifetime'
): Promise<{ url: string }>;
```

---

## Security & Abuse Controls

- RLS on all tables; server actions revalidate ownership and tier constraints.
- Turnstile bot‑checks; device hash soft‑limits for free usage frequency.
- Rate limits on server actions (per IP + per user).
- No client‑side secrets; presigned URLs for Storage; CSP/HSTS enabled.
- Idle timeout (5 min) in free runner auto‑completes and moves to results with a gentle message.

---

## Observability & KPIs

### Preview Widget Metrics

- Track: `preview_widget_load`, `preview_role_selected`, `preview_answer_typed`, `preview_submit_clicked`, `preview_feedback_shown`, `preview_cta_clicked`, `preview_signup_completed`
- Targets: Widget→Full Assessment CTR ≥ **15%**, Time‑to‑interactive **<3s**, Widget completion rate **>60%**

### Free Assessment Metrics

- Track: `funnel_start`, `assessment_started`, `assessment_completed`, `cta_clicked_upgrade`, `trial_replay`, `voice_playback_used_q1`, `timeout_returned`
- Targets: Trial→Premium CTR ≥ **12%**, Time‑to‑first‑interaction **<10s**, Social bounce **<30%**

### Premium Metrics

- Track: `checkout_initiated`, `entitlement_granted`, `interview_started`, `interview_completed`, `report_viewed`, `pdf_downloaded`
- Targets: Checkout→Completion **>85%**, Interview completion rate **>90%**

All metrics implemented via `lib/analytics.ts` (PostHog/Segment or custom `events` table).

---

## Deployment Notes

- Vercel for Next.js; Supabase managed; Stripe live/test per env.
- Migrations: add `device_fingerprints`, update `sessions`, `results` schemas.
- Seed a warm‑up prompt bank for variability.
- Middleware: capture UTM; optional mobile redirect logic if desired.

---

## Definition of Done (New Entry System)

### Preview Widget

- Widget loads and is interactive within **≤3s** on landing page.
- User can select role, answer question (200 char min), and receive instant client-side feedback.
- No authentication or API calls required.
- CTA to full assessment is prominent and clear.
- Role and answer data carried forward via sessionStorage to prefill assessment setup.

### Free Assessment

- Users can start the complimentary assessment from `/` within **≤10s**.
- The free runner shows **one question at a time**; **Q1 voice playback** only.
- Results show **one visible metric**; other metrics **locked** with tasteful blur/lock.
- CTA to **/pricing** is prominent; avoids "upgrade/buy" wording.
- Abuse controls enforce **1 complimentary assessment per 7 days** (user+device).
- Visuals match brand gradient and tone across all funnel screens.

---

## Summary: Three-Tier System

InterviewLab now operates as a unified platform with three entry points, each optimized for different user readiness levels:

### Tier 1: Preview Widget (Instant Demo)

- **Purpose:** Convert skeptical social media traffic with zero friction
- **Time to Value:** <30 seconds
- **Requirements:** None (no auth, no signup, no data collection)
- **Features:** 1 question, instant client-side feedback, role selection
- **Technical:** Pure client-side JavaScript, no backend calls
- **Conversion Goal:** Drive to Tier 2 (Full Assessment)

### Tier 2: Complimentary Assessment (Free Trial)

- **Purpose:** Demonstrate full product value with meaningful sample
- **Time to Value:** ~5 minutes
- **Requirements:** Email/auth, Turnstile verification, device binding
- **Features:** 3 questions, Q1 voice playback, 1 visible metric, partial results
- **Technical:** Database-backed, server actions, abuse controls (1 per 7 days)
- **Conversion Goal:** Drive to Tier 3 (Premium Purchase)

### Tier 3: Full Professional Simulation (Premium)

- **Purpose:** Complete interview preparation solution
- **Time to Value:** Immediate after purchase
- **Requirements:** Paid entitlement (time-based passes)
- **Features:** Unlimited interviews, full voice I/O, adaptive difficulty, complete scoring, all metrics, PDF reports
- **Technical:** Full OpenAI integration, Whisper STT, TTS, comprehensive analytics
- **Business Model:** One-time payment, no subscription (48h, 7d, 30d, lifetime)

### Funnel Flow

```
Landing Page (Preview Widget)
    ↓ 15% CTR target
Complimentary Assessment Setup
    ↓ Signup/Auth
3-Question Assessment
    ↓ Completion
Partial Results + Upgrade CTA
    ↓ 12% CTR target
Pricing Page
    ↓ Checkout
Premium Entitlement
    ↓ Access
Full Professional Simulation
```

This architecture ensures maximum conversion by meeting users at their current readiness level while maintaining a seamless upgrade path through the funnel.
