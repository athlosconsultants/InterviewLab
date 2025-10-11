# E2E Testing Guide (T149)

**Goal:** 80%+ coverage of critical user paths with Playwright

**Status:** 🟡 In Progress

---

## Test Structure

```
tests/
├── e2e/
│   ├── auth-flow.spec.ts         # Sign up, sign in, sign out
│   ├── interview-flow.spec.ts     # Complete interview (existing)
│   ├── payment-flow.spec.ts       # Purchase credits
│   ├── report-flow.spec.ts        # View and download report
│   └── helpers/
│       ├── auth.ts                # Reusable auth utilities
│       ├── setup.ts               # Setup flow utilities
│       └── fixtures.ts            # Test data fixtures
```

---

## Running Tests

```bash
# Run all tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/e2e/auth-flow.spec.ts

# Run tests in UI mode (interactive)
pnpm playwright test --ui

# Run tests in headed mode (see browser)
pnpm playwright test --headed

# Run tests in specific browser
pnpm playwright test --project=chromium
pnpm playwright test --project=firefox
pnpm playwright test --project=webkit

# Generate test report
pnpm playwright show-report
```

---

## Test 1: Authentication Flow

**File:** `tests/e2e/auth-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should sign up with email', async ({ page }) => {
    // Generate unique email
    const email = `test+${Date.now()}@example.com`;
    const password = 'Test123!@#';

    // Click sign in button
    await page.getByRole('link', { name: /sign in/i }).click();

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/sign-in/);

    // Fill sign-up form
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should redirect to email confirmation page or home
    await page.waitForURL(/\/(confirm-email|$)/);

    // Verify success message
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('should sign in with existing account', async ({ page }) => {
    // Use pre-created test account
    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    await page.getByRole('link', { name: /sign in/i }).click();
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to home or dashboard
    await page.waitForURL('/');

    // Verify user is logged in (check for profile menu or sign out)
    await expect(page.getByText(/sign out/i)).toBeVisible();
  });

  test('should sign out', async ({ page }) => {
    // First, sign in
    await signIn(page, {
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });

    // Click sign out
    await page.getByRole('button', { name: /sign out/i }).click();

    // Should redirect to home
    await expect(page).toHaveURL('/');

    // Verify signed out (should see sign in button)
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid.*credentials/i)).toBeVisible();
  });
});

// Helper function
async function signIn(page, { email, password }) {
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/');
}
```

---

## Test 2: Payment Flow

**File:** `tests/e2e/payment-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { signIn } from './helpers/auth';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with test account
    await signIn(page, {
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });
  });

  test('should view pricing page', async ({ page }) => {
    await page.goto('/pricing');

    // Verify all tier cards are visible
    await expect(page.getByText(/starter pack/i)).toBeVisible();
    await expect(page.getByText(/professional pack/i)).toBeVisible();
    await expect(page.getByText(/elite pack/i)).toBeVisible();

    // Verify prices
    await expect(page.getByText(/\$26\.99/)).toBeVisible();
    await expect(page.getByText(/\$39\.99/)).toBeVisible();
    await expect(page.getByText(/\$49\.99/)).toBeVisible();
  });

  test('should initiate checkout for Starter Pack', async ({ page }) => {
    await page.goto('/pricing');

    // Click "Get 3 Interviews" button
    await page.getByRole('button', { name: /get 3 interviews/i }).click();

    // Should redirect to Stripe checkout
    await page.waitForURL(/checkout\.stripe\.com/);

    // Verify Stripe checkout page loaded
    await expect(page.getByText(/card information/i)).toBeVisible();
  });

  test('should complete purchase with test card', async ({ page, context }) => {
    await page.goto('/pricing');

    // Click "Get 5 Interviews" (Professional Pack)
    await page.getByRole('button', { name: /get 5 interviews/i }).click();

    // Wait for Stripe checkout
    await page.waitForURL(/checkout\.stripe\.com/);

    // Fill in Stripe test card
    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    await cardFrame.getByLabel(/card number/i).fill('4242 4242 4242 4242');
    await cardFrame.getByLabel(/expiry/i).fill('12/25');
    await cardFrame.getByLabel(/cvc/i).fill('123');

    // Fill in billing details
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);

    // Submit payment
    await page.getByRole('button', { name: /pay/i }).click();

    // Wait for success redirect
    await page.waitForURL(/\/checkout\/success/);

    // Verify success message
    await expect(page.getByText(/purchase confirmed/i)).toBeVisible();
    await expect(page.getByText(/5.*interviews/i)).toBeVisible();
  });

  test('should show updated balance after purchase', async ({ page }) => {
    // Complete purchase (helper function)
    await purchaseStaterPack(page);

    // Go to setup page
    await page.goto('/setup');

    // Verify entitlement badge shows new balance
    await expect(page.getByText(/3 interviews/i)).toBeVisible();
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: /get 3 interviews/i }).click();

    // Use declined test card
    await page.waitForURL(/checkout\.stripe\.com/);
    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    await cardFrame.getByLabel(/card number/i).fill('4000 0000 0000 0002'); // Declined card

    await page.getByRole('button', { name: /pay/i }).click();

    // Should show error
    await expect(page.getByText(/declined/i)).toBeVisible();
  });
});

async function purchaseStaterPack(page) {
  await page.goto('/pricing');
  await page.getByRole('button', { name: /get 3 interviews/i }).click();
  // ... fill form and submit
  await page.waitForURL(/\/checkout\/success/);
}
```

