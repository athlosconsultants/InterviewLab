# InterviewLab — MVP Task Plan (One-Concern, Testable Steps)

> Guiding rules: Complete tasks **in order**, one at a time. Each task is tiny, has a clear start/end, and is testable. Keep sensitive data server-side. Use Next.js (TypeScript, App Router) + Tailwind + shadcn/ui + Supabase (Auth, Postgres, Storage).

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

### T84 — Add Paid Tier Configuration

**Goal:** Introduce paid-tier interview configuration with mode (text/voice) and stage selection.  
**Edits:** `app/setup/page.tsx`, `app/setup/actions.ts`, `sessions` schema.  
**Steps:**

1. Update setup form to include mode toggle and stage selector (1–3).
2. Save these fields in `sessions` (`mode`, `stages_planned`, `plan_tier`).
3. Default free users to text-only, 1-stage, 3-question limit.  
   **DoD:** Session row persists new fields; UI displays them correctly.  
   **Test:** Create both free and paid sessions; verify mode and stage fields stored.

---

### T85 — Implement Free vs Paid Restrictions

**Goal:** Limit free users to 3 questions, disable voice and multi-stage.  
**Edits:** `app/interview/[id]/actions.ts`, `lib/interview.ts`.  
**Steps:**

1. Add logic to enforce question cap for free sessions.
2. Hide voice/multi-stage options in UI when `plan_tier='free'`.  
   **DoD:** Free users stop at 3 questions; upgrade prompt triggers.  
   **Test:** Free user attempts 4th question → blocked.

---

### T86 — Add Entitlement Logic (Paid Interview Package)

**Goal:** Implement one-off purchase entitlement to unlock paid session.  
**Edits:** `lib/payments.ts`, `lib/supabase-server.ts`, `lib/interview.ts`.  
**Steps:**

1. Create `entitlements` table (type='interview_package').
2. Consume entitlement when starting paid session.
3. Link `entitlement_id` to session.  
   **DoD:** Entitlement consumed on use; cannot reuse.  
   **Test:** Attempt to start two paid sessions with one entitlement → fail.

---

### T87 — Enhance Research for Role→Industry Mapping

**Goal:** Improve research quality by mapping roles to industry templates.  
**Edits:** `lib/research.ts`, `lib/industryMap.ts`.  
**Steps:**

1. Implement fuzzy role classifier → load `industry_kit`.
2. Enrich `research_snapshot` with `interview_style`, `competencies`, and `tone`.  
   **DoD:** Snapshot contains accurate, role-appropriate context.  
   **Test:** Bartender → Hospitality kit; Project Manager → Construction kit.

---

### T88 — Add Interview Introduction Generator

**Goal:** Generate realistic, role-specific introductions for paid interviews.  
**Edits:** `lib/interview.ts`, `openai.ts`.  
**Steps:**

1. Add `generateIntro(sessionId)` LLM call using role/company context.
2. Save `intro_text` and mark `intro_done=true`.  
   **DoD:** Paid interviews start with natural intro text.  
   **Test:** Verify intro references role/company.

---

### T89 — Add Bridge Generator Between Questions

**Goal:** Improve realism with bridges referencing previous answers.  
**Edits:** `lib/interview.ts`.  
**Steps:**

1. Create `generateBridge(sessionId, lastTurnId)`.
2. Summarize previous answer → feed into prompt → store `bridge_text`.  
   **DoD:** Bridges reference candidate’s last answer contextually.  
   **Test:** Check conversation continuity.

---

### T90 — Context-Aware Question Generation

**Goal:** Generate next question dynamically using previous answers.  
**Edits:** `lib/interview.ts`.  
**Steps:**

1. Extend question generation prompt to include `answer_digest_last`.
2. Adjust difficulty and topic coverage progressively.  
   **DoD:** Questions adapt logically to user’s prior responses.  
   **Test:** Answers mentioning leadership → next question probes leadership deeper.

---

