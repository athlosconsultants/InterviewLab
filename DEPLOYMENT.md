# InterviewLab Deployment Guide

This guide covers deploying InterviewLab to staging and production environments.

## Prerequisites

- [ ] Vercel account
- [ ] Supabase project (staging and production)
- [ ] Stripe account (test and live mode)
- [ ] OpenAI API key
- [ ] Domain name configured
- [ ] Git repository

---

## Staging Environment Setup (T150)

### 1. Create Staging Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Name it: `interviewlab-staging`
4. Choose a region close to your users
5. Generate a strong database password
6. Wait for project creation (~2 minutes)

### 2. Run Database Migrations on Staging

1. Connect to your staging database
2. Run all migrations in order from `db/migrations/`:
   ```bash
   # Example using Supabase SQL Editor
   # Copy/paste each migration file:
   001_initial_schema.sql
   002_rls_policies.sql
   003_storage_policies.sql
   ... (all migrations through 013)
   ```

3. Verify migrations:
   ```sql
   SELECT * FROM entitlements LIMIT 1;
   SELECT * FROM sessions LIMIT 1;
   ```

### 3. Configure Storage Buckets

Create storage buckets in Supabase Dashboard → Storage:

- **`cvs`** - Public read, authenticated write
- **`job-descriptions`** - Public read, authenticated write
- **`audio-recordings`** - Private, authenticated read/write
- **`reports`** - Private, authenticated read/write

### 4. Set Up Vercel Staging Environment

1. Push `staging` branch to GitHub:
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. In Vercel Dashboard:
   - Import your repository
   - Set branch to `staging`
   - Configure environment variables (see below)

### 5. Configure Staging Environment Variables

In Vercel → Project Settings → Environment Variables (Staging):

```bash
# Supabase (Staging)
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_...

# Site
NEXT_PUBLIC_SITE_URL=https://staging.interviewlab.io
NODE_ENV=production
```

### 6. Set Up Stripe Webhook for Staging

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://staging.interviewlab.io/api/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 7. Deploy to Staging

```bash
git push origin staging
```

Vercel will automatically deploy. Wait for deployment to complete.

### 8. Test Staging Environment

- [ ] Sign up with test account
- [ ] Upload CV and job description
- [ ] Complete short interview (text mode)
- [ ] Complete short interview (voice mode)
- [ ] Purchase test pack (use card `4242 4242 4242 4242`)
- [ ] Complete paid interview
- [ ] View report
- [ ] Download PDF
- [ ] Check Supabase logs for errors
- [ ] Verify Stripe webhook received

---

## Production Environment Setup (T151)

### 1. Create Production Supabase Project

Same as staging, but name it `interviewlab-production`.

**Important:**
- Use a different, stronger database password
- Enable Point-in-Time Recovery (PITR) for backups
- Enable database connection pooling

### 2. Run Database Migrations on Production

Run all migrations from `db/migrations/` (001 through 013).

### 3. Configure Storage Buckets

Same as staging - create all four buckets with proper RLS policies.

### 4. Configure Production Domain

1. In Vercel → Project Settings → Domains
2. Add your domain: `interviewlab.io`
3. Add `www.interviewlab.io` → redirect to apex
4. Configure DNS:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

5. Wait for SSL certificate (automatic)

### 5. Set Up Production Environment Variables

In Vercel → Project Settings → Environment Variables (Production):

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (LIVE Mode) 🚨
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_...

# Site
NEXT_PUBLIC_SITE_URL=https://interviewlab.io
NODE_ENV=production

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 6. Set Up Stripe Webhook for Production

1. In Stripe Dashboard → Switch to **Live Mode**
2. Go to Developers → Webhooks
3. Add endpoint: `https://interviewlab.io/api/stripe-webhook`
4. Select events: `checkout.session.completed`
5. Copy webhook signing secret to production `STRIPE_WEBHOOK_SECRET`

### 7. Pre-Deployment Checklist

- [ ] All migrations tested on staging
- [ ] All environment variables set correctly
- [ ] Stripe live mode keys configured
- [ ] Domain DNS configured
- [ ] SSL certificate valid
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Analytics configured (PostHog/Plausible)
- [ ] Database backups enabled
- [ ] Terms of Service page created
- [ ] Privacy Policy page created
- [ ] GDPR compliance verified

### 8. Deploy to Production

```bash
git checkout main
git merge staging
git push origin main
```

Vercel will automatically deploy to production.

### 9. Post-Deployment Verification

Within 1 hour of deployment:

- [ ] Sign up with real email → verify email delivery
- [ ] Upload CV → verify storage works
- [ ] Complete interview → verify AI generation
- [ ] Make small test purchase → verify payment flow
- [ ] **Immediately refund test purchase**
- [ ] Check error logs (zero errors expected)
- [ ] Test on mobile (iPhone & Android)
- [ ] Verify security headers (securityheaders.com)
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test accessibility (WCAG audit)

### 10. Monitoring Setup

**Uptime Monitoring:**
- Add to UptimeRobot or Better Stack
- Monitor: `https://interviewlab.io`
- Alert via email/SMS on downtime

**Error Tracking:**
- Configure Sentry alerts for critical errors
- Set up Slack notifications

**Performance Monitoring:**
- Enable Vercel Analytics
- Monitor Core Web Vitals

**Database Monitoring:**
- Supabase Dashboard → observe connections, queries
- Set alerts for high connection count

---

## Rollback Procedure

If production deployment fails:

1. In Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "..." → "Promote to Production"
4. Investigate issue in staging
5. Fix and re-deploy

---

## Secrets Rotation

Rotate secrets every 90 days or immediately if compromised:

### Rotate Supabase Service Role Key:
1. Supabase Dashboard → Settings → API
2. Click "Reset service_role secret"
3. Copy new key
4. Update in Vercel environment variables
5. Redeploy

### Rotate Stripe Webhook Secret:
1. Stripe Dashboard → Developers → Webhooks
2. Delete old endpoint
3. Create new endpoint
4. Copy new signing secret
5. Update in Vercel
6. Redeploy

### Rotate OpenAI API Key:
1. OpenAI Dashboard → API Keys
2. Create new key
3. Update in Vercel
4. Delete old key
5. Redeploy

---

## Scaling Considerations

**When to scale:**
- Database connections > 50
- Response time > 3s consistently
- More than 100 concurrent users

**How to scale:**
- Enable Supabase connection pooling (Supavisor)
- Upgrade Supabase plan (Pro tier)
- Add Redis for caching (Upstash)
- Enable Vercel Edge Functions for API routes
- Add CDN for static assets (Cloudflare)
- Consider read replicas for database

---

## Support Contacts

- **Vercel Support:** support@vercel.com
- **Supabase Support:** Dashboard → Help
- **Stripe Support:** Dashboard → Help
- **OpenAI Support:** help.openai.com

---

## Emergency Procedures

**Database Issue:**
1. Check Supabase Dashboard → Database → Logs
2. If corrupted, restore from Point-in-Time backup
3. Notify users via status page

**Payment Issue:**
1. Check Stripe Dashboard → Events
2. Verify webhook is receiving events
3. Check webhook logs: `/api/stripe-webhook`
4. Contact Stripe support if persistent

**AI Service Down:**
1. Check OpenAI status page
2. Temporarily disable AI features
3. Show maintenance message to users

---

**Last Updated:** October 11, 2025

