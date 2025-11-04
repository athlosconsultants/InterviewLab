'use client';

import { CategoryScore } from '@/lib/dashboard-stats';
import { TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PerformanceCardProps {
  categoryScores: {
    communication: CategoryScore;
    problemSolving: CategoryScore;
    leadership: CategoryScore;
  };
}

/**
 * Performance Breakdown Card
 * Shows visual representation of scores across categories
 * Highlights strongest and weakest areas with actionable insights
 */
export function PerformanceCard({ categoryScores }: PerformanceCardProps) {
  const categories = [
    categoryScores.communication,
    categoryScores.problemSolving,
    categoryScores.leadership,
  ];

  // Find strongest and weakest
  const strongest = categories.reduce((max, cat) =>
    cat.score > max.score ? cat : max
  );
  const weakest = categories.reduce((min, cat) =>
    cat.score < min.score ? cat : min
  );
  const improving = categories.find((cat) => cat.trend === 'improving');

  // Color mapping for score ranges
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
      <h3 className="text-xl font-semibold text-[#1E293B] mb-6">
        Your Performance Breakdown
      </h3>

      {/* Horizontal Bar Chart */}
      <div className="space-y-4 mb-6">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#1E293B]">
                  {category.name}
                </span>
                {getTrendIcon(category.trend)}
              </div>
              <span className="text-sm font-bold text-[#1E293B]">
                {category.score}/10
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getScoreColor(category.score)} transition-all`}
                style={{ width: `${(category.score / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="space-y-3 mb-6">
        {/* Strongest */}
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Strongest: {strongest.name}
            </p>
            <p className="text-xs text-green-700">
              You score {strongest.score}/10 on average in this category
            </p>
          </div>
        </div>

        {/* Improving (if applicable) */}
        {improving && (
          <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
            <Activity className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-cyan-900">
                Improving: {improving.name}
              </p>
              <p className="text-xs text-cyan-700">
                Your scores are trending upward - keep it up!
              </p>
            </div>
          </div>
        )}

        {/* Weakest (only show if score is significantly lower) */}
        {weakest.score < strongest.score - 1 && (
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">
                Focus on: {weakest.name}
              </p>
              <p className="text-xs text-orange-700">
                Practicing this area will have the biggest impact on your
                overall score
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      {weakest.score < strongest.score - 1 && (
        <Button variant="outline" className="w-full" asChild>
          <Link href="/setup">Practice {weakest.name} →</Link>
        </Button>
      )}
    </section>
  );
}
