# Stripe Setup Guide — Phase 13

This guide walks you through setting up Stripe products and prices for InterviewLab's tiered payment system.

---

## 🎯 Overview

You need to create **3 Stripe products** (one for each tier) and obtain their **Price IDs** to store in your environment variables.

---

## 📋 Step-by-Step Instructions

### 1. Access Your Stripe Dashboard

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** for development
3. Navigate to **Products** → **Product catalog**

---

### 2. Create Product 1: Starter Pack

1. Click **+ Add product**
2. Fill in the following:
   - **Name**: `Kickstart Plan (3 Interviews)`
   - **Description**: `3 full premium interviews + voice mode + detailed feedback reports`
   - **Pricing model**: One-time
   - **Price**: `$26.99 USD`
   - **Tax behavior**: Choose appropriate option for your business
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_...`)
5. Save this as `STRIPE_PRICE_STARTER`

---

### 3. Create Product 2: Professional Pack

1. Click **+ Add product**
2. Fill in the following:
   - **Name**: `Career Builder (5 Interviews)`
   - **Description**: `5 full interviews with multi-stage mode, adaptive difficulty, and advanced feedback analytics`
   - **Pricing model**: One-time
   - **Price**: `$39.99 AUD`
   - **Tax behavior**: Choose appropriate option for your business
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_...`)
5. Save this as `STRIPE_PRICE_PROFESSIONAL`

---

### 4. Create Product 3: Elite Pack

1. Click **+ Add product**
2. Fill in the following:
   - **Name**: `Dream Job Pack (10 Interviews)`
   - **Description**: `10 interviews with priority AI engine, deeper industry simulation, and confidence score report`
   - **Pricing model**: One-time
   - **Price**: `$49.99 AUD`
   - **Tax behavior**: Choose appropriate option for your business
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_...`)
5. Save this as `STRIPE_PRICE_ELITE`

---

### 5. Get Your Stripe Secret Key

1. Navigate to **Developers** → **API keys**
2. Copy the **Secret key** (starts with `sk_test_...` in test mode)
3. Save this as `STRIPE_SECRET_KEY`

---

### 6. Get Your Stripe Webhook Secret

1. Navigate to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Set **Endpoint URL** to: `https://your-domain.com/api/stripe-webhook`
   - For local development, use a tool like [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com/)
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded` (optional)
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Save this as `STRIPE_WEBHOOK_SECRET`

---

## 🔐 Add to Your `.env.local` File

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration (Phase 13)
STRIPE_SECRET_KEY=sk_test_... # Your secret key from step 5
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook secret from step 6

# Price IDs for each tier
STRIPE_PRICE_STARTER=price_... # Price ID from step 2
STRIPE_PRICE_PROFESSIONAL=price_... # Price ID from step 3
STRIPE_PRICE_ELITE=price_... # Price ID from step 4

# Success/Cancel URLs (update with your domain)
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Update for production
```

---

## 🧪 Testing Stripe Locally

### Option 1: Stripe CLI (Recommended)

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
4. The CLI will output a webhook signing secret (starts with `whsec_...`)
5. Use this as your `STRIPE_WEBHOOK_SECRET` for local development

### Option 2: ngrok

1. Install [ngrok](https://ngrok.com/)
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Update your Stripe webhook endpoint URL to: `https://abc123.ngrok.io/api/stripe-webhook`
5. Use the signing secret from the Stripe dashboard

---

## ✅ Verification

After setup, verify everything works:

1. Start your dev server: `pnpm dev`
2. Navigate to the pricing page: `http://localhost:3000/pricing`
3. Click a "Buy Now" button
4. You should be redirected to Stripe Checkout
5. Use Stripe's test card: `4242 4242 4242 4242` (any future date, any CVC)
6. Complete the purchase
7. You should be redirected back to your app
8. Check your database: the entitlement should be created with the correct credits

---

## 🚀 Production Deployment

When deploying to production:

1. Switch to **Live Mode** in Stripe Dashboard
2. Create the products again in Live Mode (Price IDs will be different)
3. Update your production environment variables with live keys:
   - `STRIPE_SECRET_KEY` (starts with `sk_live_...`)
   - `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_ELITE` (live price IDs)
   - `STRIPE_WEBHOOK_SECRET` (from production webhook endpoint)
   - `NEXT_PUBLIC_SITE_URL` (your production domain)

---

## 📚 Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

---

## ⚠️ Security Notes

1. **Never commit** `.env.local` to version control
2. Use environment variables for all sensitive keys
3. Always verify webhook signatures in production
4. Test thoroughly in Test Mode before going live
5. Enable [Stripe Radar](https://stripe.com/radar) for fraud prevention in production

---

**Status:** T132 Documentation Complete ✅  
**Next Step:** Run the database migration 013, then proceed to T134 (Stripe Checkout Flow implementation)

