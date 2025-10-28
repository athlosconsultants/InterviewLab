import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Get credentials from environment variables
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    // Check if environment variables are set
    if (!validUsername || !validPassword) {
      console.error(
        '[Admin Auth] ADMIN_USERNAME or ADMIN_PASSWORD not set in environment'
      );
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    // Verify credentials
    if (username === validUsername && password === validPassword) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Invalid credentials
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('[Admin Auth] Verification error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
