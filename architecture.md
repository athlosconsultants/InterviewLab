# InterviewLab — Full Architecture (Next.js + Supabase) — **New Entry System Integrated**

> **Scope:** This replaces/updates the previous `architecture.md` to include the **Complimentary Assessment Funnel** (“New Entry System”) while preserving the premium **Full Professional Simulation** flow. Any conflicting/obsolete parts of the older architecture are called out under **Deprecations & Replacements**.

---

## Executive Summary

InterviewLab now has **two complementary flows**:

1. **Complimentary Assessment Funnel (Free, no credit card)** — the default entry path for new users landing from social traffic. Delivers a believable 3‑question demo with **Q1 voice playback only**, hides transcript, and shows a **partial** results card that nudges users to **Access the Full Professional Simulation**.
2. **Full Professional Simulation (Premium)** — the existing multi‑stage, fully adaptive interview with voice input/output and a comprehensive report, gated by **time‑based access passes** (Stripe + entitlements).

Both flows share the same backend (Next.js server actions), Supabase (Auth/DB/Storage), and AI providers (OpenAI LLM, Whisper STT, TTS provider).

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
   |  (Supabase Auth; device fingerprint; Turnstile)
   v
[Next.js Route Handlers / Server Actions]
   |---> Supabase (Auth, Postgres, Storage, RLS)
   |---> OpenAI (LLM, Whisper STT)
   |---> TTS (OpenAI/ElevenLabs)  [Q1 playback in free funnel]
   '--- Stripe (Checkout, Webhooks) [Premium]
```

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
│  ├─ marketing/
│  │  ├─ Hero.tsx                         # Headline + sub + CTA
│  │  └─ MicroIdentity.tsx                # Inline “What should we call you?” prompt
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

- Presents credibility and the primary CTA: **Start Complimentary Assessment**.
- On click: shows **PreparingOverlay** for ≤2s, then inline **MicroIdentity** prompt (first name).
- Creates/updates a lightweight user record (anonymous or authed) and routes to `/assessment/setup`.

### 2) Complimentary Assessment — **Pre‑Assessment** `app/assessment/setup`

- Frames the experience: “3 questions · Text‑only · Takes ~5 minutes”.
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
  name text,                            -- 'funnel_start','assessment_started','assessment_completed','cta_clicked_upgrade','trial_replay','voice_playback_used_q1','timeout_returned'
  payload jsonb,
  created_at timestamptz default now()
)
```

**RLS:** All tables enforce `user_id = auth.uid()` for CRUD. Server actions use service role only for controlled writes that remain user‑scoped.

---

## Where State Lives

### Client (Ephemeral)

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

1. **Auth & Micro‑Identity**
   - Anonymous or email‑based Supabase sessions allowed.
   - First name captured as lightweight profile field and tagged to session.

2. **Bot Protection & Device Binding**
   - **Turnstile** token verified via `/api/turnstile-verify` → `lib/antiabuse/turnstile.ts`.
   - `lib/antiabuse/device.ts` hashes a client fingerprint (no PII) and binds to `user_id`.
   - `lib/antiabuse/trial.ts` checks rolling 7‑day window (per user + device).

3. **Free Runner**
   - `lib/assessment.ts` selects warm‑up prompts via `lib/variability.ts` (seeded by session).
   - `Q1` -> `api/tts` synthesizes playback; **voice input disabled**.
   - `submitFree` saves turns + digest; on index==3 computes **partial** results via `lib/results.ts`.
   - Redirect to `/assessment/results/[sessionId]`.

4. **Premium System**
   - Unchanged interview loop: voice in/out, Whisper STT, adaptive questions, full scoring via `lib/scoring.ts`.
   - **Stripe** creates time‑pass → webhook writes `entitlements` → routes gate via `lib/entitlements.ts`.

5. **Pricing Hand‑Off**
   - Results page CTA leads to `/pricing`.
   - Successful checkout returns user to premium setup/interview based on entitlement status.

---

## Deprecations & Replacements

- **Old Landing CTA (“Go to /setup”) → REPLACED.**  
  The primary CTA on `/` now starts the **Complimentary Assessment** → `/assessment/setup`. The premium `/setup` route stays available but is no longer the default entry for new users.

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

- Track: `funnel_start`, `assessment_started`, `assessment_completed`, `cta_clicked_upgrade`, `trial_replay`, `voice_playback_used_q1`, `timeout_returned`.
- Targets: Trial→Premium CTR ≥ **12%**, Time‑to‑first‑interaction **<10s**, Social bounce **<30%**.
- Implement via `lib/analytics.ts` (PostHog/Segment or custom `events` table).

---

## Deployment Notes

- Vercel for Next.js; Supabase managed; Stripe live/test per env.
- Migrations: add `device_fingerprints`, update `sessions`, `results` schemas.
- Seed a warm‑up prompt bank for variability.
- Middleware: capture UTM; optional mobile redirect logic if desired.

---

## Definition of Done (New Entry System)

- Users can start the complimentary assessment from `/` within **≤10s**.
- The free runner shows **one question at a time**; **Q1 voice playback** only.
- Results show **one visible metric**; other metrics **locked** with tasteful blur/lock.
- CTA to **/pricing** is prominent; avoids “upgrade/buy” wording.
- Abuse controls enforce **1 complimentary assessment per 7 days** (user+device).
- Visuals match brand gradient and tone across all funnel screens.
