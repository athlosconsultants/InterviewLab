/**
 * T100 - Question Reveal Hook
 * Manages the reveal timer with countdown and replay-extend functionality
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseQuestionRevealOptions {
  currentTurnId: string | null;
  accessibilityMode: boolean;
  onRevealCountChange?: (count: number) => void;
}

interface UseQuestionRevealReturn {
  countdown: number | null; // 3, 2, 1, or null
  questionVisible: boolean;
  revealCount: number;
  maxReveals: number;
  canReplay: boolean;
  handleReplay: () => void;
  remainingTime: number | null; // seconds remaining in current reveal window
}

const COUNTDOWN_DURATION = 3000; // 3 seconds
const INITIAL_REVEAL_DURATION = 20000; // 20 seconds
const REPLAY_EXTENSION = 8000; // +8 seconds per replay
const MAX_REPLAYS = 2;

export function useQuestionReveal({
  currentTurnId,
  accessibilityMode,
  onRevealCountChange,
}: UseQuestionRevealOptions): UseQuestionRevealReturn {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [questionVisible, setQuestionVisible] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const revealEndTimeRef = useRef<number | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  // Start countdown and reveal sequence
  const startRevealSequence = useCallback(
    (duration: number) => {
      clearAllTimers();

      // 3-2-1 countdown
      setCountdown(3);
      setQuestionVisible(false);

      timersRef.current.push(setTimeout(() => setCountdown(2), 1000));
      timersRef.current.push(setTimeout(() => setCountdown(1), 2000));
      timersRef.current.push(
        setTimeout(() => {
          setCountdown(null);
          setQuestionVisible(true);

          // Set reveal end time
          const endTime = Date.now() + duration;
          revealEndTimeRef.current = endTime;

          // Start tick interval to update remaining time
          tickIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
            setRemainingTime(remaining);

            if (remaining === 0) {
              if (tickIntervalRef.current) {
                clearInterval(tickIntervalRef.current);
                tickIntervalRef.current = null;
              }
            }
          }, 100); // Update every 100ms for smooth countdown

          // Emit reveal_started event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('reveal_started', {
                detail: { turnId: currentTurnId, duration },
              })
            );
          }
        }, COUNTDOWN_DURATION)
      );

      // Auto-hide after reveal duration
      timersRef.current.push(
        setTimeout(() => {
          setQuestionVisible(false);
          setRemainingTime(null);
          revealEndTimeRef.current = null;

          toast.info('Question hidden', {
            description: `Use Replay to review (${MAX_REPLAYS - revealCount}× remaining)`,
          });

          // Emit reveal_hidden event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('reveal_hidden', {
                detail: { turnId: currentTurnId },
              })
            );
          }
        }, COUNTDOWN_DURATION + duration)
      );
    },
    [clearAllTimers, currentTurnId, revealCount]
  );

  // Handle replay (extends current window)
  const handleReplay = useCallback(() => {
    // Check if we've exceeded replay limit (belt and suspenders with button disable)
    if (revealCount >= MAX_REPLAYS) {
      toast.error('No replays left');
      return;
    }

    // If question is currently hidden, re-show it with extension
    if (!questionVisible) {
      setQuestionVisible(true);
      const duration = REPLAY_EXTENSION;
      const endTime = Date.now() + duration;
      revealEndTimeRef.current = endTime;

      // Start tick interval
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      tickIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
        setRemainingTime(remaining);

        if (remaining === 0) {
          if (tickIntervalRef.current) {
            clearInterval(tickIntervalRef.current);
            tickIntervalRef.current = null;
          }
        }
      }, 100);

      // Auto-hide after extension
      const hideTimer = setTimeout(() => {
        setQuestionVisible(false);
        setRemainingTime(null);
        revealEndTimeRef.current = null;

        const remaining = MAX_REPLAYS - revealCount;
        toast.info('Question hidden', {
          description:
            remaining > 0
              ? `Use Replay to review (${remaining}× remaining)`
              : 'No replays remaining',
        });
      }, duration);

      timersRef.current.push(hideTimer);
    } else {
      // If question is currently visible, extend the window
      if (revealEndTimeRef.current) {
        const now = Date.now();
        const currentRemaining = revealEndTimeRef.current - now;
        const newEndTime = revealEndTimeRef.current + REPLAY_EXTENSION;
        revealEndTimeRef.current = newEndTime;

        // Clear existing hide timer
        clearAllTimers();

        // Set new hide timer
        const hideTimer = setTimeout(() => {
          setQuestionVisible(false);
          setRemainingTime(null);
          revealEndTimeRef.current = null;

          const remaining = MAX_REPLAYS - revealCount;
          toast.info('Question hidden', {
            description:
              remaining > 0
                ? `Use Replay to review (${remaining}× remaining)`
                : 'No replays remaining',
          });
        }, currentRemaining + REPLAY_EXTENSION);

        timersRef.current.push(hideTimer);
      }
    }

    // Use functional update to avoid stale closure issues
    setRevealCount((prev) => {
      const newCount = prev + 1;
      console.log(
        `[T100 Replay] Incrementing replay count: ${prev} -> ${newCount} (max: ${MAX_REPLAYS})`
      );

      // Notify parent of count change
      if (onRevealCountChange) {
        onRevealCountChange(newCount);
      }

      // Emit replay_used event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('replay_used', {
            detail: { turnId: currentTurnId, count: newCount },
          })
        );
      }

      return newCount;
    });

    // Toast notification (use revealCount + 1 for immediate feedback)
    const newCount = revealCount + 1;
    const remaining = MAX_REPLAYS - newCount;
    toast.info(`Replay ${newCount} of ${MAX_REPLAYS}`, {
      description:
        remaining > 0 ? `${remaining} remaining` : 'Final replay used',
    });
  }, [
    revealCount,
    questionVisible,
    currentTurnId,
    onRevealCountChange,
    clearAllTimers,
  ]);

  // Initialize reveal sequence when turn changes
  useEffect(() => {
    if (!currentTurnId || accessibilityMode) {
      // Skip reveal logic if no question or accessibility mode is on
      setCountdown(null);
      setQuestionVisible(false);
      setRemainingTime(null);
      clearAllTimers();
      return;
    }

    // Reset state for new question
    setRevealCount(0);
    startRevealSequence(INITIAL_REVEAL_DURATION);

    // Cleanup on unmount or turn change
    return () => {
      clearAllTimers();
    };
  }, [currentTurnId, accessibilityMode, startRevealSequence, clearAllTimers]);

  // Show question immediately in accessibility mode
  useEffect(() => {
    if (accessibilityMode && currentTurnId) {
      setQuestionVisible(true);
      setCountdown(null);
      setRemainingTime(null);
    }
  }, [accessibilityMode, currentTurnId]);

  return {
    countdown,
    questionVisible,
    revealCount,
    maxReveals: MAX_REPLAYS,
    canReplay: revealCount < MAX_REPLAYS,
    handleReplay,
    remainingTime,
  };
}
