'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewConfigForm } from '@/components/setup/InterviewConfigForm';
import { DraftRecoveryBanner } from '@/components/setup/DraftRecoveryBanner';
import { loadDraft, saveDraft, clearDraft, createDebouncedSave, type InterviewDraft } from '@/utils/draftManager';
import type { InterviewConfig, InterviewProfile } from '@/lib/schema';
import { createClient } from '@/lib/supabase-client';

export default function SetupConfigurePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<InterviewProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // Check authentication
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/sign-in');
          return;
        }

        // Check if user is premium
        const entitlementsRes = await fetch('/api/user/entitlements');
        const entitlementsData = await entitlementsRes.json();
        const hasPremium = entitlementsData.remaining_interviews > 0;
        setIsPremium(hasPremium);

        // Fetch interview profile for prefilling
        const profileRes = await fetch('/api/user/interview-profile');
        if (profileRes.ok) {
          const { profile: profileData } = await profileRes.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  const handleContinue = (config: InterviewConfig) => {
    // Store config in sessionStorage for Screen 2
    sessionStorage.setItem('interviewConfig', JSON.stringify(config));
    
    // Also save to draft for auto-save
    saveDraft({
      screenOneConfig: config,
      roleContext: {}, // Will be filled in Screen 2
    });
    
    router.push('/setup/context');
  };

  const handleRestoreDraft = (draft: InterviewDraft) => {
    // If draft has roleContext data, go directly to Screen 2
    if (draft.roleContext.jobTitle || draft.roleContext.company) {
      sessionStorage.setItem('interviewConfig', JSON.stringify(draft.screenOneConfig));
      router.push('/setup/context');
    }
    // Otherwise, just prefill Screen 1 with the config
    // The InterviewConfigForm will handle this via initialConfig prop
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-16 pb-24 md:pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-2">
              Customize Your Interview
            </h1>
            <p className="text-base text-slate-600">
              Configure your practice session exactly how you want it
            </p>
          </div>

          {/* Draft Recovery Banner */}
          <DraftRecoveryBanner onRestore={handleRestoreDraft} />

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
            <InterviewConfigForm
              onContinue={handleContinue}
              onBack={handleBack}
              initialConfig={profile?.lastInterview ? {
                mode: profile.lastInterview.mode as 'text' | 'voice',
                stages: profile.lastInterview.stages as 1 | 2 | 3,
                questionsPerStage: profile.lastInterview.questionsPerStage,
              } : undefined}
              showHints={!!profile?.lastInterview}
              isPremium={isPremium}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

