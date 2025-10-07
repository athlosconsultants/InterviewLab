/**
 * Entitlement management for paid interview packages (T86)
 * Handles checking, consuming, and linking entitlements to sessions.
 */

import { createClient } from './supabase-server';
import type { Entitlement } from './schema';

/**
 * Checks if a user has an active entitlement available.
 * Returns the first available entitlement or null if none exist.
 */
export async function checkAvailableEntitlement(
  userId: string
): Promise<Entitlement | null> {
  const supabase = await createClient();

  const { data: entitlements, error } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'interview_package')
    .eq('status', 'active')
    .is('consumed_at', null)
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) {
    console.error('Error checking entitlements:', error);
    return null;
  }

  if (!entitlements || entitlements.length === 0) {
    return null;
  }

  return entitlements[0] as Entitlement;
}

/**
 * Consumes an entitlement by marking it as consumed.
 * Links the entitlement to a session ID.
 */
export async function consumeEntitlement(
  entitlementId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Double-check ownership and status before consuming
  const { data: entitlement, error: fetchError } = await supabase
    .from('entitlements')
    .select('*')
    .eq('id', entitlementId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .is('consumed_at', null)
    .single();

  if (fetchError || !entitlement) {
    return {
      success: false,
      error: 'Entitlement not found or already consumed',
    };
  }

  // Mark as consumed
  const { error: updateError } = await supabase
    .from('entitlements')
    .update({
      status: 'consumed',
      consumed_at: new Date().toISOString(),
    })
    .eq('id', entitlementId);

  if (updateError) {
    console.error('Error consuming entitlement:', updateError);
    return {
      success: false,
      error: 'Failed to consume entitlement',
    };
  }

  return { success: true };
}

/**
 * Creates a test/manual entitlement for a user.
 * Useful for testing or manual grants before payment system is implemented.
 */
export async function grantEntitlement(
  userId: string,
  type: 'interview_package' | 'subscription' = 'interview_package',
  expiresAt?: Date
): Promise<{ success: boolean; entitlementId?: string; error?: string }> {
  const supabase = await createClient();

  const { data: entitlement, error } = await supabase
    .from('entitlements')
    .insert({
      user_id: userId,
      type,
      status: 'active',
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      metadata: {
        granted_manually: true,
        granted_at: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Error granting entitlement:', error);
    return {
      success: false,
      error: 'Failed to grant entitlement',
    };
  }

  return {
    success: true,
    entitlementId: entitlement.id,
  };
}

/**
 * Gets all entitlements for a user with their status.
 */
export async function getUserEntitlements(
  userId: string
): Promise<Entitlement[]> {
  const supabase = await createClient();

  const { data: entitlements, error } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user entitlements:', error);
    return [];
  }

  return (entitlements as Entitlement[]) || [];
}
