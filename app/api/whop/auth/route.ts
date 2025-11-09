/**
 * Whop OAuth Authentication Handler
 *
 * Exchanges OAuth code for access token, fetches user info,
 * creates/links Supabase account, and syncs entitlements
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { exchangeWhopCode, getWhopUserInfo } from '@/lib/whop-sdk';
import {
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

    // Create/update Supabase user (use service role for admin operations)
    const supabase = createServiceRoleClient();

    // Check if user already exists in our system
    const { data: existingUser } = await supabase
      .from('whop_users')
      .select('user_id')
      .eq('whop_user_id', whopUserId)
      .single();

    let supabaseUserId: string;

    if (existingUser) {
      // User already linked
      supabaseUserId = existingUser.user_id;
    } else {
      // Check if a user with this email already exists in Supabase
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = existingAuthUsers?.users.find(
        (u) => u.email === email
      );

      if (existingAuthUser) {
        // User exists in Supabase auth, just link to Whop
        console.log('[Whop Auth] User exists in Supabase, linking to Whop');
        supabaseUserId = existingAuthUser.id;
      } else {
        // Create new Supabase auth user
        // Generate a secure temporary password
        const tempPassword = `whop_${whopUserId}_${Date.now()}_${Math.random().toString(36)}`;

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
          console.error(
            '[Whop Auth] Failed to create Supabase user:',
            authError
          );
          return NextResponse.json(
            { success: false, error: 'Failed to create user account' },
            { status: 500 }
          );
        }

        supabaseUserId = authData.user.id;
      }

      // Store/update Whop OAuth data
      const tokenExpiresAt = tokenResult.expiresIn
        ? new Date(Date.now() + tokenResult.expiresIn * 1000)
        : null;

      const { error: whopUserError } = await supabase.from('whop_users').upsert(
        {
          user_id: supabaseUserId,
          whop_user_id: whopUserId,
          whop_email: email,
          whop_username: username,
          access_token: tokenResult.accessToken,
          refresh_token: tokenResult.refreshToken,
          token_expires_at: tokenExpiresAt,
        },
        {
          onConflict: 'whop_user_id',
        }
      );

      if (whopUserError) {
        console.error(
          '[Whop Auth] Failed to store Whop user data:',
          whopUserError
        );
        // Continue anyway, user is created
      }
    }

    // Fetch and sync user's Whop memberships using their access token
    const memberships = await getWhopUserMemberships(tokenResult.accessToken!);
    let membershipTier: 'free' | 'premium' | null = null;

    if (memberships.length > 0) {
      // Sync all active memberships
      for (const membership of memberships) {
        if (
          membership.status === 'active' ||
          membership.status === 'trialing'
        ) {
          await syncWhopMembershipToSupabase(membership);

          // Determine tier: if any membership is premium, set as premium
          const { mapWhopPlanToTier } = await import('@/lib/whop');
          const tier = mapWhopPlanToTier(
            membership.product_id,
            membership.plan_id
          );

          if (tier === 'free') {
            membershipTier = membershipTier || 'free'; // Only set to free if not already premium
          } else {
            membershipTier = 'premium'; // Premium overrides free
          }
        }
      }
      console.log(
        `[Whop Auth] Synced ${memberships.length} membership(s) for user ${whopUserId}`
      );
    } else {
      console.log('[Whop Auth] No active memberships found for user');
    }

    // Create a session for the user using a temporary password
    const tempPassword = crypto.randomUUID();

    // Update the user's password (works for both new and existing users)
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      supabaseUserId,
      { password: tempPassword }
    );

    if (updateError) {
      console.error(
        '[Whop Auth] Failed to set temporary password:',
        updateError
      );
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      );
    }

    console.log('[Whop Auth] Temporary password set successfully');
    console.log('[Whop Auth] Returning credentials to frontend');
    console.log('[Whop Auth] Membership tier:', membershipTier);

    return NextResponse.json({
      success: true,
      email: email,
      userId: supabaseUserId,
      password: tempPassword,
      membershipTier: membershipTier,
    });
  } catch (error) {
    console.error('[Whop Auth] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
