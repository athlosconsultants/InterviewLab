'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase-client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useDevice } from '@/hooks/useDevice';
import { bindDevice } from '@/app/assessment/setup/actions';
import { getWhopOAuthUrl } from '@/lib/whop';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fingerprint, isLoading: isFingerprintLoading } = useDevice();

  useEffect(() => {
    // Check for error messages from URL params (e.g., from callback redirect)
    const error = searchParams?.get('error');
    const urlMessage = searchParams?.get('message');
    const urlEmail = searchParams?.get('email');

    if (error === 'use_code') {
      // Show OTP input if redirected with error
      setOtpSent(true);
      if (urlEmail) {
        setEmail(decodeURIComponent(urlEmail));
      }
      if (urlMessage) {
        setMessage(decodeURIComponent(urlMessage));
      } else {
        setMessage('Please enter the 6-digit code from your email');
      }
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = createClient();

    // Always use OTP-only authentication
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setOtpSent(true);
      setEmailSent(true);
      setMessage('Check your email for your 6-digit code!');
    }

    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = createClient();
    const redirectUrl = searchParams?.get('redirect') || '/';

    try {
      // Verify the OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // T32: Bind device on sign-in
      if (fingerprint) {
        console.log('Binding device...');
        try {
          await bindDevice(fingerprint);
          console.log('Device bound successfully.');
        } catch (bindError) {
          console.error('Failed to bind device:', bindError);
          // Don't block login if binding fails, just log it.
        }
      } else {
        console.warn('No fingerprint available to bind.');
      }

      // Verify session was actually created
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error('Session check failed:', sessionError);
        setMessage('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Session established:', {
        email: sessionData.session.user.email,
        accessToken: sessionData.session.access_token.substring(0, 20) + '...',
        expiresAt: sessionData.session.expires_at,
      });

      // Explicitly refresh the auth state to ensure cookies are written
      await supabase.auth.refreshSession();
      console.log('🔄 Session refreshed');

      setMessage('Success! Redirecting...');

      // Wait a moment for cookies to fully persist in in-app browsers
      // TikTok and other in-app browsers need this delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Use window.location.href for full page reload to ensure cookies are sent
      // This is more reliable for in-app browsers than router.push()
      console.log('🔀 Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('OTP verification error:', err);
      setMessage('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6 p-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-lg">
                <Image
                  src="/logo.png"
                  alt="InterviewLab Logo"
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Sign In
          </h1>
          <p className="text-muted-foreground">
            Enter your email to receive a verification code
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl border-2 shadow-sm ${
              message.includes('Check') || message.includes('Success')
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-800 text-green-900 dark:text-green-100'
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100'
            }`}
          >
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || emailSent}
                className="h-12 text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
              disabled={loading || emailSent}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-b from-background via-background to-muted/20 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Sign in with Whop */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-semibold bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 border-2 shadow-lg"
            onClick={() => {
              const whopUrl = getWhopOAuthUrl();
              window.location.href = whopUrl;
            }}
            disabled={loading}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign in with Whop
          </Button>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {!email && (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the email address you used to sign in
                </p>
              </div>
            )}

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-blue-200 dark:border-blue-800">
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                required
                disabled={loading}
                maxLength={6}
                pattern="\d{6}"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="text-3xl text-center tracking-[0.5em] font-mono font-bold bg-transparent border-0 focus-visible:ring-0"
              />
              {email && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Code sent to <span className="font-medium">{email}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
              disabled={loading || otp.length !== 6 || !email}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 text-base"
              onClick={() => {
                setOtpSent(false);
                setEmailSent(false);
                setOtp('');
                setEmail('');
                setMessage('');
              }}
            >
              Start over
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8 p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="InterviewLab Logo"
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Loading...
              </h1>
            </div>
          </div>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
