# InterviewLab Operations Runbook

**Purpose:** Quick reference for common operational tasks and incident response.

**Audience:** On-call engineers, DevOps, site administrators.

---

## Table of Contents

1. [Health Checks](#health-checks)
2. [Common Issues](#common-issues)
3. [Incident Response](#incident-response)
4. [Database Operations](#database-operations)
5. [User Support](#user-support)
6. [Monitoring & Alerts](#monitoring--alerts)

---

## Health Checks

### Quick Health Check (Manual)

```bash
# 1. Check main site
curl -I https://interviewlab.io
# Expected: 200 OK

# 2. Check API health
curl https://interviewlab.io/api/user/entitlements
# Expected: 401 (requires auth) or 200 with data

# 3. Check Supabase
curl https://your-project.supabase.co/rest/v1/
# Expected: 200

# 4. Check Stripe
stripe events list --limit 1
# Expected: Recent events visible
```

### Automated Health Checks

- **Uptime Monitor:** https://uptimerobot.com/dashboard
- **Vercel Analytics:** https://vercel.com/your-org/interviewlab/analytics
- **Supabase Health:** Dashboard → Settings → Database Health

---

## Common Issues

### Issue 1: Users Can't Sign In

**Symptoms:** "Invalid credentials" or redirect loops

**Diagnosis:**
1. Check Supabase auth logs:
   - Dashboard → Authentication → Logs
2. Verify email delivery (check spam folder)
3. Test with known working account

**Resolution:**
```bash
# If email confirmation is stuck, manually confirm user:
# In Supabase SQL Editor:
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

---

### Issue 2: Interview Won't Start

**Symptoms:** "Failed to create session" error

**Diagnosis:**
1. Check entitlement balance:
   ```sql
   SELECT * FROM entitlements 
   WHERE user_id = 'user-id-here' 
   AND status = 'active';
   ```
2. Check OpenAI API status: https://status.openai.com
3. Check database connection count (should be < 60)

**Resolution:**
- If no entitlements: User needs to purchase or use exemption code
- If OpenAI down: Wait for recovery or show maintenance message
- If DB connections high: Enable connection pooling

---

### Issue 3: Payment Webhook Failed

**Symptoms:** User paid but didn't receive credits

**Diagnosis:**
1. Check Stripe Dashboard → Events
2. Find `checkout.session.completed` event
3. Check webhook response (should be 200)
4. Check server logs for `[T134 Webhook]`

**Resolution:**
```bash
# Manually grant entitlement:
# In Supabase SQL Editor:
INSERT INTO entitlements (user_id, type, status, tier, remaining_interviews, perks, stripe_session_id)
VALUES (
  'user-id-here',
  'interview_package',
  'active',
  'professional',
  5,
  '{"voice_mode": true, "multi_stage": true}',
  'cs_test_...'
);

# Log the manual grant:
INSERT INTO entitlement_history (user_id, entitlement_id, action, new_balance, metadata)
VALUES (
  'user-id-here',
  'entitlement-id-here',
  'grant',
  5,
  '{"manual": true, "reason": "webhook failure", "granted_by": "admin"}'
);
```

---

### Issue 4: AI Generation Timeout

**Symptoms:** "Request timed out" during interview

**Diagnosis:**
1. Check OpenAI API latency
2. Check question complexity (very long prompts?)
3. Check rate limits (429 errors in logs)

**Resolution:**
- Increase timeout in `lib/openai.ts` if needed
- Optimize prompts to be more concise
- If rate limited: wait 60s or upgrade OpenAI tier

---

### Issue 5: Storage Upload Fails

**Symptoms:** "Failed to upload file" error

**Diagnosis:**
1. Check file size (max 5MB for CV)
2. Check storage bucket policies in Supabase
3. Check storage quota (Supabase dashboard)

**Resolution:**
```bash
# Verify RLS policies are correct:
# In Supabase SQL Editor:
SELECT * FROM storage.policies WHERE bucket_id = 'cvs';

# If policy missing, re-run:
# db/migrations/003_storage_policies.sql
```

---

## Incident Response

### Severity Levels

- **P0 (Critical):** Site down, payments failing, data loss
- **P1 (High):** Major feature broken, affecting many users
- **P2 (Medium):** Minor feature broken, workaround available
- **P3 (Low):** Cosmetic issue, no functional impact

### P0 Response Procedure

1. **Acknowledge** (within 5 minutes)
   - Post in #incidents Slack channel
   - Update status page

2. **Assess** (within 15 minutes)
   - Check monitoring dashboards
   - Identify root cause
   - Estimate impact (% of users affected)

3. **Mitigate** (within 30 minutes)
   - If deployment issue: rollback immediately
   - If third-party outage: communicate with users
   - If database issue: restore from backup if needed

4. **Resolve** (ASAP)
   - Apply fix
   - Deploy to production
   - Verify resolution

5. **Post-Mortem** (within 48 hours)
   - Write incident report
   - Identify preventative measures
   - Update runbook

### Quick Rollback

```bash
# Via Vercel CLI:
vercel rollback

# Or via Vercel Dashboard:
# Deployments → Previous deployment → Promote to Production
```

---

## Database Operations

### Backup & Restore

**Automatic Backups:**
- Supabase Pro: Daily automatic backups (7-day retention)
- Point-in-Time Recovery: Restore to any point in last 7 days

**Manual Backup:**
```bash
# Export all tables:
pg_dump -h db.your-project.supabase.co \
  -U postgres -d postgres \
  --no-owner --no-acl \
  > backup-$(date +%Y%m%d).sql
```

**Restore from Backup:**
1. Supabase Dashboard → Database → Backups
2. Select backup date
3. Click "Restore"
4. Confirm (this is destructive!)

### Common Queries

**Check user entitlements:**
```sql
SELECT 
  u.email,
  e.tier,
  e.remaining_interviews,
  e.status
FROM auth.users u
LEFT JOIN entitlements e ON e.user_id = u.id
WHERE u.email = 'user@example.com';
```

**View recent interview sessions:**
```sql
SELECT 
  s.id,
  s.created_at,
  s.mode,
  s.status,
  s.plan_tier,
  u.email
FROM sessions s
JOIN auth.users u ON u.id = s.user_id
ORDER BY s.created_at DESC
LIMIT 20;
```

**View payment history:**
```sql
SELECT 
  eh.created_at,
  eh.action,
  eh.new_balance,
  u.email,
  e.tier
FROM entitlement_history eh
JOIN auth.users u ON u.id = eh.user_id
JOIN entitlements e ON e.id = eh.entitlement_id
WHERE eh.action = 'purchase'
ORDER BY eh.created_at DESC
LIMIT 50;
```

---

## User Support

### Grant Free Interviews (Admin)

```sql
INSERT INTO entitlements (user_id, type, status, remaining_interviews, perks)
VALUES (
  'user-id-here',
  'interview_package',
  'active',
  3,
  '{"voice_mode": true}'
);
```

### Reset User Password

1. Supabase Dashboard → Authentication → Users
2. Find user by email
3. Click "..." → Reset Password
4. User will receive password reset email

### Delete User Account (GDPR)

```sql
-- This cascades to all related data (sessions, turns, entitlements)
DELETE FROM auth.users WHERE email = 'user@example.com';
```

### View User Activity

```sql
SELECT 
  s.created_at,
  s.mode,
  s.job_title,
  s.company_name,
  COUNT(t.id) as questions_answered
FROM sessions s
LEFT JOIN turns t ON t.session_id = s.id
WHERE s.user_id = 'user-id-here'
GROUP BY s.id
ORDER BY s.created_at DESC;
```

---

## Monitoring & Alerts

### Key Metrics to Watch

**Application:**
- Response time (P95 < 2s)
- Error rate (< 1%)
- Interview completion rate (> 80%)
- Payment success rate (> 98%)

**Infrastructure:**
- Database connections (< 60)
- CPU usage (< 70%)
- Memory usage (< 80%)
- Storage usage (< 90%)

**Business:**
- Daily signups
- Daily interviews completed
- Revenue (MRR)
- Churn rate

### Alert Configuration

**Vercel:**
- Enable build failure notifications
- Enable deployment notifications
- Set up performance alerts (response time > 3s)

**Supabase:**
- Enable database CPU > 80% alert
- Enable connection count > 70 alert
- Enable storage > 90% alert

**Sentry (Error Tracking):**
- Alert on new error types
- Alert on error spike (> 10 errors/min)
- Daily error digest

---

## Maintenance Windows

**Recommended Schedule:**
- **Database migrations:** Tuesday 2-4 AM UTC
- **Dependency updates:** Weekly, Friday evening
- **Major feature releases:** Monday-Thursday
- **Avoid deployments:** Friday afternoon, weekends

**Maintenance Procedure:**
1. Announce 48 hours in advance (email + status page)
2. Enable maintenance mode if needed
3. Run migrations on staging first
4. Deploy to production
5. Monitor for 2 hours post-deployment
6. Announce completion

---

## Emergency Contacts

**On-Call Rotation:** See PagerDuty schedule

**Escalation Path:**
1. On-call engineer → 15 min response
2. Team lead → 30 min response
3. CTO → 1 hour response

**External Support:**
- **Vercel:** support@vercel.com (Response: 4 hours)
- **Supabase:** Dashboard → Help (Response: 8 hours)
- **Stripe:** Dashboard → Support (Response: 24 hours)
- **OpenAI:** help.openai.com (Response: 48 hours)

---

## Useful Commands

**Check deployment status:**
```bash
vercel ls
```

**View recent logs:**
```bash
vercel logs interviewlab --since 1h
```

**Run database migration:**
```bash
# Via Supabase SQL Editor
psql -h db.your-project.supabase.co -U postgres -d postgres -f migration.sql
```

**Test Stripe webhook:**
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger checkout.session.completed
```

---

**Last Updated:** October 11, 2025  
**Version:** 1.0  
**Owner:** Platform Team

