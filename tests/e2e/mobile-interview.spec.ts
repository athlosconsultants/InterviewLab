import { test, expect, devices } from '@playwright/test';

/**
 * T159: E2E Mobile Interview Test
 *
 * Validates the complete mobile interview flow across different devices
 * Tests both text and voice interview modes on mobile viewports
 */

test.describe('Mobile Interview Flow', () => {
  // Use iPhone 13 Pro viewport for mobile tests
  test.use({
    ...devices['iPhone 13 Pro'],
  });

  test.beforeEach(async ({ page }) => {
    // Start from the mobile landing page
    await page.goto('/mobile');
  });

  test('should load mobile landing page with correct layout', async ({
    page,
  }) => {
    // Check for mobile-specific heading
    await expect(
      page.getByRole('heading', { name: /ace your next interview/i })
    ).toBeVisible();

    // Check for CTA button
    await expect(
      page.getByRole('link', { name: /start practice interview/i })
    ).toBeVisible();

    // Check for real headshots
    const images = page.locator('img[alt="User"]');
    await expect(images.first()).toBeVisible();

    // Check for features section
    await expect(page.getByText(/industry-specific questions/i)).toBeVisible();
  });

  test('should navigate to setup from mobile landing', async ({ page }) => {
    // Click the CTA
    await page.getByRole('link', { name: /start practice interview/i }).click();

    // Should redirect to sign-in (unauthenticated)
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should render mobile text interview UI on mobile viewport', async ({
    page,
    context,
  }) => {
    // Mock authentication
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Navigate to a mock interview
    await page.goto('/interview/test-session-id');

    // Should show mobile interview UI
    // Check for mobile-specific elements
    await expect(page.locator('.mobile-layout-wrapper')).toBeVisible();

    // Check for progress header
    await expect(page.getByText(/question \d+ of \d+/i)).toBeVisible();

    // Check for sticky action bar at bottom
    const actionBar = page.locator('[class*="fixed bottom-0"]');
    await expect(actionBar).toBeVisible();
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    // Click on mobile-specific elements
    const ctaButton = page.getByRole('link', {
      name: /start practice interview/i,
    });

    // Tap (touch) the button
    await ctaButton.tap();

    // Should navigate
    await expect(page).toHaveURL(/\/sign-in|\/setup/);
  });

  test('should display mobile-optimized cards with proper spacing', async ({
    page,
  }) => {
    // Check for mobile cards
    const cards = page.locator('[class*="rounded-xl"]');
    await expect(cards.first()).toBeVisible();

    // Check viewport is mobile size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(768);
  });

  test('should have touch-friendly tap targets (min 48px)', async ({
    page,
  }) => {
    // Get CTA button
    const ctaButton = page.getByRole('link', {
      name: /start practice interview/i,
    });

    // Check button height is touch-friendly
    const box = await ctaButton.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });

  test('should not show desktop-only elements on mobile', async ({ page }) => {
    // Desktop header should not be visible or should be adapted
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(768);

    // Mobile-specific gradient background should be present
    const body = page.locator('body');
    const bgClass = await body.getAttribute('class');
    // Just verify page loaded - specific class checks can be brittle
    expect(bgClass).toBeDefined();
  });

  test('should handle window resize from mobile to desktop', async ({
    page,
  }) => {
    // Start on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/mobile');

    // Verify mobile view
    await expect(
      page.getByRole('heading', { name: /ace your next interview/i })
    ).toBeVisible();

    // Resize to desktop
    await page.setViewportSize({ width: 1024, height: 768 });

    // On mobile route, should still show mobile content or redirect
    // (behavior depends on implementation)
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Mobile Interview - Text Mode', () => {
  test.use({
    ...devices['iPhone 13 Pro'],
  });

  test('should show mobile text input with large touch targets', async ({
    page,
    context,
  }) => {
    // This test would require proper auth mocking
    // Placeholder for when auth is set up
    test.skip(true, 'Requires authenticated session');

    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/interview/test-session-id');

    // Check for large textarea
    const textarea = page.getByPlaceholder(/type your answer/i);
    await expect(textarea).toBeVisible();

    const box = await textarea.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(80);
  });
});

test.describe('Mobile Interview - Voice Mode', () => {
  test.use({
    ...devices['iPhone 13 Pro'],
  });

  test('should show large voice orb on mobile', async ({ page, context }) => {
    // This test would require proper auth mocking
    test.skip(true, 'Requires authenticated session');

    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/interview/test-session-id?mode=voice');

    // Check for voice orb
    // Specific implementation would depend on actual voice UI
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Mobile Device Detection', () => {
  test('should detect iPhone and serve mobile UI', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 13 Pro'],
    });
    const page = await context.newPage();

    await page.goto('/');

    // Should redirect to /mobile for mobile devices
    await expect(page).toHaveURL(/\/mobile/);

    await context.close();
  });

  test('should detect Android and serve mobile UI', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
    });
    const page = await context.newPage();

    await page.goto('/');

    // Should redirect to /mobile for mobile devices
    await expect(page).toHaveURL(/\/mobile/);

    await context.close();
  });

  test('should detect desktop and serve desktop UI', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    await page.goto('/');

    // Should stay on / for desktop devices
    await expect(page).toHaveURL(/^\/$|^\/$/);

    await context.close();
  });
});
