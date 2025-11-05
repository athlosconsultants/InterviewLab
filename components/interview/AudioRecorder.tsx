'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  delayMs?: number; // Optional delay before auto-starting recording
  autoStart?: boolean; // Whether to auto-start recording (only for main interview questions)
  orbState?: 'idle' | 'speaking' | 'listening' | 'thinking'; // Current orb state
}

export function AudioRecorder({
  onRecordingComplete,
  disabled,
  delayMs = 0,
  autoStart = true, // Default to true for backward compatibility
  orbState = 'idle',
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mimeType, setMimeType] = useState<string>('audio/webm');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Auto-start recording on mount (with optional delay)
  // Only auto-start if:
  // 1. autoStart is true (only for main interview questions)
  // 2. Orb is idle (not speaking or thinking)
  // 3. Not already recording and no audio blob
  useEffect(() => {
    if (
      autoStart &&
      orbState === 'idle' &&
      !disabled &&
      !isRecording &&
      !audioBlob
    ) {
      if (delayMs > 0) {
        console.log(
          `[AudioRecorder] Auto-start enabled. Waiting ${delayMs}ms before recording...`
        );
        const timer = setTimeout(() => {
          console.log('[AudioRecorder] Delay complete. Starting recording...');
          startRecording();
        }, delayMs);
        return () => clearTimeout(timer);
      } else {
        console.log('[AudioRecorder] Auto-starting recording immediately...');
        startRecording();
      }
    } else if (!autoStart) {
      console.log(
        '[AudioRecorder] Auto-start disabled (warm-up/confirmation question)'
      );
    } else if (orbState !== 'idle') {
      console.log(
        `[AudioRecorder] Auto-start blocked - orb is ${orbState} (must be idle)`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayMs, autoStart, orbState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine the best supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
      ];

      let selectedMimeType = 'audio/webm';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      setMimeType(selectedMimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: selectedMimeType,
        });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Notify parent
        onRecordingComplete(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success('Recording', {
        description: 'Speak clearly',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Microphone access denied', {
        description: 'Allow access to record',
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast.success('Recording complete', {
        description: 'Review or re-record',
      });
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'paused'
    ) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const playRecording = () => {
    if (audioUrl && audioBlob) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
        audioElementRef.current.onended = () => {
          setIsPlaying(false);
        };
        audioElementRef.current.onerror = (e) => {
          console.error('Audio playback error:', e);
          toast.error('Playback failed', {
            description:
              'Unable to play the recording. Please try re-recording.',
          });
          setIsPlaying(false);
        };
      }

      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        // Set source (browser will auto-detect format from blob URL)
        audioElementRef.current.src = audioUrl;
        audioElementRef.current.play().catch((error) => {
          console.error('Play failed:', error);
          toast.error('Playback failed', {
            description: 'Try re-recording',
          });
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }
    setIsPlaying(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls - Auto-starts, only shows Pause/Resume/Stop */}
      {!audioBlob && isRecording && (
        <div className="flex items-center gap-3">
          {!isPaused ? (
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onClick={pauseRecording}
              disabled={disabled}
              className="gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onClick={resumeRecording}
              disabled={disabled}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            disabled={disabled}
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      {audioBlob && audioUrl && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-md border p-3">
            <Button
              type="button"
              variant="tertiary"
              size="xs"
              onClick={playRecording}
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play
                </>
              )}
            </Button>
            <span className="text-sm font-mono">
              {formatTime(recordingTime)}
            </span>
            <Button
              type="button"
              variant="tertiary"
              size="xs"
              onClick={resetRecording}
              className="ml-auto"
            >
              Re-record
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Recording ready. Submit your answer when you&apos;re satisfied.
          </p>
        </div>
      )}
    </div>
  );
}
