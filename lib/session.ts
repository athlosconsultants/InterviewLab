import { createClient } from './supabase-server';
import type { ResumeProgressState, Turn } from './schema';

/**
 * T111: Session Resume System
 * Utilities for saving and restoring interview session state
 */

/**
 * Save current session progress for resume functionality
 */
export async function saveSessionProgress(
  sessionId: string,
  currentTurnId: string | null,
  lastCompletedTurnId: string | null,
  turnIndex: number,
  phase: ResumeProgressState['interview_phase']
): Promise<void> {
  try {
    const supabase = await createClient();

    // Get current turn count
    const { data: turns } = await supabase
      .from('turns')
      .select('id, answer_text')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const answeredCount = turns?.filter((t) => t.answer_text).length || 0;
    const totalTurns = turns?.length || 0;

    const progressState: ResumeProgressState = {
      current_turn_id: currentTurnId,
      last_completed_turn_id: lastCompletedTurnId,
      answered_count: answeredCount,
      total_expected: Math.max(totalTurns, answeredCount + 1), // At least one more than answered
      interview_phase: phase,
      last_save_timestamp: new Date().toISOString(),
    };

    // Update session with progress state
    const { error } = await supabase
      .from('sessions')
      .update({
        turn_index: turnIndex,
        progress_state: progressState,
        last_activity: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      console.error('[T111] Failed to save session progress:', error);
      throw error;
    }

    console.log(`[T111] Session progress saved for ${sessionId}:`, {
      turnIndex,
      phase,
      answeredCount,
      currentTurnId,
    });
  } catch (error) {
    console.error('[T111] Error saving session progress:', error);
    // Don't throw to avoid breaking the user experience
  }
}

/**
 * Get resume data for a session
 */
export async function getResumeData(sessionId: string): Promise<{
  canResume: boolean;
  progressState: ResumeProgressState | null;
  resumeTurnId: string | null;
  message: string;
}> {
  try {
    const supabase = await createClient();

    // Get session with progress state
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return {
        canResume: false,
        progressState: null,
        resumeTurnId: null,
        message: 'Session not found',
      };
    }

    // Check if session is in a resumable state
    if (session.status === 'complete') {
      return {
        canResume: false,
        progressState: null,
        resumeTurnId: null,
        message: 'Interview already completed',
      };
    }

    const progressState = session.progress_state as ResumeProgressState | null;

    if (!progressState) {
      return {
        canResume: false,
        progressState: null,
        resumeTurnId: null,
        message: 'No resume data available',
      };
    }

    // Check if there's a current turn to resume from
    let resumeTurnId = progressState.current_turn_id;

    // If no current turn, try to find the next unanswered turn
    if (!resumeTurnId) {
      const { data: turns } = await supabase
        .from('turns')
        .select('id, answer_text')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      const nextUnansweredTurn = turns?.find((t) => !t.answer_text);
      resumeTurnId = nextUnansweredTurn?.id || null;
    }

    // Calculate time since last activity
    const lastActivity = new Date(session.last_activity);
    const timeSinceLastActivity = Date.now() - lastActivity.getTime();
    const hoursAgo = timeSinceLastActivity / (1000 * 60 * 60);

    // Determine if resume is appropriate
    const canResume = resumeTurnId !== null && hoursAgo < 24; // Allow resume within 24 hours

    return {
      canResume,
      progressState,
      resumeTurnId,
      message: canResume
        ? `Resume from ${progressState.interview_phase} phase`
        : hoursAgo >= 24
          ? 'Session expired (>24h ago)'
          : 'No questions to resume from',
    };
  } catch (error) {
    console.error('[T111] Error getting resume data:', error);
    return {
      canResume: false,
      progressState: null,
      resumeTurnId: null,
      message: 'Error checking resume status',
    };
  }
}

/**
 * Auto-save session progress (called every 10 seconds)
 */
export async function autoSaveSession(sessionId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Get current session state
    const { data: session } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('id', sessionId)
      .single();

    if (!session || session.status === 'complete') {
      return; // Don't auto-save completed sessions
    }

    // Get current turns
    const { data: turns } = await supabase
      .from('turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!turns || turns.length === 0) {
      return; // No turns to save
    }

    // Find current turn and determine phase
    const unansweredTurn = turns.find((t) => !t.answer_text);
    const lastAnsweredTurn = turns.filter((t) => t.answer_text).pop();

    let phase: ResumeProgressState['interview_phase'] = 'interview';
    if (unansweredTurn) {
      const turnType = (unansweredTurn as any).turn_type;
      if (turnType === 'small_talk') phase = 'small_talk';
      else if (turnType === 'confirmation') phase = 'confirmation';
    }

    // Auto-save current state
    await saveSessionProgress(
      sessionId,
      unansweredTurn?.id || null,
      lastAnsweredTurn?.id || null,
      turns.findIndex((t) => t.id === unansweredTurn?.id) || turns.length,
      phase
    );
  } catch (error) {
    console.error('[T111] Auto-save failed:', error);
    // Fail silently - auto-save shouldn't disrupt user experience
  }
}

/**
 * Mark session as completed (no more resume needed)
 */
export async function markSessionComplete(sessionId: string): Promise<void> {
  try {
    const supabase = await createClient();

    const progressState: ResumeProgressState = {
      current_turn_id: null,
      last_completed_turn_id: null,
      answered_count: 0,
      total_expected: 0,
      interview_phase: 'complete',
      last_save_timestamp: new Date().toISOString(),
    };

    await supabase
      .from('sessions')
      .update({
        status: 'complete',
        progress_state: progressState,
        last_activity: new Date().toISOString(),
      })
      .eq('id', sessionId);

    console.log(`[T111] Session ${sessionId} marked as complete`);
  } catch (error) {
    console.error('[T111] Error marking session complete:', error);
  }
}
