'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      console.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set');
      return;
    }

    const loadTurnstile = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token);
            },
            'error-callback': () => {
              console.error('Turnstile error');
            },
            theme: 'light',
          });
        } catch (error) {
          console.error('Failed to render Turnstile:', error);
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

  return <div ref={containerRef} className="flex justify-center" />;
};
