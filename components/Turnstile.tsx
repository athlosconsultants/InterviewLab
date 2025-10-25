'use client';

import React, { useEffect, useRef } from 'react';

type TurnstileProps = {
  onVerify: (token: string) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export const TurnstileWidget = ({ onVerify }: TurnstileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      console.error('❌ NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set');
      console.error(
        'Please add NEXT_PUBLIC_TURNSTILE_SITE_KEY to your .env.local file'
      );
      setHasError(true);
      setIsLoading(false);
      return;
    }

    console.log('🔐 Turnstile: Site key found, loading widget...');

    const loadTurnstile = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        try {
          console.log('🔐 Turnstile: Rendering widget...');
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              console.log('✅ Turnstile: Verification successful');
              setIsLoading(false);
              onVerify(token);
            },
            'error-callback': () => {
              console.error('❌ Turnstile: Verification error');
              setHasError(true);
              setIsLoading(false);
            },
            theme: 'light',
          });
          console.log(
            '🔐 Turnstile: Widget rendered with ID:',
            widgetIdRef.current
          );
          setIsLoading(false);
        } catch (error) {
          console.error('❌ Turnstile: Failed to render widget:', error);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    // Check if Turnstile is already loaded
    if (window.turnstile) {
      loadTurnstile();
    } else {
      // Load Turnstile script
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = loadTurnstile;
      script.onerror = () => {
        console.error('❌ Turnstile: Failed to load script');
        setHasError(true);
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Failed to remove Turnstile widget:', error);
        }
      }
    };
  }, [onVerify]);

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} className="flex justify-center min-h-[65px]" />
      {isLoading && !hasError && (
        <div className="text-sm text-slate-600 mt-2">
          Loading security check...
        </div>
      )}
      {hasError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 mt-2">
          ⚠️ Security verification failed to load. Check console for details or
          contact support.
        </div>
      )}
    </div>
  );
};
