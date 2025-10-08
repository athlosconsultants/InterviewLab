'use server';

import { createClient } from '@/lib/supabase-server';
import {
  startInterview,
  submitAnswer,
  getInterviewState,
  generateIntro,
} from '@/lib/interview';

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

    // Verify session belongs to user (T88 - with plan_tier)
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, user_id, status, plan_tier, intro_text')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { error: 'Session not found', data: null };
    }

    // Check if interview has any turns (questions)
    const { data: existingTurns } = await supabase
      .from('turns')
      .select('id')
      .eq('session_id', sessionId)
      .limit(1);

    // If there are already turns, just get the current state
    if (existingTurns && existingTurns.length > 0) {
      const state = await getInterviewState(sessionId);
      return { error: null, data: state };
    }

    // T88: Generate intro for paid tier (before first question)
    const planTier = (session as any).plan_tier || 'free';
    let intro = '';
    if (planTier === 'paid' && !session.intro_text) {
      try {
        intro = await generateIntro(sessionId);
      } catch (error) {
        console.error('Failed to generate intro:', error);
        // Don't fail the interview if intro generation fails
      }
    } else if (session.intro_text) {
      intro = session.intro_text;
    }

    // No turns yet - generate the first question
    const result = await startInterview(sessionId);
    const state = await getInterviewState(sessionId);

    return { error: null, data: { ...state, intro } };
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
  audioKey?: string;
  replayCount?: number;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', data: null };
    }

    // Verify session belongs to user (T85 - fetch plan_tier and limits)
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, user_id, plan_tier, limits')
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { error: 'Session not found', data: null };
    }

    // T85: Verify free tier hasn't exceeded limits before submitting
    if (session.plan_tier === 'free') {
      const { data: existingTurns, error: turnsError } = await supabase
        .from('turns')
        .select('id')
        .eq('session_id', params.sessionId)
        .eq('user_id', user.id);

      if (!turnsError && existingTurns && existingTurns.length >= 3) {
        return {
          error: 'Free tier limit reached (3 questions maximum)',
          data: { done: true, nextQuestion: null },
        };
      }
    }

    // Submit answer (including audio key and replay count if provided)
    const result = await submitAnswer(params);

    return { error: null, data: result };
  } catch (error) {
    console.error('Submit answer error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to submit answer',
      data: null,
    };
  }
}
