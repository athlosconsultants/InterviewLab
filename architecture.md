# InterviewLab — Full Architecture (Next.js + Supabase)

## Overview

InterviewLab is a SaaS web app that simulates realistic, AI-driven interviews using the user’s own CV and job information. Users experience a chat-style interface with optional voice in/out; answers adapt the next question; a rubric-based report is produced at the end.

- **Frontend:** Next.js (TypeScript, App Router, Tailwind, shadcn/ui)
- **Backend:** Next.js API routes (server actions / route handlers)
- **Auth & DB:** **Supabase** (Postgres + Auth; Row-Level Security)
- **AI Services:** OpenAI (LLM for Q&A + feedback), Whisper (STT), TTS (OpenAI or ElevenLabs)
- **Storage:** Supabase Storage (CVs, audio, reports)
- **Payments:** Stripe Checkout for time-based access passes

---

## High-Level Architecture

```
[Browser/Next.js UI]
   |  (Auth via Supabase)
   v
[Next.js Route Handlers / Server Actions]
   |---> Supabase (Auth, Postgres, Storage)
   |---> OpenAI (LLM, Whisper)
   |---> TTS Provider (OpenAI/ElevenLabs)
   '--- Stripe (Checkout, Webhooks)
```

- The frontend only keeps ephemeral UI state; sensitive data flows through secure server routes.
- Supabase Auth secures session; RLS protects per-user records in Postgres.

---

## File & Folder Structure

```
/ (repo root)
├─ app/
│  ├─ (marketing)/
│  │  └─ page.tsx                  # Landing page
│  ├─ setup/
│  │  ├─ page.tsx                  # Intake form (job + uploads)
│  │  └─ actions.ts                # Server actions (start research)
│  ├─ interview/
│  │  ├─ [sessionId]/
│  │  │  ├─ page.tsx               # Chat/voice interface
│  │  │  └─ actions.ts             # ask/submit/replay server actions
│  ├─ report/
│  │  ├─ [sessionId]/
│  │  │  └─ page.tsx               # Scored feedback UI
│  ├─ api/                         # Route handlers (if using REST style)
│  │  ├─ research/route.ts         # POST research
│  │  ├─ tts/route.ts              # POST TTS synth
│  │  ├─ transcribe/route.ts       # POST Whisper STT
│  │  └─ stripe-webhook/route.ts   # POST Stripe webhooks (optional)
│  └─ layout.tsx                   # Root layout + providers
│
├─ components/
│  ├─ forms/
│  │  ├─ IntakeForm.tsx
│  │  └─ FileDrop.tsx
│  ├─ interview/
│  │  ├─ ChatThread.tsx
│  │  ├─ QuestionBubble.tsx
│  │  ├─ AnswerComposer.tsx        # Text input + mic record controls
│  │  ├─ TimerRing.tsx
│  │  └─ ReplayButton.tsx
│  ├─ results/
│  │  ├─ ScoreDial.tsx
│  │  └─ CategoryBars.tsx
│  └─ ui/…                         # shadcn/ui wrappers
│
├─ lib/
│  ├─ supabase-client.ts           # Browser-side client (limited, non-sensitive)
│  ├─ supabase-server.ts           # Server-side client (service role via RLS-safe ops)
│  ├─ openai.ts                    # Server-side LLM/STT/TTS helpers
│  ├─ storage.ts                   # Supabase Storage helpers (presigned URLs)
│  ├─ research.ts                  # Company/role research orchestration
│  ├─ interview.ts                 # State machine, question generator
│  ├─ scoring.ts                   # Rubric scoring + feedback formatter
│  ├─ schema.ts                    # Types (DB rows, DTOs)
│  └─ utils.ts                     # Validation, zod schemas, formatting
│
├─ db/
│  ├─ migrations/                  # SQL migration files (if using SQL directly)
│  └─ seed.ts                      # Seed default RoleKits, etc.
│
├─ styles/                         # Tailwind CSS, globals
├─ public/                         # Logos, static assets
├─ env.d.ts                        # Type-safe environment variables
├─ package.json
└─ README.md
```

---

## Time-Based Access Pass System

### Overview

InterviewLab uses a **time-based access pass model** instead of per-interview credits. Users purchase passes that grant unlimited interview access for a specific duration.

### Plans

- **Access Passes** (via Stripe Checkout):
  - 48 hours
  - 7 days
  - 30 days
  - Lifetime

### Purchase Flow

