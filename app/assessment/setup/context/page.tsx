'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleContextForm } from '@/components/setup/RoleContextForm';
import { uploadFile } from '@/lib/upload-client';
import { startComplimentaryAssessment } from '../actions';
import { toast } from 'sonner';
import type { InterviewConfig, RoleContext } from '@/lib/schema';

export default function AssessmentContextPage() {
  const router = useRouter();
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get config from sessionStorage
    const storedConfig = sessionStorage.getItem('assessmentConfig');
    if (!storedConfig) {
      // No config found, redirect back to configure
      router.push('/assessment/setup/configure');
      return;
    }

    try {
      const parsedConfig = JSON.parse(storedConfig) as InterviewConfig;
      setConfig(parsedConfig);
    } catch (error) {
      console.error('Error parsing config:', error);
      router.push('/assessment/setup/configure');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleSubmit = async (context: RoleContext, cvFile: File | null) => {
    if (!config) {
      toast.error('Configuration not found. Please start over.');
      router.push('/assessment/setup/configure');
      return;
    }

    if (!cvFile) {
      toast.error('CV/Resume is required for free assessment');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload CV
      const cvResult = await uploadFile(cvFile, 'cv');
      if (!cvResult.success || !cvResult.storageKey) {
        toast.error('CV upload failed', {
          description: cvResult.error,
        });
        setIsSubmitting(false);
        return;
      }

      toast.success('CV uploaded!', {
        description: 'Starting your assessment...',
      });

      // Start complimentary assessment
      const result = await startComplimentaryAssessment(
        context.jobTitle,
        context.jobDescription || '',
        cvResult.storageKey
      );

      if ('error' in result) {
        toast.error('Assessment setup failed', {
          description: result.error,
        });
        setIsSubmitting(false);
        return;
      }

      // Clear config from sessionStorage
      sessionStorage.removeItem('assessmentConfig');

      // Redirect to assessment interview
      router.push(result.redirectUrl);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred', {
        description: 'Please try again',
      });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/assessment/setup/configure');
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
              Tell Us About the Role
            </h1>
            <p className="text-base text-slate-600">
              Upload your CV to get personalized interview questions
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
            <RoleContextForm
              onSubmit={handleSubmit}
              onBack={handleBack}
              initialContext={undefined}
              cvMetadata={undefined}
              showHints={false}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

