# Phase 14 — Production Hardening

**Goal:** Prepare InterviewLab for production deployment with security, performance, reliability, and observability enhancements.

**Tasks:** T141 – T151 (11 tasks)

---

## 🔒 T141 — Security Headers & CSP

**Goal:** Implement security best practices via HTTP headers and Content Security Policy.

**Implementation:**
- Add security headers to `next.config.mjs`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Implement Content Security Policy (CSP) in middleware
- Add HSTS (HTTP Strict Transport Security) for production

**Files:**
- `next.config.mjs`
- `middleware.ts`

**Testing:**
- Run [Mozilla Observatory](https://observatory.mozilla.org) scan
- Verify CSP doesn't block legitimate resources
- Test on [securityheaders.com](https://securityheaders.com)

**DoD:** Security score A or A+ on Mozilla Observatory.

---

## 🚦 T142 — Rate Limiting

**Goal:** Protect API endpoints from abuse with rate limiting.

**Implementation:**
- Create `lib/rate-limit.ts` using Upstash Redis or in-memory LRU cache
- Apply rate limits:
  - **Authentication:** 5 requests/min per IP
  - **Interview submission:** 10 requests/min per user
  - **AI generation:** 3 requests/min per user
  - **File upload:** 5 uploads/hour per user
- Return `429 Too Many Requests` with `Retry-After` header
- Add rate limit info to response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

**Files:**
- `lib/rate-limit.ts` (new)
- `app/api/*/route.ts` (apply middleware)
- `app/interview/[id]/actions.ts`

**Testing:**
- Exceed rate limits and verify 429 responses
- Verify legitimate usage is not blocked
- Test rate limit reset after timeout

**DoD:** All critical endpoints protected; abuse scenarios blocked.

---

## 📊 T143 — Structured Logging & Error Tracking

**Goal:** Implement structured logging with PII redaction and centralized error handling.

**Implementation:**
- Create `lib/logger.ts` with log levels (debug, info, warn, error)
- Add request ID to all logs (from middleware)
- Redact PII: emails, tokens, passwords, user IDs (partial)
- Integrate error tracking (e.g., Sentry, LogRocket, or Axiom)
- Log key events:
  - `[AUTH] User signed in: user_xxx`
  - `[SESSION] Interview started: session_xxx (mode: voice)`
  - `[AI] GPT-4 call: 3.2s, 450 tokens`
  - `[PAYMENT] Entitlement granted: 5 interviews`
  - `[ERROR] API failure: /api/transcribe (500)`

**Files:**
- `lib/logger.ts` (new)
- All API routes and server actions
- `middleware.ts` (add request ID)

**Testing:**
- Trigger errors and verify they're logged with request IDs
- Verify PII is redacted in logs
- Test log filtering by level and tags

**DoD:** All errors logged with context; no PII leaks; request IDs traceable.

---

## 📈 T144 — Analytics & Event Tracking

**Goal:** Track user behavior and system metrics for product insights.

**Implementation:**
- Integrate analytics provider:
  - **Option 1:** PostHog (self-hosted or cloud)
  - **Option 2:** Plausible Analytics (privacy-focused)
  - **Option 3:** Custom Supabase events table
- Track events:
  - **User Journey:**
    - `signup_completed`
    - `cv_uploaded`
    - `interview_started` (mode, tier)
    - `question_answered` (turn_index, stage)
    - `interview_completed` (duration, questions_count)
    - `report_viewed`
  - **Monetization:**
    - `pricing_page_viewed`
    - `checkout_initiated` (tier)
    - `purchase_completed` (tier, amount, currency)
    - `upgrade_prompt_shown`
    - `upgrade_prompt_clicked`
  - **Engagement:**
    - `replay_used`
    - `voice_mode_toggled`
- Add user properties: `plan_tier`, `total_interviews`, `signup_date`

**Files:**
- `lib/analytics.ts` (update with new events)
- All user-facing components and actions

**Testing:**
- Complete full user flow and verify events in dashboard
- Test event properties are captured correctly
- Verify GDPR compliance (no PII in events)

**DoD:** All key events tracked; dashboard shows user funnel.

---

## ♿ T145 — Accessibility Audit & Fixes

**Goal:** Ensure WCAG 2.1 AA compliance for inclusive user experience.

**Implementation:**
- Run axe DevTools audit on all pages
- Fix critical issues:
  - Add ARIA labels to buttons and interactive elements
  - Ensure proper heading hierarchy (h1 → h2 → h3)
  - Add `alt` text to all images
  - Ensure sufficient color contrast (4.5:1 for text)
  - Add focus indicators (visible `:focus-visible` styles)
  - Make modals keyboard-navigable (focus trapping)
  - Add skip-to-content link
  - Ensure form labels are properly associated
- Test with screen reader (NVDA or VoiceOver)
- Add keyboard shortcuts guide (optional)

**Files:**
- All components (add ARIA attributes)
- `globals.css` (focus styles)
- `components/ui/*` (shadcn components)

**Testing:**
- Run automated axe audit: 0 critical, 0 serious issues
- Complete keyboard-only navigation (Tab, Enter, Esc, Arrow keys)
- Test with screen reader (VoiceOver on macOS)
- Verify focus order is logical

**DoD:** Axe audit passes; keyboard-only flow works end-to-end.

---

## 📱 T146 — Mobile Responsiveness Polish

**Goal:** Ensure excellent UX on mobile devices (iPhone, Android).

**Implementation:**
- Test on multiple breakpoints: 375px (iPhone SE), 390px (iPhone 12), 768px (iPad)
- Fix mobile issues:
  - Voice orb too large → scale down on mobile
  - Interview controls overlap → fixed bottom bar with safe-area-inset
  - Text input obscured by keyboard → scroll into view on focus
  - Pricing cards overflow → horizontal scroll or stack
  - Report charts not responsive → force responsive mode
- Add viewport meta tag with safe-area-inset
- Test touch interactions:
  - Tap targets ≥ 44x44px
  - Swipe gestures don't conflict with browser
- Optimize for iOS Safari (sticky header issues)

**Files:**
- `components/interview/mode/VoiceUI.tsx`
- `components/interview/mode/TextUI.tsx`
- `app/pricing/page.tsx`
- `components/results/ReportView.tsx`
- `globals.css` (mobile-specific styles)

**Testing:**
- Test on real iPhone and Android devices
- Use Chrome DevTools device emulation
- Test in both portrait and landscape
- Verify no horizontal scrolling

**DoD:** All pages usable on mobile; no layout breaks; touch targets adequate.

---

## 🔐 T147 — Environment & Secrets Management

**Goal:** Secure environment variable handling and secrets rotation.

**Implementation:**
- Document all required environment variables in `.env.example`
- Add runtime checks for critical env vars (fail fast if missing)
- Implement secrets validation on app startup
- Add `.env.local` to `.gitignore` (verify not committed)
- Document secrets rotation procedure:
  - Supabase service role key
  - Stripe webhook secret
  - OpenAI API key
- Add environment-specific configs:
  - `development` (localhost)
  - `staging` (preview deployments)
  - `production` (live site)

**Files:**
- `.env.example` (new)
- `lib/config.ts` (new - centralized config validation)
- `next.config.mjs` (environment-specific settings)
- `ENV_SETUP.md` (update with rotation procedures)

**Testing:**
- Run app without required env vars → should fail with clear error
- Verify no secrets in git history
- Test with invalid API keys → should error gracefully

**DoD:** All secrets documented; validation in place; no secrets in repo.

---

## ⚡ T148 — Performance Optimization

**Goal:** Optimize Core Web Vitals and reduce bundle size.

**Implementation:**
- **Code Splitting:**
  - Lazy load report components (`next/dynamic`)
  - Lazy load pricing page animations
  - Split vendor bundles (React, Framer Motion, Recharts)
- **Image Optimization:**
  - Use Next.js `<Image>` component everywhere
  - Add `blur` placeholders for hero images
  - Compress images with `sharp`
- **Bundle Analysis:**
  - Run `next build --experimental-build-analysis`
  - Identify large dependencies
  - Consider alternatives (e.g., `date-fns` instead of `moment`)
- **API Optimization:**
  - Cache Supabase queries where appropriate
  - Add `revalidate` to static pages
  - Optimize OpenAI prompts (reduce token count)
- **Font Optimization:**
  - Use `next/font` for local fonts
  - Subset fonts to only needed glyphs

**Files:**
- `next.config.mjs` (enable bundle analyzer)
- All components using heavy libraries
- `app/layout.tsx` (font optimization)

**Testing:**
- Run Lighthouse audit: aim for 90+ on Performance
- Measure Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- Test on 3G network throttling

**DoD:** Lighthouse Performance score > 90; bundle size < 300KB (gzipped).

---

## 🧪 T149 — E2E Test Coverage

**Goal:** Expand Playwright test coverage for critical user flows.

**Implementation:**
- Add comprehensive E2E tests:
  - **Auth Flow:** Sign up → verify email → sign in → sign out
  - **Interview Flow:** Upload CV → setup → voice interview → complete
  - **Payment Flow:** View pricing → checkout (test mode) → verify credits
  - **Report Flow:** Complete interview → view report → download PDF
- Add visual regression tests (screenshot comparison)
- Add API response mocking for faster tests
- Run tests in CI/CD pipeline (GitHub Actions)

**Files:**
- `tests/e2e/auth-flow.spec.ts` (new)
- `tests/e2e/interview-flow.spec.ts` (expand)
- `tests/e2e/payment-flow.spec.ts` (new)
- `tests/e2e/report-flow.spec.ts` (new)
- `.github/workflows/test.yml` (new)

**Testing:**
- Run `pnpm test:e2e`
- Verify all tests pass in CI
- Test with multiple browsers (Chromium, Firefox, WebKit)

**DoD:** 80%+ coverage of critical paths; tests run in CI; all passing.

---

## 🚀 T150 — Staging Environment Setup

**Goal:** Create a staging environment for pre-production testing.

**Implementation:**
- **Supabase Staging:**
  - Create new Supabase project for staging
  - Run all migrations on staging DB
  - Set up staging storage buckets
  - Configure RLS policies
- **Vercel Staging:**
  - Create preview deployment branch (`staging`)
  - Set staging environment variables in Vercel
  - Configure custom domain: `staging.interviewlab.io`
- **Stripe Test Mode:**
  - Use Stripe test mode keys
  - Set up webhook forwarding to staging URL
- **Seed Data:**
  - Create seed script with demo users and sessions
  - Add sample industry kits
  - Pre-populate with test entitlements

**Files:**
- `scripts/seed-staging.ts` (new)
- `.env.staging` (template)
- `DEPLOYMENT.md` (new - deployment procedures)

**Testing:**
- Deploy to staging
- Run full E2E test suite against staging
- Test Stripe checkout with test cards
- Verify emails are sent (use Mailhog or similar)

**DoD:** Staging URL functional; identical to prod except for data.

---

## 🌐 T151 — Production Deployment Preparation

**Goal:** Final checklist and prod deployment.

**Implementation:**
- **Pre-Deployment Checklist:**
  - [ ] All Phase 14 tasks complete
  - [ ] Security headers configured
  - [ ] Rate limiting enabled
  - [ ] Error tracking live (Sentry)
  - [ ] Analytics tracking (PostHog/Plausible)
  - [ ] Accessibility audit passed
  - [ ] Mobile tested on real devices
  - [ ] E2E tests passing
  - [ ] Staging tested end-to-end
  - [ ] Secrets rotated (new prod keys)
  - [ ] DNS configured
  - [ ] SSL certificate valid
  - [ ] Monitoring alerts configured
  - [ ] Backup strategy in place
  - [ ] Terms of Service & Privacy Policy live
  - [ ] GDPR compliance verified
- **Production Deployment:**
  - Create production Supabase project
  - Run migrations on prod DB
  - Set up prod storage buckets
  - Configure prod Stripe account (live mode)
  - Deploy to Vercel production
  - Set custom domain: `interviewlab.io`
  - Test post-deployment:
    - Sign up with real email
    - Complete short interview
    - Make test purchase (then refund)
- **Monitoring:**
  - Set up uptime monitoring (UptimeRobot, Better Stack)
  - Configure alerts for errors (Sentry)
  - Monitor API rate limits
  - Track Core Web Vitals (Vercel Analytics)

**Files:**
- `DEPLOYMENT.md` (comprehensive deployment guide)
- `.env.production.example`
- `docs/RUNBOOK.md` (new - operational procedures)

**Testing:**
- Complete full user journey on production
- Test with real payment (small amount)
- Monitor for errors in first 24 hours
- Load test with k6 or Artillery

**DoD:** Production deployed; monitoring in place; first users successful.

---

## 📋 Summary

| Task | Type | Priority | Estimated Time |
|------|------|----------|----------------|
| T141 | Security | Critical | 2-3 hours |
| T142 | Security | Critical | 3-4 hours |
| T143 | Observability | High | 3-4 hours |
| T144 | Analytics | High | 2-3 hours |
| T145 | Accessibility | High | 4-5 hours |
| T146 | Mobile UX | High | 3-4 hours |
| T147 | Security | Critical | 1-2 hours |
| T148 | Performance | Medium | 3-4 hours |
| T149 | Testing | Medium | 4-5 hours |
| T150 | Infrastructure | Critical | 2-3 hours |
| T151 | Deployment | Critical | 3-4 hours |

**Total Estimated Time:** 30-40 hours (1-2 weeks for single developer)

---

## 🎯 Success Criteria

**Security:**
- ✅ A+ on Mozilla Observatory
- ✅ No secrets in git history
- ✅ Rate limiting prevents abuse

**Performance:**
- ✅ Lighthouse Performance > 90
- ✅ LCP < 2.5s, FID < 100ms, CLS < 0.1
- ✅ Bundle size < 300KB gzipped

**Reliability:**
- ✅ 99.9% uptime (first month)
- ✅ All errors logged and tracked
- ✅ E2E tests passing

**Accessibility:**
- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation works
- ✅ Screen reader compatible

**User Experience:**
- ✅ Mobile responsive (no layout breaks)
- ✅ Fast page loads (< 2s)
- ✅ Clear error messages

---

## 📦 Next Steps After Phase 14

- **Phase 15:** Feature enhancements (v2.0)
  - Interview replay/review
  - Collaborative hiring (share reports)
  - Custom branding for enterprises
  - API for integrations
  - Mobile apps (React Native)

- **Phase 16:** Scale & Optimize
  - Multi-region deployment
  - CDN for assets
  - Database read replicas
  - Caching layer (Redis)
  - Background job queue

---

**Phase 14 Status:** 🔴 Not Started

**Last Updated:** October 11, 2025

