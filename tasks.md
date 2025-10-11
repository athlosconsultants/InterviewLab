# InterviewLab — MVP Task Plan (One-Concern, Testable Steps)

> Guiding rules: Complete tasks **in order**, one at a time. Each task is tiny, has a clear start/end, and is testable. Keep sensitive data server-side. Use Next.js (TypeScript, App Router) + Tailwind + shadcn/ui + Supabase (Auth, Postgres, Storage).

---

## 🔥 CRITICAL: Database Migrations Required

**Before testing Phases 8.5-10, run these migrations in Supabase SQL Editor:**

### Migration 009: Turn Type Column (T106)

```sql
ALTER TABLE turns ADD COLUMN IF NOT EXISTS turn_type TEXT DEFAULT 'question';
ALTER TABLE turns ADD CONSTRAINT check_turn_type
  CHECK (turn_type IN ('small_talk', 'question', 'confirmation'));
```

### Migration 010: Stage Targets Column (T107)

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS stage_targets JSON;
COMMENT ON COLUMN sessions.stage_targets IS 'T107: Array of target question counts per stage for paid tier variability, e.g., [5,7,6,8]';
```

### Migration 011: Resume Fields (T111)

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS turn_index INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS progress_state JSON;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION update_sessions_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_activity = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sessions_last_activity_trigger ON sessions;
CREATE TRIGGER update_sessions_last_activity_trigger
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_last_activity();

COMMENT ON COLUMN sessions.turn_index IS 'T111: Current turn index for resume functionality';
COMMENT ON COLUMN sessions.progress_state IS 'T111: JSON object storing resume state data';
COMMENT ON COLUMN sessions.last_activity IS 'T111: Timestamp of last user activity for auto-save';
```

### Migration 012: Difficulty Curve Column (T112)

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS difficulty_curve JSON;
COMMENT ON COLUMN sessions.difficulty_curve IS 'T112: JSON array tracking difficulty adjustments based on answer quality';
```

**Status:** All migrations must be run for T106, T107, T111, T112 features to work.

---

## 📋 Implementation Summary (Phases 8.5-10)

### Completed Features

**Phase 8.5:** Conversational & Paid Interview Upgrade

- ✅ T84-T90: Paid tier config, restrictions, entitlements, industry mapping, intros, bridges, context-aware generation
- ✅ T91-T94: Multi-stage logic, industry templates, timer/reveal system, analyzing transitions

**Phase 9:** Mode-Specific Interview UX & Reveal System

- ✅ T100-T110: Reveal window, single-question display, text/voice mode routing, orb UI, text mode rewrite, small-talk flow, stage caps, mode-specific replay, mode-aware prompts, analytics & telemetry

**Phase 10:** Post-MVP Enhancements

- ✅ T111-T113: Session resume, adaptive difficulty, low-latency pre-fetch

### Key Architectural Decisions

1. **Server/Client Separation:** Created server action wrappers (`app/interview/[id]/actions.ts`) for `getResumeData` and `autoSaveSession` to handle Next.js `next/headers` restrictions.

2. **Client-Safe Adaptive Logic:** Extracted adaptive difficulty functions to `lib/adaptive-difficulty.ts` to avoid server-side dependency conflicts.

3. **Authentication Context:** Modified `startInterview` and `getInterviewState` to accept optional `supabaseClient` parameter, ensuring consistent auth context across server actions.

4. **Turn Type System:** Introduced `turn_type` column to distinguish small_talk/question/confirmation turns, preventing them from counting toward stage progression.

5. **Dynamic Timing:** Implemented intelligent delay calculation to ensure perceived latency ≤1.5s while maintaining smooth UX transitions.

### Critical Bug Fixes

1. **Duplicate Questions:** Fixed by passing all turns (including small talk) to question generation for context.
2. **Timer on Warm-up:** Disabled reveal system for small_talk/confirmation via `currentTurnId: null`.
3. **Analyzing Overlap:** Reordered state updates to hide question during analyzing state.
4. **Session Not Found:** Fixed authentication context by passing `supabaseClient` to interview functions.
5. **Import Errors:** Resolved `next/headers` client component errors with server action wrappers.

### Testing Infrastructure

- Playwright E2E test suite configured
- Admin debug view at `/admin/debug` for session inspection
- Client-side analytics with localStorage tracking
- Multi-browser testing: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

---

## Phase 0 — Repo, Tooling, CI (Foundations)

### T00 — Initialise Repo & Package Manager

**Goal:** Create repo with PNPM and basic scripts.  
**Edits:** `package.json`, `.gitignore`, `README.md`  
**Steps:**

1. `pnpm init` and set `"type": "module"`.
2. Add scripts: `dev`, `build`, `start`, `lint`, `test`.
3. Add `.gitignore` (node_modules, .env\*, .next).  
   **DoD:** Repo installs with `pnpm i` and `pnpm -v` prints version.  
   **Test:** `pnpm run` shows scripts.

### T01 — Create Next.js App (TS, App Router)

**Goal:** Scaffold Next with TS.  
**Edits:** `/app`, `tsconfig.json`, `next.config.mjs`  
**Steps:** `pnpm create next-app@latest` → TS, App Router, ESLint yes.  
**DoD:** `pnpm dev` serves default page.  
**Test:** Open `http://localhost:3000` shows Next page.

### T02 — Add Tailwind

**Goal:** Styling baseline.  
**Edits:** `tailwind.config.ts`, `postcss.config.js`, `app/globals.css`  
**Steps:** Follow Tailwind setup for Next App Router.  
**DoD:** Tailwind class renders correctly.  
**Test:** Create a div with `bg-black text-white` visible.

### T03 — Add shadcn/ui

**Goal:** UI components.  
**Edits:** `components/ui/*`, `lib/utils.ts`  
**Steps:** Install shadcn/ui CLI; init; add Button/Input/Dialog.  
**DoD:** Button renders on page.  
**Test:** Place Button in `app/page.tsx`.

### T04 — Lint/Format Hooks

**Goal:** Code quality and pre-commit.  
**Edits:** `.eslintrc`, `.prettierrc`, `lint-staged`, `husky` hooks  
**Steps:** Install eslint/prettier/husky; configure pre-commit `lint-staged`.  
**DoD:** Commit triggers lint/fix.  
**Test:** Introduce a lint error; verify hook blocks commit.

### T05 — Basic CI

**Goal:** CI validates builds.  
**Edits:** `.github/workflows/ci.yml`  
**Steps:** Add job: install → lint → typecheck → build.  
**DoD:** CI green on main.  
**Test:** Push branch; see CI pass.

---

## Phase 1 — Supabase (Auth, DB, Storage)

### T10 — Supabase Project & .env

**Goal:** Connect Supabase.  
**Edits:** `.env.local.example`, `.env.local`  
**Steps:** Create project, copy URL/anon keys, set env vars.  
**DoD:** Env loaded; no runtime key errors.  
**Test:** `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` in dev (temporary).

### T11 — Supabase Client (Browser & Server)

