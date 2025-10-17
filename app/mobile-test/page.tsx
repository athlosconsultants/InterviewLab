'use client';

import { useIsMobile } from '@/lib/useIsMobile';

/**
 * Test page for mobile detection hook
 * Access at: /mobile-test
 *
 * Instructions:
 * 1. Open in browser
 * 2. Open DevTools (F12)
 * 3. Toggle device toolbar (Ctrl/Cmd + Shift + M)
 * 4. Select iPhone 13 or similar mobile device
 * 5. Observe the display changes and console logs
 */
export default function MobileTestPage() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Mobile Detection Test</h1>
          <p className="text-muted-foreground">
            T150: Device Detection Hook (Client-Side)
          </p>
        </div>

        {/* Detection Result */}
        <div
          className={`p-8 rounded-xl border-2 shadow-lg transition-all duration-300 ${
            isMobile
              ? 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-300 dark:border-cyan-800'
              : 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-300 dark:border-purple-800'
          }`}
        >
          <div className="text-center space-y-4">
            <div className="text-6xl">{isMobile ? '📱' : '🖥️'}</div>
            <h2 className="text-3xl font-bold">
              {isMobile ? 'Mobile View' : 'Desktop View'}
            </h2>
            <p className="text-lg">
              Current viewport:{' '}
              <strong>{isMobile ? '≤768px' : '>768px'}</strong>
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-3">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open browser DevTools (F12 or Cmd+Option+I)</li>
            <li>Toggle device toolbar (Ctrl/Cmd + Shift + M)</li>
            <li>Select &quot;iPhone 13&quot; or similar mobile device</li>
            <li>Watch the display change and check console logs</li>
            <li>Toggle between mobile and desktop to see live updates</li>
          </ol>
        </div>

        {/* Technical Details */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ✅ Hook Details:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
            <li>Uses window.matchMedia API for accurate detection</li>
            <li>Breakpoint: 768px (matches Tailwind&apos;s md breakpoint)</li>
            <li>Automatically updates on viewport resize</li>
            <li>Console logging enabled for debugging</li>
            <li>SSR-safe (initializes on client mount)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
