import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * T110: Admin debug endpoint to inspect session timing signals
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id required' },
        { status: 400 }
      );
    }

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get all turns for the session
    const { data: turns, error: turnsError } = await supabase
      .from('turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (turnsError) {
      return NextResponse.json(
        { error: 'Failed to fetch turns' },
        { status: 500 }
      );
    }

    // Process timing data
    const debugData = {
      session: {
        id: session.id,
        status: session.status,
        mode: (session as any).mode,
        plan_tier: (session as any).plan_tier,
        current_stage: (session as any).current_stage,
        stages_planned: (session as any).stages_planned,
        created_at: session.created_at,
        updated_at: session.updated_at,
      },
      turns:
        turns?.map((turn, index) => ({
          index: index + 1,
          id: turn.id,
          turn_type: (turn as any).turn_type || 'question',
          question: {
            text: (turn as any).question?.text,
            category: (turn as any).question?.category,
            difficulty: (turn as any).question?.difficulty,
          },
          answer_provided: !!(turn as any).answer_text,
          answer_length: (turn as any).answer_text?.length || 0,
          timing: (turn as any).timing || {},
          bridge_text: (turn as any).bridge_text,
          created_at: turn.created_at,
        })) || [],
      analytics: {
        total_turns: turns?.length || 0,
        small_talk_turns:
          turns?.filter((t) => (t as any).turn_type === 'small_talk').length ||
          0,
        actual_questions:
          turns?.filter(
            (t) => (t as any).turn_type === 'question' || !(t as any).turn_type
          ).length || 0,
        confirmation_turns:
          turns?.filter((t) => (t as any).turn_type === 'confirmation')
            .length || 0,
        unanswered_turns:
          turns?.filter((t) => !(t as any).answer_text).length || 0,
        total_replay_count:
          turns?.reduce(
            (sum, t) => sum + ((t as any).timing?.replay_count || 0),
            0
          ) || 0,
        total_reveal_count:
          turns?.reduce(
            (sum, t) => sum + ((t as any).timing?.reveal_count || 0),
            0
          ) || 0,
        average_answer_length:
          turns?.length > 0
            ? Math.round(
                turns.reduce(
                  (sum, t) => sum + ((t as any).answer_text?.length || 0),
                  0
                ) / turns.length
              )
            : 0,
      },
    };

    return NextResponse.json(debugData);
  } catch (error) {
    console.error('[Admin Debug] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * T110: Get all recent sessions for debugging
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // Get recent sessions (last 50)
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, status, mode, plan_tier, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[Admin Debug] Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
