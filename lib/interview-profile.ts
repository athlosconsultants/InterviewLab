/**
 * Interview Profile Management
 * Utilities for managing user interview profiles, preferences, and history
 */

import type { InterviewProfile } from './schema';

/**
 * Extract unique role and company suggestions from interview history
 */
export function extractSuggestions(profile: InterviewProfile | null): {
  roles: string[];
  companies: string[];
} {
  if (!profile?.interviewHistory || profile.interviewHistory.length === 0) {
    return { roles: [], companies: [] };
  }

  const roles = new Set<string>();
  const companies = new Set<string>();

  // Add last interview data
  if (profile.lastInterview) {
    roles.add(profile.lastInterview.jobTitle);
    companies.add(profile.lastInterview.company);
  }

  // Add historical data
  profile.interviewHistory.forEach((interview) => {
    if (interview.jobTitle) roles.add(interview.jobTitle);
    if (interview.company) companies.add(interview.company);
  });

  return {
    roles: Array.from(roles).slice(0, 5), // Top 5 roles
    companies: Array.from(companies).slice(0, 5), // Top 5 companies
  };
}

/**
 * Update user profile after interview completion
 * This will be called from the interview completion flow
 */
export async function updateProfileAfterInterview(params: {
  jobTitle: string;
  company: string;
  location?: string;
  jobDescription?: string;
  mode: 'text' | 'voice';
  stages: number;
  questionsPerStage: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/user/interview-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lastInterview: {
          jobTitle: params.jobTitle,
          company: params.company,
          location: params.location,
          jobDescription: params.jobDescription,
          mode: params.mode,
          stages: params.stages,
          questionsPerStage: params.questionsPerStage,
          completedAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to update profile' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Network error' };
  }
}

