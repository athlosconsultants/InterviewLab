import { createClient } from '@/lib/supabase-server';
import { startOfDay, differenceInDays } from 'date-fns';

export interface DashboardStats {
  totalInterviews: number;
  averageScore: number;
  practiceStreak: number;
  totalPracticeTimeHours: number;
  recentSessions: Array<{
    id: string;
    role: string;
    company: string;
    completedAt: string;
    overallScore: number;
  }>;
  incompleteSession: {
    id: string;
    role: string;
    company: string;
    progress: number;
    remainingMinutes: number;
  } | null;
}

/**
 * Calculate dashboard statistics for a user
 * Fetches completed sessions, calculates averages, streaks, and practice time
 */
export async function calculateDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const supabase = await createClient();

  // Fetch all sessions for the user
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sessionsError) {
    console.error(
      'Error fetching sessions for dashboard stats:',
      sessionsError
    );
    return {
      totalInterviews: 0,
      averageScore: 0,
      practiceStreak: 0,
      totalPracticeTimeHours: 0,
      recentSessions: [],
      incompleteSession: null,
    };
  }

  let totalInterviews = 0;
  let totalScore = 0;
  let totalDurationMs = 0;
  const completedSessionsWithScores: Array<{
    id: string;
    role: string;
    company: string;
    completedAt: string;
    overallScore: number;
    date: Date;
  }> = [];
  let incompleteSession: any = null;

  // Process each session
  for (const session of sessions || []) {
    if (session.status === 'feedback') {
      // Fetch report for overall score
      const { data: report } = await supabase
        .from('reports')
        .select('feedback')
        .eq('session_id', session.id)
        .single();

      if (report?.feedback) {
        const overallScore = (report.feedback as any).overall?.score || 0;
        totalScore += overallScore;
        totalInterviews++;

        completedSessionsWithScores.push({
          id: session.id,
          role: session.job_title || 'Unknown Role',
          company: session.company || 'Unknown Company',
          completedAt: session.updated_at,
          overallScore: parseFloat((overallScore / 10).toFixed(1)),
          date: new Date(session.updated_at),
        });
      }

      // Calculate total duration
      const { data: turns } = await supabase
        .from('turns')
        .select('timing')
        .eq('session_id', session.id);

      if (turns) {
        for (const turn of turns) {
          if (turn.timing?.duration_ms) {
            totalDurationMs += turn.timing.duration_ms;
          }
        }
      }
    } else if (session.status === 'running' && !incompleteSession) {
      // Found the most recent incomplete session
      const { data: turns } = await supabase
        .from('turns')
        .select('answer_text, turn_type')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (turns) {
        const actualQuestions = turns.filter(
          (t) => (t as any).turn_type === 'question' || !(t as any).turn_type
        );
        const answeredQuestions = actualQuestions.filter(
          (t) => t.answer_text
        ).length;
        const totalQuestions = (session.limits as any)?.question_cap || 3;

        const progress =
          totalQuestions > 0
            ? Math.round((answeredQuestions / totalQuestions) * 100)
            : 0;
        const remainingMinutes = Math.max(
          0,
          Math.round((totalQuestions - answeredQuestions) * 3)
        ); // Estimate 3 mins per question

        incompleteSession = {
          id: session.id,
          role: session.job_title || 'Unknown Role',
          company: session.company || 'Unknown Company',
          progress,
          remainingMinutes,
        };
      }
    }
  }

  // Calculate average score (out of 10)
  const averageScore =
    totalInterviews > 0
      ? parseFloat((totalScore / totalInterviews / 10).toFixed(1))
      : 0;

  // Calculate total practice time in hours
  const totalPracticeTimeHours = parseFloat(
    (totalDurationMs / (1000 * 60 * 60)).toFixed(1)
  );

  // Calculate practice streak
  let practiceStreak = 0;
  if (completedSessionsWithScores.length > 0) {
    // Sort by date descending
    completedSessionsWithScores.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Get unique practice days
    const practiceDays = Array.from(
      new Set(
        completedSessionsWithScores.map((s) => startOfDay(s.date).getTime())
      )
    ).sort((a, b) => b - a);

    // Check if practiced today or yesterday
    const today = startOfDay(new Date());
    const yesterday = startOfDay(
      new Date(today.getTime() - 24 * 60 * 60 * 1000)
    );

    if (practiceDays.length > 0) {
      const mostRecentPractice = new Date(practiceDays[0]);

      // Only count streak if practiced today or yesterday
      if (
        mostRecentPractice.getTime() === today.getTime() ||
        mostRecentPractice.getTime() === yesterday.getTime()
      ) {
        practiceStreak = 1;

        // Count consecutive days backward
        for (let i = 1; i < practiceDays.length; i++) {
          const currentDay = new Date(practiceDays[i]);
          const previousDay = new Date(practiceDays[i - 1]);
          const dayDiff = differenceInDays(previousDay, currentDay);

          if (dayDiff === 1) {
            practiceStreak++;
          } else {
            break;
          }
        }
      }
    }
  }

  // Get recent 5 sessions
  const recentSessions = completedSessionsWithScores
    .slice(0, 5)
    .map(({ date, ...rest }) => rest);

  return {
    totalInterviews,
    averageScore,
    practiceStreak,
    totalPracticeTimeHours,
    recentSessions,
    incompleteSession,
  };
}
