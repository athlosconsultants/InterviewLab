/**
 * Whop OAuth Authentication Handler
 *
 * Exchanges OAuth code for access token, fetches user info,
 * creates/links Supabase account, and syncs entitlements
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { exchangeWhopCode } from '@/lib/whop-sdk';
import {
  getWhopUserInfo,
  getWhopUserMemberships,
  syncWhopMembershipToSupabase,
} from '@/lib/whop';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/whop/callback`;

    const tokenResult = await exchangeWhopCode(code, redirectUri);

    if (!tokenResult.success || !tokenResult.accessToken) {
      console.error('[Whop Auth] Failed to exchange code:', tokenResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with Whop' },
        { status: 400 }
      );
    }

    // Get Whop user info
    const userInfoResult = await getWhopUserInfo(tokenResult.accessToken);

    if (
      !userInfoResult.success ||
      !userInfoResult.userId ||
      !userInfoResult.email
    ) {
      console.error(
        '[Whop Auth] Failed to fetch user info:',
        userInfoResult.error
      );
      return NextResponse.json(
        { success: false, error: 'Failed to fetch Whop user information' },
        { status: 400 }
      );
    }

    const { userId: whopUserId, email, username } = userInfoResult;

    // Create/update Supabase user
    const supabase = await createClient();

    // Check if user already exists in our system
    const { data: existingUser } = await supabase
      .from('whop_users')
      .select('user_id')
      .eq('whop_user_id', whopUserId)
      .single();

    let supabaseUserId: string;
    let tempPassword = '';

    if (existingUser) {
      // User already linked
      supabaseUserId = existingUser.user_id;
    } else {
      // Create new Supabase auth user
      // Generate a secure temporary password
      tempPassword = `whop_${whopUserId}_${Date.now()}_${Math.random().toString(36)}`;

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm since Whop already verified
          user_metadata: {
            whop_user_id: whopUserId,
            username: username,
            auth_provider: 'whop',
          },
        });

      if (authError || !authData.user) {
        console.error('[Whop Auth] Failed to create Supabase user:', authError);
        return NextResponse.json(
          { success: false, error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      supabaseUserId = authData.user.id;

      // Store Whop OAuth data
      const tokenExpiresAt = tokenResult.expiresIn
        ? new Date(Date.now() + tokenResult.expiresIn * 1000)
        : null;

      const { error: whopUserError } = await supabase
        .from('whop_users')
        .insert({
          user_id: supabaseUserId,
          whop_user_id: whopUserId,
          whop_email: email,
          whop_username: username,
          access_token: tokenResult.accessToken,
          refresh_token: tokenResult.refreshToken,
          token_expires_at: tokenExpiresAt,
        });

      if (whopUserError) {
        console.error(
          '[Whop Auth] Failed to store Whop user data:',
          whopUserError
        );
        // Continue anyway, user is created
      }
    }

    // Fetch and sync user's Whop memberships
    const memberships = await getWhopUserMemberships(whopUserId);

    if (memberships.length > 0) {
      // Sync all active memberships
      for (const membership of memberships) {
        if (
          membership.status === 'active' ||
          membership.status === 'trialing'
        ) {
          await syncWhopMembershipToSupabase(membership);
        }
      }
      console.log(
        `[Whop Auth] Synced ${memberships.length} membership(s) for user ${whopUserId}`
      );
    } else {
      console.log('[Whop Auth] No active memberships found for user');
    }

    return NextResponse.json({
      success: true,
      email: email,
      tempPassword: tempPassword || undefined,
      userId: supabaseUserId,
    });
  } catch (error) {
    console.error('[Whop Auth] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
