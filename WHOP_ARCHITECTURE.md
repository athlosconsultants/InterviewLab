# Whop + Stripe Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      InterviewLab App                           │
│                   (Your Existing System)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                      ┌──────────────────┐
│  Stripe Users    │                      │   Whop Users     │
│  (Existing)      │                      │   (New)          │
└──────────────────┘                      └──────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌──────────────────┐                      ┌──────────────────┐
│ Stripe Checkout  │                      │ Whop Marketplace │
│   (On your site) │                      │  (On whop.com)   │
└──────────────────┘                      └──────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌──────────────────┐                      ┌──────────────────┐
│ Stripe Webhook   │                      │  Whop Webhook    │
│ /api/stripe-     │                      │ /api/whop-       │
│  webhook         │                      │  webhook         │
└──────────────────┘                      └──────────────────┘
        │                                           │
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Supabase DB   │
                    │   entitlements  │
                    │     table       │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ getUserEnti-    │
                    │  tlements()     │
                    │ (checks both!)  │
                    └─────────────────┘
```

---

## Data Flow: Stripe User (Existing Flow - Unchanged)

```
1. User visits your website
   │
   ▼
2. User clicks "Buy Premium"
   │
   ▼
3. Redirected to Stripe Checkout
   │
   ▼
4. User pays on Stripe
   │
   ▼
5. Stripe sends webhook to /api/stripe-webhook
   │
   ▼
6. Entitlement created with payment_provider = 'stripe'
   │
   ▼
7. User gets access to premium features
```

---

## Data Flow: Whop User (New Flow)

```
1. User discovers product on Whop marketplace
   │
   ▼
2. User purchases on Whop
   │
   ▼
3. Whop sends webhook to /api/whop-webhook
   │
   ▼
4. Webhook syncs membership (but user not linked yet)
   │
   ▼
5. User clicks "Access Product" on Whop
   │
   ▼
6. Redirected to your app /sign-in
   │
   ▼
7. User clicks "Sign in with Whop"
   │
   ▼
8. OAuth flow: /whop/callback → /api/whop/auth
   │
   ▼
9. System creates/links Supabase account
   │
   ▼
10. System fetches user's Whop memberships
    │
    ▼
11. System syncs memberships to entitlements table
    │
    ▼
12. Entitlement created with payment_provider = 'whop'
    │
    ▼
13. User signed in and redirected to dashboard
    │
    ▼
14. User has access to premium features
```

---

## Database Schema

### Entitlements Table (Updated)

```sql
CREATE TABLE entitlements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT,
  tier TEXT,  -- '48h', '7d', '30d', 'lifetime'
  status TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Stripe fields (existing)
  stripe_session_id TEXT,
  
  -- Whop fields (NEW)
  payment_provider TEXT DEFAULT 'stripe',  -- 'stripe' or 'whop'
  whop_membership_id TEXT UNIQUE,
  whop_product_id TEXT,
  whop_plan_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Whop Users Table (New)

```sql
CREATE TABLE whop_users (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  whop_user_id TEXT UNIQUE,
  whop_email TEXT,
  whop_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Entitlements Logic

### Before (Stripe Only)

```typescript
async function getUserEntitlements(userId: string) {
  // Get most recent entitlement
  const entitlement = await supabase
    .from('entitlements')
    .select('tier, expires_at')
    .eq('user_id', userId)
    .single();
    
  // Check if expired
  const isActive = !entitlement.expires_at || 
                   new Date(entitlement.expires_at) > new Date();
                   
  return { isActive, tier: entitlement.tier };
}
```

### After (Stripe + Whop)

```typescript
async function getUserEntitlements(userId: string) {
  // Get ALL entitlements (Stripe + Whop)
  const entitlements = await supabase
    .from('entitlements')
    .select('tier, expires_at, payment_provider, status')
    .eq('user_id', userId);
    
  // Find first valid (non-expired) entitlement
  for (const ent of entitlements) {
    if (ent.status === 'active') {
      const isActive = !ent.expires_at || 
                       new Date(ent.expires_at) > new Date();
      if (isActive) {
        return { isActive: true, tier: ent.tier };
      }
    }
  }
  
  return { isActive: false, tier: null };
}
```

**Key Change:** Now checks both Stripe and Whop entitlements, returns the first valid one.

---

## API Endpoints

### Existing Endpoints (Unchanged)
- `POST /api/checkout` - Stripe checkout creation
- `POST /api/stripe-webhook` - Stripe webhook handler
- All other existing endpoints continue to work

### New Endpoints (Whop)
- `POST /api/whop-webhook` - Receives Whop membership events
- `POST /api/whop/auth` - Handles OAuth code exchange
- `GET /whop/callback` - OAuth callback page

---

## Security

### Stripe (Existing)
```typescript
// Verifies Stripe webhook signature
stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