### T91 — Stage Advancement Logic

**Goal:** Manage multi-stage interviews with 5–10 dynamic questions per stage.  
**Edits:** `lib/interview.ts`, `lib/scoring.ts`.  
**Steps:**

1. Track per-stage question counts and competencies covered.
2. Advance stage after threshold or coverage complete.  
   **DoD:** Session transitions cleanly between stages.  
   **Test:** Stage 1 ends after ~7 questions → Stage 2 begins.

---

### T92 — Integrate Industry Template Dataset

**Goal:** Connect `industry_kits.json` to research and interview generation.  
**Edits:** `lib/industry_kits.json`, `lib/research.ts`, `lib/interview.ts`.  
**Steps:**

1. Import JSON mapping for industry/role question context.
2. Use to seed tone, competencies, and example topics.  
   **DoD:** Questions reflect industry-specific tone and depth.  
   **Test:** Tech roles get technical/behavioral tone; Hospitality gets scenario-based.

---

### T93 — Add Timer and Reveal System (UI)

**Goal:** Simulate real interview pacing with timed question reveal.  
**Edits:** `app/interview/[id]/page.tsx`.  
**Steps:**

1. Add 3–2–1 countdown → show question for 15s → hide.
2. Add limited “Show Again” button (max 2 uses).  
   **DoD:** Timer and reveal counter function correctly.  
   **Test:** Verify reveal limit triggers after two uses.

---

### T94 — “Analyzing Answer” Transition State

**Goal:** Add immersion delay while generating next question.  
**Edits:** `app/interview/[id]/page.tsx`.  
**Steps:**

1. After answer submit → show spinner “Analyzing answer…”.
2. Hide once new question received.  
   **DoD:** UI pauses realistically between questions.  
   **Test:** Delay visible before next question.

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

### T100 — Reveal Window & Replay-Extend

**Goal:** Make the reveal timer functional and extend visibility when replaying.  
**Edits:** `app/interview/[id]/page.tsx`, `components/interview/QuestionReveal.tsx`, `components/interview/ReplayButton.tsx`.  
**Steps:**

1. Implement `useQuestionReveal()` hook to manage states: `preCountdown(3s) → revealed(for N seconds) → hidden`.
2. Default **N = 20s** for the first reveal. On **Replay**, extend current visible window by **+8s** (max 2 replays).
3. Persist `reveal_count` per turn; expose in `turns.timing` (server) for scoring.
4. Emit events: `reveal_started`, `reveal_hidden`, `replay_used` for analytics.  
   **DoD:** Question text hides after reveal window; each replay extends visibility by 8s (up to 2x).  
   **Test:** Manual: countdown→reveal→auto-hide; pressing replay twice extends and respects cap.

---

### T102 — Current-Question-Only Display (Both Modes)

**Goal:** Show only the current question; hide all previous Q/As in the UI.  
**Edits:** `components/interview/ChatThread.tsx`, `app/interview/[id]/page.tsx`.  
**Steps:**

1. Replace thread list with a **single panel** rendering the active turn only.
2. Keep prior turns in memory for backend context, but do **not** render them.
3. Add a small “Section”/“Stage” label to indicate progress (e.g., “Stage 1 • Q3”).  
   **DoD:** UI only shows the current question and the answer composer.  
   **Test:** After answering, prior Q/A disappear; next question replaces panel.

---

### T103 — Mode Router (Text vs Voice)

**Goal:** Clean split between Text UI and Voice UI.  
**Edits:** `app/interview/[id]/page.tsx`, `components/interview/mode/VoiceUI.tsx`, `components/interview/mode/TextUI.tsx`.  
**Steps:**

1. Read `session.mode` and render **TextUI** or **VoiceUI**.
2. Share common service hooks (fetch turns, submit answers), keep **distinct** UIs.  
   **DoD:** Mode switch verified via session setting.  
   **Test:** Start two sessions (text/voice); correct UI renders.

---

