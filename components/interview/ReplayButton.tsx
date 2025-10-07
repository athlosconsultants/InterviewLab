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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onReplay}
        disabled={disabled || isMaxedOut}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Replay Question
      </Button>
      <span
        className={`text-xs ${isMaxedOut ? 'text-destructive' : 'text-muted-foreground'}`}
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
