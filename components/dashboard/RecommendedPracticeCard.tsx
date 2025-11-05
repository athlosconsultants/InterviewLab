'use client';

import { DashboardStats } from '@/lib/dashboard-stats';
import { RotateCw, Target, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RecommendedPracticeCardProps {
  stats: DashboardStats;
}

interface Recommendation {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  metadata?: string;
  ctaText: string;
  href: string;
}

/**
 * Recommended Practice Section
 * Provides intelligent suggestions based on user data
 * Contextual recommendations for continued engagement
 */
export function RecommendedPracticeCard({
  stats,
}: RecommendedPracticeCardProps) {
  const recommendations: Recommendation[] = [];

  // 1. Continue incomplete interview (highest priority)
  if (stats.incompleteSession) {
    recommendations.push({
      id: 'continue-incomplete',
      icon: <RotateCw className="h-5 w-5 text-cyan-600" />,
      title: 'Continue Your Journey',
      description: `Finish your ${stats.incompleteSession.role} interview`,
      metadata: `${stats.incompleteSession.progress}% complete • ~${stats.incompleteSession.remainingMinutes} minutes remaining`,
      ctaText: 'Continue',
      href: `/interview/${stats.incompleteSession.id}`,
    });
  }

  // 2. Practice weak category
  const categories = [
    stats.categoryScores.communication,
    stats.categoryScores.problemSolving,
    stats.categoryScores.leadership,
  ];
  const weakest = categories.reduce((min, cat) =>
    cat.score < min.score ? cat : min
  );
  const strongest = categories.reduce((max, cat) =>
    cat.score > max.score ? cat : max
  );

  if (weakest.score < strongest.score - 1 && stats.totalInterviews > 0) {
    recommendations.push({
      id: 'practice-weak',
      icon: <Target className="h-5 w-5 text-orange-600" />,
      title: 'Sharpen Your Skills',
      description: `Your ${strongest.name.toLowerCase()} scores improved! Practice ${weakest.name.toLowerCase()} next.`,
      ctaText: `Start ${weakest.name} Focus`,
      href: '/setup',
    });
  }

  // 3. Maintain streak
  if (stats.practiceStreak > 0 && !stats.practicedToday) {
    recommendations.push({
      id: 'maintain-streak',
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      title: 'Maintain Your Streak',
      description: `You're on a ${stats.practiceStreak}-day streak! Practice today to keep it going.`,
      metadata: 'Quick 3-question session',
      ctaText: 'Quick Practice',
      href: '/assessment/setup',
    });
  }

  // 4. New challenge (if no other high-priority recommendations)
  if (recommendations.length < 2 && stats.totalInterviews > 0) {
    recommendations.push({
      id: 'new-challenge',
      icon: <Zap className="h-5 w-5 text-blue-600" />,
      title: 'Try Something New',
      description:
        'Challenge yourself with a different role or industry to expand your skills.',
      ctaText: 'New Challenge',
      href: '/setup',
    });
  }

  // If user has no interviews yet, provide a getting started recommendation
  if (stats.totalInterviews === 0) {
    recommendations.push({
      id: 'first-interview',
      icon: <Zap className="h-5 w-5 text-cyan-600" />,
      title: 'Start Your First Interview',
      description: 'Get personalized feedback and see exactly what to improve.',
      metadata: 'Takes 15-20 minutes',
      ctaText: 'Get Started',
      href: '/setup',
    });
  }

  return (
    <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
      <h3 className="text-xl font-semibold text-[#1E293B] mb-6">
        Recommended for You
      </h3>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex items-start gap-4 p-4 bg-[#F5F9FA] rounded-lg border border-slate-200 hover:border-cyan-300 transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 flex-shrink-0">
              {rec.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#1E293B] mb-1">
                {rec.title}
              </h4>
              <p className="text-sm text-[#64748B] mb-1">{rec.description}</p>
              {rec.metadata && (
                <p className="text-xs text-[#94A3B8]">{rec.metadata}</p>
              )}
            </div>
            <Button variant="tertiary" size="sm" asChild className="flex-shrink-0">
              <Link href={rec.href}>{rec.ctaText} →</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
