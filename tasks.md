
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
3. Add `.gitignore` (node_modules, .env*, .next).  
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

## Phase 9 — Payments (Optional for MVP)

### T90 — Pricing UI + Upgrade Dialog
**Goal:** Trigger upgrade.  
**Edits:** `components/UpgradeDialog.tsx`, `app/(marketing)/page.tsx`  
**DoD:** Button opens dialog with plan details.  
**Test:** Dialog appears.

### T91 — Stripe Checkout Session
**Goal:** Create session.  
**Edits:** `app/api/stripe/session/route.ts`  
**DoD:** Returns Stripe URL for user.  
**Test:** Clicking “Upgrade” redirects to Stripe.

### T92 — Webhook & Plan Update
**Goal:** Persist plan.  
**Edits:** `app/api/stripe-webhook/route.ts`  
**DoD:** On successful payment, update `profiles.plan`.  
**Test:** Webhook test event updates DB.

### T93 — Gate by Plan
**Goal:** Enforce limits.  
**Edits:** `lib/interview.ts`  
**DoD:** Free/Pro/Premium limits respected server-side.  
**Test:** Plan changes take effect immediately.

---

## Phase 10 — Production Hardening

### T100 — Security Headers
**Goal:** Baseline security.  
**Edits:** `next.config.mjs`, middleware for CSP/HSTS.  
**DoD:** Security headers present.  
**Test:** Observatory score improved.

### T101 — Rate Limiting
**Goal:** Abuse protection.  
**Edits:** `lib/rate-limit.ts` (Supabase or Redis-based)  
**DoD:** IP+user limits on interview routes.  
**Test:** Exceeding rate returns 429.

### T102 — Logging & Error Handling
**Goal:** Insight + stability.  
**Edits:** `lib/log.ts`, try/catch in API/actions.  
**DoD:** Structured logs (PII redacted), central handler.  
**Test:** Errors logged with request id.

### T103 — Basic Analytics
**Goal:** Usage tracking.  
**Edits:** PostHog or Plausible integration.  
**DoD:** Events: session start, question asked, answer submitted, interview complete.  
**Test:** Events visible on dashboard.

### T104 — Accessibility Pass
**Goal:** WCAG baseline.  
**Edits:** aria labels, focus rings, captions.  
**DoD:** axe audit: 0 critical issues.  
**Test:** Keyboard-only flow works.

### T105 — Mobile Polish
**Goal:** UX on small screens.  
**Edits:** responsive adjustments, fixed action bar.  
**DoD:** iPhone/Android emulate clean; no overflow or clipped buttons.  
**Test:** Manual pass on DevTools.

### T106 — Seed Data & Fixtures
**Goal:** Reliable demos.  
**Edits:** `db/seed.ts`  
**DoD:** Seed RoleKits and demo session.  
**Test:** Run seed and load demo.

### T107 — Staging Deploy
**Goal:** End-to-end testbed.  
**Steps:** Create staging Supabase, Storage, envs; deploy to Vercel preview.  
**DoD:** Staging URL functional.  
**Test:** Full run of short interview.

### T108 — Prod Deploy
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