**Goal:** Clients split by context.  
**Edits:** `lib/supabase-client.ts`, `lib/supabase-server.ts`  
**Steps:** Implement browser client (anon); server client using cookies/session.  
**DoD:** Importable without errors.  
**Test:** Call a trivial query from a server component.

### T12 — Auth UI (Sign In/Out)

**Goal:** Minimal auth flow.  
**Edits:** `app/(auth)/sign-in/page.tsx`, `app/(auth)/callback/route.ts`  
**Steps:** Implement Supabase Auth UI or custom email magic link.  
**DoD:** User can sign in/out.  
**Test:** Sign in → header shows user email.

### T13 — DB Schema (Prisma or SQL)

**Goal:** Create core tables.  
**Edits:** `db/migrations/*`, `lib/schema.ts`  
**Steps:** Create tables: `documents`, `company_profiles`, `role_kits`, `sessions`, `turns`, `reports`.  
**DoD:** Tables exist in DB.  
**Test:** Run a `select count(*)` on `sessions`.

### T14 — RLS Policies

**Goal:** Enforce per-user access.  
**Edits:** `db/migrations/*`  
**Steps:** Enable RLS; add policies `user_id = auth.uid()`.  
**DoD:** Non-owner queries fail.  
**Test:** Simulate with SQL: another user cannot read rows.

### T15 — Supabase Storage Buckets

**Goal:** Buckets for files.  
**Edits:** Create buckets `uploads`, `audio`, `reports`.  
**Steps:** Configure access rules; deny public by default.  
**DoD:** Buckets exist.  
**Test:** Upload a dummy file through dashboard.

---

## Phase 2 — Layout, Navigation, Theming

### T20 — Root Layout & Theme Provider

**Goal:** App-wide shell.  
**Edits:** `app/layout.tsx`  
**Steps:** Add font, theme provider, Toaster.  
**DoD:** Global styles apply.  
**Test:** Typography consistent across pages.

### T21 — Routed Pages

**Goal:** Base routes.  
**Edits:** `app/(marketing)/page.tsx`, `app/setup/page.tsx`, `app/interview/[id]/page.tsx`, `app/report/[id]/page.tsx`  
**DoD:** Visiting each route renders a stub.  
**Test:** Manual navigation works.

### T22 — Protected Routes

**Goal:** Auth guard.  
**Edits:** Middleware or server component checks.  
**DoD:** `/setup`, `/interview`, `/report` require auth.  
**Test:** Logged-out users redirected to sign-in.

---

## Phase 3 — Intake: Forms & Uploads

### T30 — Intake Form UI

**Goal:** Collect job/company/location + files.  
**Edits:** `components/forms/IntakeForm.tsx`  
**DoD:** Fields present with validation messages.  
**Test:** Invalid inputs show errors; valid enables submit.

### T31 — FileDrop Component

**Goal:** Drag & drop with preview.  
**Edits:** `components/forms/FileDrop.tsx`  
**DoD:** Drag/drop shows file names & size; restrict types (PDF/PNG/JPG/DOCX).  
**Test:** Drop invalid file → error toast.

### T32 — Presigned Upload API

**Goal:** Secure uploads to Storage.  
**Edits:** `app/api/upload/route.ts`, `lib/storage.ts`  
**DoD:** Endpoint returns presigned URL for a given `type`.  
**Test:** Upload a file via `fetch` PUT; verify in bucket.

### T33 — Save Document Metadata

**Goal:** Persist file refs.  
**Edits:** `lib/storage.ts`, `lib/schema.ts`  
**DoD:** After upload, create `documents` row with `storage_key`, `type`.  
**Test:** DB row exists and points to bucket object.

---

## Phase 4 — Parsing & Research Snapshot

### T40 — PDF/DOCX Text Extraction

**Goal:** Extract text server-side.  
**Edits:** `lib/extract.ts`  
**DoD:** Returns plain text for CV/JobSpec; handles empty gracefully.  
**Test:** Upload sample CV → inspect extracted text.

### T41 — OCR for Images

**Goal:** Screenshots parsing.  
**Edits:** `lib/ocr.ts`  
**DoD:** OCR returns text for PNG/JPG job spec.  
**Test:** Sample screenshot → text output non-empty.

### T42 — Research Snapshot Model

**Goal:** Data structure only.  
**Edits:** `lib/schema.ts`  
**DoD:** Type defined for `ResearchSnapshot` (company facts, competencies, sources).  
**Test:** Type compiles; no runtime yet.

### T43 — Research API (Server Action)

**Goal:** Combine inputs → snapshot.  
**Edits:** `app/setup/actions.ts`, `lib/research.ts`  
**DoD:** Creates `sessions` row with `research_snapshot` JSON.  
**Test:** Submit form → DB session created, snapshot not null.

### T44 — Setup Progress UI (SSE)

**Goal:** Transparent loading.  
**Edits:** `app/setup/page.tsx`, `app/api/research/route.ts`  
**DoD:** Progress updates (Analysing CV → Reading Spec → Researching Company → Building Plan).  
**Test:** UI updates step-by-step; ends with success.

### T45 — Ready Screen

**Goal:** Hand-off to interview.  
**Edits:** `app/setup/page.tsx`  
**DoD:** After research, “Ready to Start Interview” CTA appears, link to `/interview/[id]`.  
**Test:** Click navigates correctly.

---

## Phase 5 — Interview State Machine & First Question

### T50 — State Machine Skeleton

**Goal:** Encapsulate session states.  
**Edits:** `lib/interview.ts`  
**DoD:** Functions: `startInterview`, `nextQuestion`, `recordAnswer`, transitions.  
**Test:** Unit tests simulate transitions without UI.

### T51 — Question Generator (LLM)

**Goal:** JSON contract for questions.  
**Edits:** `lib/openai.ts`, `lib/interview.ts`  
**DoD:** Given snapshot + digests, returns `{question, type, competency, difficulty, time_limit}`.  
**Test:** Mock snapshot → valid JSON.

### T52 — Interview Page Shell

**Goal:** Chat scaffold.  
**Edits:** `app/interview/[id]/page.tsx`, `components/interview/ChatThread.tsx`  
**DoD:** Shows session title and empty thread.  
**Test:** Route renders with session data.

### T53 — Render First Question

**Goal:** Display Q1.  
**Edits:** `app/interview/[id]/page.tsx`  
**DoD:** On mount, calls `startInterview` and renders Q1 bubble.  
**Test:** First question visible.

### T54 — TTS Synthesis

**Goal:** Play audio for question.  
**Edits:** `app/api/tts/route.ts`, `lib/openai.ts`, `components/interview/QuestionBubble.tsx`  
**DoD:** Play button fetches audio URL; audio plays.  
**Test:** Hear spoken question.

### T55 — Timer & Replay Counter

**Goal:** Realism signals.  
**Edits:** `components/interview/TimerRing.tsx`, `components/interview/ReplayButton.tsx`  
**DoD:** Countdown visible; replay usage increments and disables at cap.  
**Test:** Timer runs; replay count changes.

---

## Phase 6 — Answer Capture (Text + Audio)

### T60 — Text Answer Composer

