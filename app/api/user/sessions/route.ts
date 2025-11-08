import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's sessions with reports data
    // Only show sessions that are running or have feedback (completed)
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id,
        job_title,
        company,
        created_at,
        status,
        reports (
          overall
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['running', 'feedback'])
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Transform data to include overall_score
    const transformedSessions = sessions?.map((session: any) => ({
      id: session.id,
      job_title: session.job_title,
      company: session.company,
      created_at: session.created_at,
      status: session.status,
      overall_score: session.reports?.[0]?.overall || null,
    })) || [];

    return NextResponse.json({
      success: true,
      sessions: transformedSessions,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

