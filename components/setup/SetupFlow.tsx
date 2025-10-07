'use client';

import { useState } from 'react';
import { IntakeForm } from '@/components/forms/IntakeForm';
import { ProgressSteps, type ProgressStep } from './ProgressSteps';
import { ReadyScreen } from './ReadyScreen';

interface SessionData {
  sessionId: string;
  jobTitle: string;
  company: string;
  location: string;
}

export function SetupFlow() {
  const [currentStep, setCurrentStep] = useState<'form' | 'progress' | 'ready'>(
    'form'
  );
  const [progressStep, setProgressStep] = useState<ProgressStep>('upload');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  const handleFormSubmit = (data: SessionData) => {
    setSessionData(data);
    setCurrentStep('progress');

    // Simulate progress steps (in reality, these are updated by the actual async operations)
    setProgressStep('upload');
    setTimeout(() => setProgressStep('analyze'), 1000);
    setTimeout(() => setProgressStep('research'), 3000);
    setTimeout(() => {
      setProgressStep('ready');
      setTimeout(() => setCurrentStep('ready'), 1000);
    }, 5000);
  };

  if (currentStep === 'ready' && sessionData) {
    return (
      <ReadyScreen
        sessionId={sessionData.sessionId}
        jobTitle={sessionData.jobTitle}
        company={sessionData.company}
      />
    );
  }

  if (currentStep === 'progress') {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Setting Up Your Interview</h2>
          <p className="text-muted-foreground">
            This will take about 30 seconds...
          </p>
        </div>
        <ProgressSteps currentStep={progressStep} />
      </div>
    );
  }

  return <IntakeForm onSuccess={handleFormSubmit} />;
}
