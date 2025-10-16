'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, ExternalLink, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isInAppBrowser, getInAppBrowserName } from '@/lib/browser-detection';

// Force dynamic rendering to prevent prerendering issues with browser detection
export const dynamic = 'force-dynamic';

export default function AuthCodeErrorPage() {
  const [isInApp, setIsInApp] = useState(false);
  const [browserName, setBrowserName] = useState<string | null>(null);

  useEffect(() => {
    const inApp = isInAppBrowser();
    setIsInApp(inApp);
    if (inApp) {
      setBrowserName(getInAppBrowserName());
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 p-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold">Authentication Failed</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t complete your sign-in. This can happen for a few
            reasons.
          </p>
        </div>

        {isInApp && browserName && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                <p className="font-medium">You&apos;re using {browserName}</p>
                <p>
                  In-app browsers sometimes have trouble with magic links. We
                  recommend using a verification code instead.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Common Issues:
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>
                The magic link expired (they&apos;re only valid for a few
                minutes)
              </li>
              <li>The link was already used</li>
              <li>
                You&apos;re using an in-app browser (Instagram, TikTok,
                Facebook, etc.)
              </li>
              <li>Network connectivity issues</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Solutions:
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <strong>Best option:</strong> Use a verification code instead
              </li>
              <li>
                Open this page in your default browser (Safari, Chrome, etc.)
              </li>
              <li>
                Request a new magic link (they expire quickly for security)
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/sign-in">
              {isInApp ? 'Try Verification Code' : 'Request New Link'}
            </Link>
          </Button>

          {isInApp && (
            <p className="text-xs text-center text-muted-foreground">
              Tip: Look for &quot;Open in browser&quot; or &quot;•••&quot; menu
              in your {browserName} app
            </p>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
