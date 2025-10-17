// T103: Mode Router - conditionally render TextUI or VoiceUI based on session mode
// T158: Added InterviewModeRouter for automatic mobile/desktop UI selection
import { InterviewModeRouter } from '@/components/interview/InterviewModeRouter';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import type { InterviewMode } from '@/lib/schema';

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Verify session exists and belongs to user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select('id, user_id, job_title, company, mode')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !session) {
    redirect('/setup');
  }

  // T158: Use InterviewModeRouter to automatically select mobile/desktop UI
  const mode: InterviewMode = session.mode || 'text';

  return (
    <main className="flex min-h-screen flex-col">
      <InterviewModeRouter
        sessionId={id}
        jobTitle={session.job_title || 'Interview'}
        company={session.company || ''}
        mode={mode}
      />
    </main>
  );
}
