# Performance Optimization Guide (T148)

**Goal:** Lighthouse Performance Score > 90, Core Web Vitals in "Good" range

**Status:** 🟡 In Progress

---

## Core Web Vitals Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | TBD | 🟡 |
| **FID** (First Input Delay) | < 100ms | TBD | 🟡 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | TBD | 🟡 |
| **FCP** (First Contentful Paint) | < 1.8s | TBD | 🟡 |
| **TTI** (Time to Interactive) | < 3.8s | TBD | 🟡 |

---

## Performance Audit

### 1. Run Lighthouse Audit

```bash
# Chrome DevTools → Lighthouse → Performance
# Run in Incognito mode
# Throttle: Mobile (Slow 4G)

# Or via CLI:
npm install -g lighthouse
lighthouse https://interviewlab.io --view
```

### 2. Check Bundle Size

```bash
# Analyze bundle
pnpm build
ANALYZE=true pnpm build

# Or use Next.js built-in analyzer
```

**Target Bundle Sizes:**
- First Load JS: < 300KB (gzipped)
- Route bundles: < 100KB each

### 3. Monitor Real User Metrics

Enable Vercel Analytics or Web Vitals reporting:

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Optimization Strategies

### 1. Code Splitting

#### Dynamic Imports for Heavy Components

```tsx
// ❌ Bad: Import everything upfront
import ReportView from '@/components/results/ReportView';
import PricingCards from '@/components/pricing/PricingCards';

// ✅ Good: Lazy load heavy components
import dynamic from 'next/dynamic';

const ReportView = dynamic(() => import('@/components/results/ReportView'), {
  loading: () => <ReportSkeleton />,
  ssr: false, // Disable SSR if not needed
});

const PricingCards = dynamic(() => import('@/components/pricing/PricingCards'));
```

#### Split Vendor Bundles

```js
// next.config.mjs
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            priority: 30,
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            priority: 30,
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            priority: 20,
          },
        },
      };
    }
    return config;
  },
};
```

### 2. Image Optimization

#### Use Next.js Image Component

```tsx
// ❌ Bad: Regular img tag
<img src="/hero.jpg" alt="Hero" />

// ✅ Good: Next.js Image with optimization
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority // For LCP image
/>
```

#### Compress Images

```bash
# Use sharp or imagemin
pnpm add sharp

# Optimize images in public/
npx @squoosh/cli --resize '{"width": 1200}' \
  --optimize '{"quality": 80}' public/*.jpg
```

#### Use Modern Formats

```tsx
<picture>
  <source srcSet="/hero.avif" type="image/avif" />
  <source srcSet="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" alt="Hero" />
</picture>
```

### 3. Font Optimization

#### Use next/font

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

#### Preload Critical Fonts

```tsx
// app/layout.tsx
export default function RootLayout() {
  return (
    <html>
      <head>
        <link
          rel="preload"
          href="/fonts/custom-font.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Reduce JavaScript

#### Remove Unused Dependencies

```bash
# Analyze what's using space
npx depcheck

# Check for duplicate dependencies
npx npm-check-updates

# Consider alternatives:
# - date-fns instead of moment (smaller)
# - preact instead of react (smaller, but requires config)
# - native CSS instead of animation libraries
```

#### Use Lighter Alternatives

```tsx
// ❌ Heavy: Full lodash (72KB)
import _ from 'lodash';

// ✅ Light: Cherry-pick functions (5KB)
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

// ✅ Better: Use native methods when possible
const unique = [...new Set(array)];
```

### 5. Caching & Prefetching

#### Static Page Generation

```tsx
// app/pricing/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default function PricingPage() {
  // Page is statically generated at build time
  return <PricingCards />;
}
```

#### Prefetch Critical Routes

```tsx
// Prefetch /interview route when user lands on /setup
import { useRouter } from 'next/navigation';

useEffect(() => {
  router.prefetch('/interview');
}, [router]);
```

#### Cache API Responses

```tsx
// app/api/user/entitlements/route.ts
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'private, max-age=60', // Cache for 1 minute
    },
  });
}
```

### 6. Database Optimization

#### Add Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_sessions_user_id_created 
  ON sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_status 
  ON entitlements(user_id, status);

CREATE INDEX IF NOT EXISTS idx_turns_session_created 
  ON turns(session_id, created_at);
```

