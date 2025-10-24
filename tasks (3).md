# InterviewLab — MVP Build Plan (Granular, One-Concern Tasks)

**Scope:** Implements the New Entry System (Complimentary 3‑question assessment) alongside existing Premium flow. Includes **cleanup** of redundant features.  
**Principles:** Each task is tiny, testable, and has a clear start → end. Execute sequentially unless marked parallel.

---

## Phase 0 — Repo Hygiene & Baseline (4 tasks)

**T00. Create feature branch**

- **Start:** none → create branch
- **Do:** `git checkout -b feat/new-entry-system`
- **End/Verify:** `git status` shows new branch; pushed to remote

**T01. Pin env contracts**

- **Start:** `/env.example` exists
- **Do:** Add keys used in plan (OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, TURNSTILE_SECRET, STRIPE_KEYS). Add comments for purpose.
- **End/Verify:** `env.example` contains all keys; CI passes dotenv load

**T02. Add gradient tokens + base styles**

- **Start:** Tailwind configured
- **Do:** Update `styles/globals.css` and Tailwind config for brand gradient tokens used by new pages
- **End/Verify:** Running dev shows gradient utility classes available (`bg-brand-gradient` etc.)

**T03. Introduce lightweight event tracker shim**

- **Start:** none
- **Do:** Add `components/analytics/Track.tsx` + `lib/analytics.ts` no‑op with console in dev
- **End/Verify:** Using `<Track name="funnel_start" />` logs event in dev console

---

## Phase 1 — Database & Security (10 tasks)

**T10. Create migration: device_fingerprints**

- **Start:** no table
- **Do:** SQL migration for `device_fingerprints(id, user_id, device_hash, created_at, unique(user_id,device_hash))`
- **End/Verify:** `supabase db push`; table exists

**T11. Update sessions schema**

- **Start:** sessions table present
- **Do:** Add/alter fields: `plan_tier text`, `stages_planned jsonb`, `questions_limit int`, `context_memory bool`, `voice_playback text`, `voice_input bool`
- **End/Verify:** Columns exist with defaults for existing rows

**T12. Update results schema for partials**

- **Start:** results table present
- **Do:** Add fields: `communication_score int`, `locked_metrics jsonb`, `report_locked bool default true`
- **End/Verify:** Columns exist; default values set

**T13. Add events table (optional)**

- **Start:** none
- **Do:** Create `events(id, user_id, session_id, name, payload, created_at)`
- **End/Verify:** Table exists; RLS ready

**T14. RLS policies — sessions**

- **Start:** sessions policies exist
- **Do:** Ensure `user_id = auth.uid()` for select/insert/update; allow server role policy for actions
- **End/Verify:** Unauthorized select blocked in SQL test; server role can write

**T15. RLS policies — turns/results/device_fingerprints/events**

- **Start:** mixed
- **Do:** Add similar `user_id = auth.uid()` policies
- **End/Verify:** Manual SQL tests pass

**T16. Seed warm‑up prompt bank**

- **Start:** none
- **Do:** Create `db/seed.ts` to insert handful of warm‑up prompts
- **End/Verify:** `node db/seed.ts` populates rows

**T17. Add DB types file**

- **Start:** none
- **Do:** `lib/schema.ts` with types for sessions/turns/results/device_fingerprints
- **End/Verify:** Type imports compile

**T18. Supabase server client**

- **Start:** may exist
- **Do:** Confirm/create `lib/supabase-server.ts` (service role safe use within server actions)
- **End/Verify:** Unit stub compiles; can select current user with RLS

**T19. Supabase browser client**

- **Start:** may exist
- **Do:** Confirm/create `lib/supabase-client.ts` (anon key only)
- **End/Verify:** Client initializes in browser without service key

---

## Phase 2 — Anti‑Abuse & Bot Protection (7 tasks)

**T20. Turnstile verify API route**

- **Start:** none
- **Do:** `app/api/turnstile-verify/route.ts` POST → verifies token server‑side
- **End/Verify:** cURL returns `{ok:true}` for valid test token

