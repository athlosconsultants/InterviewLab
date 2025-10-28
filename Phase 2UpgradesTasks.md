# InterviewLab — 1-Question Preview Funnel MVP Build Plan

## Phase 0 — Preparation & Branch Setup

**T00. Create feature branch**

- **Start:** none
- **Do:** `git checkout -b feat/quick-try-widget`
- **End/Verify:** branch created; visible via `git status`

**T01. Review dependencies**

- **Start:** repo root
- **Do:** ensure `next`, `react`, `typescript` up-to-date; verify Tailwind config loads correctly
- **End/Verify:** `npm run dev` builds existing app successfully

**T02. Duplicate staging environment**

- **Start:** Vercel project
- **Do:** create preview deployment environment with separate Supabase keys
- **End/Verify:** test hitting `/` renders live staging version

---

## Phase 1 — QuickTryWidget MVP (Client-Only)

**T10. Create new component directory**

- **Start:** none
- **Do:** `mkdir components/landing`
- **End/Verify:** folder exists with placeholder file

**T11. Create `QuickTryWidget.tsx` skeleton**

- **Start:** blank file
- **Do:** add wrapper `<Card>` with role dropdown + disabled submit
- **End/Verify:** renders placeholder widget on test page

**T12. Implement role dropdown**

- **Start:** roles array defined inline
- **Do:** add 6 roles; onChange updates local state
- **End/Verify:** selecting a role updates `selectedRole` in React state

**T13. Display sample question per role**

- **Start:** roles mapped to static JSON
- **Do:** import `previewQuestions.ts` (6 keys); conditional render based on `selectedRole`
- **End/Verify:** selecting “Software Engineer” shows correct question

**T14. Add text input area**

- **Start:** none
- **Do:** create textarea with 200 char min counter
- **End/Verify:** typing below 200 shows warning; above enables submit

**T15. Implement feedback logic stub**

- **Start:** new file `lib/preview-feedback.ts`
- **Do:** export function `analyzeAnswer(answer:string)` returning mock feedback list
- **End/Verify:** `analyzeAnswer("test")` returns sample 3-point array

**T16. Build feedback rules**

- **Start:** stub exists
- **Do:** add heuristic checks for length, STAR, quantification, filler words, specificity
- **End/Verify:** console log output shows appropriate messages per rule

**T17. Display feedback section**

- **Start:** empty `<div>`
- **Do:** render feedback array as list with ✅❌💡 icons
- **End/Verify:** visible bullet points after submission

**T18. Add CTA to full assessment**

- **Start:** none
- **Do:** add button “Get Your Full 3‑Question Assessment →” below feedback
- **End/Verify:** visible only after feedback appears

**T19. Store role + answer to sessionStorage**

- **Start:** feedback displayed
- **Do:** `sessionStorage.setItem('quicktry', JSON.stringify({role,answer}))`
- **End/Verify:** open DevTools → Application → entry present

---

## Phase 2 — Landing Page Integration

**T20. Import widget into landing page**

- **Start:** `app/(marketing)/page.tsx`
- **Do:** add `<QuickTryWidget />` in hero section
- **End/Verify:** visible on `/` under headline

**T21. Update hero layout**

- **Start:** existing hero content
- **Do:** rewrite to match new copy: headline + subheadline + trust tags
- **End/Verify:** matches design doc text

**T22. Add trust signals below widget**

- **Start:** none
- **Do:** 3 inline badges (“10,000+ interviews”, “2,847 this week”, “50+ industries”)
- **End/Verify:** visible and responsive on mobile

**T23. Adjust mobile responsiveness**

- **Start:** desktop-only CSS
- **Do:** use Tailwind responsive classes for one-column layout and large buttons
- **End/Verify:** test on iPhone sim → widget full width

---

## Phase 3 — Bridge to 3‑Question Flow

**T30. Modify 3Q setup form**

