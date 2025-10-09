// T103: Mode Router - conditionally render TextUI or VoiceUI based on session mode
import { TextUI } from '@/components/interview/mode/TextUI';
import { VoiceUI } from '@/components/interview/mode/VoiceUI';
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

  // T103: Route to correct UI based on mode
  const mode: InterviewMode = session.mode || 'text'; // Default to text if not specified
  const InterviewComponent = mode === 'voice' ? VoiceUI : TextUI;

  return (
    <main className="flex min-h-screen flex-col">
      <InterviewComponent
        sessionId={id}
        jobTitle={session.job_title || 'Interview'}
        company={session.company || ''}
      />
    </main>
  );
}
