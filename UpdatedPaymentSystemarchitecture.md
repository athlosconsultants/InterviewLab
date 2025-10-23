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

## Time-Based Access Pass System

### Plans

- **Access Passes** (via Stripe Checkout):
  - 48 hours
  - 7 days
  - 30 days
  - Lifetime

### Flow

1. **Frontend** calls a server action to create a Stripe Checkout session with metadata (`user_id`, `pass_tier`, etc).
2. **Stripe Checkout** completes → webhook triggers `/api/stripe-webhook/route.ts`.
3. **Webhook Handler** validates event, reads metadata, and upserts an `entitlements` row with expiry timestamp.
4. **Supabase** stores entitlements:
   - `user_id`, `tier`, `expires_at`, `stripe_session_id`, `created_at`
5. **App access** is checked via `getUserEntitlements()` (in `lib/entitlements.ts`) during interview/report routes.
6. **Frontend UX** reflects status ("X days left", "Upgrade Now", etc).

### Key Files

- `app/api/stripe-webhook/route.ts` → Verifies and records entitlements
- `lib/entitlements.ts` → Gets current active entitlement
- `lib/payments/timepasses.ts` → Product catalog, Stripe session creation
- `components/Paywall.tsx` → Gating component
- `components/PerkDisplay.tsx` → Benefits of each plan

---

## Database Schema: Entitlements

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

---

## Where State Lives

### Client

- Auth session (via Supabase)
- UI state (timers, playback, upload status)
- Passive entitlement awareness (via SSR or hydration)

### Server

- **Entitlements:** Authoritative source of user access
- **Stripe session metadata** ties payments to Supabase updates
- **Time gating** logic lives in `lib/entitlements.ts`

---

## Services Integration

- **Stripe Checkout** creates purchases with pass metadata
- **Stripe Webhook** updates `entitlements` in Supabase
- **Supabase** enforces per-user RLS and stores all time-based access data
- **Next.js Server Actions** read entitlements and gate routes accordingly

---

## API & Utilities

- `createCheckoutSession(tier)` → Returns Stripe URL
- `getUserEntitlements(user)` → Returns `{ tier, expiresAt, isActive }`
- `isEntitled(user, feature)` → Boolean guard for interviews, reports, etc
- `renderPerkDisplay(tier)` → Perk marketing breakdown

---

## Frontend Gating & UX

- Entitlement is checked before:
  - Starting interview
  - Viewing report
- If not entitled:
  - Redirect to `/pricing`
  - Prompt checkout via `Paywall.tsx`
- Active users see remaining time banner ("3 days left")

---

## Security

- Stripe webhook validates event authenticity (signature + event type)
- Entitlements RLS-enforced: no cross-user access
- All entitlements updates happen via server (no client-side writes)
- Expiry enforcement applies server-side only

---

## Migration Notes

- Legacy credit-based model removed
- Stripe SKU model replaced with time-pass SKUs
- All previous gating mechanisms now funnel through `getUserEntitlements()`

---

## Done-Definition

- User can:
  - Purchase time-based pass via Stripe
  - Get access immediately post-checkout
  - Be blocked when pass expires
  - View perks and purchase options
- All gating is centralized and RLS-compliant
- Clean Stripe ↔ Supabase integration; recoverable from webhook retry
