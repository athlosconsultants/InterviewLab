'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ReplayButtonProps {
  replayCount: number;
  replayCap: number;
  onReplay: () => void;
  disabled?: boolean;
}

export function ReplayButton({
  replayCount,
  replayCap,
  onReplay,
  disabled,
}: ReplayButtonProps) {
  const replaysRemaining = replayCap - replayCount;
  const isMaxedOut = replaysRemaining <= 0;

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="tertiary"
        size="xs"
        onClick={onReplay}
        disabled={disabled || isMaxedOut}
        className="gap-1.5"
      >
        <RotateCcw className="h-3 w-3" />
        Replay Question
      </Button>
      <span
        className={`text-[10px] ${isMaxedOut ? 'text-destructive' : 'text-muted-foreground'}`}
      >
        {replaysRemaining > 0 ? (
          <>
            {replaysRemaining} {replaysRemaining === 1 ? 'replay' : 'replays'}{' '}
            left
          </>
        ) : (
          'No replays left'
        )}
      </span>
    </div>
  );
}