**T21. Device hash helper**

- **Start:** none
- **Do:** `lib/antiabuse/device.ts` function `hashDevice(fp): string`; server action to bind device
- **End/Verify:** Unit test: same fp → same hash; row inserted

**T22. Trial allowance helper**

- **Start:** none
- **Do:** `lib/antiabuse/trial.ts` check “1 per 7 days” by user_id + device_hash
- **End/Verify:** Unit tests for allowed vs blocked paths

**T23. Client fingerprint capture**

- **Start:** none
- **Do:** Lightweight client util (no PII) to capture fp and send to server action on setup
- **End/Verify:** DevTools network shows bind call; stored in DB

**T24. Rate‑limit guard**

- **Start:** none
- **Do:** Simple per‑IP throttle in server actions (KV/Upstash or in‑mem dev fallback)
- **End/Verify:** Rapid calls return 429 after threshold in dev

**T25. Ensure CSP headers**

- **Start:** basic headers
- **Do:** Add `next.config.js` or middleware CSP for APIs (tts/transcribe/turnstile)
- **End/Verify:** Response headers show CSP; no console CSP errors

**T26. Abuse test script**

- **Start:** none
- **Do:** Add `scripts/abuse.test.mjs` to simulate fast calls; expect 429 & block messages
- **End/Verify:** Script reports PASS

---

## Phase 3 — Complimentary Assessment: Setup (9 tasks)

**T30. Route skeleton**

- **Start:** none
- **Do:** Create `app/assessment/setup/page.tsx` and layout with brand gradient
- **End/Verify:** Navigate `/assessment/setup` renders placeholder

**T31. UI: PreparingOverlay**

- **Start:** none
- **Do:** `components/assessment/PreparingOverlay.tsx`
- **End/Verify:** Storybook/dev renders overlay for 2s on CTA click

**T32. UI: MicroIdentity prompt**

- **Start:** none
- **Do:** `components/marketing/MicroIdentity.tsx` used inside setup
- **End/Verify:** Type a first name; state reflects value

**T33. Server actions: verifyTurnstile**

- **Start:** none
- **Do:** `app/assessment/setup/actions.ts` export `verifyTurnstile`
- **End/Verify:** Invalid token shows inline error

**T34. Server actions: bindDevice**

- **Start:** none
- **Do:** Implement `bindDevice(fpHash)` writing to DB
- **End/Verify:** Row in `device_fingerprints` exists

**T35. Server actions: initFreeSession**

- **Start:** none
- **Do:** Creates session with config `{plan_tier:'free_trial', questions_limit:3, context_memory:false, voice_playback:'q1_only', voice_input:false}`
- **End/Verify:** Row created; returns `sessionId`

**T36. Trial allowance integration**

- **Start:** helper exists
- **Do:** Call `trial.check()` inside `initFreeSession`; block with user‑friendly message if disallowed
- **End/Verify:** Attempt within 7 days shows “Come back later” UI

**T37. UTM capture**

- **Start:** middleware present
- **Do:** Capture `utm_*` and attach to session payload
- **End/Verify:** Session row shows `utm` in metadata/jsonb

**T38. Navigation to runner**

- **Start:** placeholder
- **Do:** On success, router push `/assessment/run/{sessionId}`
- **End/Verify:** Manual flow transitions correctly

---

## Phase 4 — Complimentary Assessment: Runner (12 tasks)

**T40. Route skeleton**

- **Start:** none
- **Do:** `app/assessment/run/[sessionId]/page.tsx` with SSR guard (owner + plan_tier=free_trial)
- **End/Verify:** Unauthorized access → 404

**T41. UI: ProgressStrip**

- **Start:** none
- **Do:** `components/assessment/ProgressStrip.tsx` shows “Warm‑Up · Q x of 3” + ring
- **End/Verify:** Index 0/1/2 renders correctly

**T42. UI: QuestionStage**

