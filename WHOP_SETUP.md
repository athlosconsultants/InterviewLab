# Whop Integration Setup Guide

This guide walks you through setting up Whop as an additional payment provider alongside your existing Stripe integration.

## 🎯 Overview

**What This Integration Does:**
- Allows users to purchase on Whop marketplace
- Users sign in via "Sign in with Whop" OAuth
- Automatically syncs Whop memberships to your entitlements system
- Works alongside Stripe (not a replacement)

**User Flow:**
1. User purchases your product on Whop
2. User clicks "Access Product" button on Whop
3. User lands on your sign-in page
4. User clicks "Sign in with Whop"
5. OAuth flow verifies their purchase
6. User gets immediate access to premium features

---

## 📋 Prerequisites

Before starting, ensure you have:
- [x] A Whop seller account
- [x] Your InterviewLab app deployed and running
- [x] Access to your Supabase project
- [x] Access to your environment variables (Vercel/hosting provider)

---

## 🚀 Step-by-Step Setup

### Step 1: Create Your Whop Product

1. Go to [whop.com](https://whop.com) and log in
2. Click "Create Product"
3. Set up your product details:
   - Name: "InterviewLab Premium Access"
   - Description: Your product description
   - Category: Education/SaaS

4. **Create Plans** that match your tiers:
   - **48-Hour Pass** → $X
   - **7-Day Pass** → $X
   - **30-Day Pass** → $X
   - **Lifetime Access** → $X

5. **Important:** Note down your Product ID and Plan IDs (you'll need these later)

---

### Step 2: Get Your Whop API Credentials

#### 2.1: Get Your API Key

1. Go to **Settings → Developer → API Keys**
2. Click **"Create API Key"**
3. Give it a name (e.g., "InterviewLab Production")
4. Copy the API key (starts with `whop_`)
5. Store it securely

#### 2.2: Get Your Company ID

1. Look at your URL when viewing your Whop dashboard
2. It will be: `https://whop.com/company/{COMPANY_ID}/overview`
3. Copy the Company ID from the URL

#### 2.3: Set Up OAuth App

1. Go to **Settings → Developer → OAuth Apps**
2. Click **"Create OAuth App"**
3. Fill in:
   - **App Name:** InterviewLab
   - **Redirect URI:** `https://yourdomain.com/whop/callback` (replace with your actual domain)
   - **Scopes:** Select `user:read` and `memberships:read`
4. Click **"Create"**
5. Copy your **Client ID** and **Client Secret**

#### 2.4: Set Up Webhook

1. Go to **Settings → Developer → Webhooks**
2. Click **"Create Webhook"**
3. Fill in:
   - **URL:** `https://yourdomain.com/api/whop-webhook`
   - **Events:** Select the following:
     - ✅ `membership.went_valid` (REQUIRED)
     - ✅ `membership.went_invalid` (REQUIRED)
     - ✅ `membership.updated` (RECOMMENDED)
     - ✅ `membership.deleted` (RECOMMENDED)
4. Click **"Create"**
5. Copy the **Webhook Secret**

---

### Step 3: Configure Environment Variables

Add the following to your `.env.local` (development) and your hosting provider (production):

```bash
# Whop Integration
WHOP_API_KEY=whop_xxxxxxxxxxxxxx
WHOP_CLIENT_ID=your-client-id
WHOP_CLIENT_SECRET=your-client-secret
WHOP_WEBHOOK_SECRET=your-webhook-secret
WHOP_COMPANY_ID=your-company-id
```

**For Vercel:**
1. Go to your project on Vercel
2. Go to **Settings → Environment Variables**
3. Add each variable above
4. Redeploy your app

---

### Step 4: Run Database Migration

You need to update your Supabase database to support Whop:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open `/db/migrations/014_add_whop_support.sql` from your codebase
4. Copy the entire SQL migration
5. Paste it into the Supabase SQL Editor
6. Click **"Run"**

This adds:
- Whop-related columns to the `entitlements` table
- A new `whop_users` table for OAuth data
- Proper indexes and RLS policies

---

### Step 5: Verify Product/Plan Mapping

The Product IDs have been configured in `/lib/whop.ts`:

```typescript
// Current configuration:
'prod_jDt4y7WIAHML0': '48h',      // 48-hour pass
'prod_xT6VjeAQ2isxv': '7d',       // 7-day pass
'prod_LbtjUWWQ2FqqT': '30d',      // 30-day pass
'prod_6Qht7KNk8j5C8': 'lifetime', // Lifetime access
```

**If you have Plan IDs (starting with `plan_`):**

If your Whop products have multiple plans within them, you may need to add Plan IDs. Open `/lib/whop.ts` and add them to the `planMappings` section:

```typescript
const planMappings: Record<string, '48h' | '7d' | '30d' | 'lifetime'> = {
  'plan_xxxxx': '48h',       // Your 48h plan ID (if applicable)
  'plan_yyyyy': '7d',        // Your 7d plan ID (if applicable)
  'plan_zzzzz': '30d',       // Your 30d plan ID (if applicable)
  'plan_aaaaa': 'lifetime',  // Your lifetime plan ID (if applicable)
};
```

**How to find Plan IDs (if needed):**
1. Go to your Whop product page
2. Click on a specific plan/pricing tier
3. Look at the URL - it will contain `plan_xxxxx`
4. Or use browser DevTools → Network tab when loading the product page

---

### Step 6: Test the Integration

#### Test Webhook (Development):

1. Use a tool like [ngrok](https://ngrok.com) to expose your local server:
   ```bash
   ngrok http 3000
   ```

2. Update your Whop webhook URL to the ngrok URL:
   ```
   https://your-ngrok-url.ngrok.io/api/whop-webhook
   ```

3. Create a test purchase on Whop
4. Check your terminal for webhook logs

#### Test OAuth Flow:

1. Go to your sign-in page: `https://yourdomain.com/sign-in`
2. Click **"Sign in with Whop"**
3. You should be redirected to Whop for authorization
4. After authorizing, you should be redirected back and signed in
5. Check your Supabase `whop_users` and `entitlements` tables to verify data was created

---

## 🔍 Troubleshooting

### Issue: "Sign in with Whop" button doesn't appear

**Solution:** Make sure you've added the Whop environment variables and redeployed.

### Issue: Webhook isn't receiving events

**Solution:** 
- Verify your webhook URL is correct
- Check that your webhook secret matches your environment variable
- Look at Whop's webhook logs for delivery failures

### Issue: OAuth callback fails

**Solution:**
- Verify your redirect URI in Whop matches exactly: `https://yourdomain.com/whop/callback`
- Check that your Client ID and Client Secret are correct
- Look at browser console for error messages

### Issue: Membership syncing fails

**Solution:**
- Verify your Plan ID mapping in `lib/whop.ts`
- Check Supabase logs for errors
- Ensure the database migration ran successfully

---

## 📊 Monitoring

### Check Active Whop Memberships:

Run this SQL in Supabase:

```sql
SELECT 
  e.user_id,
  e.tier,
  e.expires_at,
  e.whop_membership_id,
  e.whop_product_id,
  e.whop_plan_id,
  wu.whop_email
FROM entitlements e
JOIN whop_users wu ON e.user_id = wu.user_id
WHERE e.payment_provider = 'whop'
  AND e.status = 'active'
ORDER BY e.created_at DESC;
```

### Check Webhook Events:

Whop provides a webhook dashboard where you can see:
- Delivery status
- Response codes
- Payload data
- Retry attempts

---

## 🎉 You're Done!

Your Whop integration is now live! Users can purchase on Whop and seamlessly access your app.

**Next Steps:**
1. List your product on the Whop marketplace
2. Set up affiliates on Whop (if desired)
3. Monitor sales in your Whop dashboard
4. Track conversions in your analytics

**Need Help?**
- Whop Docs: [docs.whop.com](https://docs.whop.com)
- Whop Support: [support.whop.com](https://support.whop.com)

---

## 🔐 Security Notes

- Store all Whop credentials securely
- Never commit secrets to version control
- Rotate API keys if compromised
- Use HTTPS for all webhook endpoints
- Verify webhook signatures on all incoming requests