**Goal:** Type answers.  
**Edits:** `components/interview/AnswerComposer.tsx`  
**DoD:** Textarea + submit button with confirm modal.  
**Test:** Submit posts to server; UI shows pending state.

### T61 — Audio Record Component

**Goal:** Mic recording.  
**Edits:** `components/interview/AnswerComposer.tsx`  
**DoD:** Start/stop record; waveform meter; upload blob via presigned URL.  
**Test:** Audio object appears in Storage.

### T62 — Transcription (Whisper)

**Goal:** STT server-side.  
**Edits:** `app/api/transcribe/route.ts`, `lib/openai.ts`  
**DoD:** Given audio key, returns transcript text.  
**Test:** Audio → text non-empty.

### T63 — Submit Answer (Server Action)

**Goal:** Persist turn + digest.  
**Edits:** `app/interview/[id]/actions.ts`, `lib/interview.ts`  
**DoD:** Creates `turn` row with transcript/audio; computes `answer_digest`.  
**Test:** New turn appears in DB; digest not empty.

### T64 — Append to Thread & Fetch Next

**Goal:** Loop continues.  
**Edits:** `app/interview/[id]/page.tsx`  
**DoD:** After submit, next question renders; scroll anchors update.  
**Test:** Q2 shows after answer; no duplicates.

---

## Phase 7 — Limits & Gating

### T70 — Free Plan Limits

**Goal:** Enforce question cap.  
**Edits:** `lib/interview.ts`, `lib/schema.ts`  
**DoD:** Free = 3 questions; block further with upgrade prompt.  
**Test:** On 4th request, gating modal appears.

### T71 — Replay Penalty Capture

**Goal:** Scoring signal only.  
**Edits:** `lib/interview.ts`  
**DoD:** Track `replay_count` in `turns.timing`.  
**Test:** Replays reflected in DB.

### T72 — Accessibility Mode (No Timer)

**Goal:** Inclusivity.  
**Edits:** `app/interview/[id]/page.tsx`  
**DoD:** Toggle disables timer + penalties.  
**Test:** Timer hidden; not counted in scoring.

---

## Phase 8 — Feedback & Report

### T80 — Feedback Generator (LLM)

**Goal:** Rubric JSON.  
**Edits:** `lib/scoring.ts`, `lib/openai.ts`  
**DoD:** Input: conversation + snapshot → Output: `{overall, dimensions{}, tips[], exemplars{}}`.  
**Test:** Deterministic JSON with sample data.

### T81 — Save Report

**Goal:** Persist results.  
**Edits:** `app/interview/[id]/actions.ts`  
**DoD:** Create `reports` row and link to session.  
**Test:** DB row exists with non-null fields.

### T82 — Report Page UI

**Goal:** Display scores.  
**Edits:** `app/report/[id]/page.tsx`, `components/results/ScoreDial.tsx`, `CategoryBars.tsx`  
**DoD:** Bars + tips render; handles empty gracefully.  
**Test:** Visual verification with seed data.

### T83 — PDF Export (Server)

**Goal:** Downloadable report.  
**Edits:** `app/api/report-pdf/route.ts`  
**DoD:** Endpoint returns PDF; store to `reports` bucket.  
**Test:** Download and open PDF.

---

---

## Phase 8.5 — Conversational & Paid Interview Upgrade

**Phase Status:** ✅ COMPLETED  
**Summary:** Implemented paid tier configuration with text/voice modes, multi-stage interviews, entitlement system, industry-specific templates, and conversational bridges.

### ✅ T84 — Add Paid Tier Configuration

**Status:** COMPLETED  
**Goal:** Introduce paid-tier interview configuration with mode (text/voice) and stage selection.  
**Edits:** `app/setup/page.tsx`, `app/setup/actions.ts`, `sessions` schema.  
**Implementation:**

1. ✅ Setup form includes mode toggle (text/voice) and stage selector (1-3).
2. ✅ Fields saved in `sessions`: `mode`, `stages_planned`, `plan_tier`.
3. ✅ Free users default to text-only, 1-stage, 3-question cap.  
   **Test Result:** ✅ Both free and paid sessions create correctly with proper config.

---

### ✅ T85 — Implement Free vs Paid Restrictions

**Status:** COMPLETED  
**Goal:** Limit free users to 3 questions, disable voice and multi-stage.  
**Edits:** `app/interview/[id]/actions.ts`, `lib/interview.ts`.  
**Implementation:**

1. ✅ Question cap enforced server-side for free sessions.
2. ✅ Voice/multi-stage options hidden in UI for free tier.  
   **Test Result:** ✅ Free users blocked after 3 questions; upgrade dialog shown.

---

### ✅ T86 — Add Entitlement Logic (Paid Interview Package)

**Status:** COMPLETED  
**Goal:** Implement one-off purchase entitlement to unlock paid session.  
**Edits:** `lib/payments.ts`, `db/migrations/`, `lib/interview.ts`.  
**Implementation:**

1. ✅ `entitlements` table created with type='interview_package'.
2. ✅ Entitlement consumed on session start; marked as used.
3. ✅ `entitlement_id` linked to session.  
   **Test Result:** ✅ One entitlement = one paid session; reuse blocked.

---

### ✅ T87 — Enhance Research for Role→Industry Mapping

**Status:** COMPLETED  
**Goal:** Improve research quality by mapping roles to industry templates.  
**Edits:** `lib/research.ts`, `lib/industry_kits.ts`.  
**Implementation:**

1. ✅ Role classification using fuzzy matching → loads industry kit.
2. ✅ Research snapshot enriched with interview_style, competencies, tone.  
   **Test Result:** ✅ Accurate role-to-industry mapping; contextual questions.

---

### ✅ T88 — Add Interview Introduction Generator

**Status:** COMPLETED  
**Goal:** Generate realistic, role-specific introductions for paid interviews.  
**Edits:** `lib/interview.ts`, `lib/openai.ts`.  
**Implementation:**

1. ✅ `generateIntro(sessionId)` creates personalized intro using LLM.
2. ✅ `intro_text` saved to session.  
   **Test Result:** ✅ Paid interviews start with natural, role-specific intro.

**Notes:**

- Mode-aware generation: voice intros optimized for TTS
- Intro references: company, role, candidate background

---

### ✅ T89 — Add Bridge Generator Between Questions

**Status:** COMPLETED  
**Goal:** Improve realism with bridges referencing previous answers.  
**Edits:** `lib/interview.ts`.  
**Implementation:**

1. ✅ `generateBridge(sessionId, lastTurnId)` creates contextual transitions.
2. ✅ Bridges summarize previous answer and lead to next question.
3. ✅ `bridge_text` stored in turns table.  
   **Test Result:** ✅ Smooth conversational flow; bridges maintain context.

**Notes:**

- Bridges merged into question generation (no separate UI display)
- Mode-aware: voice bridges optimized for TTS
- Short, contextual comments that feel natural

---

### ✅ T90 — Context-Aware Question Generation

**Status:** COMPLETED  
**Goal:** Generate next question dynamically using previous answers.  
**Edits:** `lib/interview.ts`.  
**Implementation:**