1. **Frontend** calls a server action to create a Stripe Checkout session with metadata (`user_id`, `pass_tier`, etc).
2. **Stripe Checkout** completes → webhook triggers `/api/stripe-webhook/route.ts`.
3. **Webhook Handler** validates event, reads metadata, and upserts an `entitlements` row with expiry timestamp.
4. **Supabase** stores entitlements with:
   - `user_id`, `tier`, `expires_at`, `stripe_session_id`, `created_at`
5. **App access** is checked via `getUserEntitlements()` (in `lib/entitlements.ts`) during interview/report routes.
6. **Frontend UX** reflects status ("X days left", "Upgrade Now", etc).

### Key Files

- `app/api/stripe-webhook/route.ts` → Verifies and records entitlements
- `lib/entitlements.ts` → Gets current active entitlement
- `lib/payments/timepasses.ts` → Product catalog, Stripe session creation
- `components/Paywall.tsx` → Gating component
- `components/PerkDisplay.tsx` → Benefits of each plan

### Entitlements Schema

```
entitlements (
  id uuid pk,
  user_id uuid fk → auth.uid(),
  tier text,
  expires_at timestamptz,
  stripe_session_id text,
  created_at timestamptz default now()
)
```

- Enforced by RLS: `user_id = auth.uid()`
- Expiry checked before unlocking interview/session/report
- Lifetime plan: `expires_at = NULL`

### State Management

#### Client

- Auth session (via Supabase)
- UI state (timers, playback, upload status)
- Passive entitlement awareness (via SSR or hydration)

#### Server

- **Entitlements:** Authoritative source of user access
- **Stripe session metadata** ties payments to Supabase updates
- **Time gating** logic lives in `lib/entitlements.ts`

### API & Utilities

- `createCheckoutSession(tier)` → Returns Stripe URL
- `getUserEntitlements(user)` → Returns `{ tier, expiresAt, isActive }`
- `isEntitled(user, feature)` → Boolean guard for interviews, reports, etc
- `renderPerkDisplay(tier)` → Perk marketing breakdown

### Frontend Gating & UX

- Entitlement is checked before:
  - Starting interview
  - Viewing report
- If not entitled:
  - Redirect to `/pricing`
  - Prompt checkout via `Paywall.tsx`
- Active users see remaining time banner ("3 days left")

### Security

- Stripe webhook validates event authenticity (signature + event type)
- Entitlements RLS-enforced: no cross-user access
- All entitlements updates happen via server (no client-side writes)
- Expiry enforcement applies server-side only

### Migration Notes

- Legacy credit-based model removed
- Stripe SKU model replaced with time-pass SKUs
- All previous gating mechanisms now funnel through `getUserEntitlements()`

---

# Mobile Web Support (Architecture Addendum)

## 📱 Mobile Frontend Architecture

### Overview

To support a mobile-optimized experience alongside the desktop app, the app now serves **distinct UIs for mobile and desktop**:

- Shared backend (Next.js server actions, Supabase, OpenAI, etc.)
- Shared core interview logic, state machine, and data flow
- Separate UI shells rendered based on device detection

### Rendering Paths

- **Desktop:** Default App Router paths (e.g., `/`, `/interview/[id]`, `/report/[id]`)
- **Mobile:** New mobile-first route group: `(mobile)` → `/m`, `/m/interview/[id]`

### Detection Logic

- **SSR Middleware:** Uses user-agent to detect mobile → redirects `/` → `/m`
- **Client Hook:** `useIsMobile()` via `matchMedia('(max-width: 768px)')` fallback

### Code Sharing

- Shared interview logic lives in `BaseInterviewUI.tsx`
- Each UI (MobileTextUI, MobileVoiceUI, TextUI, VoiceUI) composes the base with responsive presentation
- Avoids duplication of state, actions, and data fetching

---

## 🔧 Mobile UI Stack

- **Routing:** `(mobile)` route group in App Router
- **Styling:** Tailwind CSS mobile-first layout system
- **Components:**
  - `MobileTextUI.tsx`
  - `MobileVoiceUI.tsx`
  - `MobileLanding.tsx` (Hormozi-style CTA funnel)

---

## 🧠 UX Principles Applied

### Landing Page (Mobile)

- Hormozi Offer Stack: Dream outcome × proof ÷ time/effort
- Sticky CTA to start free interview
- Designed for TikTok/Instagram funnel visitors

### Interview UX

- One-screen, focused layout
- Touch targets >48px
- Stickied action buttons (submit, replay)
- Adjusted font sizes and ring indicators

