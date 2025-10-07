'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { startInterview } from '@/app/setup/actions';
import { useState } from 'react';

interface ReadyScreenProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

export function ReadyScreen({
  sessionId,
  jobTitle,
  company,
}: ReadyScreenProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    await startInterview(sessionId);
  };

  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center space-y-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Your Interview is Ready!</h2>
        <p className="text-lg text-muted-foreground">
          We&apos;ve analyzed your CV and prepared questions for:
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-2">
        <p className="text-sm text-muted-foreground">Position</p>
        <p className="text-2xl font-semibold">{jobTitle}</p>
        <p className="text-sm text-muted-foreground">at</p>
        <p className="text-xl font-medium">{company}</p>
      </div>

      <div className="max-w-md space-y-4">
        <p className="text-sm text-muted-foreground">
          The interview will consist of tailored questions based on your
          experience and the role requirements. Take your time with each answer.
        </p>
      </div>

      <Button
        size="lg"
        onClick={handleStart}
        disabled={isStarting}
        className="min-w-[200px]"
      >
        {isStarting ? 'Starting...' : 'Start Interview'}
      </Button>
    </div>
  );
}
