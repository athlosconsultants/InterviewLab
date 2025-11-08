/**
 * Entitlements - Time-Based Access Pass System
 */

import { createClient } from '@/lib/supabase-server';
import { isSuperAdmin } from '@/lib/super-admin';

export type PassTier = '48h' | '7d' | '30d' | 'lifetime';

export interface UserEntitlement {
  isActive: boolean;
  tier: PassTier | null;
  expiresAt: string | null;
  isSuperAdmin?: boolean;
}

/**
 * Get user's current entitlement status
 * Returns { isActive: true } if user has valid, non-expired access
 * Super admins always return isActive: true
 * Checks both Stripe and Whop entitlements
 */
export async function getUserEntitlements(
  userId: string
): Promise<UserEntitlement> {
  // Check if user is a super admin first
  const superAdmin = await isSuperAdmin(userId);
  if (superAdmin) {
    return {
      isActive: true,
      tier: 'lifetime',
      expiresAt: null,
      isSuperAdmin: true,
    };
  }

  const supabase = await createClient();

  // Fetch all entitlements (both Stripe and Whop) ordered by creation date
  const { data, error } = await supabase
    .from('entitlements')
    .select('tier, expires_at, payment_provider, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return {
      isActive: false,
      tier: null,
      expiresAt: null,
    };
  }

  const now = new Date();

  // Find the first valid (non-expired) entitlement
  for (const entitlement of data) {
    // Skip if status is explicitly expired or cancelled
    if (entitlement.status && ['expired', 'cancelled'].includes(entitlement.status)) {
      continue;
    }

    const expiresAt = entitlement.expires_at ? new Date(entitlement.expires_at) : null;
    
    // Check if expired (null expires_at = lifetime = never expires)
    const isActive = expiresAt === null || expiresAt > now;

    if (isActive) {
      return {
        isActive: true,
        tier: entitlement.tier as PassTier,
        expiresAt: entitlement.expires_at,
      };
    }
  }

  // No valid entitlements found
  return {
    isActive: false,
    tier: null,
    expiresAt: null,
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
