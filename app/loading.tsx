/**
 * Loading state for root page
 * Prevents flash of free landing page when premium users navigate via client-side routing
 * Shows elegant loading spinner that matches premium dashboard aesthetic
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50/30 via-white to-white">
      <div className="text-center">
        {/* Spinner with brand colors */}
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent mb-4"></div>
        
        {/* Loading text with same typography as premium dashboard */}
        <p className="text-sm font-light text-slate-600 tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
}

