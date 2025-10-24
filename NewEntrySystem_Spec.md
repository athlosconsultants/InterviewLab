# The Interview Lab — New Entry System (Complimentary Assessment Funnel)

**Version:** 1.0  
**Owner:** InterviewLab Product  
**Purpose:** Define WHAT to build (not how) for the unified landing + free-tier funnel that maximizes conversion to the premium simulation, aligned with brand (light blue → cyan gradient) and professional tone.

---

## 0) Brand & Visual Baseline

- **Background:** Same soft gradient as current sign-in (light blue radial blur on white). Use this across Landing, Pre‑Assessment, Assessment, and Results.
- **Palette:** Logo gradient tokens (blue → cyan). Primary CTA uses gradient; cards are white with subtle shadow, rounded 2xl.
- **Typography:** Inter/SF; headings medium weight; body high legibility.
- **Motion:** Subtle 300–400ms fades and progress ring fills; no gamey effects.
- **Tone:** Executive, calm, credible. Never “cheap demo”. Copy avoids “upgrade/buy” in favor of “Access the full professional simulation”.

---

## 1) Funnel Overview (User Journey)

Four linear stages:

1. **Arrival & Micro-Identity** → establish personalization without friction.
2. **Pre‑Assessment** → set expectations, initialize session.
3. **Complimentary Assessment (3 Qs)** → immersive demo; one question visible at a time; text answers; voice playback only for Q1.
4. **Results & Conversion** → show partial insights + locked features; invite “Access the Full Professional Simulation”.

**Primary KPI targets**

- Trial → Premium click-through ≥ 12%
- Time to first interaction < 10s
- TikTok/IG bounce < 30%

---

## 2) Screens & States (WHAT each screen does)

### A. Landing / Arrival (`/`)

**Goal:** Immediate credibility + motion toward action.  
**Hero:**

- Headline: “Experience a Real AI Job Interview — Free, No Credit Card Needed.”
- Sub: “Built from real hiring data used by top global companies.”
- CTA: **Start Complimentary Assessment →** (gradient button)

**On click (no route change yet):**

- Display lightweight overlay: “Preparing your interview environment…” (2s max)
- Show **Micro‑Identity** prompt (inline):  
  “What should we call you during the interview?” [First name] [Continue →]

**Output:** Creates a lightweight user record and proceeds to Pre‑Assessment.

---

### B. Pre‑Assessment (`/assessment/setup`)

**Goal:** Frame the experience and confirm readiness.

- Title: “Complimentary Interview Assessment”
- Sub: “You’ll answer three short questions to sample how our AI interviewers work.”
- Details line: “3 questions · Text‑only · Takes ~5 minutes”
- Button: **Start Assessment**

**Output:** Initializes a **session** with constraints:

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

---

### C. Complimentary Assessment (`/assessment/run/:sessionId`)

**Goal:** Deliver a believable, focused interview demo.

- Layout: **single active question** (no scroll history). Prior Q vanishes post‑submit.
- Header strip: “Warm‑Up • Question x of 3” + slim progress indicator.
- **Q1:** AI voice playback (TTS). User answers via text.
- **Q2–Q3:** Text prompts, gentle time nudge copy (“Aim for under 60 seconds.”).
- Bridge lines between Qs (1 sentence) to feel human.
- End state: “Analyzing your responses…” (analysis runs).

**System behavior:**

- Save each turn; no transcript shown during interview.
- After Q3, compute **partial analysis** returning one visible metric.

---

### D. Results & Conversion (`/assessment/results/:sessionId`)

**Goal:** Create contrast and motivate upgrade.

- Header: “Preliminary Analysis”
- Report card:
  | Metric | State |
  |---|---|
  | Communication Clarity | **74%** (example value) |
  | Confidence | 🔒 Locked |
  | Structure | 🔒 Locked |
  | Analytical Depth | 🔒 Locked |

- Copy: “Your complimentary assessment provides a snapshot. The full professional simulation includes voice practice, adaptive context and a detailed performance report.”
- Primary CTA: **Access the Full Professional Simulation →** (routes to `/pricing`)
- Secondary: **Replay Assessment** (once per user/week)
- Optional email capture: “Send my full report when you upgrade.”

