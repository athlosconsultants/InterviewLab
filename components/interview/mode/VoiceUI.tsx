'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, RotateCcw, Send, Loader2, Type } from 'lucide-react';
import {
  initializeInterview,
  submitInterviewAnswer,
} from '@/app/interview/[id]/actions';
import type { Turn, Timing } from '@/lib/schema';
import { toast } from 'sonner';
import { VoiceOrb } from '../VoiceOrb';
import { AudioRecorder } from '../AudioRecorder';
import { UpgradeDialog } from '../UpgradeDialog';

interface VoiceUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

type OrbState = 'idle' | 'speaking' | 'listening' | 'processing';

export function VoiceUI({ sessionId, jobTitle, company }: VoiceUIProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [introText, setIntroText] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Answer states
  const [answerMode, setAnswerMode] = useState<'text' | 'audio'>('audio');
  const [answer, setAnswer] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stage info
  const [currentStage, setCurrentStage] = useState(1);
  const [stagesPlanned, setStagesPlanned] = useState(1);
  const [stageName, setStageName] = useState('');

  // Audio playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Initialize interview
  useEffect(() => {
    const loadInterview = async () => {
      setIsLoading(true);
      const result = await initializeInterview(sessionId);

      if (result.error) {
        toast.error('Failed to load interview', {
          description: result.error,
        });
        router.push('/setup');
        return;
      }

      if (result.data) {
        const turnsWithTiming = (result.data.turns || []).map((turn) => {
          const timing = turn.timing as Timing | null;
          if (!timing?.started_at && !turn.answer_text) {
            return {
              ...turn,
              timing: {
                started_at: new Date().toISOString(),
                completed_at: '',
                duration_ms: 0,
                replay_count: 0,
              } as Timing,
            };
          }
          return turn;
        });

        setTurns(turnsWithTiming);
        setIntroText(result.data.intro || null);
        setCurrentStage(result.data.currentStage || 1);
        setStagesPlanned(result.data.stagesPlanned || 1);
        setStageName(result.data.stageName || '');

        const firstUnanswered = turnsWithTiming.find((t) => !t.answer_text);
        if (firstUnanswered) {
          setCurrentTurnId(firstUnanswered.id);
        }
      }

      setIsLoading(false);
    };

    loadInterview();
  }, [sessionId, router]);

  // Auto-play TTS for intro
  useEffect(() => {
    if (introText && turns.length === 0 && !isLoading) {
      playTextToSpeech(introText, 'intro');
    }
  }, [introText, turns.length, isLoading]);

  // Auto-play TTS for new questions
  useEffect(() => {
    const currentQuestion = turns.find(
      (t) => t.id === currentTurnId && !t.answer_text
    );

    if (currentQuestion && !isLoading) {
      const questionText = currentQuestion.question.text;
      const bridgeText = currentQuestion.bridge_text;

      // Play bridge first if it exists
      if (bridgeText) {
        playTextToSpeech(bridgeText, 'bridge', () => {
          // After bridge, play question
          setTimeout(() => {
            playQuestionTTS(currentQuestion.id, questionText);
          }, 500);
        });
      } else {
        playQuestionTTS(currentQuestion.id, questionText);
      }
    }
  }, [currentTurnId, turns, isLoading]);

  const playTextToSpeech = async (
    text: string,
    type: 'intro' | 'bridge',
    onComplete?: () => void
  ) => {
    try {
      setOrbState('speaking');

      // For intro/bridge, we just use browser TTS for now
      // In production, you'd want to call the TTS API
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setOrbState('idle');
        if (onComplete) onComplete();
      };

      utterance.onerror = () => {
        setOrbState('idle');
        toast.error('Speech playback failed');
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('TTS error:', error);
      setOrbState('idle');
    }
  };

  const playQuestionTTS = async (turnId: string, questionText: string) => {
    try {
      setOrbState('speaking');

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questionText,
          turnId: turnId,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.audioUrl) {
        throw new Error('Failed to generate audio');
      }

      setCurrentAudioUrl(data.audioUrl);

      // Create and play audio
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setOrbState('idle');
        setIsPlayingAudio(false);
      };

      audio.onerror = () => {
        setOrbState('idle');
        setIsPlayingAudio(false);
        toast.error('Audio playback failed');
      };

      await audio.play();
      setIsPlayingAudio(true);
    } catch (error) {
      console.error('TTS error:', error);
      setOrbState('idle');
      toast.error('Unable to play question audio');
    }
  };

  const handleReplay = useCallback(() => {
    if (!currentAudioUrl || !audioRef.current) {
      toast.error('No audio to replay');
      return;
    }

    setOrbState('speaking');
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      setOrbState('idle');
      toast.error('Replay failed');
    });
  }, [currentAudioUrl]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (answerMode === 'text' && !answer.trim()) {
        toast.error('Answer required');
        return;
      }

      if (answerMode === 'audio' && !audioBlob) {
        toast.error('Recording required');
        return;
      }

      if (!currentTurnId) {
        toast.error('No active question');
        return;
      }

      setIsSubmitting(true);
      setOrbState('processing');

      try {
        let finalAnswer = answer.trim();
        let audioKey: string | undefined = undefined;

        // Handle audio mode
        if (answerMode === 'audio' && audioBlob) {
          const audioFormData = new FormData();
          audioFormData.append('audio', audioBlob, 'answer.webm');
          audioFormData.append('turnId', currentTurnId);

          const uploadResponse = await fetch('/api/upload-audio', {
            method: 'POST',
            body: audioFormData,
          });

          const uploadData = await uploadResponse.json();

          if (!uploadData.success) {
            toast.error('Upload failed');
            setOrbState('idle');
            setIsSubmitting(false);
            return;
          }

          audioKey = uploadData.storageKey;

          // Transcribe audio
          toast.info('Transcribing...');
          const transcribeFormData = new FormData();
          transcribeFormData.append('audio', audioBlob, 'answer.webm');

          const transcribeResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: transcribeFormData,
          });

          const transcribeData = await transcribeResponse.json();

          if (!transcribeData.success) {
            toast.error('Transcription failed');
            setOrbState('idle');
            setIsSubmitting(false);
            return;
          }

          finalAnswer = transcribeData.text;
          toast.success('Transcribed');
        }

        // Submit the answer
        const result = await submitInterviewAnswer({
          sessionId,
          turnId: currentTurnId,
          answerText: finalAnswer,
          audioKey,
          replayCount: 0, // Voice mode doesn't have replay limits
        });

        if (result.error) {
          toast.error('Unable to submit', {
            description: result.error,
          });
          setOrbState('idle');
          return;
        }

        if (result.data) {
          setTurns((prev) =>
            prev.map((t) =>
              t.id === currentTurnId ? { ...t, answer_text: finalAnswer } : t
            )
          );

          if (result.data.done) {
            setOrbState('idle');
            toast.success('Interview complete', {
              description: 'Well done.',
            });
            setShowUpgradeDialog(true);
            return;
          }

          const nextData = result.data as {
            done: boolean;
            nextQuestion: any;
            turnId: string;
            bridgeText?: string | null;
            currentStage?: number;
            stagesPlanned?: number;
            stageName?: string;
          };

          if (nextData.nextQuestion && nextData.turnId) {
            if (
              nextData.currentStage &&
              nextData.currentStage !== currentStage
            ) {
              toast.success(
                `Stage ${nextData.currentStage}: ${nextData.stageName}`,
                {
                  description: 'Next stage',
                }
              );
            }

            const newTurn = {
              id: nextData.turnId,
              session_id: sessionId,
              user_id: '',
              question: nextData.nextQuestion,
              tts_key: null,
              answer_text: null,
              answer_audio_key: null,
              answer_digest: null,
              bridge_text: nextData.bridgeText || null,
              timing: {
                started_at: new Date().toISOString(),
                completed_at: '',
                duration_ms: 0,
                replay_count: 0,
              } as Timing,
              created_at: new Date().toISOString(),
            } as Turn;

            setTurns((prev) => [...prev, newTurn]);
            setCurrentTurnId(nextData.turnId);

            if (nextData.currentStage) setCurrentStage(nextData.currentStage);
            if (nextData.stagesPlanned)
              setStagesPlanned(nextData.stagesPlanned);
            if (nextData.stageName) setStageName(nextData.stageName);
          }

          setAnswer('');
          setAudioBlob(null);
          setOrbState('idle');
        }
      } catch (error) {
        console.error('Submit error:', error);
        toast.error('Something went wrong', {
          description: 'Please try again',
        });
        setOrbState('idle');
      } finally {
        setIsSubmitting(false);
      }
    },
    [answerMode, answer, audioBlob, currentTurnId, sessionId, currentStage]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const questionCount = turns.length;
  const currentQuestion = turns.find(
    (t) => t.id === currentTurnId && !t.answer_text
  );

  return (
    <>
      <div className="mx-auto w-full max-w-4xl p-4 space-y-8">
        {/* Header */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{jobTitle}</h1>
              <p className="text-muted-foreground">{company}</p>
              {stagesPlanned > 1 && (
                <p className="text-sm text-primary mt-2">
                  Stage {currentStage} of {stagesPlanned}: {stageName}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Voice Mode</p>
              <p className="text-sm font-medium">
                Question {questionCount + 1}
              </p>
            </div>
          </div>
        </div>

        {/* Voice Orb */}
        <div className="flex flex-col items-center justify-center py-12">
          <VoiceOrb state={orbState} size="lg" />

          {currentQuestion && (
            <div className="mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplay}
                disabled={!currentAudioUrl || isPlayingAudio}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Replay Question
              </Button>
            </div>
          )}
        </div>

        {/* Answer Input */}
        {currentQuestion && !isSubmitting && (
          <div className="border rounded-lg p-6 space-y-4 bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Answer</h3>
              <div className="flex gap-2">
                <Button
                  variant={answerMode === 'audio' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnswerMode('audio')}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Voice
                </Button>
                <Button
                  variant={answerMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnswerMode('text')}
                >
                  <Type className="mr-2 h-4 w-4" />
                  Text
                </Button>
              </div>
            </div>

            {answerMode === 'audio' ? (
              <AudioRecorder
                onRecordingComplete={(blob) => {
                  setAudioBlob(blob);
                  setOrbState('idle');
                }}
              />
            ) : (
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="resize-none"
              />
            )}

            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (answerMode === 'text' && !answer.trim()) ||
                (answerMode === 'audio' && !audioBlob)
              }
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Answer
                </>
              )}
            </Button>
          </div>
        )}

        {/* Transcript (if audio answer was recorded) */}
        {audioBlob && answerMode === 'audio' && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Recording ready. Submit to transcribe and continue.
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Dialog */}
      {showUpgradeDialog && (
        <UpgradeDialog
          open={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          onViewReport={() => router.push(`/report/${sessionId}`)}
        />
      )}
    </>
  );
}