---

## Test 3: Report Flow

**File:** `tests/e2e/report-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { signIn, completeInterview } from './helpers/auth';

test.describe('Report Flow', () => {
  let sessionId: string;

  test.beforeEach(async ({ page }) => {
    await signIn(page, {
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });

    // Complete an interview to generate report
    sessionId = await completeInterview(page);
  });

  test('should view report', async ({ page }) => {
    await page.goto(`/report/${sessionId}`);

    // Verify report components visible
    await expect(page.getByText(/overall score/i)).toBeVisible();
    await expect(page.getByText(/strengths/i)).toBeVisible();
    await expect(page.getByText(/areas for improvement/i)).toBeVisible();

    // Verify score dial
    const scoreElement = page.getByTestId('score-dial');
    await expect(scoreElement).toBeVisible();
  });

  test('should download PDF report', async ({ page }) => {
    await page.goto(`/report/${sessionId}`);

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page.getByRole('button', { name: /download.*pdf/i }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/interview.*report.*\.pdf/i);

    // Optionally, save and verify PDF content
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('should start new interview from report', async ({ page }) => {
    await page.goto(`/report/${sessionId}`);

    // Click "Start New Interview" button
    await page.getByRole('button', { name: /start new interview/i }).click();

    // Should redirect to setup
    await expect(page).toHaveURL('/setup');
  });

  test('should show upgrade prompt for free users', async ({ page }) => {
    // TODO: Implement logic to test free user seeing upgrade prompt
    // after completing 3 questions
  });
});
```

---

## Test Helpers

**File:** `tests/e2e/helpers/auth.ts`

```typescript
import { Page } from '@playwright/test';

export async function signIn(
  page: Page,
  { email, password }: { email: string; password: string }
) {
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/');
}

export async function completeInterview(page: Page): Promise<string> {
  await page.goto('/setup');

  // Upload test CV
  const cvInput = page.locator('input[type="file"]').first();
  await cvInput.setInputFiles('./tests/fixtures/test-cv.pdf');

  // Fill form
  await page.getByLabel(/job title/i).fill('Software Engineer');
  await page.getByLabel(/company/i).fill('Test Company');

  // Start interview
  await page.getByRole('button', { name: /start interview/i }).click();

  // Wait for interview page
  await page.waitForURL(/\/interview\//);

  // Extract session ID from URL
  const url = page.url();
  const sessionId = url.split('/interview/')[1];

  // Answer 3 questions (minimum for free tier)
  for (let i = 0; i < 3; i++) {
    await page.getByRole('textbox', { name: /your answer/i }).fill('Test answer');
    await page.getByRole('button', { name: /submit/i }).click();
    await page.waitForTimeout(1000); // Wait for next question
  }

  // Complete interview
  await page.waitForURL(/\/report\//);

  return sessionId;
}
```

**File:** `tests/fixtures/test-cv.pdf`

Create a minimal test CV PDF for upload testing.

---

## Visual Regression Testing

Add screenshot comparisons for critical pages:

```typescript
test('homepage should match baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixels: 100, // Allow small differences
  });
});

test('pricing page should match baseline', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page).toHaveScreenshot('pricing.png', {
    fullPage: true,
  });
});
```

---

## CI/CD Integration

**File:** `.github/workflows/e2e-tests.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Test Coverage Goals

| Flow | Critical Path | Coverage | Status |
|------|---------------|----------|--------|
| **Auth** | Sign up → Sign in → Sign out | 100% | 🟡 |
| **Setup** | Upload CV → Fill form → Start | 100% | 🟡 |
| **Interview (Text)** | Answer 3 questions → Complete | 100% | ✅ |
| **Interview (Voice)** | Record → Transcribe → Submit | 80% | 🟡 |
| **Payment** | View pricing → Checkout → Success | 90% | 🟡 |
| **Report** | View → Download PDF | 90% | 🟡 |

---

## Best Practices

### 1. Use Page Object Model

```typescript
// pages/PricingPage.ts
export class PricingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/pricing');
  }

  async selectStarterPack() {
    await this.page.getByRole('button', { name: /get 3 interviews/i }).click();
  }

  async selectProfessionalPack() {
    await this.page.getByRole('button', { name: /get 5 interviews/i }).click();
  }
}

// Usage in test:
const pricingPage = new PricingPage(page);
await pricingPage.goto();
await pricingPage.selectStarterPack();
```

### 2. Use Test Fixtures

```typescript
// fixtures/test-data.ts
export const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
};

export const testInterview = {
  jobTitle: 'Software Engineer',
  company: 'Test Company',
  location: 'San Francisco, CA',
};
```

### 3. Clean Up Test Data

```typescript
test.afterEach(async ({ page }) => {
  // Clean up test interview sessions
  await page.request.delete(`/api/test/cleanup`);
});
```

### 4. Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // Parallel workers
  fullyParallel: true,
});
```

---

## Acceptance Criteria

- [ ] All critical flows covered
- [ ] Tests pass consistently (no flakiness)
- [ ] Tests run in CI on every PR
- [ ] Visual regression tests for key pages
- [ ] Test execution time < 5 minutes
- [ ] Test coverage report generated

---

**Estimated Time:** 4-5 hours

**Last Updated:** October 11, 2025