1. ✅ Question prompt includes answer digests from previous turns.
2. ✅ Progressive difficulty and topic coverage based on context.  
   **Test Result:** ✅ Questions adapt to candidate's responses; follow-up depth increases.

---

### ✅ T91 — Stage Advancement Logic

**Status:** COMPLETED  
**Goal:** Manage multi-stage interviews with 5–10 dynamic questions per stage.  
**Edits:** `lib/interview.ts`, `lib/scoring.ts`, `lib/schema.ts`.  
**Implementation:**

1. ✅ Added `current_stage` tracking to sessions table.
2. ✅ Implemented `shouldAdvanceStage()` with competency coverage logic.
3. ✅ Stage transitions now show toast notifications with stage name.
4. ✅ Questions are properly categorized by stage (Technical → Behavioral → Scenario).  
   **Test Result:** ✅ Multi-stage interviews transition cleanly; stage info displays correctly.

**Notes:**

- Stage names are derived from `research_snapshot.interview_config.stages`
- Free tier remains single-stage; paid tier supports 1-3 stages
- Stage advancement considers both question count and competency coverage

---

### ✅ T92 — Integrate Industry Template Dataset

**Status:** COMPLETED  
**Goal:** Connect `industry_kits.json` to research and interview generation.  
**Edits:** `lib/industry_kits.ts`, `lib/research.ts`, `lib/interview.ts`.  
**Implementation:**

1. ✅ Created comprehensive `industry_kits.ts` with 15+ industry templates.
2. ✅ Implemented role/industry classification in research snapshot generation.
3. ✅ Questions now reflect industry-specific tone and competencies.
4. ✅ Integrated templates for: Tech, Healthcare, Finance, Hospitality, Retail, etc.  
   **Test Result:** ✅ Plumber role correctly mapped to Civil Engineering kit; questions reflect industry context.

**Notes:**

- Each kit includes: styles, tone, competencies, sample topics, and stage configurations
- Fallback to generic template for unmapped industries
- Research snapshot includes `interview_config` with industry metadata

---

### ✅ T93 — Add Timer and Reveal System (UI)

**Status:** COMPLETED  
**Goal:** Simulate real interview pacing with timed question reveal.  
**Edits:** `hooks/useQuestionReveal.ts`, `components/interview/mode/TextUI.tsx`.  
**Implementation:**

1. ✅ Created `useQuestionReveal()` hook with 3-2-1 countdown → 15s reveal → hide.
2. ✅ Added "Replay Question" button (max 2 uses, extends visibility +8s each).
3. ✅ Reveal count tracked in `turns.timing.reveal_count` for scoring.
4. ✅ System disabled for small talk/confirmation turns.  
   **Test Result:** ✅ Timer functions correctly; replay extends visibility; cap enforced.

**Notes:**

- Accessibility mode disables timer/reveal system
- Replay extends current reveal window rather than restarting countdown
- Question text hides after reveal window expires

---

### ✅ T94 — "Analyzing Answer" Transition State

**Status:** COMPLETED  
**Goal:** Add immersion delay while generating next question.  
**Edits:** `components/interview/mode/TextUI.tsx`, `components/interview/mode/VoiceUI.tsx`.  
**Implementation:**

1. ✅ Added `isAnalyzing` state that shows spinner after answer submission.
2. ✅ Smooth transitions with minimum delay (500ms) for UX consistency.
3. ✅ Current question hidden during analyzing state to prevent overlap.
4. ✅ Different handling for small talk (2s delay) vs regular questions.  
   **Test Result:** ✅ Analyzing animation displays correctly; no question overlap.

---

### T95 — Context Digest & Summary Update

**Goal:** Maintain rolling summary of conversation for prompt efficiency.  
**Edits:** `lib/interview.ts`, `lib/scoring.ts`.  
**Steps:**

1. Generate short digest after each answer.
2. Update rolling summary in `sessions`.  
   **DoD:** Context stays current but compact.  
   **Test:** Log shows summary < 1KB after 10 questions.

---

### T96 — Scoring Model Update (Include Replay Penalties)

**Goal:** Adjust final scoring prompt to factor composure signals.  
**Edits:** `lib/scoring.ts`.  
**Steps:**

1. Include `reveal_count` and `replay_usage` in scoring input.
2. Slightly lower composure score if abused.  
   **DoD:** Scoring reflects realism penalties subtly.  
   **Test:** Many replays → lower composure score.

---

### T97 — UI Polish & Microcopy Update

**Goal:** Finalize immersive chat UX tone.  
**Edits:** `app/interview/[id]/page.tsx`, microcopy files.  
**Steps:**

1. Update phrasing for intro, bridge, analyzing states.
2. Align with Apple-style minimalist tone.  
   **DoD:** Conversational flow feels human and premium.  
   **Test:** End-to-end paid interview feels natural.

---

### T98 — Refactor Server Caching for Context Reuse

**Goal:** Cache research snapshot + industry context server-side.  
**Edits:** `lib/cache.ts`, `lib/research.ts`.  
**Steps:**

1. Cache per-role research snapshot.
2. Reuse if same company/role inputs appear again.  
   **DoD:** Identical roles skip redundant research calls.  
   **Test:** Same role/company setup → cache hit logged.

---

### T99 — Regression & QA Testing (Paid Interview System)

**Goal:** Validate all new flows before Phase 9.  
**Edits:** N/A (testing phase).  
**Steps:**

1. Run end-to-end tests (free & paid sessions).
2. Validate database integrity, transitions, entitlements.  
   **DoD:** No critical bugs before payments integration.  
   **Test:** QA checklist passes 100%.

## Phase 9 — Mode-Specific Interview UX & Reveal System

**Phase Status:** ✅ COMPLETED  
**Summary:** Built complete text and voice interview UX with reveal system, small-talk welcome flow, stage caps, mode-specific replay behavior, admin telemetry, and comprehensive E2E tests.

### ✅ T100 — Reveal Window & Replay-Extend

**Status:** COMPLETED  
**Goal:** Make the reveal timer functional and extend visibility when replaying.  
**Edits:** `hooks/useQuestionReveal.ts`, `components/interview/ReplayButton.tsx`.  
**Implementation:**

1. ✅ Implemented `useQuestionReveal()` hook with full state machine.
2. ✅ 20s initial reveal window; +8s extension per replay (max 2 replays).
3. ✅ `reveal_count` persisted in `turns.timing` for scoring signals.
4. ✅ Analytics events: `reveal_elapsed`, `show_again_used` tracked.  
   **Test Result:** ✅ Reveal system functional; replay cap enforced; scoring data collected.

**Notes:**

- Hook accepts `onRevealExpired` callback for analytics tracking
- Disabled for small talk and confirmation turns via null turnId
- Accessibility mode bypasses reveal system entirely

---

### ✅ T102 — Current-Question-Only Display (Both Modes)

**Status:** COMPLETED  
**Goal:** Show only the current question; hide all previous Q/As in the UI.  
**Edits:** `components/interview/mode/TextUI.tsx`, `components/interview/mode/VoiceUI.tsx`.  
**Implementation:**

