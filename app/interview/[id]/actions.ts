'use server';

import { createClient } from '@/lib/supabase-server';
import {
  startInterview,
  submitAnswer,
  getInterviewState,
} from '@/lib/interview';
import { redirect } from 'next/navigation';

/**
 * Server action to initialize the interview and get the first question.
 */
export async function initializeInterview(sessionId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', data: null };
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, user_id, status')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { error: 'Session not found', data: null };
    }

    // If already running, get current state
    if (session.status === 'running') {
      const state = await getInterviewState(sessionId);
      return { error: null, data: state };
    }

    // Start the interview
    const result = await startInterview(sessionId);
    const state = await getInterviewState(sessionId);

    return { error: null, data: state };
  } catch (error) {
    console.error('Initialize interview error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to initialize interview',
      data: null,
    };
  }
}

/**
 * Server action to submit an answer and get the next question.
 */
export async function submitInterviewAnswer(params: {
  sessionId: string;
  turnId: string;
  answerText: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', data: null };
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, user_id')
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { error: 'Session not found', data: null };
    }

    // Submit answer
    const result = await submitAnswer(params);

    // If done, redirect to report page
    if (result.done) {
      redirect(`/report/${params.sessionId}`);
    }

    return { error: null, data: result };
  } catch (error) {
    console.error('Submit answer error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to submit answer',
      data: null,
    };
  }
}
