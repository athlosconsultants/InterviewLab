'use client';

/**
 * Mobile Landing Page Test
 *
 * This is a test page for T151 to verify the mobile route wrapper works.
 * A full mobile landing page (T152) will be implemented next.
 *
 * Access at: http://localhost:3001/mobile (or root when on mobile)
 */
export default function MobileLandingTest() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-background p-6">
      <div className="max-w-md mx-auto pt-12 space-y-8">
        {/* Test Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl">📱</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Mobile Layout Active
          </h1>
          <p className="text-muted-foreground">T151: Mobile Route Wrapper</p>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-800 shadow-lg">
          <div className="text-center space-y-3">
            <div className="text-4xl">✅</div>
            <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
              Mobile Route Working!
            </h2>
            <p className="text-sm text-green-800 dark:text-green-200">
              You&apos;re viewing the mobile-optimized layout
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="font-semibold text-lg">Mobile Layout Features:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Dedicated mobile route group</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Automatic desktop redirect</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Mobile-optimized header & footer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Shared backend integration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Console logging for debugging</span>
            </li>
          </ul>
        </div>

        {/* Testing Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
            🧪 Testing Instructions:
          </h3>
          <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-decimal">
            <li>View this page in mobile viewport (≤768px)</li>
            <li>Check console for mobile layout logs</li>
            <li>Resize to desktop (&gt;768px) - should redirect to /</li>
            <li>Desktop users visiting /mobile should auto-redirect</li>
          </ol>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-lg p-4 border-2 border-cyan-300 dark:border-cyan-800">
          <p className="text-sm text-center font-medium text-cyan-900 dark:text-cyan-100">
            🚀 Next: T152 - Full Hormozi-style Mobile Landing Page
          </p>
        </div>
      </div>
    </div>
  );
}