1. ✅ Single-panel design showing only active turn.
2. ✅ Previous turns kept in state for backend context, not rendered.
3. ✅ Stage/progress indicator shows "Stage 1 • Q3 of 8".  
   **Test Result:** ✅ Clean single-question UI; smooth transitions between questions.

**Notes:**

- Turns array maintained for API calls and resume functionality
- Current turn tracked by `currentTurnId` state
- Analyzing state prevents overlap between questions

---

### ✅ T103 — Mode Router (Text vs Voice)

**Status:** COMPLETED  
**Goal:** Clean split between Text UI and Voice UI.  
**Edits:** `app/interview/[id]/page.tsx`.  
**Implementation:**

1. ✅ Mode router reads `session.mode` and renders appropriate UI component.
2. ✅ Shared server actions (`initializeInterview`, `submitInterviewAnswer`).
3. ✅ Distinct UI implementations for text and voice experiences.  
   **Test Result:** ✅ Text/voice modes render correctly based on session configuration.

**Notes:**

- Mode is set during setup phase and stored in sessions table
- Both UIs share: analytics tracking, session resume, auto-save
- Mode determines: question display, replay behavior, TTS handling

---

### ✅ T104 — Voice Mode "Orb" UI (No Text Questions)

**Status:** COMPLETED  
**Goal:** Conversational voice experience with auto TTS; no question text displayed.  
**Edits:** `components/interview/mode/VoiceUI.tsx`, `components/interview/VoiceOrb.tsx`.  
**Implementation:**

1. ✅ VoiceOrb component with animated states (idle/speaking/listening/processing).
2. ✅ Auto-play TTS for intro, questions, and bridges.
3. ✅ No question text rendered; purely conversational.
4. ✅ Replay button re-speaks audio without revealing text.
5. ✅ Supports both voice and text answers; minimal transcript preview.  
   **Test Result:** ✅ Hands-free voice interview flow working; orb animations smooth.

**Notes:**

- Fixed dual-audio issue on first question
- Moved state label below orb for better UX
- Graceful handling of autoplay restrictions with user interaction fallback

---

### ✅ T105 — Text Mode UI Rewrite (Current Question Focus)

**Status:** COMPLETED  
**Goal:** Refine text UI to integrate countdown, reveal, analyzing states cohesively.  
**Edits:** `components/interview/mode/TextUI.tsx`.  
**Implementation:**

1. ✅ Complete layout: header, question card with reveal system, answer composer, footer.
2. ✅ Replay button properly integrated with reveal extension.
3. ✅ Analyzing state with smooth transitions (no overlap).
4. ✅ Dynamic timing ensures perceived delay ≤1.5s.  
   **Test Result:** ✅ Polished text interview UX; all states transition smoothly.

**Notes:**

- Answer composer remains visible during reveal countdown
- Question text hidden when `isAnalyzing` is true
- Accessibility toggle disables reveal/replay system

---

### ✅ T106 — Small-Talk Welcome Flow (Pre-Interview)

**Status:** COMPLETED  
**Goal:** Welcome message and brief small talk before starting.  
**Edits:** `lib/interview.ts`, `db/migrations/009_add_turn_type.sql`.  
**Implementation:**

1. ✅ `generateSmallTalk()` creates 1-2 warm-up questions.
2. ✅ New `turn_type` column distinguishes small_talk/question/confirmation.
3. ✅ Small talk not timed, not hidden, not counted toward stage questions.
4. ✅ Confirmation turn asks "Ready to begin?" before first scored question.  
   **Test Result:** ✅ Small talk flows naturally; no timer/reveal on warm-up questions.

**Database Migration Required:**

```sql
-- Migration 009_add_turn_type.sql
ALTER TABLE turns ADD COLUMN IF NOT EXISTS turn_type TEXT DEFAULT 'question';
ALTER TABLE turns ADD CONSTRAINT check_turn_type
  CHECK (turn_type IN ('small_talk', 'question', 'confirmation'));
```

**Notes:**

- Small talk filtered from question count calculations
- Analytics tracking: `small_talk_shown`, `proceed_confirmed`
- Fixed duplicate questions issue by including all turns in generation context

---

### ✅ T107 — Stage Question Caps & Variability

**Status:** COMPLETED  
**Goal:** Limit per-stage to **max 8** and vary actual count (5–8).  
**Edits:** `lib/interview.ts`, `db/migrations/010_add_stage_targets.sql`.  
**Implementation:**

1. ✅ `generateStageTargets()` creates random distribution (5-8 per stage).
2. ✅ `stage_targets` array stored in sessions for paid multi-stage interviews.
3. ✅ Stage advancement respects variable caps.
4. ✅ Free tier maintains 3-question cap.  
   **Test Result:** ✅ Stage lengths vary between runs; never exceed 8 questions.

**Database Migration Required:**

```sql
-- Migration 010_add_stage_targets.sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS stage_targets JSON;
```

**Notes:**

- Only applies to paid multi-stage interviews
- Free tier and single-stage paid use fixed limits
- Targets generated at session creation time

---

### ✅ T108 — Replay-Driven Reveal Behavior (Mode-Specific)

**Status:** COMPLETED  
**Goal:** Align replay with visibility per mode.  
**Edits:** `components/interview/ReplayButton.tsx`, `hooks/useQuestionReveal.ts`.  
**Implementation:**

1. ✅ Text mode: replay extends reveal window +8s, tracked as `reveal_count`.
2. ✅ Voice mode: replay re-speaks audio, tracked as `replay_count`.
3. ✅ Both modes enforce 2-replay cap.  
   **Test Result:** ✅ Mode-specific replay behavior working correctly.

**Notes:**

- Text mode uses `useQuestionReveal` hook
- Voice mode manages replay count in component state
- Both counts sent to server for scoring signals

---

### ✅ T109 — Prompt & Backend Adjustments (Mode-Aware)

**Status:** COMPLETED  
**Goal:** Ensure backend prompts respect mode and small-talk.  
**Edits:** `lib/interview.ts`, `lib/scoring.ts`.  
**Implementation:**

1. ✅ `generateQuestion()` accepts `mode` parameter for TTS-optimized prompts.
2. ✅ `generateIntro()` and `generateBridge()` accept `mode` for voice optimization.
3. ✅ Scoring includes `reveal_count`, `replay_count`, `small_talk_turns`.
4. ✅ Voice mode prompts avoid long textual preambles.  
   **Test Result:** ✅ Mode-aware generation working; scoring signals included.

**Notes:**

- Mode passed from session through all generation functions
- Scoring prompt explicitly mentions new signals for LLM context
- Small talk turns filtered from scoring but included in context

---

### ✅ T110 — QA & Telemetry

**Status:** COMPLETED  
**Goal:** Validate new UX and collect metrics.  
**Edits:** `lib/analytics.ts`, `tests/e2e/interview-flow.spec.ts`, `app/admin/debug/page.tsx`, `app/api/admin/debug/route.ts`.  
**Implementation:**

