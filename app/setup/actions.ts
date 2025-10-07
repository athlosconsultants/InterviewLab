'use server';

import { createClient } from '@/lib/supabase-server';
import { generateResearchSnapshot } from '@/lib/research';
import { redirect } from 'next/navigation';

interface CreateSessionParams {
  jobTitle: string;
  company: string;
  location: string;
}

/**
 * Server action to create a new interview session.
 * This fetches the uploaded documents, generates a research snapshot,
 * and creates a session record in the database.
 */
export async function createSession(params: CreateSessionParams) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', sessionId: null };
    }

    // Fetch the most recent CV document
    const { data: cvDocs, error: cvError } = await supabase
      .from('documents')
      .select('extracted_text')
      .eq('user_id', user.id)
      .eq('type', 'cv')
      .order('created_at', { ascending: false })
      .limit(1);

    if (cvError || !cvDocs || cvDocs.length === 0) {
      console.error('CV fetch error:', cvError);
      return {
        error: 'No CV found. Please upload your CV first.',
        sessionId: null,
      };
    }

    const cvText = cvDocs[0].extracted_text;
    if (!cvText || cvText.trim().length < 50) {
      return {
        error: 'CV text is too short or empty. Please upload a valid CV.',
        sessionId: null,
      };
    }

    // Fetch the most recent job spec document
    const { data: jobDocs, error: jobError } = await supabase
      .from('documents')
      .select('extracted_text')
      .eq('user_id', user.id)
      .eq('type', 'jobspec')
      .order('created_at', { ascending: false })
      .limit(1);

    if (jobError || !jobDocs || jobDocs.length === 0) {
      console.error('Job spec fetch error:', jobError);
      return {
        error: 'No job description found. Please provide a job description.',
        sessionId: null,
      };
    }

    const jobDescriptionText = jobDocs[0].extracted_text;
    if (!jobDescriptionText || jobDescriptionText.trim().length < 50) {
      return {
        error:
          'Job description is too short or empty. Please provide a valid job description.',
        sessionId: null,
      };
    }

    // Generate research snapshot using OpenAI
    console.log('Generating research snapshot...');
    const researchSnapshot = await generateResearchSnapshot({
      cvText,
      jobDescriptionText,
      jobTitle: params.jobTitle,
      company: params.company,
      location: params.location,
    });

    console.log('Research snapshot generated:', researchSnapshot);

    // Create session record
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        status: 'ready',
        job_title: params.jobTitle,
        company: params.company,
        location: params.location,
        research_snapshot: researchSnapshot,
        limits: {
          question_cap: 3,
          replay_cap: 2,
          timer_sec: 90,
        },
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return {
        error: 'Failed to create interview session. Please try again.',
        sessionId: null,
      };
    }

    console.log('Session created:', session.id);

    return { error: null, sessionId: session.id };
  } catch (error) {
    console.error('Create session error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.',
      sessionId: null,
    };
  }
}

/**
 * Server action to start an interview (redirect to interview page).
 */
export async function startInterview(sessionId: string) {
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
    .select('id, user_id, status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error || !session) {
    redirect('/setup');
  }

  // Update session status to running
  await supabase
    .from('sessions')
    .update({ status: 'running' })
    .eq('id', sessionId);

  redirect(`/interview/${sessionId}`);
}