#### Use Connection Pooling

Enable Supavisor in Supabase Dashboard → Database → Connection Pooling

#### Optimize Queries

```tsx
// ❌ Bad: N+1 query
const sessions = await supabase.from('sessions').select('*');
for (const session of sessions.data) {
  const turns = await supabase
    .from('turns')
    .select('*')
    .eq('session_id', session.id);
}

// ✅ Good: Single query with join
const sessions = await supabase
  .from('sessions')
  .select('*, turns(*)')
  .limit(10);
```

### 7. API Optimization

#### Reduce OpenAI Token Usage

```tsx
// ❌ Bad: Send entire CV every time
const prompt = `CV: ${fullCV}\n\nGenerate question...`;

// ✅ Good: Summarize CV once, reuse summary
const cvSummary = await summarizeCV(fullCV); // Cache this
const prompt = `CV Summary: ${cvSummary}\n\nGenerate question...`;
```

#### Batch API Calls

```tsx
// ❌ Bad: Sequential API calls
await generateQuestion1();
await generateQuestion2();
await generateQuestion3();

// ✅ Good: Parallel API calls
await Promise.all([
  generateQuestion1(),
  generateQuestion2(),
  generateQuestion3(),
]);
```

### 8. Reduce Render Blocking

#### Move Scripts to Bottom

```tsx
// ❌ Bad: Blocking script in head
<head>
  <script src="/analytics.js"></script>
</head>

// ✅ Good: Async or defer
<head>
  <script src="/analytics.js" defer></script>
</head>

// ✅ Better: Load after page interactive
<Script src="/analytics.js" strategy="lazyOnload" />
```

#### Inline Critical CSS

```tsx
// next.config.mjs
const nextConfig = {
  experimental: {
    optimizeCss: true, // Enable CSS optimization
  },
};
```

### 9. Optimize Animations

#### Use CSS transforms (GPU-accelerated)

```css
/* ❌ Bad: Animates layout properties */
.animate {
  animation: move 1s;
}

@keyframes move {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ Good: Animates transform (GPU) */
.animate {
  animation: move 1s;
}

@keyframes move {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

#### Reduce Framer Motion Bundle

```tsx
// ❌ Bad: Import entire framer-motion
import { motion } from 'framer-motion';

// ✅ Good: Use LazyMotion for reduced bundle
import { LazyMotion, domAnimation, m } from 'framer-motion';

<LazyMotion features={domAnimation}>
  <m.div animate={{ x: 100 }} />
</LazyMotion>
```

### 10. Service Worker for Offline

```tsx
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/pricing',
        '/styles.css',
        '/logo.svg',
      ]);
    })
  );
});

// Register in app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## Monitoring & Continuous Improvement

### 1. Set Up Performance Budgets

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://interviewlab.io"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

### 2. Track Real User Metrics

```tsx
// lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);

  // Send to analytics
  // posthog.capture('web_vital', metric);
}
```

### 3. Performance CI/CD

Add Lighthouse CI to GitHub Actions:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.interviewlab.io
          uploadArtifacts: true
```

---

## Quick Wins (Do First)

1. ✅ **Enable next/image** for all images
2. ✅ **Add next/font** for web fonts
3. ✅ **Lazy load** report and pricing components
4. ✅ **Compress images** (use Squoosh or sharp)
5. ✅ **Enable gzip/brotli** (automatic on Vercel)
6. ✅ **Add loading states** (reduce perceived latency)
7. ✅ **Preload LCP image** (hero image)
8. ✅ **Remove unused dependencies** (audit with depcheck)
9. ✅ **Add database indexes** (for common queries)
10. ✅ **Enable Supabase connection pooling**

---

## Acceptance Criteria

- [ ] Lighthouse Performance Score: > 90
- [ ] LCP: < 2.5s
- [ ] FID: < 100ms
- [ ] CLS: < 0.1
- [ ] First Load JS: < 300KB (gzipped)
- [ ] Tested on 3G network (DevTools throttling)
- [ ] No performance regressions in CI

---

**Estimated Time:** 3-4 hours

**Last Updated:** October 11, 2025

