# Upgrades Phase 1 Tasks — Upgrade to Time-Based Payment System (Stripe + Supabase)

Each task is atomic, testable, and should be executed + verified before the next one begins. You are expected to execute one task at a time and report back before continuing.

---

## 🧱 Setup: Stripe SKUs and Supabase Schema

### 1. Create Stripe Products & Prices

- Log into Stripe Dashboard
- Create 4 products: 48h, 7d, 30d, Lifetime
- Save their Price IDs
  ✅ Done when: All Stripe products and price IDs exist and are documented

### 2. Add `entitlements` Table to Supabase

- Use SQL editor or migration
- Columns:
  - `id uuid primary key default uuid_generate_v4()`
  - `user_id uuid not null`
  - `tier text`
  - `expires_at timestamptz`
  - `stripe_session_id text`
  - `created_at timestamptz default now()`
- Add RLS policy: `user_id = auth.uid()`
  ✅ Done when: Entitlements table is created with RLS

---

## 🔁 Backend: Stripe Webhook and Supabase Logic

### 3. Implement `createCheckoutSession(tier)` server function

- Input: tier (string: 48h, 7d, 30d, lifetime)
- Output: Stripe Checkout URL
- Include metadata: `{ user_id, pass_tier }`
  ✅ Done when: Returns URL for Stripe Checkout with metadata

### 4. Create `/api/stripe-webhook/route.ts`

- Listen for `checkout.session.completed`
- Validate Stripe signature
- Parse metadata
- Insert/update entitlement row with:
  - user_id
  - tier
  - expires_at (compute from tier)
  - stripe_session_id
    ✅ Done when: Stripe webhook correctly writes `entitlements` row

### 5. Add `lib/entitlements.ts:getUserEntitlements(userId)`

- Query `entitlements` for user
- Check expiration
- Return `{ isActive, tier, expiresAt }`
  ✅ Done when: Returns correct entitlement state

---

## ⛔ Gating Logic

### 6. Add `isEntitled(userId, feature)` helper

- Use `getUserEntitlements()`
- Return `true` only if `isActive` is true
  ✅ Done when: Boolean guard function exists

### 7. Protect Interview Start (`startInterview`)

- Add entitlement guard to server action
- If not entitled → throw
  ✅ Done when: Users without entitlement cannot start interview

### 8. Protect Report View (`/report/[id]`)

- Add entitlement guard to route loader
- If not entitled → redirect to `/pricing`
  ✅ Done when: Report view requires entitlement

---

## 💳 Frontend UX

### 9. Add `Paywall.tsx` component

- Shows pricing grid
- Displays benefits
- Shows "X days remaining" if entitled
  ✅ Done when: Paywall component renders correctly

### 10. Add pricing page `/pricing`

- Renders `Paywall.tsx`
- Hooks up `createCheckoutSession()` via button
  ✅ Done when: Users can start Stripe Checkout from pricing page

### 11. Add fallback redirect

- If entitlement check fails anywhere → redirect to `/pricing`
  ✅ Done when: All routes consistently gate non-entitled users

---

## ✅ Test Plan

### 12. Purchase → Entitlement Flow

- Visit `/pricing`
- Complete purchase (Stripe test mode)
- Confirm webhook fired
- Confirm `entitlements` row created
- Confirm access to `/interview` and `/report`
  ✅ Done when: Full flow works E2E

### 13. Entitlement Expiry

- Manually expire entitlement row
- Confirm user is locked out of premium features
  ✅ Done when: Expiry enforcement works

---

## 🧹 Cleanup & Migration

### 14. Remove legacy credit logic

- Delete old fields, checks, and UI related to credit usage
  ✅ Done when: Codebase no longer references interview credits
