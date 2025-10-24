'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

type TrackProps = {
  name: string;
  payload?: Record<string, unknown>;
};

/**
 * A simple component to track an event on mount.
 */
export const Track = ({ name, payload }: TrackProps) => {
  useEffect(() => {
    track({ name, payload });
  }, [name, payload]);

  return null;
};
