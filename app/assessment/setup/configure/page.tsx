'use client';

import { useRouter } from 'next/navigation';
import { InterviewConfigForm } from '@/components/setup/InterviewConfigForm';
import type { InterviewConfig } from '@/lib/schema';

export default function AssessmentConfigurePage() {
  const router = useRouter();

  const handleContinue = (config: InterviewConfig) => {
    // Store config in sessionStorage for Screen 2
    sessionStorage.setItem('assessmentConfig', JSON.stringify(config));
    router.push('/assessment/setup/context');
  };

  const handleBack = () => {
    router.push('/');
  };

  // Free assessment: fixed configuration
  const fixedConfig: InterviewConfig = {
    mode: 'text',
    stages: 1,
    questionsPerStage: 3,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-light text-slate-800 tracking-tight mb-2">
              Free 3-Question Assessment
            </h1>
            <p className="text-base text-slate-600">
              Text-based practice with personalized feedback
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
            <InterviewConfigForm
              onContinue={handleContinue}
              onBack={handleBack}
              initialConfig={fixedConfig}
              showHints={false}
              isPremium={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

