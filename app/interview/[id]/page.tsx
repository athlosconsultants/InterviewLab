import { InterviewUI } from '@/components/interview/InterviewUI';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

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
    redirect('/auth/sign-in');
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, job_title, company')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !session) {
    redirect('/setup');
  }

  return (
    <main className="flex min-h-screen flex-col">
      <InterviewUI
        sessionId={id}
        jobTitle={session.job_title || 'Interview'}
        company={session.company || ''}
      />
    </main>
  );
}