**Output:** Records CTA and replay events; ends funnel.

---

## 3) Anti‑Abuse & Traffic Qualification (Invisible to users)

- **Trial frequency:** 1 complimentary assessment / 7 days per user/device.
- **Device binding:** Store hashed device fingerprint alongside user id.
- **Bot protection:** Cloudflare Turnstile or equivalent before session start.
- **Question variability:** Seeded randomization of warm‑up prompts per session.
- **Timeouts:** 5‑minute idle timeout returns user to Results with gentle message.
- **Campaign handling:** UTM detection; TikTok/IG can optionally shorten to 2 Qs and adjust copy at Results.

Copy framing for limits (professional tone):

> “Complimentary assessments are limited to maintain fairness and accuracy.”

---

## 4) Data Model (WHAT must exist; no implementation detail)

### User

- `id`
- `first_name` (optional)
- `trial_remaining` (int; default 1 per rolling 7 days)
- `device_hash` (optional; for soft enforcement)
- `created_at`

### Session

- `id`
- `user_id`
- `plan_tier` = `"free_trial"`
- `stages_planned` = `["warmup"]`
- `questions_limit` = `3`
- `context_memory` = `false`
- `voice_playback` = `"q1_only"`
- `voice_input` = `false`
- `status` ∈ `["active","completed","expired"]`
- `created_at`, `completed_at`

### Turn

- `session_id`
- `index` (0‑based)
- `turn_type` ∈ `["question","bridge"]`
- `question_text`
- `answer_text`
- `duration_sec`

### Result (Partial for free)

- `session_id`
- `communication_score` (0–100)
- `locked_metrics` = `["confidence","structure","analytical_depth"]`
- `report_locked` = `true`

Analytics events to track:

- `funnel_start`, `assessment_started`, `assessment_completed`
- `cta_clicked_upgrade`, `email_entered_report`, `trial_replay`
- `voice_playback_used_q1`, `timeout_returned`

---

## 5) Pricing Hand‑Off (WHAT user sees after CTA)

**/pricing** highlights:

- “Full Professional Simulation” benefits:
  - Multi‑stage interviews (Warm‑Up → Core → Curveball → Reflection)
  - Voice input & continuous interviewer context
  - Detailed analytics dashboard + benchmarks
  - Flexible passes (7‑day, 30‑day, Lifetime)

Copy style: “Access the professional simulation” (not “buy/upgrade”).

---

## 6) Accessibility & Performance Requirements

- WCAG AA contrast; keyboard navigable; captions/transcript option for TTS.
- Mobile‑first responsive layout; sticky bottom composer on mobile.
- Autoplay rules respected (user‑initiated audio on Q1).

---

## 7) Brand Execution Notes

- Reuse the **same gradient background** as the provided sign‑in screenshot across all new funnel screens.
- Primary CTA and progress accents use the brand gradient.
- Keep UI restrained: whitespace, soft shadows, no busy decoration.

---

## 8) Acceptance Criteria (Done = ✅)

- Users can start a complimentary assessment from `/` within **≤10s**.
- Assessment shows **one question at a time**, no history.
- Q1 has **voice playback**; all answers are **text-only**.
- Results show **one visible metric** + **locked** others with tasteful blur.
- **CTA** to pricing is prominent; copy remains professional.
- Abuse controls limit free use to **1 / 7 days** per user/device.
- Visuals match brand: same gradient background and color palette as sign‑in.

---

## 9) Future-Proofing Toward App Store

- Componentize views for reuse in native shell.
- Keep entitlements & session APIs platform-agnostic.
- Audio interactions remain user-initiated to satisfy iOS policies.

---

## 10) One‑Sentence Mission

Deliver a seamless, brand‑consistent **Complimentary Assessment** that feels like a real interview, reveals credible but incomplete insights, and converts users to the **Full Professional Simulation** with minimal friction and zero gimmicks.
