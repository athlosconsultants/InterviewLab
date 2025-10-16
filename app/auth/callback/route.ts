import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;

  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Additional fallback parameters for in-app browsers
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const tokenType = searchParams.get('token_type');
  const expiresIn = searchParams.get('expires_in');

  const supabase = await createClient();

  // Strategy 1: Try code exchange (primary method for magic links)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        console.log('[Auth Callback] Code exchange successful');
        return NextResponse.redirect(new URL(next, request.url));
      }

      console.error('[Auth Callback] Code exchange failed:', error.message);
    } catch (err) {
      console.error('[Auth Callback] Code exchange exception:', err);
    }
  }

  // Strategy 2: Try direct token setting (fallback for in-app browsers)
  if (accessToken && refreshToken) {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (!error) {
        console.log('[Auth Callback] Direct token setting successful');
        return NextResponse.redirect(new URL(next, request.url));
      }

      console.error(
        '[Auth Callback] Direct token setting failed:',
        error.message
      );
    } catch (err) {
      console.error('[Auth Callback] Direct token setting exception:', err);
    }
  }

  // Strategy 3: Check if there's already a valid session (user may have completed OTP flow)
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!error && session) {
      console.log('[Auth Callback] Existing session found');
      return NextResponse.redirect(new URL(next, request.url));
    }
  } catch (err) {
    console.error('[Auth Callback] Session check exception:', err);
  }

  // All strategies failed - redirect to error page
  console.error('[Auth Callback] All auth strategies failed');
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
}
