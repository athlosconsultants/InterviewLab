'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import type { Question } from '@/lib/schema';
import { toast } from 'sonner';

interface QuestionBubbleProps {
  question: Question;
  questionNumber: number;
  turnId: string;
}

export function QuestionBubble({
  question,
  questionNumber,
  turnId,
}: QuestionBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = async () => {
    try {
      // If audio is already loaded, just play/pause
      if (audioRef.current && audioUrl) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
        return;
      }

      // Generate TTS audio
      setIsLoading(true);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: question.text,
          turnId: turnId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      // Create audio element and play
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      setAudioUrl(data.audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        toast.error('Playback failed');
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Audio unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg bg-muted p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Question {questionNumber}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {question.category}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
            {question.difficulty}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayAudio}
            disabled={isLoading}
            className="ml-auto h-7 w-7 p-0"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-base">{question.text}</p>
      </div>
    </div>
  );
}
