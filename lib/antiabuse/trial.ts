import { createClient } from '@/lib/supabase-server';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Checks if a user or device is allowed to start a new complimentary assessment.
 * Policy: 1 assessment per 7 days, checked against both user ID and device hash.
 * @returns {Promise<{
 *   allowed: boolean;
 *   reason: 'USER_RATE_LIMITED' | 'DEVICE_RATE_LIMITED' | 'OK';
 *   retryAfter?: Date;
 * }>}
 */
export async function checkTrialAllowance(): Promise<{
  allowed: boolean;
  reason: 'USER_RATE_LIMITED' | 'DEVICE_RATE_LIMITED' | 'OK';
  retryAfter?: Date;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // For anonymous users, we can only check by device.
    // The device binding must have happened before this check.
    return { allowed: true, reason: 'OK' }; // Placeholder for now
  }

  // Check for recent trials by user_id
  const { data: userTrials, error: userError } = await supabase
    .from('sessions')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('plan_tier', 'free_trial')
    .order('created_at', { ascending: false })
    .limit(1);

  if (userError) {
    console.error('Error fetching user trials:', userError);
    throw new Error('Could not verify trial allowance.');
  }

  if (userTrials && userTrials.length > 0) {
    const lastTrialDate = new Date(userTrials[0].created_at);
    const now = new Date();
    if (now.getTime() - lastTrialDate.getTime() < SEVEN_DAYS_IN_MS) {
      return {
        allowed: false,
        reason: 'USER_RATE_LIMITED',
        retryAfter: new Date(lastTrialDate.getTime() + SEVEN_DAYS_IN_MS),
      };
    }
  }

  // Check for recent trials by device_hash (if user is known)
  // This logic depends on the device hash being available.
  // We'll expand this once the client-side implementation is ready.

  return { allowed: true, reason: 'OK' };
}
