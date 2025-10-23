/**
 * Entitlements - Time-Based Access Pass System
 */

import { createClient } from '@/lib/supabase-server';

export type PassTier = '48h' | '7d' | '30d' | 'lifetime';

export interface UserEntitlement {
  isActive: boolean;
  tier: PassTier | null;
  expiresAt: string | null;
}

/**
 * Get user's current entitlement status
 * Returns { isActive: true } if user has valid, non-expired access
 */
export async function getUserEntitlements(
  userId: string
): Promise<UserEntitlement> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('entitlements')
    .select('tier, expires_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return {
      isActive: false,
      tier: null,
      expiresAt: null,
    };
  }

  const now = new Date();
  const expiresAt = data.expires_at ? new Date(data.expires_at) : null;

  // Check if expired (null expires_at = lifetime = never expires)
  const isActive = expiresAt === null || expiresAt > now;

  return {
    isActive,
    tier: data.tier as PassTier,
    expiresAt: data.expires_at,
  };
}

/**
 * Check if user is entitled to access a feature
 * Boolean guard for gating premium features
 */
export async function isEntitled(userId: string): Promise<boolean> {
  const entitlement = await getUserEntitlements(userId);
  return entitlement.isActive;
}