---

## 📦 No Backend Changes

- **Database schema:** Unchanged
- **Server actions:** Reused
- **TTS/STT/LLM flow:** Fully preserved

---

## ✅ Benefits

- Clear funnel segmentation (mobile vs desktop)
- Fully mobile-optimized UX
- Single backend, no duplication
- App ready for production traffic from social sources

---

## 🌐 Deployment Notes

- SSR device detection: in `middleware.ts`
- Mobile-specific routes start at `/m`
- No additional hosting configuration required (Vercel-friendly)

---

## What Each Part Does

### `app/(marketing)/page.tsx`

Landing page with product pitch, pricing, CTA → `/setup`. Public route.

### `app/setup/page.tsx` + `actions.ts`

- **Intake form**: Job Title, Company, Location, Job Spec (PDF/Image), CV (PDF/DOCX), optional extra context.
- **Server action** kicks off **research**:
  1. Extract text from uploads (server)
  2. Summarise CV + job spec
  3. Query public sources for company facts
  4. Create a `Session` row + `ResearchSnapshot` row
  5. Redirect to `/interview/[sessionId]`

### `app/interview/[sessionId]/page.tsx` + `actions.ts`

- **Chat UI** shows one question at a time (text + optional audio).
- **Server actions**:
  - `startInterview(sessionId)` → first question
  - `submitAnswer(sessionId, {text|audioKey})` → Whisper → digest → next question
  - `replayQuestion(sessionId)` → increments replay usage (affects score)

### `app/report/[sessionId]/page.tsx`

- Fetches final `Report` from DB.
- Renders score dial, category bars, strengths, improvements, exemplar answers.
- “Download PDF” via server function (optional).

### `lib/*`

- **supabase-client.ts**: lightweight browser client (no service keys) to read user-safe data.
- **supabase-server.ts**: server client for privileged ops **behind RLS policies**.
- **openai.ts**: isolated server logic to call LLM, Whisper, TTS.
- **storage.ts**: presigned upload/download helpers for Supabase Storage.
- **research.ts**: takes CV + job spec → company/role snapshot.
- **interview.ts**: interview **state machine** + question generator + answer digests.
- **scoring.ts**: rubric scoring/feedback generation using LLM with strict JSON schema.
- **schema.ts**: central TS types for DB entities and API payloads.

---

## Data Model (Supabase Postgres)

**Users (managed by Supabase Auth)**  
Additional profile table (optional):

- `profiles(id uuid pk, user_id uuid unique, plan text, created_at)`

**entitlements**

- `id uuid pk, user_id uuid fk → auth.uid()`
- `tier text` (48h|7d|30d|lifetime)
- `expires_at timestamptz` (nullable for lifetime)
- `stripe_session_id text`
- `created_at timestamptz`

**documents**

- `id uuid pk, user_id uuid fk → auth.uid()`
- `type text` (cv|jobspec|extra|audio|report)
- `storage_key text` (Supabase Storage path)
- `extracted_text text` (nullable)
- `created_at timestamptz`

**company_profiles**

- `id uuid pk, user_id uuid fk`
- `company text`
- `facts jsonb`
- `sources jsonb`
- `updated_at timestamptz`

**role_kits**

- `id uuid pk, user_id uuid fk` (or global/shared)
- `role text`
- `competencies jsonb`
- `archetypes jsonb`
- `updated_at timestamptz`

**sessions**

- `id uuid pk, user_id uuid fk`
- `status text` (intake|research|ready|running|feedback|complete)
- `job_title text, company text, location text`
- `research_snapshot jsonb`
- `limits jsonb` (question cap, replay cap, timer sec)
- `created_at, updated_at`

**turns**

- `id uuid pk, session_id uuid fk, user_id uuid fk`
- `question jsonb` (text, category, difficulty, time_limit)
- `tts_key text` (audio path, nullable)
- `answer_text text`
- `answer_audio_key text`
- `answer_digest jsonb` (short summary for context)
- `timing jsonb` (durations, replay_count)
- `created_at`

**reports**

- `id uuid pk, session_id uuid fk, user_id uuid fk`
- `overall integer`
- `dimensions jsonb` (relevance/structure/depth/etc.)
- `tips jsonb` (array of strings)
- `exemplars jsonb` (before/after samples)
- `pdf_key text` (optional)
- `created_at`

**RLS**: every table enforces `user_id = auth.uid()` for `select/insert/update/delete`.

---

