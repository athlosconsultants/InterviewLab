import { createClient } from './supabase-client';

/**
 * T110: Analytics event types for tracking user interactions
 */
export type AnalyticsEvent =
  | 'small_talk_shown'
  | 'proceed_confirmed'
  | 'reveal_elapsed'
  | 'show_again_used'
  | 'orb_autoplay_ok'
  | 'interview_started'
  | 'question_answered'
  | 'interview_completed'
  | 'mode_selected';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  session_id: string;
  user_id?: string;
  turn_id?: string;
  metadata?: {
    mode?: 'text' | 'voice';
    turn_type?: 'small_talk' | 'question' | 'confirmation';
    reveal_count?: number;
    replay_count?: number;
    question_number?: number;
    stage?: number;
    duration_ms?: number;
    [key: string]: any;
  };
  timestamp: string;
}

/**
 * T110: Track analytics events
 */
export async function trackEvent(
  event: AnalyticsEvent,
  sessionId: string,
  metadata?: AnalyticsEventData['metadata']
): Promise<void> {
  try {
    // In a production app, you'd send this to your analytics service
    // For now, we'll log to console and optionally store in localStorage for debugging
    const eventData: AnalyticsEventData = {
      event,
      session_id: sessionId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Log for debugging
    console.log(`[Analytics] ${event}:`, eventData);

    // Store in localStorage for admin debug view
    const existingEvents = getStoredEvents();
    existingEvents.push(eventData);

    // Keep only last 100 events to prevent memory issues
    const recentEvents = existingEvents.slice(-100);
    localStorage.setItem('interview_analytics', JSON.stringify(recentEvents));

    // TODO: In production, send to analytics service like Mixpanel, Amplitude, etc.
    // await sendToAnalyticsService(eventData);
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
    // Fail silently - analytics shouldn't break the user experience
  }
}

/**
 * T110: Get stored analytics events (for admin debug view)
 */
export function getStoredEvents(): AnalyticsEventData[] {
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('interview_analytics');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Analytics] Failed to get stored events:', error);
    return [];
  }
}

/**
 * T110: Clear stored analytics events
 */
export function clearStoredEvents(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('interview_analytics');
    }
  } catch (error) {
    console.error('[Analytics] Failed to clear stored events:', error);
  }
}

/**
 * T110: Get analytics summary for a session
 */
export function getSessionAnalytics(sessionId: string): {
  events: AnalyticsEventData[];
  summary: {
    total_events: number;
    small_talk_interactions: number;
    reveal_count: number;
    replay_count: number;
    mode?: 'text' | 'voice';
    duration_ms?: number;
  };
} {
  const allEvents = getStoredEvents();
  const sessionEvents = allEvents.filter((e) => e.session_id === sessionId);

  const summary = {
    total_events: sessionEvents.length,
    small_talk_interactions: sessionEvents.filter(
      (e) => e.event === 'small_talk_shown'
    ).length,
    reveal_count: sessionEvents
      .filter((e) => e.event === 'reveal_elapsed')
      .reduce((sum, e) => sum + (e.metadata?.reveal_count || 0), 0),
    replay_count: sessionEvents
      .filter((e) => e.event === 'show_again_used')
      .reduce((sum, e) => sum + (e.metadata?.replay_count || 0), 0),
    mode: sessionEvents.find((e) => e.metadata?.mode)?.metadata?.mode,
    duration_ms: sessionEvents.find((e) => e.metadata?.duration_ms)?.metadata
      ?.duration_ms,
  };

  return {
    events: sessionEvents,
    summary,
  };
}

/**
 * T110: Track timing data for performance analysis
 */
export function trackTiming(
  event: string,
  sessionId: string,
  startTime: number,
  metadata?: Record<string, any>
): void {
  const duration = Date.now() - startTime;
  trackEvent(event as AnalyticsEvent, sessionId, {
    ...metadata,
    duration_ms: duration,
  });
}
