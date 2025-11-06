'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleContextForm } from '@/components/setup/RoleContextForm';
import { uploadFile } from '@/lib/upload-client';
import { createSession } from '@/app/setup/actions';
import { toast } from 'sonner';
import type { InterviewConfig, RoleContext, InterviewProfile } from '@/lib/schema';

export default function SetupContextPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<InterviewProfile | null>(null);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // Get config from sessionStorage
        const storedConfig = sessionStorage.getItem('interviewConfig');
        if (!storedConfig) {
          // No config found, redirect back to configure
          router.push('/setup/configure');
          return;
        }

        const parsedConfig = JSON.parse(storedConfig) as InterviewConfig;
        setConfig(parsedConfig);

        // Fetch interview profile for prefilling
        const profileRes = await fetch('/api/user/interview-profile');
        if (profileRes.ok) {
          const { profile: profileData } = await profileRes.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  const handleSubmit = async (context: RoleContext, cvFile: File | null) => {
    if (!config) {
      toast.error('Configuration not found. Please start over.');
      router.push('/setup/configure');
      return;
    }

    setIsSubmitting(true);

    try {
      let cvFileKey = context.cvFileKey;

      // Upload CV if a new file was provided
      if (cvFile) {
        const cvResult = await uploadFile(cvFile, 'cv');
        if (!cvResult.success || !cvResult.storageKey) {
          toast.error('CV upload failed', {
            description: cvResult.error,
          });
          setIsSubmitting(false);
          return;
        }
        cvFileKey = cvResult.storageKey;
      }

      // Upload job description if provided
      let jobDescKey: string | undefined;
      if (context.jobDescription) {
        const jobDescResponse = await fetch('/api/upload-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: context.jobDescription,
            type: 'jobspec',
          }),
        });

        const jobDescResult = await jobDescResponse.json();
        if (jobDescResult.success) {
          jobDescKey = jobDescResult.storageKey;
        }
      }

      toast.success('Files uploaded!', {
        description: 'Creating your interview...',
      });

      // Create interview session
      const { sessionId, error: sessionError } = await createSession({
        jobTitle: context.jobTitle,
        company: context.company,
        location: context.location || '',
        mode: config.mode,
        stagesPlanned: config.stages,
        questionsPerStage: config.questionsPerStage,
        planTier: 'paid', // Premium users only on this flow
      });

      if (sessionError || !sessionId) {
        toast.error('Session creation failed', {
          description: sessionError || 'Please try again',
        });
        setIsSubmitting(false);
        return;
      }

      toast.success('Interview ready!', {
        description: 'Redirecting to interview...',
      });

      // Clear config from sessionStorage
      sessionStorage.removeItem('interviewConfig');

      // Redirect to interview
      router.push(`/interview/${sessionId}`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred', {
        description: 'Please try again',
      });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/setup/configure');
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

  if (!config) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-light text-slate-800 tracking-tight mb-2">
              🎯 Tell Us About the Role
            </h1>
            <p className="text-base text-slate-600">
              Share some context to personalize your interview questions
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
            <RoleContextForm
              onSubmit={handleSubmit}
              onBack={handleBack}
              initialContext={profile?.lastInterview}
              cvMetadata={profile?.cvFile}
              showHints={!!profile?.lastInterview}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

