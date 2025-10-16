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

  // Check if user is in an in-app browser (from User-Agent header)
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const isInAppBrowser = [
    'fban',
    'fbav',
    'instagram',
    'tiktok',
    'snapchat',
    'line',
    'micromessenger',
    'twitter',
  ].some((pattern) => userAgent.includes(pattern));

  console.log('[Auth Callback] User-Agent:', userAgent);
  console.log('[Auth Callback] Is in-app browser:', isInAppBrowser);
  console.log('[Auth Callback] Has code:', !!code);

  // If in-app browser detected and they clicked a magic link, redirect to sign-in with instructions
  if (isInAppBrowser && code) {
    console.log(
      '[Auth Callback] In-app browser detected, redirecting to OTP flow'
    );
    return NextResponse.redirect(
      new URL(
        "/sign-in?error=use_code&message=Magic links don't work in this browser. Please check your email and enter the 6-digit code instead.",
        request.url
      )
    );
  }

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

      // If code exchange fails, redirect to OTP flow as fallback
      console.log(
        '[Auth Callback] Redirecting to OTP flow due to code exchange failure'
      );
      return NextResponse.redirect(
        new URL(
          '/sign-in?error=use_code&message=There was an issue with the magic link. Please check your email and enter the 6-digit code instead.',
          request.url
        )
      );
    } catch (err) {
      console.error('[Auth Callback] Code exchange exception:', err);
      // Redirect to OTP flow on exception as well
      return NextResponse.redirect(
        new URL(
          '/sign-in?error=use_code&message=There was an issue with the magic link. Please check your email and enter the 6-digit code instead.',
          request.url
        )
      );
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