- **Start:** none
- **Do:** `components/assessment/QuestionStage.tsx` renders question, optional `VoicePlayback`, and `AnswerComposerText`
- **End/Verify:** With `index===0` shows voice playback control only

**T43. UI: AnswerComposerText**

- **Start:** none
- **Do:** Textarea + submit button; disables on pending
- **End/Verify:** Press submit calls server action; button state toggles

**T44. UI: BridgeLine**

- **Start:** none
- **Do:** Minor delayed text line between questions
- **End/Verify:** After submit, bridge appears for ~1s

**T45. Actions: askFree**

- **Start:** none
- **Do:** Select seeded question from `lib/variability.ts`
- **End/Verify:** Returns `{index, question}`; deterministic per seed

**T46. Actions: synthesizeQ1TTS**

- **Start:** none
- **Do:** Calls `/api/tts` for Q1 only; stores `tts_key`
- **End/Verify:** Storage file exists; presigned URL returned

**T47. Actions: submitFree**

- **Start:** none
- **Do:** Write `turns` row with `answer_text`, compute brief `answer_digest`
- **End/Verify:** DB row created; digest present

**T48. Loop to next question**

- **Start:** state machine incomplete
- **Do:** Increment index and re‑render next question after bridge
- **End/Verify:** Reaches Q3 reliably

**T49. Finalize flow**

- **Start:** none
- **Do:** Implement `finalizeFree` that computes partial results and saves to `results`
- **End/Verify:** Row in `results`; redirect path returned

**T4A. Idle timeout auto‑complete**

- **Start:** none
- **Do:** 5‑minute idle detector triggers finalize + results redirect
- **End/Verify:** Leave idle; see results with note

**T4B. Event hooks**

- **Start:** events shim
- **Do:** Emit `assessment_started`, `assessment_completed`, `voice_playback_used_q1`
- **End/Verify:** Logs/DB records created

---

## Phase 5 — Complimentary Assessment: Results (7 tasks)

**T50. Route skeleton**

- **Start:** none
- **Do:** `app/assessment/results/[sessionId]/page.tsx` SSR owner guard
- **End/Verify:** Non‑owner 404s

**T51. UI: ResultCardPartial**

- **Start:** none
- **Do:** Shows single visible metric (e.g., Communication), others blurred/locked with tasteful copy
- **End/Verify:** Locked visuals present; scores hidden except primary

**T52. CTA to /pricing**

- **Start:** none
- **Do:** Prominent CTA button (copy: “Access the full professional simulation”)
- **End/Verify:** Click navigates to `/pricing`; event `cta_clicked_upgrade` emitted

**T53. Replay assessment control**

- **Start:** none
- **Do:** Button to restart if allowance permits (calls `initFreeSession` again)
- **End/Verify:** Within window → blocked; after 7 days → allowed

**T54. Optional email capture**

- **Start:** none
- **Do:** Input to “Send me my full report when I upgrade” → store to profile
- **End/Verify:** DB profile row updated

**T55. Copy polish & compliance**

- **Start:** placeholder text
- **Do:** Ensure no “upgrade/buy”; use approved tone
- **End/Verify:** Content review checklist passes

**T56. Analytics events**

- **Start:** shim ready
- **Do:** Emit `results_viewed`, `trial_replay`
- **End/Verify:** Logs/DB entries present

---

## Phase 6 — Payments, Entitlements & Pricing (6 tasks)

**T60. Pricing page**

- **Start:** may exist
- **Do:** `app/pricing/page.tsx` emphasizes benefits; integrates PerkDisplay
- **End/Verify:** Page renders with tiers

**T61. Checkout action**

- **Start:** none/new
- **Do:** server action `createCheckoutSession(tier)` with Stripe session
- **End/Verify:** Returns URL; clicking opens Stripe checkout

**T62. Webhook handler**

- **Start:** none/new
- **Do:** `app/api/stripe-webhook/route.ts` → writes `entitlements`
- **End/Verify:** Test webhook creates entitlement row

**T63. Entitlement gate**

