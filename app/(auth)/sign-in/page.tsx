'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase-client';
import { isInAppBrowser, getInAppBrowserName } from '@/lib/browser-detection';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isInApp, setIsInApp] = useState(false);
  const [browserName, setBrowserName] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const inApp = isInAppBrowser();
    setIsInApp(inApp);
    if (inApp) {
      setBrowserName(getInAppBrowserName());
    }

    // Check for error messages from URL params (e.g., from callback redirect)
    const error = searchParams?.get('error');
    const urlMessage = searchParams?.get('message');
    const urlEmail = searchParams?.get('email');

    if (error === 'use_code') {
      // User clicked magic link in problematic browser - show OTP input
      setOtpSent(true);
      setIsInApp(true); // Force in-app mode
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
    const redirectUrl = searchParams?.get('redirect') || '/';

    if (isInApp) {
      // Use OTP for in-app browsers
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
        setMessage('Check your email for the 6-digit code!');
      }
    } else {
      // Use magic link for standard browsers, but still send with shouldCreateUser
      // so the email will include both magic link AND 6-digit code
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setEmailSent(true);
        setMessage('Check your email for the login link!');
      }
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

      // Verify session was actually created
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error('Session check failed:', sessionError);
        setMessage('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      console.log('✅ Session established:', {
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
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground mt-2">
            {isInApp
              ? 'Enter your email to receive a verification code'
              : 'Enter your email to receive a magic link'}
          </p>
        </div>

        {isInApp && browserName && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">
                You&apos;re using {browserName}
              </p>
              <p>
                We&apos;ll send you a 6-digit code instead of a magic link for
                better compatibility.
              </p>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.includes('Check') || message.includes('Success')
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || emailSent}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || emailSent}
            >
              {loading
                ? 'Sending...'
                : isInApp
                  ? 'Send Verification Code'
                  : 'Send Magic Link'}
            </Button>

            {emailSent && !isInApp && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setOtpSent(true);
                  setMessage('Enter the 6-digit code from your email below');
                }}
              >
                I have a 6-digit code instead
              </Button>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {!email && (
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the email address you used to sign in
                </p>
              </div>
            )}

            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
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
                className="text-2xl text-center tracking-widest font-mono"
              />
              {email && (
                <p className="text-xs text-muted-foreground mt-2">
                  Code sent to {email}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6 || !email}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
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
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8 p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Sign In</h1>
              <p className="text-muted-foreground mt-2">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
