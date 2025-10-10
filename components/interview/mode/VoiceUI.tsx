'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, RotateCcw, Send, Loader2, Type } from 'lucide-react';
import {
  initializeInterview,
  submitInterviewAnswer,
  getResumeData,
  autoSaveSession,
} from '@/app/interview/[id]/actions'; // T111: Including server actions for resume
import type { Turn, Timing } from '@/lib/schema';
import { toast } from 'sonner';
import { VoiceOrb } from '../VoiceOrb';
import { AudioRecorder } from '../AudioRecorder';
import { UpgradeDialog } from '../UpgradeDialog';
import { trackEvent } from '@/lib/analytics'; // T110: Analytics tracking

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

  // T111: Resume functionality state
  const [resumeChecked, setResumeChecked] = useState(false);
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);
  const [canResume, setCanResume] = useState(false);

  // Audio playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // T108: Replay count tracking for voice mode scoring
  const [replayCount, setReplayCount] = useState(0);

  // T114: Unified audio cancellation to prevent overlaps
  const stopAllAudio = useCallback(() => {
    // Stop any browser TTS
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Stop any Audio element playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlayingAudio(false);
  }, []);

  // T115: Helper to add a pause/delay in the audio flow
  const pauseBetweenSections = (ms: number = 1500): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Initialize interview
  useEffect(() => {
    const loadInterview = async () => {
      setIsLoading(true);

      // T111: Check if interview can be resumed before initializing
      if (!resumeChecked) {
        try {
          const result = await getResumeData(sessionId);
          setResumeChecked(true);

          if (result.data) {
            setCanResume(result.data.canResume);
            setResumeMessage(result.data.message);

            if (result.data.canResume) {
              toast.info('Interview resumed', {
                description: result.data.message,
              });
            }
          }
        } catch (error) {
          console.error('[T111] Resume check failed:', error);
          // Continue with normal initialization if resume check fails
        }
      }

      const result = await initializeInterview(sessionId);

      if (result.error) {
        toast.error('Failed to load interview', {
          description: result.error,
        });
        router.push('/setup');
        return;
      }

      if (result.data) {
        const turnsWithTiming = (result.data.turns || []).map((turn: Turn) => {
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

        const firstUnanswered = turnsWithTiming.find(
          (t: Turn) => !t.answer_text
        );
        if (firstUnanswered) {
          setCurrentTurnId(firstUnanswered.id);
          // T108: Reset replay count for voice mode when setting initial turn
          setReplayCount(0);
        }
      }

      setIsLoading(false);
    };

    loadInterview();
  }, [sessionId, router]);

  // Track if intro has been played to prevent double playback on Q1
  const [introPlayed, setIntroPlayed] = useState(false);

  // T115: Track interview phase for proper sequencing
  const [currentPhase, setCurrentPhase] = useState<
    'welcome' | 'smalltalk' | 'confirmation' | 'interview' | 'complete'
  >('welcome');

  // T110: Track when small talk is shown in voice mode
  useEffect(() => {
    const currentQuestion = turns.find((t) => !t.answer_text);
    if (
      currentQuestion &&
      (currentQuestion as any).turn_type === 'small_talk'
    ) {
      trackEvent('small_talk_shown', sessionId, {
        mode: 'voice',
        turn_id: currentQuestion.id,
        question_number: turns.filter((t) => !t.answer_text).length,
      });
    }
  }, [turns, sessionId]);

  // T111: Auto-save session progress every 10 seconds
  useEffect(() => {
    if (!isLoading && turns.length > 0) {
      const autoSaveInterval = setInterval(async () => {
        try {
          await autoSaveSession(sessionId);
          console.log('[T111] Auto-saved session progress');
        } catch (error) {
          console.error('[T111] Auto-save failed:', error);
        }
      }, 10000); // 10 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [sessionId, isLoading, turns.length]);

  // T114: Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  // T115: Auto-play TTS for intro, then play first turn after a pause
  useEffect(() => {
    if (introText && turns.length > 0 && !introPlayed && !isLoading) {
      const firstTurn = turns.find((t) => !t.answer_text);
      if (firstTurn) {
        const turnType = (firstTurn as any).turn_type || 'question';

        // Set initial phase based on first turn type
        if (turnType === 'small_talk') {
          setCurrentPhase('smalltalk');
        } else if (turnType === 'confirmation') {
          setCurrentPhase('confirmation');
        } else {
          setCurrentPhase('interview');
        }

        // Play intro with pause before first turn
        playTextToSpeech(introText, 'intro', async () => {
          setIntroPlayed(true);

          // T115: Add pause after welcome message
          await pauseBetweenSections(2000); // 2 second pause after intro

          // Play the first turn
          const questionText = firstTurn.question.text;
          const bridgeText = firstTurn.bridge_text;

          // T115: Play bridge separately if it exists
          if (bridgeText) {
            await playTextToSpeech(bridgeText, 'bridge', async () => {
              await pauseBetweenSections(800); // Brief pause after bridge
              playQuestionTTS(firstTurn.id, questionText);
            });
          } else {
            playQuestionTTS(firstTurn.id, questionText);
          }
        });
      }
    }
  }, [introText, turns, introPlayed, isLoading]);

  // T115: Auto-play TTS for new questions with proper sequencing
  // Skip first question if intro exists (it's chained after intro)
  useEffect(() => {
    const currentQuestion = turns.find(
      (t) => t.id === currentTurnId && !t.answer_text
    );

    // Skip if this is the first question and we have an intro (it will be chained)
    const isFirstQuestion =
      turns.length > 0 && currentQuestion?.id === turns[0].id;
    if (isFirstQuestion && introText && !introPlayed) {
      return;
    }

    if (currentQuestion && !isLoading) {
      const turnType = (currentQuestion as any).turn_type || 'question';

      // T115: Update phase based on turn type
      if (turnType === 'small_talk') {
        setCurrentPhase('smalltalk');
      } else if (turnType === 'confirmation') {
        setCurrentPhase('confirmation');
      } else {
        setCurrentPhase('interview');
      }

      const questionText = currentQuestion.question.text;
      const bridgeText = currentQuestion.bridge_text;

      // T115: Play bridge separately with pauses for better flow
      if (bridgeText) {
        playTextToSpeech(bridgeText, 'bridge', async () => {
          await pauseBetweenSections(800); // Brief pause after bridge
          playQuestionTTS(currentQuestion.id, questionText);
        });
      } else {
        playQuestionTTS(currentQuestion.id, questionText);
      }
    }
  }, [currentTurnId, turns, isLoading, introText, introPlayed]);

  // T114: Updated to use OpenAI TTS consistently for intro/bridge
  const playTextToSpeech = async (
    text: string,
    type: 'intro' | 'bridge',
    onComplete?: () => void
  ) => {
    try {
      // T114: Cancel any existing audio before starting new playback
      stopAllAudio();

      setOrbState('speaking');

      // T114: Use OpenAI TTS API for consistent voice
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          type: type,
          // No turnId for intro/bridge audio
        }),
      });

      const data = await response.json();

      if (!data.success || !data.audioUrl) {
        throw new Error('Failed to generate audio');
      }

      // Create and play audio
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setOrbState('idle');
        setIsPlayingAudio(false);
        if (onComplete) onComplete();
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
      toast.error('Unable to play audio');
    }
  };

  const playQuestionTTS = async (turnId: string, questionText: string) => {
    try {
      // T114: Cancel any existing audio before starting new playback
      stopAllAudio();

      setOrbState('speaking');

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questionText,
          turnId: turnId,
          type: 'question',
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

        // T110: Track successful orb autoplay completion
        trackEvent('orb_autoplay_ok', sessionId, {
          mode: 'voice',
          turn_id: turnId,
          question_number: turns.filter((t) => !t.answer_text).length + 1,
        });
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

    // T114: Stop any other audio first (e.g., browser TTS)
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // T108: Increment replay count for voice mode
    setReplayCount((prev) => {
      const newCount = prev + 1;
      console.log(
        `[T108 Voice Replay] Incrementing replay count: ${prev} -> ${newCount}`
      );
      return newCount;
    });

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

        // T110: Track proceed confirmation in voice mode
        const currentTurn = turns.find((t) => t.id === currentTurnId);
        if (currentTurn && (currentTurn as any).turn_type === 'confirmation') {
          trackEvent('proceed_confirmed', sessionId, {
            mode: 'voice',
            turn_id: currentTurnId,
            question_number: turns.filter((t) => !t.answer_text).length,
          });
        }

        // T113: Track submission time for latency monitoring
        const submitStartTime = Date.now();
        setOrbState('processing'); // T113: Show processing immediately

        // Submit the answer (T108: include replay count in voice mode)
        const result = await submitInterviewAnswer({
          sessionId,
          turnId: currentTurnId,
          answerText: finalAnswer,
          audioKey,
          replayCount, // T108: Pass voice mode replay count for scoring
        });

        // T113: Calculate actual latency
        const actualLatency = Date.now() - submitStartTime;
        console.log(
          `[T113 VoiceUI] Question generation latency: ${actualLatency}ms`
        );

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
            setCurrentPhase('complete'); // T115: Mark as complete
            toast.success('Interview complete', {
              description: 'Well done.',
            });
            setShowUpgradeDialog(true);
            return;
          }

          // T113: Ensure minimum processing time for smooth UX (500ms)
          const minProcessingTime = 500;
          const remainingTime = Math.max(0, minProcessingTime - actualLatency);

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

            // T115: Add pause between sections based on phase transitions
            const currentTurn = turns.find((t) => t.id === currentTurnId);
            const currentTurnType =
              (currentTurn as any)?.turn_type || 'question';
            const nextTurnType = (newTurn as any).turn_type || 'question';

            // Add longer pause when transitioning from small talk → confirmation or confirmation → interview
            let pauseDuration = 1000; // Default pause
            if (
              currentTurnType === 'small_talk' &&
              nextTurnType === 'small_talk'
            ) {
              pauseDuration = 1200; // Between small talk questions
            } else if (
              currentTurnType === 'small_talk' &&
              nextTurnType === 'confirmation'
            ) {
              pauseDuration = 1500; // Before confirmation
            } else if (
              currentTurnType === 'confirmation' &&
              nextTurnType === 'question'
            ) {
              pauseDuration = 2000; // Before main interview
            }

            setTurns((prev) => [...prev, newTurn]);
            setCurrentTurnId(nextData.turnId);
            // T108: Reset replay count for voice mode when setting new turn
            setReplayCount(0);

            if (nextData.currentStage) setCurrentStage(nextData.currentStage);
            if (nextData.stagesPlanned)
              setStagesPlanned(nextData.stagesPlanned);
            if (nextData.stageName) setStageName(nextData.stageName);

            // T115: Add the calculated pause before transitioning
            await pauseBetweenSections(pauseDuration);
          }

          // T113: Ensure smooth transition with dynamic timing
          if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime));
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
            <div className="mt-8 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplay}
                disabled={!currentAudioUrl || isPlayingAudio}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Replay Question
              </Button>
              {/* T108: Show replay count for voice mode (no limit, just tracking) */}
              {replayCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {replayCount} {replayCount === 1 ? 'replay' : 'replays'}
                </span>
              )}
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
