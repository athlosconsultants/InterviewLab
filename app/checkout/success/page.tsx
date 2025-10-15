'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * T134 - Phase 13: Checkout Success Page Content
 * Inner component that uses useSearchParams
 */
function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setIsLoading(false);
      return;
    }

    // Give webhook time to process (usually very fast, but we add a small delay for UX)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Processing your purchase...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Something went wrong
          </h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button onClick={() => router.push('/pricing')} className="mt-6">
            Back to Pricing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="rounded-2xl bg-card p-8 shadow-lg border border-border text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-4">🎉 Purchase Successful!</h1>
            <p className="text-lg text-muted-foreground mb-2">
              Your interview pack has been activated.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              You can now start practicing with premium features.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-lg p-6 mb-8 text-left"
          >
            <h2 className="font-semibold mb-4 text-center">
              What&apos;s included:
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Voice mode with AI interviewer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Detailed feedback reports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Adaptive difficulty system</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Multi-stage interviews (Pro & Elite)</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => router.push('/setup')}
              className="w-full sm:w-auto"
            >
              Start Interview
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto"
            >
              Back to Home
            </Button>
          </motion.div>

          {/* Session ID (for debugging) */}
          {sessionId && (
            <p className="mt-8 text-xs text-muted-foreground">
              Order ID: {sessionId.slice(-12)}
            </p>
          )}

          {/* Support Email */}
          <p className="mt-6 text-sm text-muted-foreground">
            Questions?{' '}
            <a
              href="mailto:support@theinterviewlab.io"
              className="text-primary hover:underline"
            >
              support@theinterviewlab.io
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * T134 - Phase 13: Checkout Success Page
 * Wrapper component with Suspense boundary
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