### T104 — Voice Mode “Orb” UI (No Text Questions)

**Goal:** Conversational voice experience with auto TTS; no question text displayed.  
**Edits:** `components/interview/mode/VoiceUI.tsx`, `app/api/tts/route.ts`.  
**Steps:**

1. Build **VoiceOrb** component (idle → greet → speak → listen → bridge) with subtle pulse animation.
2. Auto-play TTS for every intro, bridge, and question **without user click** (use `AudioContext`/`autoplay` handling; gracefully prompt for interaction if blocked).
3. Do **not** render question text; only the orb, mic button, and optional **“Type your answer”** control.
4. On “Replay”, re-speak via TTS; **do not** reveal text.
5. Accept voice or text answers; show minimal transcript chip (may auto-hide after submit).  
   **DoD:** Voice interview flows hands-free; questions are spoken, never shown as text.  
   **Test:** Start paid voice session → hear greeting → hear Q1 → answer by voice → hear bridge → Q2.

---

### T105 — Text Mode UI Rewrite (Current Question Focus)

**Goal:** Refine text UI to integrate countdown, reveal, analyzing states cohesively.  
**Edits:** `components/interview/mode/TextUI.tsx`, `components/interview/QuestionReveal.tsx`, `components/interview/AnalyzingState.tsx`.  
**Steps:**

1. Layout: header (stage + progress), **Question card** (countdown → reveal window → hidden), **Answer composer**, footer (actions).
2. Add “Show Again” button (max 2) which re-reveals text for **5s** each time.
3. Add explicit **“Analyzing answer…”** state after submit until next question arrives.  
   **DoD:** Smooth flow: countdown → reveal → hidden → compose → analyzing → next.  
   **Test:** UX demo run; show-again capped at 2; analyzing spinner visible.

---

### T106 — Small-Talk Welcome Flow (Pre-Interview)

**Goal:** Welcome message and brief small talk before starting.  
**Edits:** `lib/interview.ts`, `app/interview/[id]/page.tsx`.  
**Steps:**

1. Add `generateSmallTalk(sessionId)` to produce 1–2 light prompts (“Tell me a bit about you”, “How’s your day going?”).
2. Render **welcome** → **small talk**; then ask, “Ready to begin the interview?” with Yes/No.
3. Do **not** count small talk toward stage question totals.  
   **DoD:** Welcome and small-talk appear before Q1; user confirms to proceed.  
   **Test:** Small talk saved as non-scored turns; Q1 begins after confirm.

---

### T107 — Stage Question Caps & Variability

**Goal:** Limit per-stage to **max 8** and vary actual count (5–8).  
**Edits:** `lib/interview.ts`.  
**Steps:**

1. Set `QUESTIONS_PER_STAGE: { min: 5, max: 8 }` for paid sessions.
2. On stage start, sample a target in range; track and enforce cap.
3. Ensure categories/competencies coverage within shorter window.  
   **DoD:** Stages finish between 5–8 questions, not always the same count.  
   **Test:** Multiple runs show varying per-stage totals; never exceed 8.

---

### T108 — Replay-Driven Reveal Behavior (Mode-Specific)

**Goal:** Align replay with visibility per mode.  
**Edits:** `components/interview/ReplayButton.tsx`, `components/interview/QuestionReveal.tsx`, `lib/interview.ts`.  
**Steps:**

1. **Text mode:** replay increments `reveal_count` and extends visible window by +8s; “Show Again” still capped at 2.
2. **Voice mode:** replay triggers orb to re-speak; no text revealed. Track `replay_count` for scoring.  
   **DoD:** Replay semantics differ by mode as specified.  
   **Test:** Voice replay re-speaks only; Text replay extends visibility.

---

### T109 — Prompt & Backend Adjustments (Mode-Aware)

**Goal:** Ensure backend prompts respect mode and small-talk.  
**Edits:** `lib/interview.ts`, `lib/scoring.ts`.  
**Steps:**

