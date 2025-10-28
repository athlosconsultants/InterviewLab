import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Verify admin access for analytics endpoint
 */
function isAdminAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword || !authHeader) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  if (!base64Credentials) {
    return false;
  }

  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'ascii'
  );
  const [username, password] = credentials.split(':');
  return username === adminUsername && password === adminPassword;
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Only admins can view analytics events
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const event_name = searchParams.get('event_name');

    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by event name if provided
    if (event_name) {
      query = query.eq('event_name', event_name);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Analytics API] Failed to fetch events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        events: data || [],
        total: count || 0,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