1. ✅ Client-side analytics: `trackEvent()`, localStorage-based.
2. ✅ Events tracked: `small_talk_shown`, `proceed_confirmed`, `reveal_elapsed`, `show_again_used`, `orb_autoplay_ok`.
3. ✅ Playwright E2E test suite added for both text and voice modes.
4. ✅ Admin debug view at `/admin/debug` to inspect session signals and difficulty curve.  
   **Test Result:** ✅ Analytics capturing events; admin view functional; E2E tests configured.

**Notes:**

- Analytics stored in localStorage (can be extended to server-side)
- Admin debug view shows: session metadata, turn details, timing signals, difficulty adjustments
- Playwright configured with multi-browser testing

---

## Phase 10 — Post-MVP Enhancements

**Phase Status:** ✅ COMPLETED  
**Summary:** Implemented session resume system with auto-save, adaptive difficulty feedback loop with quality assessment, and low-latency question generation with dynamic timing optimization.

### ✅ T111 — Session Resume System

**Status:** COMPLETED  
**Goal:** Allow users to resume an interrupted interview seamlessly.  
**Edits:** `lib/session.ts`, `app/interview/[id]/actions.ts`, `components/interview/mode/TextUI.tsx`, `components/interview/mode/VoiceUI.tsx`, `db/migrations/011_add_resume_fields.sql`.  
**Implementation:**

1. ✅ New columns: `turn_index`, `progress_state` (JSONB), `last_activity` timestamp.
2. ✅ `saveSessionProgress()` updates state after each answer.
3. ✅ `getResumeData()` checks if interview can be resumed on reconnect.
4. ✅ Auto-save every 10 seconds via `setInterval`.  
   **Test Result:** ✅ Browser refresh resumes from current question; progress preserved.

**Database Migration Required:**

```sql
-- Migration 011_add_resume_fields.sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS turn_index INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS progress_state JSON;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Auto-update last_activity trigger
CREATE OR REPLACE FUNCTION update_sessions_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_activity = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sessions_last_activity_trigger ON sessions;
CREATE TRIGGER update_sessions_last_activity_trigger
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_last_activity();
```

**Notes:**

- `progress_state` stores: current_turn_id, last_completed_turn_id, answered_count, interview_phase
- Server actions wrap session functions to handle auth context
- Resume message shown via toast on reconnect

---

### ✅ T112 — Adaptive Difficulty Feedback Loop

**Status:** COMPLETED  
**Goal:** Dynamically adjust question difficulty based on prior answer quality.  
**Edits:** `lib/adaptive-difficulty.ts`, `lib/interview.ts`, `app/admin/debug/page.tsx`, `db/migrations/012_add_difficulty_curve.sql`.  
**Implementation:**

1. ✅ `assessAnswerQuality()` uses heuristics: length, technical terms, STAR method, examples.
2. ✅ `getAdaptiveDifficulty()` adjusts difficulty based on answer quality and interview progress.
3. ✅ `difficulty_curve` array tracks all adjustments with timestamps and reasons.
4. ✅ Admin debug view visualizes difficulty adjustments.  
   **Test Result:** ✅ Questions adapt intelligently; difficulty curve logged and visible.

**Database Migration Required:**

```sql
-- Migration 012_add_difficulty_curve.sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS difficulty_curve JSON;
```

**Notes:**

- Created separate `lib/adaptive-difficulty.ts` to avoid server/client import conflicts
- Quality assessment: strong/medium/weak based on multiple indicators
- Difficulty adjusts dynamically: early questions forgiving, mid-interview adaptive, late-interview challenging
- Each adjustment records: turn_index, previous/new difficulty, reason, answer_quality, timestamp

---

### ✅ T113 — Low-Latency / Pre-Fetch Mode

**Status:** COMPLETED  
**Goal:** Reduce waiting time between questions by pre-fetching next prompt.  
**Edits:** `app/interview/[id]/actions.ts`, `components/interview/mode/TextUI.tsx`, `components/interview/mode/VoiceUI.tsx`.  
**Implementation:**

1. ✅ Answer submission triggers immediate next-question generation.
2. ✅ Dynamic timing: minimum 500ms "Analyzing" state for UX consistency.
3. ✅ Latency tracking logs performance (target: ≤1500ms total).
4. ✅ Smooth transitions ensure no perceived lag.  
   **Test Result:** ✅ Perceived delay ≤1.5s; latency logged for monitoring.

**Notes:**

- `submitInterviewAnswer` tracks latency: `const startTime = Date.now()`
- TextUI/VoiceUI implement dynamic delay: `remainingTime = max(0, minDelay - actualLatency)`
- Console logs show actual generation time for optimization
- Warnings logged if latency exceeds 1500ms target

## Phase 11 — Immersion & Polish ### PHASE COMPLETE

### T114 — Unified TTS Voice and Playback Control

Use one consistent TTS voice across welcome, bridge, and questions.  
Prevent overlapping audio by cancelling previous `AudioContext` sources before new playback.

### T115 — Voice Interview Flow Sequencing

Implement the complete scripted flow:  
Welcome (no input) → warm-up 1 → bridge → warm-up 2 → ready-check → bridge → main intro → pause → Q1.  
Handle transitions via queued async events; confirm identical logic for text mode.

### T116 — Voice Orb Visual Polish

Replace flashing purple animation with muted-grey slow-pulse “analysis” state.  
Keep “speaking”/“listening” colours distinct but subtle.

### T117 — Flow Validation Audit (Voice)

End-to-end QA: verify single-voice playback, correct ordering, pause timing, and state recovery if user interacts mid-audio.

### T118 — Text Mode Warm-Up Integration

Apply the same welcome + small-talk + ready-check flow to text mode, sharing backend logic.

### T119 — Bridge Visibility Sync

Hide bridge text whenever its associated question hides; unhide together on replay.

### T120 — Analyzing UI Redesign

Minimalist fade-in/out animation with subtle spinner or three-dot pulse.  
Ensure total transition ≈ 0.5–1 s for smoothness.

### T121 — Countdown Auto-Advance

On timer expiry, auto-submit current answer (blank if none) and move to next question.  
Show toast “Time’s up – moving on”.

### T122 — Checklist Centering

Center the dynamic checklist animation on the “Setting Up Interview” screen (flexbox + justify/align center).

### T123 — Hide Question Counter

Remove “Question X of Y” from both UIs; retain internal progress tracking only.

## Phase 12 — Experience & Marketing Enhancements ✅ COMPLETED

### T124 — Greeting Separation (Fix Warm-Up Flow) ✅

**Status:** COMPLETED  
**Commits:** `fix(T124): Implement greeting separation for text/voice interviews`

Split the **greeting** and **first warm-up** turns in both text and voice interviews.  
Greeting = solo message (no answer box); after "Start Interview" button, render first warm-up question.  
Voice mode automatically reads greeting then transitions to warm-up 1.

**Implementation:**
- Added `showWelcomeScreen` state to both `TextUI.tsx` and `VoiceUI.tsx`
- Welcome screen displays intro text with dedicated UI (blue gradient card)
- "Start Interview" button dismisses welcome and shows first question
- Voice mode auto-plays intro TTS, then hides welcome and plays first question
- Fixed JSX structure issues with conditional rendering

**Files Modified:**
- `components/interview/mode/TextUI.tsx`
- `components/interview/mode/VoiceUI.tsx`

