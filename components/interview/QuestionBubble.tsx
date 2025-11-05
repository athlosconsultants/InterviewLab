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
      <div className="max-w-[80%] rounded-xl bg-slate-50 border border-slate-200 p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
            Question {questionNumber}
          </span>
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            {question.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            {question.difficulty}
          </span>
          <Button
            variant="tertiary"
            size="xs"
            onClick={handlePlayAudio}
            disabled={isLoading}
            className="ml-auto"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </Button>
        </div>
        <p className="text-sm text-slate-900 leading-relaxed">
          {question.text}
        </p>
      </div>
    </div>
  );
}