- **Start:** `app/assessment/setup/page.tsx`
- **Do:** read from `sessionStorage.quicktry`; prefill `role` field if exists
- **End/Verify:** selecting role in preview auto-populates role in setup form

**T31. Clear preview sessionStorage after setup**

- **Start:** during setup submit action
- **Do:** removeItem('quicktry') post-success
- **End/Verify:** key removed after redirect

**T32. Add optional analytics event**

- **Start:** `lib/analytics.ts`
- **Do:** create `track('preview_to_assessment_start')` call when CTA clicked
- **End/Verify:** console log shows event

---

## Phase 4 — Analytics Instrumentation

**T40. Track widget events**

- **Start:** `Track.tsx` shim
- **Do:** emit events for: load, roleSelect, answerTyped, feedbackShown, CTAclicked
- **End/Verify:** events visible in local console

**T41. Track assessment linkage**

- **Start:** CTA click handler
- **Do:** add UTM param `?source=quicktry` to `/assessment/setup` redirect
- **End/Verify:** URL query includes `source=quicktry`

**T42. Verify metrics pipeline**

- **Start:** Supabase `events` table
- **Do:** ensure new event types allowed by schema
- **End/Verify:** event rows appear after testing widget

---

## Phase 5 — Polish & QA

**T50. Add animation & transitions**

- **Start:** static components
- **Do:** use Framer Motion for fade‑in feedback, CTA button pop
- **End/Verify:** visible smooth transitions

**T51. Accessibility review**

- **Start:** functioning widget
- **Do:** run Axe; ensure aria labels on dropdown, textarea, button
- **End/Verify:** 0 critical issues

**T52. Performance audit**

- **Start:** local build
- **Do:** Lighthouse → TTI < 3s target
- **End/Verify:** TTI < 3s passes threshold

**T53. QA mobile Safari + Chrome**

- **Start:** staging deploy
- **Do:** test end-to-end widget → signup → assessment
- **End/Verify:** consistent across devices

---

Phase 6 — Dynamic Preview Question Generation & Caching

Goal: Introduce dynamic, non-repetitive preview questions using cached OpenAI-generated variants per role, refreshed hourly.

T60. Create Supabase table

Start: none

Do: SQL migration for preview_questions (id, role, question, created_at) with index on role

End/Verify: supabase db push; table exists

T61. Implement /api/preview-question

Start: none

Do: add GET route that selects up to 10 cached questions by role and returns one at random

End/Verify: calling endpoint returns random question JSON

T62. Build generator route /api/regenerate-preview-questions

Start: none

Do: loop through 6 roles; call OpenAI once per role; request 8–12 question variants in one API call

End/Verify: Supabase table populated with 8–12 questions/role

T63. Integrate premium backend prompt logic

Start: reference lib/openai.ts or lib/interview.ts

Do: reuse existing interview question generation prompt for quality consistency

End/Verify: generated questions match premium tone and difficulty

T64. Add hourly refresh job

Start: staging environment

Do: add Vercel Cron job or Supabase Edge function to call /api/regenerate-preview-questions hourly

End/Verify: automatic refresh verified in logs

T65. Modify QuickTryWidget fetch logic

Start: static question source

Do: update to call /api/preview-question?role={selectedRole}

End/Verify: each role fetches randomized question instantly

T66. Add fallback

Start: API route

Do: if no cached data, return one from static local backup list

End/Verify: route returns valid fallback even with empty DB

T67. Add analytics hooks

Start: lib/analytics.ts

Do: log events: preview_question_generated, preview_question_served

End/Verify: events visible in DB/console

T68. QA caching behavior

Start: after 1+ hour test window

Do: confirm question set refreshes hourly; repeated role selections yield different questions

End/Verify: consistent randomization and fresh variants

## Definition of Done

- Widget loads under 3s and provides instant feedback with no API calls.
- Role + answer persist correctly to 3Q setup.
- Analytics capture full funnel (widget → signup → assessment).
- No regressions in existing assessment or premium flows.