- **Start:** lib exists
- **Do:** `lib/entitlements.ts` helper to check active entitlement
- **End/Verify:** Premium routes redirect to `/pricing` if not entitled

**T64. Post‑checkout redirect**

- **Start:** none
- **Do:** On success, route to `/setup` for premium intake
- **End/Verify:** Manual test after test mode checkout

**T65. Tier copy & legal**

- **Start:** placeholder
- **Do:** Ensure time‑pass copy matches product; add refund/terms links
- **End/Verify:** Legal checklist passes

---

## Phase 7 — API: TTS & Transcribe (5 tasks)

**T70. `/api/tts` implementation**

- **Start:** none
- **Do:** Supports free Q1 playback & premium all questions; validates tier
- **End/Verify:** Free: only Q1 works; Premium: any question works

**T71. `/api/transcribe` (premium only)**

- **Start:** none
- **Do:** Whisper proxy; guard by entitlement and session tier
- **End/Verify:** Free request 403; Premium OK

**T72. Storage util**

- **Start:** none
- **Do:** `lib/storage.ts` presigned upload/download helpers
- **End/Verify:** Able to get signed URL for Q1 audio

**T73. OpenAI util**

- **Start:** none
- **Do:** `lib/openai.ts` wrapper for chat, tts, whisper
- **End/Verify:** Unit test returns stub completion in dev

**T74. Results assembler**

- **Start:** none
- **Do:** `lib/results.ts` returns DTOs for partial vs full
- **End/Verify:** Free: one metric + locks; Premium: full object

---

## Phase 8 — Premium Flow sanity (4 tasks)

**T80. Keep `/setup` intake**

- **Start:** exists
- **Do:** Confirm intact; wire to entitlement check
- **End/Verify:** Entitled user can proceed

**T81. Premium interview route guard**

- **Start:** exists
- **Do:** Ensure SSR guard validates owner + entitled + plan_tier=premium
- **End/Verify:** Non‑entitled redirected

**T82. Report route guard**

- **Start:** exists
- **Do:** Ensure premium report requires entitled & owner
- **End/Verify:** Unauthorized blocked

**T83. Research snapshot**

- **Start:** exists
- **Do:** Confirm `lib/research.ts` invoked on setup; snapshot stored
- **End/Verify:** Session row has `research_snapshot`

---

## Phase 9 — Marketing Entry & Navigation (5 tasks)

**T90. Landing CTA swap**

- **Start:** CTA → `/setup`
- **Do:** Change to `/assessment/setup`; preserve secondary link to premium
- **End/Verify:** Clicking primary CTA opens free setup

**T91. Middleware UTM capture**

- **Start:** basic middleware
- **Do:** Persist `utm_*` params on first visit
- **End/Verify:** Session metadata contains UTM after flow

**T92. Header nav adjustments**

- **Start:** existing nav
- **Do:** Add “Complimentary Assessment” and “Full Simulation” entries
- **End/Verify:** Links correct; active states style

**T93. 10‑second TTFI check**

- **Start:** none
- **Do:** Add Web Vitals logging; ensure first interaction <10s on mid‑range device
- **End/Verify:** Local throttled test passes

**T94. Accessibility pass**

- **Start:** none
- **Do:** Axe audit on setup/run/results; fix focus order/labels
- **End/Verify:** No critical issues

---

## Phase 10 — Cleanup of Redundant Functionality (10 tasks)

**T100. Remove free voice input code paths**

- **Start:** lingering mic components for free trial
- **Do:** Delete/guard any mic UI for free tier
- **End/Verify:** Searching “mic” under assessment shows none

**T101. Remove transcript/history in free runner**

- **Start:** old transcript component
- **Do:** Delete or exclude from free routes
- **End/Verify:** No transcript rendered; DOM clean

**T102. Delete credit‑based trial logic**

- **Start:** old “credits” tables/flags
- **Do:** Remove UI copy & guards; migrate to `trial.ts`
- **End/Verify:** Grep for “credit” returns zero in app code

**T103. Remove “free full report” routes/UI**

