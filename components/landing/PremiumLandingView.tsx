'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, BarChart3, Pencil, Target, TrendingUp, Clock, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/lib/dashboard-stats';
import { CvUploadModal } from '@/components/dashboard/CvUploadModal';
import { MotivationalInsight } from '@/components/dashboard/MotivationalInsight';
import { formatDistanceToNow } from 'date-fns';

interface PremiumLandingViewProps {
  tier: string;
  expiresAt: string | null;
  isSuperAdmin?: boolean;
  stats: DashboardStats;
  hasCv: boolean;
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
  hasCv,
}: PremiumLandingViewProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [showCvUpload, setShowCvUpload] = useState(false);

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

  // Calculate weekly count from recent sessions
  const weeklyCount = stats.recentSessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  }).length;

  return (
    <main className="premium-dashboard min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white">
      {/* Mobile & Tablet Layout (< 1024px) */}
      <div className="lg:hidden mx-auto max-w-2xl md:max-w-[520px] px-6 md:px-8 py-12 md:py-16 pb-10 sm:pb-12 md:pb-16 flex flex-col min-h-screen justify-between">
        {/* STATUS & WELCOME SECTION (25% of viewport) */}
        <div className="space-y-2 py-4">
          <h1 className="text-2xl md:text-3xl font-light text-slate-800 tracking-tight">
            {getGreeting()}
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

        {/* MOTIVATIONAL INSIGHT - Platform-specific spacing */}
        <div className="mt-5 mb-8 sm:mt-6 sm:mb-8 md:mt-8 md:mb-10">
          <MotivationalInsight />
        </div>

        {/* PRIMARY ACTION ZONE (40% of viewport) */}
        <div className="flex-1 flex flex-col justify-center space-y-6 my-6">
          <Button
            asChild
            className="w-full h-[84px] sm:h-20 md:h-24 text-lg md:text-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 active:scale-[0.98] rounded-2xl mb-8"
          >
            <Link href="/setup">
              Start New Interview
              <span className="ml-3 text-2xl">→</span>
            </Link>
          </Button>
        </div>

        {/* SECONDARY ACTIONS (20% of viewport) */}
        <div className="space-y-6 mt-6 md:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 md:gap-5 space-y-4 sm:space-y-0">
            {/* Continue Interview (if incomplete session exists) */}
            {stats.incompleteSession ? (
              <Button
                asChild
                variant="outline"
                className="h-auto py-6 flex flex-col items-start space-y-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors rounded-xl"
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
              className="h-20 font-semibold border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors rounded-xl"
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
              className="h-20 font-semibold border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors rounded-xl"
            >
              <Link href="/dashboard/reports">
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
        <div className="space-y-6 pt-6 mt-4 md:mt-6 border-t border-slate-200/50">
          {/* CV Upload Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-light">
                {hasCv ? 'CV on file' : 'No CV uploaded'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-slate-500 hover:text-slate-700"
              onClick={() => setShowCvUpload(true)}
            >
              <Pencil className="h-3 w-3 mr-1" />
              {hasCv ? 'Update' : 'Upload'}
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

      {/* Desktop Two-Column Layout (>= 1024px) */}
      <div className="hidden lg:flex mx-auto max-w-7xl px-12 py-16 pb-16 min-h-screen">
        <div className="flex gap-12 w-full">
          
          {/* LEFT COLUMN: Primary Actions */}
          <div className="flex-1 max-w-[640px] flex flex-col justify-between">
            {/* STATUS & WELCOME */}
            <div className="space-y-2 py-4">
              <h1 className="text-3xl font-light text-slate-800 tracking-tight">
                {getGreeting()}
              </h1>
              <p className="text-sm text-slate-500 font-light tracking-wide">
                {getTierDisplay()}
                {!isSuperAdmin && tier !== 'lifetime' && timeRemaining && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{timeRemaining}</span>
                  </>
                )}
              </p>
            </div>

            {/* PRIMARY CTA */}
            <div className="flex-1 flex flex-col justify-center space-y-6 my-12">
              <Button
                asChild
                className="w-full h-28 text-2xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98] rounded-2xl"
              >
                <Link href="/setup">
                  Start New Interview
                  <span className="ml-3 text-3xl">→</span>
                </Link>
              </Button>
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {stats.incompleteSession ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-24 py-6 flex flex-col justify-center items-start space-y-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors rounded-xl"
                  >
                    <Link href={`/interview/${stats.incompleteSession.id}`}>
                      <div className="w-full flex items-center justify-between">
                        <span className="font-semibold text-slate-800 text-lg">Continue Interview</span>
                        <span className="text-sm text-slate-500">{stats.incompleteSession.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                          style={{ width: `${stats.incompleteSession.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-500">{stats.incompleteSession.remainingMinutes} min remaining</span>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="h-24 text-lg font-semibold border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors rounded-xl"
                  >
                    <Link href="/setup">
                      <BarChart3 className="h-6 w-6 mr-3 text-slate-500" />
                      Quick Session
                    </Link>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  className="h-24 text-lg font-semibold border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors rounded-xl"
                >
                  <Link href="/dashboard/reports">
                    <BarChart3 className="h-6 w-6 mr-3 text-slate-500" />
                    View Reports
                    {stats.recentSessions.length > 0 && (
                      <span className="ml-auto text-sm text-slate-500">
                        {stats.recentSessions[0].overallScore}/10
                      </span>
                    )}
                  </Link>
                </Button>
              </div>
            </div>

            {/* UTILITY FOOTER */}
            <div className="space-y-6 pt-8 mt-8 border-t border-slate-200/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-light">
                    {hasCv ? 'CV on file' : 'No CV uploaded'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-2 px-3 text-sm text-slate-500 hover:text-slate-700"
                  onClick={() => setShowCvUpload(true)}
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  {hasCv ? 'Update' : 'Upload'}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
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

          {/* RIGHT COLUMN: Info & Stats */}
          <div className="w-[420px] flex flex-col space-y-6 py-4">
            {/* MOTIVATIONAL INSIGHT */}
            <div>
              <MotivationalInsight />
            </div>

            {/* QUICK STATS CARD */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-5">
                Your Progress
              </h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-50">
                      <BarChart3 className="h-5 w-5 text-cyan-600" />
                    </div>
                    <span className="text-sm text-slate-600">Total Interviews</span>
                  </div>
                  <span className="text-2xl font-semibold text-slate-900">{stats.totalInterviews}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm text-slate-600">This Week</span>
                  </div>
                  <span className="text-2xl font-semibold text-green-600">{weeklyCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-slate-600">Average Score</span>
                  </div>
                  <span className="text-2xl font-semibold text-slate-900">
                    {stats.averageScore > 0 ? `${stats.averageScore}/10` : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="text-sm text-slate-600">Practice Time</span>
                  </div>
                  <span className="text-2xl font-semibold text-slate-900">
                    {stats.totalPracticeTimeHours > 0 ? `${stats.totalPracticeTimeHours}h` : '—'}
                  </span>
                </div>

                {stats.recentSessions.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Last session: {formatDistanceToNow(new Date(stats.recentSessions[0].completedAt), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PRACTICE STREAK (if applicable) */}
            {stats.practiceStreak > 0 && (
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{stats.practiceStreak}-Day Streak!</h3>
                </div>
                <p className="text-sm text-slate-700 mb-3">
                  You&apos;ve practiced {stats.practiceStreak} {stats.practiceStreak === 1 ? 'day' : 'days'} in a row. Keep it up!
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-700 font-medium">
                  {stats.practicedToday ? '✓ Practiced today' : 'Practice today to continue your streak'}
                </div>
              </div>
            )}

            {/* NEXT MILESTONE (if under 10 interviews) */}
            {stats.totalInterviews < 10 && (
              <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 p-6 border border-cyan-100">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-5 w-5 text-cyan-600" />
                  <h3 className="text-sm font-semibold text-slate-800">Next Milestone</h3>
                </div>
                <p className="text-sm text-slate-700 mb-4">
                  {10 - stats.totalInterviews} more {10 - stats.totalInterviews === 1 ? 'interview' : 'interviews'} to unlock advanced insights
                </p>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${(stats.totalInterviews / 10) * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-cyan-700 font-medium">
                  {stats.totalInterviews}/10 interviews
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CV Upload Modal */}
      {showCvUpload && (
        <CvUploadModal
          isOpen={showCvUpload}
          onClose={() => setShowCvUpload(false)}
          hasCv={hasCv}
        />
      )}
    </main>
  );
}
