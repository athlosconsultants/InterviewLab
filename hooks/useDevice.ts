'use client';

import { useEffect, useState } from 'react';
// import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

export function useDevice() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getFingerprint = async () => {
      try {
        // const fp = await FingerprintJS.load({
        //   apiKey: process.env.NEXT_PUBLIC_FINGERPRINTJS_API_KEY!,
        // });

        // const result = await fp.get();
        // setFingerprint(result.visitorId);

        // Placeholder until dependency issue is resolved
        console.warn(
          'FingerprintJS dependency not installed. Using placeholder.'
        );
        setFingerprint('placeholder_fingerprint_for_development');
      } catch (error) {
        console.error('Error getting fingerprint:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getFingerprint();
  }, []);

  return { fingerprint, isLoading };
}
