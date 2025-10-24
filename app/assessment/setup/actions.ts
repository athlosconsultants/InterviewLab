'use server';

import { createClient } from '@/lib/supabase-server';
import { hashDevice } from '@/lib/antiabuse/device';
import { revalidatePath } from 'next/cache';
import { checkTrialAllowance } from '@/lib/antiabuse/trial';
import { interview, research } from '@/lib/interview';

export async function bindDevice(fingerprint: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const deviceHash = hashDevice(fingerprint);

  const { error } = await supabase
    .from('device_fingerprints')
    .insert({ user_id: user.id, device_hash: deviceHash });

  if (error) {
    // Ignore unique constraint violation errors, as it means the device is already bound.
    if (error.code !== '23505') {
      console.error('Failed to bind device:', error);
      throw new Error('Failed to bind device');
    }
  }

  revalidatePath('/assessment/setup');
}

export async function startComplimentaryAssessment(
  jobTitle: string,
  jobDescription: string
): Promise<{ redirectUrl: string } | { error: string; retryAfter?: Date }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to start an assessment.' };
  }

  // T23: Guard trial setup action
  const allowance = await checkTrialAllowance();
  if (!allowance.allowed) {
    return {
      error: `You have already completed a complimentary assessment recently. Please try again later.`,
      retryAfter: allowance.retryAfter,
    };
  }

  // Create a research snapshot for the interview
  const researchSnapshot = await research.create(
    jobTitle,
    jobDescription,
    'free_trial_research'
  );

  // Create the interview session
  const session = await interview.create(
    user.id,
    researchSnapshot,
    'free_trial'
  );

  return { redirectUrl: `/interview/${session.id}` };
}
