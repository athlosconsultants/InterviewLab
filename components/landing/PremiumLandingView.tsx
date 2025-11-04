'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Clock,
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  BarChart3,
  Star,
  Flame,
  PlayCircle,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/lib/dashboard-stats';
import { formatDistanceToNow } from 'date-fns';

interface PremiumLandingViewProps {
  tier: string;
  expiresAt: string | null;
  isSuperAdmin?: boolean;
  stats: DashboardStats;
  userName: string;
}

/**
 * Premium user dashboard
 * Shows personalized stats, quick access to interviews, recent sessions, and subscription status
 * Replaces the default landing page for logged-in premium users
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
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days} day${days !== 1 ? 's' : ''} ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

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
        return 'Premium Access';
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
    return null; // Prevent hydration mismatch
  }

  return (
    <main className="min-h-screen bg-[#F5F9FA]">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-10">
        {/* Header Section with Greeting and Subscription Badge */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2">
              {getGreeting()}, {userName}! 🎯
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${
                  timeRemaining === 'Expired' ? 'bg-red-500' : 'bg-green-500'
                }`}
              >
                <Zap className="h-3 w-3 mr-1" />
                {getTierDisplay()}{' '}
                {timeRemaining === 'Expired' ? 'Expired' : 'Active'}
              </span>
              {!isSuperAdmin && tier !== 'lifetime' && timeRemaining && (
                <span className="text-sm text-[#64748B]">
                  {timeRemaining} left
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Quick Stats Cards - 4 columns */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Interviews */}
          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500 mb-3">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#1E293B] mb-1">
              {stats.totalInterviews}
            </p>
            <p className="text-sm text-[#64748B]">Interviews Completed</p>
          </div>

          {/* Average Score */}
          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 mb-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#1E293B] mb-1">
              {stats.averageScore}/10
            </p>
            <p className="text-sm text-[#64748B]">Average Score</p>
          </div>

          {/* Practice Streak */}
          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 mb-3">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#1E293B] mb-1">
              {stats.practiceStreak}
            </p>
            <p className="text-sm text-[#64748B]">Day Streak</p>
          </div>

          {/* Total Practice Time */}
          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 mb-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#1E293B] mb-1">
              {stats.totalPracticeTimeHours}h
            </p>
            <p className="text-sm text-[#64748B]">Practice Time</p>
          </div>
        </section>

        {/* Primary CTA: Start Interview Section */}
        <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8 space-y-6">
          {/* Continue Incomplete Interview (if exists) */}
          {stats.incompleteSession && (
            <div className="pb-6 border-b border-slate-200 space-y-4">
              <h3 className="text-xl font-semibold text-[#1E293B]">
                Continue where you left off?
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#F5F9FA] p-4 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <h4 className="font-medium text-[#1E293B]">
                    {stats.incompleteSession.role} at{' '}
                    {stats.incompleteSession.company}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-[#64748B] mt-1">
                    <span>{stats.incompleteSession.progress}% complete</span>
                    <span>•</span>
                    <span>
                      ~{stats.incompleteSession.remainingMinutes} min remaining
                    </span>
                  </div>
                  {/* Simple progress bar */}
                  <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${stats.incompleteSession.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    <Link href={`/interview/${stats.incompleteSession.id}`}>
                      Continue →
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/setup">Start Fresh</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* New Interview Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#1E293B]">
              Ready to Practice?
            </h3>
            <p className="text-[#64748B] leading-relaxed">
              Start a personalized interview session tailored to your experience
              and target role.
            </p>

            {/* Quick Launch Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                asChild
                variant="outline"
                className="justify-start p-4 h-auto text-left"
              >
                <Link href="/assessment/setup">
                  <Zap className="h-5 w-5 mr-3 text-cyan-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#1E293B]">
                      Quick 3-question warmup
                    </p>
                    <p className="text-sm text-[#64748B]">~5 min</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto text-[#64748B]" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start p-4 h-auto text-left"
              >
                <Link href="/setup">
                  <Target className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#1E293B]">
                      Full interview session
                    </p>
                    <p className="text-sm text-[#64748B]">~15-20 min</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto text-[#64748B]" />
                </Link>
              </Button>
            </div>

            {/* Main CTA Button */}
            <Button
              asChild
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all mt-4"
            >
              <Link href="/setup">
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Premium Interview →
              </Link>
            </Button>

            <p className="text-sm text-[#64748B] text-center mt-4">
              Unlimited questions • Voice mode • Detailed feedback
            </p>
          </div>
        </section>

        {/* Recent Interview Sessions */}
        {stats.recentSessions.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#1E293B]">
                Recent Practice Sessions
              </h3>
            </div>
            <div className="space-y-4">
              {stats.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-[#F5F9FA] rounded-lg border border-slate-200"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1E293B]">
                      {session.role} @ {session.company}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-[#64748B] mt-1">
                      <span>
                        {formatDistanceToNow(new Date(session.completedAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {session.overallScore}/10
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/report/${session.id}`}>View Details →</Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
