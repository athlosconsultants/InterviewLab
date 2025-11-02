'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TurnstileWidget } from '@/components/Turnstile';
import { FileDrop } from '@/components/forms/FileDrop';
import { PreparingOverlay } from '@/components/assessment/PreparingOverlay';
import { startComplimentaryAssessment } from './actions';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import { createClient } from '@/lib/supabase-client';
import { uploadFile } from '@/lib/upload-client';

export default function AssessmentSetupPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreparing, setShowPreparing] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [jobDescriptionFocused, setJobDescriptionFocused] = useState(false);
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

  // Helper function to detect device type
  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  // Track page view
  useEffect(() => {
    try {
      const referrer = typeof document !== 'undefined' ? document.referrer : '';
      track({
        name: 'assessment_setup_page_viewed',
        payload: {
          referrer,
          device_type: getDeviceType(),
        },
      });
    } catch (err) {
      console.error('Analytics tracking error:', err);
    }
  }, []);

  // T30: Read from sessionStorage and prefill job title
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('quicktry');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.role) {
            setJobTitle(data.role);
            // T32: Track that user came from preview widget
            track({
              name: 'preview_to_assessment_start',
              payload: { role: data.role },
            });
          }
        } catch (e) {
          console.error('Failed to parse quicktry data:', e);
        }
      }
    }
  }, []);

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    track({ name: 'turnstile_verified' });
  };

  // CV Upload tracking wrapper
  const handleCvFileSelect = (file: File | null) => {
    if (file) {
      try {
        track({
          name: 'cv_upload_completed',
          payload: {
            file_type: file.type,
            file_size: (file.size / (1024 * 1024)).toFixed(2), // Convert to MB
            device_type: getDeviceType(),
          },
        });
      } catch (err) {
        console.error('Analytics tracking error:', err);
      }
    }
    setCvFile(file);
  };

  // Job Description field interaction tracking
  const handleJobDescriptionFocus = () => {
    if (!jobDescriptionFocused) {
      try {
        track({
          name: 'job_description_field_focused',
          payload: {
            device_type: getDeviceType(),
          },
        });
        setJobDescriptionFocused(true);
      } catch (err) {
        console.error('Analytics tracking error:', err);
      }
    }
  };

  const handleJobDescriptionBlur = () => {
    if (jobDescription.trim().length > 0) {
      try {
        track({
          name: 'job_description_added',
          payload: {
            has_content: jobDescription.trim().length > 10,
            character_count: jobDescription.trim().length,
            device_type: getDeviceType(),
          },
        });
      } catch (err) {
        console.error('Analytics tracking error:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Track button click
    try {
      track({
        name: 'start_interview_button_clicked',
        payload: {
          has_cv: !!cvFile,
          has_job_description: jobDescription.trim().length > 0,
          device_type: getDeviceType(),
        },
      });
    } catch (err) {
      console.error('Analytics tracking error:', err);
    }

    // Validation and tracking
    const missingFields: string[] = [];
    if (!cvFile) {
      missingFields.push('cv_file');
      setError('Please upload your CV/Resume.');
    }
    if (!turnstileToken) {
      missingFields.push('turnstile_token');
      setError('Please complete the security check.');
    }

    if (missingFields.length > 0) {
      try {
        track({
          name: 'form_validation_failed',
          payload: {
            missing_fields: missingFields,
            device_type: getDeviceType(),
          },
        });
      } catch (err) {
        console.error('Analytics tracking error:', err);
      }
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

      // Upload CV file with upload failure tracking
      const uploadResult = await uploadFile(cvFile, 'cv');
      if (!uploadResult.success || !uploadResult.storageKey) {
        // Track CV upload failure
        try {
          track({
            name: 'cv_upload_failed',
            payload: {
              error_type: uploadResult.error || 'unknown_error',
              file_type_attempted: cvFile.type,
              device_type: getDeviceType(),
            },
          });
        } catch (err) {
          console.error('Analytics tracking error:', err);
        }
        throw new Error(
          uploadResult.error || 'Failed to upload CV. Please try again.'
        );
      }

      // Start the complimentary assessment with CV
      const result = await startComplimentaryAssessment(
        jobTitle,
        jobDescription,
        uploadResult.storageKey
      );

      if ('error' in result) {
        setError(result.error);
        track({
          name: 'assessment_setup_failed',
          payload: { reason: result.error },
        });
        setIsSubmitting(false);
      } else {
        track({ name: 'assessment_started', payload: { jobTitle } });
        // T31: Clear sessionStorage after successful setup
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('quicktry');
        }
        // Show preparing overlay before redirecting
        setPendingRedirect(result.redirectUrl);
        setShowPreparing(true);
      }
    } catch (err: any) {
      console.error('Error starting assessment:', err);
      setError(err.message || 'An error occurred. Please try again.');
      track({
        name: 'assessment_setup_error',
        payload: { error: err.message },
      });
      setIsSubmitting(false);
    }
    // Note: isSubmitting is reset in the error case, or when overlay completes
  };

  // Handle overlay completion and redirect
  const handlePreparingComplete = () => {
    if (pendingRedirect) {
      router.push(pendingRedirect);
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
    <>
      {/* T31: Preparing Overlay */}
      <PreparingOverlay
        show={showPreparing}
        onComplete={handlePreparingComplete}
        duration={2000}
      />

      <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Ready to Practice Like It&apos;s Real?
              </h1>
              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-6">
                Upload your CV to get interview questions based on YOUR actual
                experience and background.
              </p>
              {/* Introduction Paragraph */}
              <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                You&apos;ll get 3 questions tailored specifically to your
                background and the role you&apos;re targeting. This takes 2
                minutes to set up.
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

                {/* CV Upload */}
                <div className="space-y-2 mb-6">
                  <Label className="text-base font-semibold">
                    Your CV/Resume <span className="text-red-500">*</span>
                  </Label>
                  <FileDrop
                    onFileSelect={handleCvFileSelect}
                    currentFile={cvFile}
                    label="Drop your CV/Resume here"
                    acceptedTypes={[
                      'application/pdf',
                      'image/png',
                      'image/jpeg',
                      'image/jpg',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/msword',
                    ]}
                    acceptedExtensions={[
                      '.pdf',
                      '.png',
                      '.jpg',
                      '.jpeg',
                      '.docx',
                      '.doc',
                    ]}
                    maxSizeMB={10}
                  />
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Why we need this:
                    </p>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">→</span>
                        <span>
                          Questions tailored to YOUR specific projects and tools
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">→</span>
                        <span>Feedback based on YOUR experience level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">→</span>
                        <span>
                          Interview difficulty matched to YOUR actual role
                        </span>
                      </li>
                    </ul>
                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                      Privacy: Your CV is encrypted and never shared. Delete
                      anytime.
                    </p>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-2 mb-6">
                  <Label
                    htmlFor="jobDescription"
                    className="text-base font-semibold"
                  >
                    Job Description{' '}
                    <span className="text-slate-600 dark:text-slate-400 font-normal">
                      (Optional -{' '}
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                        Highly Recommended
                      </span>
                      )
                    </span>
                  </Label>
                  <textarea
                    id="jobDescription"
                    placeholder="Paste the job description or key responsibilities here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    onFocus={handleJobDescriptionFocus}
                    onBlur={handleJobDescriptionBlur}
                    disabled={isSubmitting}
                    rows={6}
                    className="w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Add this if you&apos;re preparing for a specific role.
                    We&apos;ll tailor questions to match that job&apos;s
                    requirements.
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
                  disabled={isSubmitting || !turnstileToken || !cvFile}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? 'Starting Your Interview...'
                    : 'Start My Personalized Interview'}
                </Button>
                {(!turnstileToken || !cvFile) && (
                  <p className="text-sm text-center text-amber-600 dark:text-amber-400 mt-2">
                    {!cvFile && !turnstileToken
                      ? 'Please upload your CV and complete the security check'
                      : !cvFile
                        ? 'Please upload your CV to continue'
                        : 'Complete the security check above to enable this button'}
                  </p>
                )}

                <p className="text-sm text-center text-slate-600 dark:text-slate-400 mt-3">
                  Takes 10-15 minutes. You can pause anytime.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
