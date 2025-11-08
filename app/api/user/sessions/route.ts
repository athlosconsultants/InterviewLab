import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's sessions
    // Only show sessions that are running or have feedback (completed)
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, job_title, company, created_at, status')
      .eq('user_id', user.id)
      .in('status', ['running', 'feedback'])
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: sessionsError.message },
        { status: 500 }
      );
    }

    // Fetch reports separately for each session
    const sessionsWithReports = await Promise.all(
      (sessions || []).map(async (session: any) => {
        const { data: report } = await supabase
          .from('reports')
          .select('overall')
          .eq('session_id', session.id)
          .single();
        
        return {
          ...session,
          overall_score: report?.overall || null,
        };
      })
    );

    console.log('[Sessions API] Found', sessionsWithReports?.length || 0, 'sessions');
    if (sessionsWithReports && sessionsWithReports.length > 0) {
      console.log('[Sessions API] Sample session:', {
        id: sessionsWithReports[0].id,
        status: sessionsWithReports[0].status,
        overall_score: sessionsWithReports[0].overall_score,
      });
    }

    return NextResponse.json({
      success: true,
      sessions: sessionsWithReports,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

