import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { generateInterviewFeedback } from '@/lib/scoring';
import type { InterviewFeedback } from '@/lib/scoring';
import { ReportView } from '@/components/results/ReportView';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch session with turns
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, research_snapshot')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Session Not Found</h1>
          <p className="text-muted-foreground">
            This interview session does not exist or you don&apos;t have access
            to it.
          </p>
        </div>
      </main>
    );
  }

  // Fetch turns
  const { data: turns, error: turnsError } = await supabase
    .from('turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (turnsError || !turns || turns.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Interview Data</h1>
          <p className="text-muted-foreground">
            This interview has no responses yet.
          </p>
        </div>
      </main>
    );
  }

  // Check if report already exists
  let { data: existingReport } = await supabase
    .from('reports')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  let feedback: InterviewFeedback;

  if (existingReport && existingReport.feedback) {
    // Use existing feedback
    feedback = existingReport.feedback as InterviewFeedback;
  } else {
    // Generate new feedback
    try {
      feedback = await generateInterviewFeedback(
        session.research_snapshot,
        turns
      );

      // Save report to database
      const { data: newReport, error: reportError } = await supabase
        .from('reports')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          feedback: feedback,
        })
        .select()
        .single();

      if (reportError) {
        console.error('Failed to save report:', reportError);
      } else {
        existingReport = newReport;
      }
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Error Generating Report</h1>
            <p className="text-muted-foreground">
              Failed to generate your interview feedback. Please try again
              later.
            </p>
          </div>
        </main>
      );
    }
  }

  return (
    <ReportView
      session={session}
      turns={turns}
      feedback={feedback}
      reportId={existingReport?.id}
    />
  );
}