## Where State Lives

### Client State (ephemeral/UI only)

- Form input state, current mic permission, current timer countdown.
- Chat scroll position, “recording” toggle.
- **No sensitive data persisted in localStorage**.

### Server State (authoritative)

- **Sessions/Turns/Reports** live in **Postgres**.
- **Files** (CVs, audio, reports) live in **Supabase Storage** with **presigned URLs**.
- **Interview progress** (status) is stored in `sessions.status`.
- **Question/answer context** is compacted via `turns.answer_digest` to keep prompts small.

---

## How Services Connect

1. **Auth:**
   - Supabase Auth session available in Next.js (server components & actions).
   - RLS ensures users only see their own rows.

2. **Uploads (CV/Job Spec/Audio):**
   - Client requests presigned URL from server action.
   - Browser uploads file directly to Supabase Storage.
   - Server receives metadata → creates `documents` row.

3. **Research:**
   - Server action reads `documents.extracted_text` (or runs OCR/PDF parse server-side).
   - Calls OpenAI for concise CV + job spec summaries; queries public facts if needed.
   - Produces `research_snapshot` stored on `sessions`.

4. **Interview Loop:**
   - `startInterview` → LLM generates Q1 JSON.
   - Optional TTS synthesized and stored at `tts_key`.
   - User answers (text or audio) → server transcribes via Whisper.
   - `turns` row created; `answer_digest` computed; next question generated.
   - Repeat until limits reached.

5. **Feedback:**
   - Server compiles full conversation + research snapshot.
   - LLM returns rubric scores + tips + exemplars (JSON).
   - Persist in `reports` and render UI; optional PDF render stored in Storage.

6. **Payments:**
   - Server creates Stripe Checkout session with metadata (`user_id`, `pass_tier`).
   - Stripe Checkout completes → webhook `/api/stripe-webhook/route.ts` triggered.
   - Webhook verifies signature and upserts `entitlements` row with expiry timestamp.
   - All interview/report routes check entitlements via `getUserEntitlements()` before granting access.

---

## API / Actions (Examples)

### Interview Flow

- `startInterview(sessionId)` → returns `{ question, ttsUrl, timeLimit, replaysLeft }`
- `submitAnswer(sessionId, { text?, audioKey? })` → transcribe if audio → store turn → returns `{ nextQuestion | done }`
- `replayQuestion(sessionId)` → increments replay count, returns `ttsUrl`
- `finalizeFeedback(sessionId)` → returns `reportId`
- `getPresignedUpload({ type })` → returns `{ url, fields }`

### Payment & Entitlements

- `createCheckoutSession(tier)` → returns Stripe Checkout URL
- `getUserEntitlements(user)` → returns `{ tier, expiresAt, isActive }`
- `isEntitled(user, feature)` → Boolean guard for interviews, reports, etc

All **server actions** validate: user session, session ownership, entitlements, and rate limits.

---

## Security & Compliance

- **RLS everywhere**; reject unauthenticated access by default.
- **CSP, HSTS, secure cookies**, CSRF for form routes if cookies used.
- **Secrets** only on server; no keys in client bundle.
- **Data deletion** endpoint wipes DB rows + Storage keys for a user.
- PII minimized in logs; redact transcripts; structured logging only on server.

---

## Performance & Cost Controls

- **Answer digests** (short summaries) to cap token growth.
- Stream setup progress and question delivery for responsiveness.
- Pre-generate TTS for the next question while the user is answering (opportunistic).
- Reasonable time limits (e.g., 90s per question) and **replay caps**.

---

## Deployment Notes

- **Vercel** for Next.js (front + route handlers).
- **Supabase** for Postgres/Auth/Storage (managed).
- ENV config per environment; **no** test keys in production.
- Optional cron to purge old raw audio/CVs after X days.

---

## Done-Definition (MVP)

- Users can: sign in, upload CV/job spec, run a short adaptive interview, and receive a scored report.
- Time-based access pass system fully integrated:
  - Purchase passes via Stripe Checkout (48h, 7d, 30d, lifetime)
  - Immediate access post-checkout via webhook
  - Automatic blocking when pass expires
  - Clear UX showing remaining time
- All sensitive data goes through server; RLS enforced.
- Entitlement gating centralized and RLS-compliant.
- Clean Stripe ↔ Supabase integration; recoverable from webhook retry.
- Basic analytics (page views, interview completions).
- CI pipeline: typecheck, lint, unit tests; preview deployments on PR.

---