- **Start:** any `/free-report` remnants
- **Do:** Delete routes/components
- **End/Verify:** 404 for old paths; no imports

**T104. Consolidate duplicate TTS helpers**

- **Start:** multiple helpers
- **Do:** Keep `lib/openai.ts` single TTS entry; delete others
- **End/Verify:** Build passes; grep for old util names returns zero

**T105. Remove unused Storage buckets**

- **Start:** legacy buckets
- **Do:** List buckets; deprecate ones not used by new flow
- **End/Verify:** Only `audio/` and necessary remain

**T106. Remove unused feature flags**

- **Start:** `NEXT_PUBLIC_*` flags not used
- **Do:** Delete from code and env.example
- **End/Verify:** Build passes; env lint OK

**T107. Delete deprecated components**

- **Start:** cards/paywalls not used
- **Do:** Remove old paywall variants now replaced
- **End/Verify:** Storybook/build pass

**T108. Remove landing CTA to /setup (primary)**

- **Start:** old primary CTA
- **Do:** Ensure primary CTA points to assessment; keep secondary to premium
- **End/Verify:** Visual and DOM verified

**T109. Dead route check**

- **Start:** various
- **Do:** Next route analyzer to find unreferenced pages
- **End/Verify:** Report clean

---

## Phase 11 — QA, Telemetry & Docs (7 tasks)

**T110. Add Storybook stories for new components**

- **Start:** none
- **Do:** Stories for PreparingOverlay, ProgressStrip, ResultCardPartial
- **End/Verify:** Stories render

**T111. E2E: Free funnel happy path**

- **Start:** none
- **Do:** Playwright test: landing → setup → run → results → pricing
- **End/Verify:** Test green

**T112. E2E: 1/7‑day enforcement**

- **Start:** none
- **Do:** Test creates session twice; second attempt blocked
- **End/Verify:** Shows policy note

**T113. E2E: Unauthorized access guards**

- **Start:** none
- **Do:** Try reading others’ sessions; expect 404
- **End/Verify:** Tests green

**T114. KPIs logging**

- **Start:** analytics shim
- **Do:** Ensure events write to `events` or external tool
- **End/Verify:** Dashboard or DB query returns rows

**T115. README updates**

- **Start:** outdated docs
- **Do:** Update root README with funnel description, dev scripts, env requirements
- **End/Verify:** PR review passes

**T116. Rollout checklist**

- **Start:** none
- **Do:** Create `docs/rollout-checklist.md` (migrations applied, Stripe keys, Turnstile keys, UTM test, CSP)
- **End/Verify:** Box‑checked before deploy

---

## Phase 12 — Deployment (4 tasks)

**T120. Vercel env & secrets**

- **Start:** not set
- **Do:** Add env vars; link Supabase + Stripe webhooks
- **End/Verify:** Vercel “Ready”

**T121. DB migrations in Prod**

- **Start:** not applied
- **Do:** `supabase db push` to prod project
- **End/Verify:** Tables/columns present

**T122. Stripe live mode dry run**

- **Start:** test mode
- **Do:** Switch to live; run $0 trial product or small amount; confirm webhook write
- **End/Verify:** Entitlement row added

**T123. Post‑deploy smoke test**

- **Start:** prod live
- **Do:** Full funnel run on mobile connection
- **End/Verify:** KPI targets within thresholds (TTFI <10s)

---

## Notes on Parallelization

- Phases 1–2 (DB + Anti‑abuse) can proceed in parallel.
- Runner UI (Phase 4) depends on actions from Phase 3.
- Cleanup (Phase 10) should start after Phase 5 to avoid breaking dev paths.

---

## Definition of Done (Program Level)

- Complimentary assessment reachable from `/` in ≤10s.
- Q1 TTS playback only; answers are text only.
- Results show exactly one unlocked metric; CTA to pricing.
- 1 per 7‑day allowance enforced (user + device).
- Premium flow unaffected and properly gated by entitlements.
- Deprecated paths/components removed.
