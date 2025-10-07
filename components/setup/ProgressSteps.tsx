'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export type ProgressStep = 'upload' | 'analyze' | 'research' | 'ready';

interface ProgressStepsProps {
  currentStep: ProgressStep;
}

const steps = [
  { id: 'upload' as const, label: 'Uploading files' },
  { id: 'analyze' as const, label: 'Analyzing materials' },
  { id: 'research' as const, label: 'Generating insights' },
  { id: 'ready' as const, label: 'Preparing interview' },
];

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-2xl space-y-4">
      {steps.map((step, index) => {
        const isComplete = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isPending = index > currentStepIndex;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {isComplete && (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}
              {isCurrent && (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              )}
              {isPending && (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={
                  isCurrent
                    ? 'font-medium text-primary'
                    : isComplete
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                }
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
