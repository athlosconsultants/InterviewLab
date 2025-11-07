'use client';

import { DashboardStats } from '@/lib/dashboard-stats';
import { Flame, Award, Target, Zap, Star, TrendingUp } from 'lucide-react';

interface AchievementSectionProps {
  stats: DashboardStats;
}

interface Achievement {
  id: string;
  name: string;
  icon: React.ReactNode;
  earned: boolean;
  description: string;
}

/**
 * Achievement & Streak Tracking Section
 * Displays current streak prominently and earned achievement badges
 * Gamification to motivate continued practice
 */
export function AchievementSection({ stats }: AchievementSectionProps) {
  // Define achievements based on user stats
  const achievements: Achievement[] = [
    {
      id: 'first-interview',
      name: 'First Interview',
      icon: <Target className="h-5 w-5" />,
      earned: stats.totalInterviews >= 1,
      description: 'Complete your first interview',
    },
    {
      id: 'five-interviews',
      name: '5 Interviews',
      icon: <Star className="h-5 w-5" />,
      earned: stats.totalInterviews >= 5,
      description: 'Complete 5 interviews',
    },
    {
      id: 'ten-interviews',
      name: '10 Interviews',
      icon: <Award className="h-5 w-5" />,
      earned: stats.totalInterviews >= 10,
      description: 'Complete 10 interviews',
    },
    {
      id: 'five-day-streak',
      name: '5 Day Streak',
      icon: <Flame className="h-5 w-5" />,
      earned: stats.practiceStreak >= 5,
      description: 'Practice 5 days in a row',
    },
    {
      id: 'high-performer',
      name: 'High Performer',
      icon: <TrendingUp className="h-5 w-5" />,
      earned: stats.averageScore >= 8,
      description: 'Achieve 8+ average score',
    },
    {
      id: 'dedicated-learner',
      name: 'Dedicated Learner',
      icon: <Zap className="h-5 w-5" />,
      earned: stats.totalPracticeTimeHours >= 5,
      description: 'Practice for 5+ hours',
    },
  ];

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
      {/* Streak Highlight */}
      {stats.practiceStreak > 0 && (
        <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 flex-shrink-0">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-orange-900 mb-1">
                {stats.practiceStreak} Day Streak! 🔥
              </h3>
              <p className="text-sm text-orange-800 mb-3">
                You&apos;ve practiced {stats.practiceStreak} day
                {stats.practiceStreak !== 1 ? 's' : ''} in a row. Keep it going!
              </p>
              {/* Progress bar for today */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span
                    className={
                      stats.practicedToday
                        ? 'text-green-700'
                        : 'text-orange-700'
                    }
                  >
                    {stats.practicedToday
                      ? "Today's goal complete"
                      : 'Practice today to maintain streak'}
                  </span>
                </div>
                <div className="h-2 w-full bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stats.practicedToday ? 'bg-green-500' : 'bg-orange-300'} transition-all`}
                    style={{ width: stats.practicedToday ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#1E293B]">
            Your Achievements
          </h4>
          <span className="text-sm text-[#64748B]">
            {earnedCount} of {achievements.length} earned
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                achievement.earned
                  ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200'
                  : 'bg-slate-50 border-slate-200 opacity-50'
              }`}
              title={achievement.description}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                    : 'bg-slate-300 text-slate-500'
                }`}
              >
                {achievement.icon}
              </div>
              <span
                className={`text-xs font-semibold text-center ${
                  achievement.earned ? 'text-[#1E293B]' : 'text-slate-500'
                }`}
              >
                {achievement.name}
              </span>
              {achievement.earned && (
                <span className="text-xs text-green-600 mt-1">Earned</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
