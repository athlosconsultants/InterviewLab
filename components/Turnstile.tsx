'use client';

// import { Turnstile } from '@marsdev/react-turnstile';
import { useEffect } from 'react';

type TurnstileProps = {
  onVerify: (token: string) => void;
};

export const TurnstileWidget = ({ onVerify }: TurnstileProps) => {
  useEffect(() => {
    // Placeholder until dependency issue is resolved
    console.warn(
      'react-turnstile dependency not installed. Using placeholder.'
    );
    onVerify('placeholder_turnstile_token_for_development');
  }, [onVerify]);

  return (
    <div>
      {/* <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={onVerify}
        options={{
          theme: 'light',
        }}
      /> */}
      <div className="p-4 border rounded-md bg-slate-50 text-slate-600">
        <p className="text-sm">Cloudflare Turnstile widget placeholder.</p>
      </div>
    </div>
  );
};