1. For **voice mode**, avoid returning long textual preambles; keep `question_text` for TTS only, never sent to UI.
2. Include `reveal_count`, `replay_count`, and `small_talk_turns` in scoring signals.
3. Ensure bridges/intro are **spoken** in voice mode (no text assumptions).  
   **DoD:** Prompts produce mode-appropriate content; scoring uses new signals.  
   **Test:** Prompt logs reflect mode flags; scoring JSON includes new fields.

---

### T110 — QA & Telemetry

**Goal:** Validate new UX and collect metrics.  
**Edits:** `lib/analytics.ts`, e2e tests.  
**Steps:**

1. Track events: `small_talk_shown`, `proceed_confirmed`, `reveal_elapsed`, `show_again_used`, `orb_autoplay_ok`.
2. Add Cypress/Playwright tests for both modes.
3. Create a basic **admin debug view** to inspect session timing signals.  
   **DoD:** Tests pass; key metrics visible.  
   **Test:** Run e2e on text + voice happy paths.

---

## Phase 10 — Post-MVP Enhancements

### T111 — Session Resume System

**Goal:** Allow users to resume an interrupted interview seamlessly.  
**Edits:** `lib/interview.ts`, `lib/session.ts`, `app/interview/[id]/page.tsx`.  
**Steps:**

1. Track `turn_index`, `current_stage`, and `progress_state` in `sessions`.
2. When user reconnects, load latest turn and resume flow.
3. Auto-save every 10 s or on each answer submission.  
   **DoD:** User can refresh or reconnect without losing context.  
   **Test:** Start interview, refresh browser → resume from same question.

---

### T112 — Adaptive Difficulty Feedback Loop

**Goal:** Dynamically adjust question difficulty based on prior answer quality.  
**Edits:** `lib/interview.ts`, `lib/scoring.ts`.  
**Steps:**

1. Use interim scoring or keyword match to classify last answer as “strong / medium / weak”.
2. Adjust next question difficulty accordingly (harder for strong answers, easier for weak).
3. Track `difficulty_curve` in `sessions`.  
   **DoD:** Question difficulty responds intelligently to candidate performance.  
   **Test:** Multiple runs show adaptive variation; logged difficulty_curve reflects adjustments.

---

### T113 — Low-Latency / Pre-Fetch Mode

**Goal:** Reduce waiting time between questions by pre-fetching next prompt.  
**Edits:** `lib/interview.ts`, `app/interview/[id]/page.tsx`.  
**Steps:**

1. After answer submission, immediately trigger next-question generation in background.
2. Cache `next_question_preview` while showing “Analyzing answer…” state.
3. When ready, replace analyzing view instantly with next question.  
   **DoD:** Perceived delay between questions ≤ 1.5 s.  
   **Test:** Network logs show next-question API pre-called; UI transition smooth.

## Phase 11 — Payments (Optional for MVP)

### T114 — Pricing UI + Upgrade Dialog

**Goal:** Trigger upgrade.  
**Edits:** `components/UpgradeDialog.tsx`, `app/(marketing)/page.tsx`  
**DoD:** Button opens dialog with plan details.  
**Test:** Dialog appears.

### T115 — Stripe Checkout Session

**Goal:** Create session.  
**Edits:** `app/api/stripe/session/route.ts`  
**DoD:** Returns Stripe URL for user.  
**Test:** Clicking “Upgrade” redirects to Stripe.

### T116 — Webhook & Plan Update

**Goal:** Persist plan.  
**Edits:** `app/api/stripe-webhook/route.ts`  
**DoD:** On successful payment, update `profiles.plan`.  
**Test:** Webhook test event updates DB.

### T117 — Gate by Plan

**Goal:** Enforce limits.  
**Edits:** `lib/interview.ts`  
**DoD:** Free/Pro/Premium limits respected server-side.  
**Test:** Plan changes take effect immediately.

---

## Phase 12 — Production Hardening

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
