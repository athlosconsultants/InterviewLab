'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';

function WhopSessionContent() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const signIn = async () => {
      try {
        const email = searchParams?.get('email');
        const password = searchParams?.get('password');
        const redirect = searchParams?.get('redirect') || '/';

        if (!email || !password) {
          console.error('[Whop Session] Missing credentials');
          setStatus('error');
          return;
        }

        console.log('[Whop Session] Signing in...');
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          console.error('[Whop Session] Failed to sign in:', error);
          setStatus('error');
          return;
        }

        console.log(
          '[Whop Session] Signed in successfully, redirecting to:',
          redirect
        );
        router.push(redirect);
      } catch (err) {
        console.error('[Whop Session] Error:', err);
        setStatus('error');
      }
    };

    signIn();
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
            {status === 'loading' && 'Setting up your account...'}
            {status === 'error' && 'Authentication Failed'}
          </h1>
          <p className="text-muted-foreground">
            {status === 'loading' &&
              'Please wait while we complete your sign-in'}
            {status === 'error' && 'There was a problem signing you in'}
          </p>
        </div>

        {/* Status Display */}
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Creating your session...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-red-500 text-5xl">⚠️</div>
              <p className="text-sm text-muted-foreground">
                Unable to complete authentication. Please try launching the app
                again from Whop.
              </p>
              <button
                onClick={() => router.push('/sign-in')}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function WhopSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WhopSessionContent />
    </Suspense>
  );
}
