'use server';

import { createClient } from '@/lib/supabase-server';
import { hashDevice } from '@/lib/antiabuse/device';
import { revalidatePath } from 'next/cache';
import { checkTrialAllowance } from '@/lib/antiabuse/trial';
import { generateResearchSnapshot } from '@/lib/research';
import { nanoid } from 'nanoid';

export async function bindDevice(fingerprint: string) {
  const supabase = await createClient();

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
  const supabase = await createClient();
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

  try {
    // Generate research snapshot with minimal info (no CV/JD documents)
    const researchSnapshot = await generateResearchSnapshot({
      cvText: '', // No CV for free trial
      jobDescriptionText: jobDescription || `${jobTitle} position`, // Use provided or generate minimal JD
      jobTitle,
      company: 'Company', // Generic company name
      location: 'Remote', // Default location
    });

    // Create the session with free_trial plan tier
    const sessionId = nanoid();
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        id: sessionId,
        user_id: user.id,
        status: 'ready',
        research_snapshot: researchSnapshot,
        plan_tier: 'free_trial',
        mode: 'text', // Free trial is text-only
        stages_planned: 1, // Single stage
        current_stage: 1,
        limits: {
          question_cap: 3, // 3 questions for free trial
        },
        job_spec: {
          role: jobTitle,
        },
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      return { error: 'Failed to create interview session. Please try again.' };
    }

    return { redirectUrl: `/interview/${sessionId}` };
  } catch (error) {
    console.error('Error in startComplimentaryAssessment:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