---

### T125 — "Thinking" State Label ✅

**Status:** COMPLETED  
**Commits:** `fix(T125): Replace Processing with Thinking state`

Replace all UI text and orb labels showing "Processing" → "Thinking."  
Renamed state internally to `thinking` for consistency.

**Implementation:**
- Changed `OrbState` type from `'processing'` to `'thinking'`
- Updated all `setOrbState('processing')` → `setOrbState('thinking')`
- Changed orb visual label from "Processing..." to "Thinking..."
- Updated color scheme for thinking state (muted purple with slow pulse)

**Files Modified:**
- `components/interview/VoiceOrb.tsx`
- `components/interview/mode/VoiceUI.tsx`

---

### T126 — Countdown Timer for Voice Mode ✅

**Status:** COMPLETED  
**Commits:** `feat(T126): Add countdown timer for voice mode`

Add countdown timer identical to text mode, triggered **after TTS playback ends**.  
Only active during main interview (not warm-ups).  
When timer = 0 → auto-advance to next question (submit blank if needed).

**Implementation:**
- Added `timerStartTime` and `isTimerActive` state to `VoiceUI`
- Timer starts in `playQuestionTTS` onEnd callback for main questions only
- `TimerRing` component displays next to orb during active timer
- Auto-submit with blank answer on expiration via `handleTimerExpire`
- Manual submission stops the timer

**Files Modified:**
- `components/interview/mode/VoiceUI.tsx`

---

### T127 — Orb Playback Guards ✅

**Status:** COMPLETED  
**Commits:** `feat(T127): Implement AudioController for playback management`

Introduce global `AudioController` to cancel previous TTS before starting new audio.  
Block double play calls within 500 ms; log state changes for QA.

**Implementation:**
- Created `lib/audioController.ts` with singleton pattern
- `AudioController.stop()` cancels all previous audio before new playback
- Debounce delay of 500ms prevents rapid double-play calls
- Console logs for all state changes: `[AudioController] All audio stopped.`
- Used in `playTextToSpeech`, `playQuestionTTS`, and `handleReplay`

**Files Created:**
- `lib/audioController.ts`

**Files Modified:**
- `components/interview/mode/VoiceUI.tsx`

---

### T128 — Question Limit Per Section (User-Configurable) ✅

**Status:** COMPLETED  
**Commits:** `feat(T128): Add configurable questions per stage`

Add "Max Questions Per Stage" field (1–10) to setup form.  
Backend: `upper = userLimit`; `lower = upper > 3 ? upper - 2 : upper`;  
randomize count between lower and upper.  
Persist in `stage_targets`; end interview once limit reached.

**Implementation:**
- Added "Questions Per Stage" range input (1-10) to setup form (Pro users only)
- Default: 3 for free, 7 for paid
- Backend generates `stageTargets` array with randomized values
- Each stage gets random questions between `lower` and `upper` bounds
- Saved in `sessions.stage_targets` column
- Dynamic `question_cap` based on `questionsPerStage * stagesPlanned`

**Files Modified:**
- `components/forms/IntakeForm.tsx`
- `app/setup/actions.ts`

---

### T129 — Landing Page Redesign (Apple-Style Hero) ✅

**Status:** COMPLETED  
**Commits:** `feat(T129): Redesign landing page with Apple-style hero`

Rebuild `/app/(marketing)/page.tsx` with modern Apple-like aesthetic:

- Hero: "Prepare for real interviews with AI trained on S&P 500 companies."
- CTAs: **Start Free Interview** and **Upgrade to Full Simulation**.
- Three-step "Upload → Research → Interview" section.
- Feature blocks for Voice/Text modes and adaptive difficulty.
- Testimonials & final CTA.  
  Use Framer Motion for smooth section transitions.

**Implementation:**
- Complete rebuild of landing page with modern design
- Hero section with gradient background and dual CTAs
- 3-step visual process (Upload → Research → Interview)
- Feature blocks with icons (Voice/Text modes, Adaptive Difficulty, Multi-Stage, Smart Research, Detailed Reports)
- Testimonials section with 3 sample entries
- Fixed ESLint errors (unescaped quotes → HTML entities)

**Files Modified:**
- `app/page.tsx`

---

### T130 — Landing Page Copy & CTAs ✅

**Status:** COMPLETED  
**Commits:** `feat(T130): Add landing page SEO and CTAs`

Add clear descriptive copy and SEO meta:

- Headline, sub-text, meta description.
- "Start your free interview today" button linking to `/setup`.

**Implementation:**
- Updated page metadata for SEO
- Headline: "Ace Your Next Interview"
- Sub-text: "Practice with AI-powered mock interviews..."
- Meta description optimized for search
- CTA buttons link to `/setup` with clear messaging
- Added descriptive copy for all feature sections

**Files Modified:**
- `app/page.tsx`

---

### Phase 12 Additional Fixes

#### Stage Header Updates + Pro Interview End Flow ✅

**Commits:** `fix: update stage header + correct pro interview end flow (Phase 12)`

**Issues Fixed:**
1. **Stage Header Not Updating:** Added console logging for stage transitions and ensured reactive updates
2. **Pro Users See Free Plan Modal:** Fixed conditional logic to skip upgrade dialog for pro users

**Implementation:**
- Backend returns `planTier` in all `submitAnswer` responses
- Console logs stage changes: `[Interview] Stage advanced to: 2 of 3 (Technical Deep Dive)`
- Pro users redirect directly to report with toast notification
- Free users still see upgrade dialog at 3-question limit
- Stage header updates reactively in both Text and Voice UIs

**Files Modified:**
- `lib/interview.ts`
- `components/interview/mode/TextUI.tsx`
- `components/interview/mode/VoiceUI.tsx`

---



## Phase 13 — Hormozi Offer System: Tiered Payments & Value Stacking

### 🎯 Overview
We’re upgrading InterviewLab’s monetization into a **tiered offer system** inspired by **Alex Hormozi’s “$100M Offers”** principles.  
The goal is to maximize perceived value, drive conversions, and clearly communicate the benefits of upgrading versus staying on the free plan.

---

### 🪜 Value Framework
**Value = (Dream Outcome × Perceived Likelihood of Achievement) / (Time Delay × Effort & Sacrifice)**

| Lever | InterviewLab Application |
|--------|--------------------------|
| **Dream Outcome** | Land your dream job faster by practicing realistic interviews trained on S&P 500 companies. |
| **Perceived Likelihood of Achievement** | Proven AI trained on real interview data + adaptive feedback engine. |
| **Time Delay** | Instant start — upload CV → start in 60 seconds. |
| **Effort & Sacrifice** | Minimal input: everything is automated. |

---

### 💎 Tiers and Pricing

| Tier | Name | Price | Currency | What It Delivers |
|------|------|--------|-----------|------------------|
| **Free Plan** | “Practice Mode” | $0 | — | 1 stage, 3 questions, text-only interview, basic feedback. |
| **Starter Pack** | “Kickstart Plan (3 Interviews)” | $26.99 | USD | 3 full premium interviews + voice mode + detailed feedback reports. |
| **Professional Pack** | “Career Builder (5 Interviews)” | $39.99 | AUD | Adds multi-stage mode, adaptive difficulty, and advanced feedback analytics. |
| **Elite Pack** | “Dream Job Pack (10 Interviews)” | $49.99 | AUD | Adds priority AI engine, deeper industry simulation, and confidence score report. |

