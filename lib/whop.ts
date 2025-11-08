/**
 * Whop Integration Utilities
 * 
 * Handles Whop API interactions, membership verification, and OAuth flows
 */

import crypto from 'crypto';
import { createClient } from '@/lib/supabase-server';

// Environment variables
const WHOP_API_KEY = process.env.WHOP_API_KEY;
const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;
const WHOP_CLIENT_ID = process.env.WHOP_CLIENT_ID;
const WHOP_CLIENT_SECRET = process.env.WHOP_CLIENT_SECRET;
const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID;

// Whop API Base URL
const WHOP_API_BASE = 'https://api.whop.com/api/v2';

export interface WhopMembership {
  id: string;
  user_id: string;
  email: string;
  username: string | null;
  product_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  expires_at: string | null;
  created_at: string;
}

export interface WhopWebhookEvent {
  event: string;
  data: {
    id: string;
    user_id: string;
    email: string;
    username: string | null;
    product_id: string;
    plan_id: string;
    status: string;
    expires_at: string | null;
    created_at: string;
  };
}

/**
 * Verify Whop webhook signature
 */
export function verifyWhopWebhook(
  payload: string,
  signature: string
): boolean {
  if (!WHOP_WEBHOOK_SECRET) {
    console.error('[Whop] Missing WHOP_WEBHOOK_SECRET');
    return false;
  }

  const hmac = crypto.createHmac('sha256', WHOP_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

/**
 * Fetch membership details from Whop API
 */
export async function getWhopMembership(
  membershipId: string
): Promise<WhopMembership | null> {
  if (!WHOP_API_KEY) {
    console.error('[Whop] Missing WHOP_API_KEY');
    return null;
  }

  try {
    const response = await fetch(
      `${WHOP_API_BASE}/memberships/${membershipId}`,
      {
        headers: {
          'Authorization': `Bearer ${WHOP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('[Whop] Failed to fetch membership:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Whop] Error fetching membership:', error);
    return null;
  }
}

/**
 * Verify if a membership is currently active
 */
export async function verifyWhopMembership(
  membershipId: string
): Promise<boolean> {
  const membership = await getWhopMembership(membershipId);
  
  if (!membership) {
    return false;
  }

  // Check if status is active or trialing
  if (membership.status !== 'active' && membership.status !== 'trialing') {
    return false;
  }

  // Check if expired (if expires_at is set)
  if (membership.expires_at) {
    const expiresAt = new Date(membership.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      return false;
    }
  }

  return true;
}

/**
 * Map Whop product/plan to our PassTier system
 * You'll need to update this mapping based on your Whop product configuration
 */
export function mapWhopPlanToTier(productId: string, planId: string): '48h' | '7d' | '30d' | 'lifetime' {
  // TODO: Update this mapping based on your actual Whop product/plan IDs
  // For now, we'll use a simple mapping
  
  // Example mapping (update with your actual IDs):
  const planMappings: Record<string, '48h' | '7d' | '30d' | 'lifetime'> = {
    // 'plan_xxxxx': '48h',
    // 'plan_yyyyy': '7d',
    // 'plan_zzzzz': '30d',
    // 'plan_aaaaa': 'lifetime',
  };

  // Default to 30d if no mapping found
  return planMappings[planId] || '30d';
}

/**
 * Calculate expiration date based on tier
 */
export function calculateExpirationDate(tier: '48h' | '7d' | '30d' | 'lifetime'): Date | null {
  if (tier === 'lifetime') {
    return null; // null = never expires
  }

  const now = new Date();
  
  switch (tier) {
    case '48h':
      return new Date(now.getTime() + 48 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Sync Whop membership to Supabase entitlements
 */
export async function syncWhopMembershipToSupabase(
  membership: WhopMembership
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // First, check if a user with this Whop user_id exists in whop_users
    const { data: whopUser, error: whopUserError } = await supabase
      .from('whop_users')
      .select('user_id')
      .eq('whop_user_id', membership.user_id)
      .single();

    if (whopUserError && whopUserError.code !== 'PGRST116') {
      console.error('[Whop] Error fetching whop_user:', whopUserError);
      return { success: false, error: 'Failed to fetch Whop user' };
    }

    if (!whopUser) {
      // User hasn't signed in with Whop yet, we'll create entitlement when they do
      console.log('[Whop] User not found in whop_users, skipping sync until first sign-in');
      return { success: true };
    }

    const userId = whopUser.user_id;
    const tier = mapWhopPlanToTier(membership.product_id, membership.plan_id);
    const expiresAt = membership.expires_at || calculateExpirationDate(tier);

    // Create or update entitlement
    const { error: entitlementError } = await supabase
      .from('entitlements')
      .upsert({
        user_id: userId,
        type: 'interview_package',
        tier: tier,
        status: membership.status === 'active' || membership.status === 'trialing' ? 'active' : 'expired',
        expires_at: expiresAt,
        payment_provider: 'whop',
        whop_membership_id: membership.id,
        whop_product_id: membership.product_id,
        whop_plan_id: membership.plan_id,
      }, {
        onConflict: 'whop_membership_id',
      });

    if (entitlementError) {
      console.error('[Whop] Error upserting entitlement:', entitlementError);
      return { success: false, error: 'Failed to create entitlement' };
    }

    console.log('[Whop] Successfully synced membership to Supabase:', membership.id);
    return { success: true };
  } catch (error) {
    console.error('[Whop] Error syncing membership:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeWhopOAuthCode(
  code: string,
  redirectUri: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}> {
  if (!WHOP_CLIENT_ID || !WHOP_CLIENT_SECRET) {
    console.error('[Whop] Missing OAuth credentials');
    return { success: false, error: 'Missing OAuth credentials' };
  }

  try {
    const response = await fetch('https://api.whop.com/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: WHOP_CLIENT_ID,
        client_secret: WHOP_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      console.error('[Whop] OAuth token exchange failed:', response.status);
      return { success: false, error: 'Failed to exchange OAuth code' };
    }

    const data = await response.json();
    
    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('[Whop] Error exchanging OAuth code:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Get Whop user info from access token
 */
export async function getWhopUserInfo(
  accessToken: string
): Promise<{
  success: boolean;
  userId?: string;
  email?: string;
  username?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${WHOP_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Whop] Failed to fetch user info:', response.status);
      return { success: false, error: 'Failed to fetch user info' };
    }

    const data = await response.json();
    
    return {
      success: true,
      userId: data.id,
      email: data.email,
      username: data.username,
    };
  } catch (error) {
    console.error('[Whop] Error fetching user info:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Get all active memberships for a Whop user
 */
export async function getWhopUserMemberships(
  whopUserId: string
): Promise<WhopMembership[]> {
  if (!WHOP_API_KEY) {
    console.error('[Whop] Missing WHOP_API_KEY');
    return [];
  }

  try {
    const response = await fetch(
      `${WHOP_API_BASE}/memberships?user_id=${whopUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${WHOP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('[Whop] Failed to fetch user memberships:', response.status);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[Whop] Error fetching user memberships:', error);
    return [];
  }
}


