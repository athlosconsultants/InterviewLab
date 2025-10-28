import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { event_name, payload, user_agent } = await request.json();

    if (!event_name) {
      return NextResponse.json(
        { error: 'event_name is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user ID if authenticated (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get IP address from request headers
    const ip_address =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      null;

    // Insert event into database
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        event_name,
        user_id: user?.id || null,
        session_id: null, // Could extract from cookies if needed
        payload: payload || {},
        user_agent: user_agent || request.headers.get('user-agent'),
        ip_address,
      });

    if (insertError) {
      console.error('[Analytics] Failed to insert event:', insertError);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
