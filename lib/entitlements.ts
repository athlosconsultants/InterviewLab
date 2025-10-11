/**
 * Entitlement management for paid interview packages
 * T86: Original implementation
 * T135 (Phase 13): Updated for credit-based system
 * Handles checking, consuming credits, and linking entitlements to sessions.
 */

import { createClient } from './supabase-server';
import type { Entitlement } from './schema';

/**
 * T135: Checks if a user has remaining interview credits
 * Returns the first entitlement with available credits or null if none exist
 */
export async function checkAvailableEntitlement(
  userId: string
): Promise<Entitlement | null> {
  const supabase = await createClient();

  // Phase 13: Look for entitlements with remaining_interviews > 0
  const { data: entitlements, error } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'interview_package')
    .eq('status', 'active')
    .gt('remaining_interviews', 0) // Phase 13: Credit-based check
    .order('created_at', { ascending: true }) // Use oldest credits first
    .limit(1);

  if (error) {
    console.error('[T135] Error checking entitlements:', error);
    return null;
  }

  if (!entitlements || entitlements.length === 0) {
    console.log('[T135] No entitlements with remaining credits found for user:', userId);
    return null;
  }

  const entitlement = entitlements[0] as any;
  console.log(
    `[T135] Found entitlement ${entitlement.id} with ${entitlement.remaining_interviews} remaining interviews`
  );

  return entitlement as Entitlement;
}

/**
 * T135: Consumes one interview credit from an entitlement
 * Decrements remaining_interviews by 1 and logs to history
 * If balance reaches 0, marks entitlement as consumed
 */
export async function consumeEntitlement(
  entitlementId: string,
  userId: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string; remainingCredits?: number }> {
  const supabase = await createClient();

  // Double-check ownership and status before consuming
  const { data: entitlement, error: fetchError } = await supabase
    .from('entitlements')
    .select('*')
    .eq('id', entitlementId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (fetchError || !entitlement) {
    console.error('[T135] Entitlement not found or not active:', fetchError);
    return {
      success: false,
      error: 'Entitlement not found or already consumed',
    };
  }

  const ent = entitlement as any;
  const currentBalance = ent.remaining_interviews || 0;

  if (currentBalance <= 0) {
    return {
      success: false,
      error: 'No remaining interviews in this entitlement',
      remainingCredits: 0,
    };
  }

  const newBalance = currentBalance - 1;

  // Decrement remaining_interviews
  const updateData: any = {
    remaining_interviews: newBalance,
  };

  // If balance reaches 0, mark as consumed
  if (newBalance === 0) {
    updateData.status = 'consumed';
    updateData.consumed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('entitlements')
    .update(updateData)
    .eq('id', entitlementId);

  if (updateError) {
    console.error('[T135] Error consuming credit:', updateError);
    return {
      success: false,
      error: 'Failed to consume credit',
    };
  }

  // Log consumption in entitlement_history
  const { error: historyError } = await supabase
    .from('entitlement_history')
    .insert({
      user_id: userId,
      entitlement_id: entitlementId,
      action: 'consume',
      interview_session_id: sessionId || null,
      previous_balance: currentBalance,
      new_balance: newBalance,
      metadata: {
        consumed_at: new Date().toISOString(),
      },
    });

  if (historyError) {
    console.error('[T135] Error logging consumption history:', historyError);
    // Don't fail the operation if history logging fails
  }

  console.log(
    `[T135] Consumed 1 credit from entitlement ${entitlementId}: ${currentBalance} → ${newBalance}`
  );

  return {
    success: true,
    remainingCredits: newBalance,
  };
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