---

### ⚖️ Comparison Table — Free vs Paid

| Feature | Free Plan | Starter | Professional | Elite |
|----------|-----------|----------|---------------|--------|
| Interview Count | 1 × (3 Q) | 3 | 5 | 10 |
| Voice Mode | ✗ | ✓ | ✓ | ✓ |
| Full Feedback Report | Basic | ✓ | ✓ | ✓ |
| Multi-Stage Interviews | ✗ | ✗ | ✓ | ✓ |
| Adaptive Difficulty | ✗ | ✓ | ✓ | ✓ |
| Priority AI Engine | ✗ | ✗ | ✗ | ✓ |
| Confidence Score Report | ✗ | ✗ | ✗ | ✓ |
| Price | Free | $26.99 USD | $39.99 AUD | $49.99 AUD |

**Key Copy Angle:**  
“Free is for testing — Premium is for transforming.”

---

## 🧩 Backend Implementation

### **T132 — Stripe Products & Price Setup**
Create Stripe products & price IDs for each pack:  
- `pack_starter_3` ($26.99 USD)  
- `pack_pro_5` ($39.99 AUD)  
- `pack_elite_10` ($49.99 AUD)  
Store in `.env` and map to `purchase_type`.

### **T133 — Entitlement Schema Upgrade**
Extend `entitlements` table:
```sql
ALTER TABLE entitlements
ADD COLUMN remaining_interviews INT DEFAULT 0,
ADD COLUMN tier TEXT CHECK (tier IN ('starter','professional','elite')),
ADD COLUMN purchase_type TEXT,
ADD COLUMN perks JSONB DEFAULT '{}'::jsonb;
```
- When a purchase completes, increment or create entitlement for that user.  
- Example: buying 5-pack with 2 left → 7 remaining.

### **T134 — Stripe Checkout Flow + Webhook**
- Implement `/api/checkout/session` → Stripe Checkout Session based on selected tier.  
- On `checkout.session.completed` (webhook):  
  - Verify signature.  
  - Grant entitlement (remaining_interviews += tier_count).  
  - Store `purchase_type`, `stripe_session_id`, and `currency`.

### **T135 — Credit Tracking + Consumption**
- Guard `createSession()` → reject if `remaining_interviews <= 0`.  
- On interview completion: `remaining_interviews –= 1`.  
- Log consumption in `entitlement_history` table.  
- If balance = 0 → trigger “Buy More” prompt.

### **T136 — Entitlement Summary Endpoint**
Expose `/api/user/entitlements` to return:
```json
{
  "tier": "professional",
  "remaining_interviews": 3,
  "perks": { "multi_stage": true, "priority_ai": false }
}
```

---

## 💻 Frontend Implementation

### **T137 — Pricing Page + Offer Stack UI**
Rebuild `/app/(marketing)/pricing/page.tsx`:
- Three animated tier cards with Framer Motion.  
- Feature comparison table (Free vs Paid).  
- Highlight “Most Popular” Professional tier.  
- CTAs → `/api/checkout/session?packType=…`.

### **T138 — Upgrade Modal Rework**
Replace existing UpgradeDialog with value-stacked copy:
> “Unlock 10 interviews, priority AI feedback, and multi-stage simulations.”  
Add pricing cards inline.

### **T139 — Entitlement Counter + Zero Balance UX**
- Show remaining interviews on dashboard & navbar.  
- If balance = 0 → disable “Start Interview” button + display:  
  > “You’ve used all your interviews — purchase another pack to continue.”  
- CTA → Pricing page.

### **T140 — Thank You & Upsell Flows**
- After purchase → show confirmation:  
  > “Welcome to the Elite Pack — 10 interviews unlocked.”  
- After interview completion → upsell modal if balance < 2.  
- Add bonus copy: “Upgrade to Elite for Priority Feedback & Confidence Report.”

---

## 🧠 Technical Notes
- Implement per-tier perks via `perks` JSONB object.  
- Use `currency` field for multi-currency logic.  
- Add QA logs: `[Entitlement] Remaining: x (Tier: pro)`.


## Phase 14 — Production Hardening

### T118 — Security Headers

**Goal:** Baseline security.  
**Edits:** `next.config.mjs`, middleware for CSP/HSTS.  
**DoD:** Security headers present.  
**Test:** Observatory score improved.

### T119 — Rate Limiting

**Goal:** Abuse protection.  
**Edits:** `lib/rate-limit.ts` (Supabase or Redis-based)  
**DoD:** IP+user limits on interview routes.  
**Test:** Exceeding rate returns 429.

### T120 — Logging & Error Handling

**Goal:** Insight + stability.  
**Edits:** `lib/log.ts`, try/catch in API/actions.  
**DoD:** Structured logs (PII redacted), central handler.  
**Test:** Errors logged with request id.

### T121 — Basic Analytics

**Goal:** Usage tracking.  
**Edits:** PostHog or Plausible integration.  
**DoD:** Events: session start, question asked, answer submitted, interview complete.  
**Test:** Events visible on dashboard.

### T122 — Accessibility Pass

**Goal:** WCAG baseline.  
**Edits:** aria labels, focus rings, captions.  
**DoD:** axe audit: 0 critical issues.  
**Test:** Keyboard-only flow works.

### T123 — Mobile Polish

**Goal:** UX on small screens.  
**Edits:** responsive adjustments, fixed action bar.  
**DoD:** iPhone/Android emulate clean; no overflow or clipped buttons.  
**Test:** Manual pass on DevTools.

### T124 — Seed Data & Fixtures

**Goal:** Reliable demos.  
**Edits:** `db/seed.ts`  
**DoD:** Seed RoleKits and demo session.  
**Test:** Run seed and load demo.

### T125 — Staging Deploy

**Goal:** End-to-end testbed.  
**Steps:** Create staging Supabase, Storage, envs; deploy to Vercel preview.  
**DoD:** Staging URL functional.  
**Test:** Full run of short interview.

### T126 — Prod Deploy

**Goal:** Go-live.  
**Steps:** Set prod env vars, Storage buckets, domain, analytics.  
**DoD:** Production URL live.  
**Test:** Real sign-in → short interview → report.

---

## Appendix — Env Vars (Example)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=
```

## Appendix — Manual Test Script (Happy Path)

1. Sign up → `/setup` visible.
2. Upload CV (PDF) + Job Spec (PNG) + fill job/company/location.
3. Start setup → see progress steps → “Ready to start.”
4. Start interview → hear TTS Q1 → answer by text → next question appears.
5. Answer by audio → transcript shows → Q3 appears.
6. On Free plan, attempt Q4 → hit upgrade gate.
7. Force complete → generate feedback → report renders with scores.
8. Download PDF.
9. Sign out; sign back in → report persists.

---

> End of MVP plan.
