/**
 * Whop Embedded App Launch Handler
 *
 * This endpoint handles automatic authentication when users click "Launch Web App" from Whop.
 * Whop passes authentication via query params or headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
import {
  getWhopUserMemberships,
  mapWhopPlanToTier,
  syncWhopMembershipToSupabase,
} from '@/lib/whop';
import { getWhopUserInfo } from '@/lib/whop-sdk';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Whop passes access token in different ways depending on configuration
    // Check query params first, then headers
    const accessToken =
      searchParams.get('access_token') ||
      searchParams.get('token') ||
      request.headers.get('x-whop-token') ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      console.error('[Whop Launch] No access token provided');
      return NextResponse.redirect(
        new URL('/sign-in?error=whop_auth_required', request.url)
      );
    }

    console.log('[Whop Launch] Access token received, fetching user info...');

    // Get user info from Whop using the access token
    const userInfoResult = await getWhopUserInfo(accessToken);

    if (!userInfoResult.success) {
      console.error(
        '[Whop Launch] Failed to fetch user info:',
        userInfoResult.error
      );
      return NextResponse.redirect(
        new URL('/sign-in?error=whop_auth_failed', request.url)
      );
    }

    const { userId: whopUserId, email, username } = userInfoResult;

    if (!email || !whopUserId) {
      console.error('[Whop Launch] Missing required user data');
      return NextResponse.redirect(
        new URL('/sign-in?error=invalid_user_data', request.url)
      );
    }

    console.log('[Whop Launch] User info retrieved:', { whopUserId, email });

    const supabase = createServiceRoleClient();

    // Check if user already exists in our system
    const { data: existingWhopUser } = await supabase
      .from('whop_users')
      .select('user_id')
      .eq('whop_user_id', whopUserId)
      .single();

    let supabaseUserId: string;

    if (existingWhopUser) {
      // User exists, use their ID
      supabaseUserId = existingWhopUser.user_id;
      console.log('[Whop Launch] Existing user found:', supabaseUserId);
    } else {
      // Check if email exists in Supabase auth
      const { data: existingAuthUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingAuthUser) {
        supabaseUserId = existingAuthUser.id;
        console.log('[Whop Launch] Found existing auth user by email');
      } else {
        // Create new Supabase user
        const tempPassword = `whop_${whopUserId}_${Date.now()}_${Math.random().toString(36)}`;

        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              whop_user_id: whopUserId,
              username: username,
              auth_provider: 'whop',
            },
          });

        if (authError || !authData.user) {
          console.error('[Whop Launch] Failed to create user:', authError);
          return NextResponse.redirect(
            new URL('/sign-in?error=account_creation_failed', request.url)
          );
        }

        supabaseUserId = authData.user.id;
        console.log('[Whop Launch] New user created:', supabaseUserId);
      }

      // Store Whop user data
      await supabase.from('whop_users').upsert(
        {
          user_id: supabaseUserId,
          whop_user_id: whopUserId,
          whop_email: email,
          whop_username: username,
          access_token: accessToken,
        },
        {
          onConflict: 'whop_user_id',
        }
      );
    }

    // Fetch and sync memberships
    const memberships = await getWhopUserMemberships(accessToken);
    let membershipTier: 'free' | 'premium' | null = null;

    console.log('[Whop Launch] Memberships found:', memberships.length);

    if (memberships.length > 0) {
      for (const membership of memberships) {
        if (
          membership.status === 'active' ||
          membership.status === 'trialing'
        ) {
          await syncWhopMembershipToSupabase(membership);

          const tier = mapWhopPlanToTier(
            membership.product_id,
            membership.plan_id
          );

          if (tier === 'free') {
            membershipTier = membershipTier || 'free';
          } else {
            membershipTier = 'premium';
          }
        }
      }
    }

    console.log('[Whop Launch] Membership tier:', membershipTier);

    // Create session for the user
    const tempPassword = crypto.randomUUID();

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      supabaseUserId,
      { password: tempPassword }
    );

    if (updateError) {
      console.error('[Whop Launch] Failed to set password:', updateError);
      return NextResponse.redirect(
        new URL('/sign-in?error=session_creation_failed', request.url)
      );
    }

    console.log('[Whop Launch] Session ready, creating sign-in credentials...');

    // Determine redirect URL based on membership tier
    const redirectPath = membershipTier === 'premium' ? '/dashboard' : '/';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

    // Redirect to a client-side page that will sign in and redirect
    const callbackUrl = new URL('/whop/session', baseUrl);
    callbackUrl.searchParams.set('email', email);
    callbackUrl.searchParams.set('password', tempPassword);
    callbackUrl.searchParams.set('redirect', redirectPath);

    console.log('[Whop Launch] Redirecting to session handler');
    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error('[Whop Launch] Error:', error);
    return NextResponse.redirect(
      new URL('/sign-in?error=unexpected_error', new URL(request.url).origin)
    );
  }
}