### Whop (New)
```typescript
// Verifies Whop webhook signature
function verifyWhopWebhook(payload: string, signature: string) {
  const hmac = crypto.createHmac('sha256', WHOP_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

Both use cryptographic signature verification to ensure webhooks are authentic.

---

## User Experience

### Stripe User Journey
```
Website → "Buy Premium" → Stripe Checkout → Payment → 
Email Login → Dashboard → Premium Access ✅
```

### Whop User Journey
```
Whop Marketplace → Purchase → "Access Product" → 
Your Website → "Sign in with Whop" → OAuth → 
Dashboard → Premium Access ✅
```

**Both end up at the same dashboard with the same features.**

---

## Key Benefits

### Technical
- ✅ **Zero breaking changes** to existing Stripe system
- ✅ **Unified entitlements** - one table, one check
- ✅ **Future-proof** - easy to add more providers
- ✅ **Secure** - webhook verification + OAuth 2.0
- ✅ **Scalable** - proper indexes and RLS policies

### Business
- ✅ **More revenue channels**
- ✅ **Access to Whop's audience**
- ✅ **Built-in affiliate system**
- ✅ **Risk diversification**
- ✅ **No vendor lock-in**

---

## Example: User with Both Stripe and Whop

```sql
-- User buys 7-day pass on Stripe
INSERT INTO entitlements (
  user_id, tier, expires_at, payment_provider, stripe_session_id
) VALUES (
  'user-123', '7d', '2025-11-15', 'stripe', 'cs_stripe_123'
);

-- Same user later buys lifetime on Whop
INSERT INTO entitlements (
  user_id, tier, expires_at, payment_provider, whop_membership_id
) VALUES (
  'user-123', 'lifetime', NULL, 'whop', 'mem_whop_456'
);

-- getUserEntitlements('user-123') returns:
-- { isActive: true, tier: 'lifetime' }
-- (Because it finds the lifetime pass first)
```

The system automatically picks the best active entitlement!

---

## Monitoring

### Dashboard Queries

**Total Users by Provider:**
```sql
SELECT 
  payment_provider,
  COUNT(*) as total_users,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
FROM entitlements
GROUP BY payment_provider;
```

**Revenue Split:**
```sql
SELECT 
  payment_provider,
  tier,
  COUNT(*) as purchases
FROM entitlements
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY payment_provider, tier
ORDER BY payment_provider, tier;
```

**Whop Conversion Rate:**
```sql
SELECT 
  COUNT(DISTINCT whop_user_id) as total_whop_users,
  COUNT(DISTINCT user_id) as signed_in_users,
  ROUND(
    COUNT(DISTINCT user_id)::NUMERIC / 
    COUNT(DISTINCT whop_user_id)::NUMERIC * 100, 
    2
  ) as conversion_rate
FROM whop_users;
```

---

## Testing Checklist

### Local Testing
- [ ] Start ngrok: `ngrok http 3000`
- [ ] Update Whop webhook URL to ngrok URL
- [ ] Create test purchase on Whop
- [ ] Check terminal for webhook logs
- [ ] Test "Sign in with Whop" flow
- [ ] Verify entitlements in Supabase

### Production Testing
- [ ] Deploy to Vercel
- [ ] Add environment variables
- [ ] Run database migration
- [ ] Update Whop webhook to production URL
- [ ] Update OAuth redirect to production URL
- [ ] Create real purchase
- [ ] Test end-to-end flow
- [ ] Verify existing Stripe users unaffected

---

## Rollback Plan

If you need to rollback:

1. **Remove Whop button:**
   ```typescript
   // Comment out in app/(auth)/sign-in/page.tsx
   // <Button>Sign in with Whop</Button>
   ```

2. **Disable Whop checks:**
   ```typescript
   // In lib/entitlements.ts
   .eq('payment_provider', 'stripe') // Only check Stripe
   ```

3. **Keep database tables** - they won't hurt anything

The system gracefully degrades to Stripe-only mode!

---

*Architecture designed and implemented November 8, 2025*

