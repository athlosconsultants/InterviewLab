'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TurnstileWidget } from '@/components/Turnstile';
import { startComplimentaryAssessment } from './actions';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import { createClient } from '@/lib/supabase-client';

export default function AssessmentSetupPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // T42: Auth guard - redirect to sign-in if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in?redirect=/assessment/setup');
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    track({ name: 'turnstile_verified' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify Turnstile token server-side
      const verifyRes = await fetch('/api/turnstile-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });

      if (!verifyRes.ok) {
        throw new Error('Security verification failed. Please try again.');
      }

      track({ name: 'assessment_setup_submitted', payload: { jobTitle } });

      // Start the complimentary assessment
      const result = await startComplimentaryAssessment(
        jobTitle,
        jobDescription
      );

      if ('error' in result) {
        setError(result.error);
        track({
          name: 'assessment_setup_failed',
          payload: { reason: result.error },
        });
      } else {
        track({ name: 'assessment_started', payload: { jobTitle } });
        router.push(result.redirectUrl);
      }
    } catch (err: any) {
      console.error('Error starting assessment:', err);
      setError(err.message || 'An error occurred. Please try again.');
      track({
        name: 'assessment_setup_error',
        payload: { error: err.message },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
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
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Complimentary Interview Assessment
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Experience a personalized mock interview tailored to your role. No
              credit card required.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
              {/* Job Title */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="jobTitle" className="text-base font-semibold">
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="e.g. Senior Product Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12 text-base"
                />
              </div>

              {/* Job Description */}
              <div className="space-y-2 mb-6">
                <Label
                  htmlFor="jobDescription"
                  className="text-base font-semibold"
                >
                  Job Description (Optional)
                </Label>
                <textarea
                  id="jobDescription"
                  placeholder="Paste the job description or key responsibilities here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                  className="w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 dark:border-gray-700"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Providing details helps us create a more accurate interview
                  simulation.
                </p>
              </div>

              {/* Turnstile Widget */}
              <div className="mb-6">
                <Label className="text-base font-semibold mb-2 block">
                  Security Verification
                </Label>
                <TurnstileWidget onVerify={handleTurnstileVerify} />
                {!turnstileToken && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Please complete the security check above to enable the
                    submit button.
                  </p>
                )}
                {turnstileToken && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    ✓ Security verification complete
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? 'Starting Your Interview...'
                  : 'Start Free Assessment'}
              </Button>
              {!turnstileToken && (
                <p className="text-sm text-center text-amber-600 dark:text-amber-400 mt-2">
                  Complete the security check above to enable this button
                </p>
              )}

              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                One complimentary assessment per week. No credit card required.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
