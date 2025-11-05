'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, BarChart3, Settings, HelpCircle, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/lib/dashboard-stats';

interface PremiumLandingViewProps {
  tier: string;
  expiresAt: string | null;
  isSuperAdmin?: boolean;
  stats: DashboardStats;
  userName: string;
}

/**
 * Premium Landing Page - "Concierge, Not Catalogue" Design
 * 
 * Psychological Principles:
 * - Costly Signaling: Premium shown through restraint, not badges
 * - Peak-End Rule: Start interview = peak, Reports = positive end
 * - Goal Gradient: Progress shown magnetizes incomplete sessions
 * - Choice Architecture: Natural flow mirrored in design
 * 
 * Design Philosophy: Rolls-Royce dashboard, not Toyota
 */
export function PremiumLandingView({
  tier,
  expiresAt,
  isSuperAdmin = false,
  stats,
  userName,
}: PremiumLandingViewProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!expiresAt || isSuperAdmin) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setTimeRemaining(`${days} day${days !== 1 ? 's' : ''} remaining`);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        setTimeRemaining(`${hours} hour${hours !== 1 ? 's' : ''} remaining`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [expiresAt, isSuperAdmin]);

  // Get tier display name
  const getTierDisplay = () => {
    if (isSuperAdmin) return 'Lifetime Access';
    switch (tier) {
      case '48h':
        return '2-Day Pass';
      case '7d':
        return '7-Day Pass';
      case '30d':
        return '30-Day Pass';
      case 'lifetime':
        return 'Lifetime Access';
      default:
        return 'Premium';
    }
  };

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white">
      <div className="mx-auto max-w-2xl px-6 md:px-8 py-12 md:py-16 flex flex-col min-h-screen justify-between">
        {/* STATUS & WELCOME SECTION (25% of viewport) */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-light text-slate-800 tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs text-slate-500 font-light tracking-wide">
            {getTierDisplay()}
            {!isSuperAdmin && tier !== 'lifetime' && timeRemaining && (
              <>
                <span className="mx-2">•</span>
                <span>{timeRemaining}</span>
              </>
            )}
          </p>
        </div>

        {/* PRIMARY ACTION ZONE (40% of viewport) */}
        <div className="flex-1 flex flex-col justify-center space-y-6 my-12">
          <Button
            asChild
            className="w-full h-20 md:h-24 text-lg md:text-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] rounded-2xl"
          >
            <Link href="/setup">
              Start New Interview
              <span className="ml-3 text-2xl">→</span>
            </Link>
          </Button>
        </div>

        {/* SECONDARY ACTIONS (20% of viewport) */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Continue Interview (if incomplete session exists) */}
            {stats.incompleteSession ? (
              <Button
                asChild
                variant="outline"
                className="h-auto py-6 flex flex-col items-start space-y-2 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors"
              >
                <Link href={`/interview/${stats.incompleteSession.id}`}>
                  <div className="w-full flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Continue Interview</span>
                    <span className="text-xs text-slate-500">{stats.incompleteSession.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                      style={{ width: `${stats.incompleteSession.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{stats.incompleteSession.remainingMinutes} min remaining</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                className="h-20 font-semibold hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors"
              >
                <Link href="/setup">
                  <BarChart3 className="h-5 w-5 mr-2 text-slate-500" />
                  Quick Session
                </Link>
              </Button>
            )}

            {/* View Reports */}
            <Button
              asChild
              variant="outline"
              className="h-20 font-semibold hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors"
            >
              <Link href="/report">
                <BarChart3 className="h-5 w-5 mr-2 text-slate-500" />
                View Reports
                {stats.recentSessions.length > 0 && (
                  <span className="ml-auto text-xs text-slate-500">
                    Latest: {stats.recentSessions[0].overallScore}/10
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* UTILITY FOOTER (15% of viewport) */}
        <div className="space-y-6 pt-8 border-t border-slate-200/50">
          {/* CV Upload Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-light">CV on file ✓</span>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-slate-500 hover:text-slate-700"
            >
              <Link href="/setup">
                <Pencil className="h-3 w-3 mr-1" />
                Update
              </Link>
            </Button>
          </div>

          {/* Utility Links */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
            <Link href="/pricing" className="hover:text-slate-600 transition-colors">
              Settings
            </Link>
            <span>•</span>
            <Link href="/pricing" className="hover:text-slate-600 transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
