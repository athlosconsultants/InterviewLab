'use server';

import { createClient } from '@/lib/supabase-server';
import {
  startInterview,
  submitAnswer,
  getInterviewState,
  generateIntro,
} from '@/lib/interview';
import {
  getResumeData as getResumeDataServer,
  autoSaveSession as autoSaveSessionServer,
} from '@/lib/session'; // T111: Server-side resume functions

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

    // T91: Verify session belongs to user (with stage information)
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
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
      const state = await getInterviewState(sessionId, supabase);

      // T91: Extract stage information for existing interview
      const currentStage = (session as any).current_stage || 1;
      const stagesPlanned = (session as any).stages_planned || 1;
      const researchSnapshot = (session as any).research_snapshot as any;
      const stages = researchSnapshot?.interview_config?.stages || [];
      const stageName = stages[currentStage - 1] || `Stage ${currentStage}`;
      const intro = session.intro_text || '';

      return {
        error: null,
        data: { ...state, intro, currentStage, stagesPlanned, stageName },
      };
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
    // Pass the authenticated supabase client to avoid session mismatch
    const result = await startInterview(sessionId, supabase);
    const state = await getInterviewState(sessionId, supabase);

    // T91: Extract stage information
    const currentStage = (session as any).current_stage || 1;
    const stagesPlanned = (session as any).stages_planned || 1;
    const researchSnapshot = (session as any).research_snapshot as any;
    const stages = researchSnapshot?.interview_config?.stages || [];
    const stageName = stages[currentStage - 1] || `Stage ${currentStage}`;

    return {
      error: null,
      data: { ...state, intro, currentStage, stagesPlanned, stageName },
    };
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
 * T113: Optimized for low-latency with performance tracking
 */
export async function submitInterviewAnswer(params: {
  sessionId: string;
  turnId: string;
  answerText: string;
  audioKey?: string;
  replayCount?: number;
}) {
  const startTime = Date.now(); // T113: Track latency

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
      .select('*')
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

    // T113: Log latency for monitoring
    const latency = Date.now() - startTime;
    console.log(
      `[T113] Answer submission + next question generation: ${latency}ms`
    );

    if (latency > 1500) {
      console.warn(`[T113] Latency exceeded target: ${latency}ms > 1500ms`);
    }

    return { error: null, data: result, latency }; // T113: Include latency in response
  } catch (error) {
    console.error('Submit answer error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to submit answer',
      data: null,
    };
  }
}

/**
 * T113: Fetch the next available question for a session
 * Used for polling if pre-fetch didn't complete in time
 */
export async function fetchNextQuestion(sessionId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', data: null };
    }

    // Get current interview state - pass authenticated client
    const state = await getInterviewState(sessionId, supabase);

    return { error: null, data: state };
  } catch (error) {
    console.error('Fetch next question error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch next question',
      data: null,
    };
  }
}

/**
 * T111: Server action to check if an interview can be resumed
 */
export async function getResumeData(sessionId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', data: null };
    }

    const resumeData = await getResumeDataServer(sessionId);
    return { error: null, data: resumeData };
  } catch (error) {
    console.error('Get resume data error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to get resume data',
      data: null,
    };
  }
}

/**
 * T111: Server action to auto-save session progress
 */
export async function autoSaveSession(sessionId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized', success: false };
    }

    await autoSaveSessionServer(sessionId);
    return { error: null, success: true };
  } catch (error) {
    console.error('Auto-save session error:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to auto-save session',
      success: false,
    };
  }
}
