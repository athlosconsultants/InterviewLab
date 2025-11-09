'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';

function WhopCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Connecting your Whop account...');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleWhopCallback = async () => {
      try {
        const code = searchParams?.get('code');
        const error = searchParams?.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Missing authorization code');
          return;
        }

        // Exchange code for access token and create/link account
        console.log('[Whop Callback] Exchanging code with backend...');
        const response = await fetch('/api/whop/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        console.log('[Whop Callback] Backend response:', data);

        if (!data.success) {
          console.error('[Whop Callback] Backend returned error:', data.error);
          setStatus('error');
          setMessage(data.error || 'Failed to authenticate with Whop');
          return;
        }

        // Sign in with the temporary password
        console.log('[Whop Callback] Signing in with password...');
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          console.error('[Whop Callback] Failed to sign in:', signInError);
          setStatus('error');
          setMessage('Failed to sign in. Please try again.');
          return;
        }

        console.log('[Whop Callback] Session established successfully!');
        setStatus('success');
        setMessage('Success! Redirecting to your dashboard...');

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (err) {
        console.error('[Whop Callback] Error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleWhopCallback();
  }, [searchParams, router]);

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
            {status === 'loading' && 'Connecting...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Authentication Failed'}
          </h1>
        </div>

        {/* Status Message */}
        <div
          className={`p-6 rounded-xl border-2 shadow-lg ${
            status === 'loading'
              ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-300 dark:border-blue-800'
              : status === 'success'
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-800'
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            {status === 'loading' && (
              <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            {status === 'success' && (
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>

        {status === 'error' && (
          <div className="text-center">
            <button
              onClick={() => router.push('/sign-in')}
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Return to sign in
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function WhopCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
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
        </main>
      }
    >
      <WhopCallbackContent />
    </Suspense>
  );
}
