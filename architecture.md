# InterviewLab — Full Architecture (Next.js + Supabase)

## Overview
InterviewLab is a SaaS web app that simulates realistic, AI-driven interviews using the user’s own CV and job information. Users experience a chat-style interface with optional voice in/out; answers adapt the next question; a rubric-based report is produced at the end.

- **Frontend:** Next.js (TypeScript, App Router, Tailwind, shadcn/ui)
- **Backend:** Next.js API routes (server actions / route handlers)
- **Auth & DB:** **Supabase** (Postgres + Auth; Row-Level Security)
- **AI Services:** OpenAI (LLM for Q&A + feedback), Whisper (STT), TTS (OpenAI or ElevenLabs)
- **Storage:** Supabase Storage (CVs, audio, reports)  
- **Payments (optional):** Stripe

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
   '--- Stripe (optional)
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

## What Each Part Does

### `app/(marketing)/page.tsx`
Landing page with product pitch, pricing, CTA → `/setup`. Public route.

### `app/setup/page.tsx` + `actions.ts`
- **Intake form**: Job Title, Company, Location, Job Spec (PDF/Image), CV (PDF/DOCX), optional extra context.
- **Server action** kicks off **research**:
  1) Extract text from uploads (server)  
  2) Summarise CV + job spec  
  3) Query public sources for company facts  
  4) Create a `Session` row + `ResearchSnapshot` row  
  5) Redirect to `/interview/[sessionId]`

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

6. **Payments (optional):**  
   - Server creates Stripe Checkout session (with user ID).  
   - Webhook (route handler) verifies signature and updates `profiles.plan`.

---

## API / Actions (Examples)

- `startInterview(sessionId)` → returns `{ question, ttsUrl, timeLimit, replaysLeft }`
- `submitAnswer(sessionId, { text?, audioKey? })` → transcribe if audio → store turn → returns `{ nextQuestion | done }`
- `replayQuestion(sessionId)` → increments replay count, returns `ttsUrl`
- `finalizeFeedback(sessionId)` → returns `reportId`
- `getPresignedUpload({ type })` → returns `{ url, fields }`

All **server actions** validate: user session, session ownership, and rate limits.

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
- All sensitive data goes through server; RLS enforced.
- Basic analytics (page views, interview completions).
- CI pipeline: typecheck, lint, unit tests; preview deployments on PR.

---
