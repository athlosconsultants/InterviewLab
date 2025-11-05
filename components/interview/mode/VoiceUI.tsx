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
import { TimerRing } from '../TimerRing'; // T126: Countdown timer for voice mode
import { trackEvent } from '@/lib/analytics'; // T110: Analytics tracking
import { audioController } from '@/lib/audioController'; // T127: Global audio controller

interface VoiceUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

type OrbState = 'idle' | 'speaking' | 'listening' | 'thinking';

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

  // T127: Audio playback managed by AudioController
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false); // T124: Welcome screen state

  // T108: Replay count tracking for voice mode scoring
  const [replayCount, setReplayCount] = useState(0);

  // T126: Timer state for voice mode (mirrors text mode)
  const [timerStartTime, setTimerStartTime] = useState<string | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Autoplay blocker handling for browser restrictions
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<{
    type: 'intro' | 'bridge' | 'question';
    text: string;
    turnId?: string;
    afterBridge?: boolean;
  } | null>(null);

  // T127: Use AudioController to stop all audio
  const stopAllAudio = useCallback(() => {
    audioController.stop();
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
        const intro = result.data.intro || null;
        setIntroText(intro);
        // T124: Show welcome screen if intro exists and no answers yet
        if (intro && turnsWithTiming.every((t: Turn) => !t.answer_text)) {
          setShowWelcomeScreen(true);
        }
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
  const introPlayingRef = useRef(false); // T114: Prevent concurrent intro playback

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

  // T124: Auto-play TTS for intro in voice mode, then hide welcome screen and play first turn
  useEffect(() => {
    // T124: Auto-play intro in voice mode when welcome screen is shown
    if (
      showWelcomeScreen &&
      introText &&
      turns.length > 0 &&
      !introPlayed &&
      !introPlayingRef.current &&
      !isLoading
    ) {
      const firstTurn = turns.find((t) => !t.answer_text);
      if (firstTurn) {
        // T114 FIX: Set ref immediately (synchronously) to block concurrent runs
        introPlayingRef.current = true;

        const turnType = (firstTurn as any).turn_type || 'question';

        // Set initial phase based on first turn type
        if (turnType === 'small_talk') {
          setCurrentPhase('smalltalk');
        } else if (turnType === 'confirmation') {
          setCurrentPhase('confirmation');
        } else {
          setCurrentPhase('interview');
        }

        // T124: Play intro with auto-transition to first question
        playTextToSpeech(introText, 'intro', async () => {
          setIntroPlayed(true);

          // T124: Hide welcome screen after intro playback
          setShowWelcomeScreen(false);

          // T115: Add pause after welcome message
          await pauseBetweenSections(2000); // 2 second pause after intro

          // Play the first turn
          const questionText = firstTurn.question.text;
          const bridgeText = firstTurn.bridge_text;

          // T115: Play bridge separately if it exists
          if (bridgeText) {
            playTextToSpeech(bridgeText, 'bridge', async () => {
              await pauseBetweenSections(800); // Brief pause after bridge
              playQuestionTTS(firstTurn.id, questionText);
            });
          } else {
            playQuestionTTS(firstTurn.id, questionText);
          }
        });
      }
    }
  }, [showWelcomeScreen, introText, turns, introPlayed, isLoading]);

  // T115: Auto-play TTS for new questions with proper sequencing
  // Skip first question if intro exists (it's chained after intro)
  useEffect(() => {
    const currentQuestion = turns.find(
      (t) => t.id === currentTurnId && !t.answer_text
    );

    // T114 FIX: Always skip first question if intro exists - intro effect handles it
    const isFirstQuestion =
      turns.length > 0 && currentQuestion?.id === turns[0].id;
    if (isFirstQuestion && introText) {
      return; // Skip regardless of introPlayed state to prevent double playback
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

  // T127: Updated to use AudioController for robust audio management
  const playTextToSpeech = async (
    text: string,
    type: 'intro' | 'bridge',
    onComplete?: () => void
  ) => {
    try {
      console.log(`[OrbState] Generating TTS for ${type}...`);
      setOrbState('thinking'); // Show thinking while generating audio

      // Use OpenAI TTS API for consistent voice
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

      // T127: Use AudioController for playback with debouncing
      await audioController.play(data.audioUrl, {
        onPlay: () => {
          console.log(
            `[OrbState] thinking → speaking (${type} playback started)`
          );
          setOrbState('speaking');
          setIsPlayingAudio(true);
          setNeedsUserInteraction(false); // Audio started successfully
        },
        onEnd: () => {
          console.log(`[OrbState] speaking → idle (${type} playback ended)`);
          setOrbState('idle');
          setIsPlayingAudio(false);
          if (onComplete) onComplete();
        },
        onError: (error) => {
          console.error(`[OrbState] Audio error for ${type}:`, error);
          // Check if it's an autoplay error
          if (
            error &&
            (error.name === 'NotAllowedError' ||
              error.message?.includes('play'))
          ) {
            console.warn('[OrbState] Autoplay blocked by browser');
            setNeedsUserInteraction(true);
          }
          setOrbState('idle');
          setIsPlayingAudio(false);
        },
      });
    } catch (playError: any) {
      // Handle autoplay blocking and other errors
      console.error('TTS error:', playError);
      if (
        playError?.name === 'NotAllowedError' ||
        playError?.message?.includes('play') ||
        playError?.message?.includes('autoplay')
      ) {
        console.warn(
          '[OrbState] Autoplay blocked - requiring user interaction for',
          type
        );
        // Store what we were trying to play (intro or bridge)
        setPendingAudio({ type, text, afterBridge: false });
        setNeedsUserInteraction(true);
        setOrbState('idle');
      } else {
        console.error('TTS generation/playback error:', playError);
        setOrbState('idle');
        // Store what we were trying to play for retry
        setPendingAudio({ type, text, afterBridge: false });
        setNeedsUserInteraction(true); // Fallback to manual start on any error
      }
    }
  };

  const playQuestionTTS = async (turnId: string, questionText: string) => {
    try {
      console.log(`[OrbState] Generating TTS for question...`);
      setOrbState('thinking'); // Show thinking while generating audio

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

      // T127: Use AudioController for playback with debouncing
      await audioController.play(data.audioUrl, {
        onPlay: () => {
          console.log(
            `[OrbState] thinking → speaking (question playback started)`
          );
          setOrbState('speaking');
          setIsPlayingAudio(true);
          setNeedsUserInteraction(false); // Audio started successfully
        },
        onEnd: () => {
          console.log(
            `[OrbState] speaking → idle (question playback ended, awaiting user input)`
          );
          setOrbState('idle');
          setIsPlayingAudio(false);

          // T126: Start timer after TTS playback ends (only for main interview questions)
          const currentTurn = turns.find((t) => t.id === turnId);
          const turnType = (currentTurn as any)?.turn_type || 'question';
          if (turnType === 'question') {
            console.log('[T126] Starting countdown timer after TTS playback');
            setTimerStartTime(new Date().toISOString());
            setIsTimerActive(true);
          }

          // T110: Track successful orb autoplay completion
          trackEvent('orb_autoplay_ok', sessionId, {
            mode: 'voice',
            turn_id: turnId,
            question_number: turns.filter((t) => !t.answer_text).length + 1,
          });
        },
        onError: (error) => {
          console.error(`[OrbState] Audio error for question:`, error);
          // Check if it's an autoplay error
          if (
            error &&
            (error.name === 'NotAllowedError' ||
              error.message?.includes('play'))
          ) {
            console.warn('[OrbState] Autoplay blocked by browser');
            setNeedsUserInteraction(true);
          }
          setOrbState('idle');
          setIsPlayingAudio(false);
        },
      });
    } catch (playError: any) {
      // Handle autoplay blocking and other errors
      console.error('TTS error:', playError);
      if (
        playError?.name === 'NotAllowedError' ||
        playError?.message?.includes('play') ||
        playError?.message?.includes('autoplay')
      ) {
        console.warn(
          '[OrbState] Autoplay blocked - requiring user interaction for question'
        );
        // Store the question we were trying to play
        setPendingAudio({
          type: 'question',
          text: questionText,
          turnId,
          afterBridge: false,
        });
        setNeedsUserInteraction(true);
        setOrbState('idle');
      } else {
        console.error('TTS generation/playback error:', playError);
        setOrbState('idle');
        // Store the question for retry
        setPendingAudio({
          type: 'question',
          text: questionText,
          turnId,
          afterBridge: false,
        });
        setNeedsUserInteraction(true); // Fallback to manual start on any error
      }
    }
  };

  // Handle user interaction to resume audio after autoplay block
  const handleResumeWithInteraction = useCallback(() => {
    console.log('[OrbState] User clicked to resume - enabling audio playback');
    console.log('[OrbState] Pending audio:', pendingAudio);
    setHasUserInteracted(true);
    setNeedsUserInteraction(false);

    // Resume from where we left off using pendingAudio
    if (pendingAudio) {
      const { type, text, turnId: pendingTurnId, afterBridge } = pendingAudio;

      if (type === 'intro') {
        // Resume intro playback, then continue to first question
        const firstTurn = turns.find((t) => !t.answer_text);
        if (firstTurn) {
          playTextToSpeech(text, 'intro', async () => {
            setIntroPlayed(true);
            setShowWelcomeScreen(false);
            await pauseBetweenSections(2000);
            const questionText = firstTurn.question.text;
            const bridgeText = firstTurn.bridge_text;
            if (bridgeText) {
              await playTextToSpeech(bridgeText, 'bridge', async () => {
                await pauseBetweenSections(800);
                playQuestionTTS(firstTurn.id, questionText);
              });
            } else {
              playQuestionTTS(firstTurn.id, questionText);
            }
          });
        }
      } else if (type === 'bridge') {
        // Bridge was blocked - play it, then play the question
        const currentQuestion = turns.find((t) => t.id === currentTurnId);
        if (currentQuestion) {
          playTextToSpeech(text, 'bridge', async () => {
            await pauseBetweenSections(800);
            playQuestionTTS(currentQuestion.id, currentQuestion.question.text);
          });
        }
      } else if (type === 'question' && pendingTurnId) {
        // Question was blocked - just play the question directly
        playQuestionTTS(pendingTurnId, text);
      }

      // Clear pending audio
      setPendingAudio(null);
    } else {
      // Fallback: try to play current question
      const currentQuestion = turns.find((t) => t.id === currentTurnId);
      if (currentQuestion && !currentQuestion.answer_text) {
        playQuestionTTS(currentQuestion.id, currentQuestion.question.text);
      }
    }
  }, [turns, currentTurnId, introText, introPlayed, pendingAudio]);

  const handleReplay = useCallback(async () => {
    if (!audioController.getCurrentUrl()) {
      toast.error('No audio to replay');
      return;
    }

    // T108: Increment replay count for voice mode
    setReplayCount((prev) => {
      const newCount = prev + 1;
      console.log(
        `[T108 Voice Replay] Incrementing replay count: ${prev} -> ${newCount}`
      );
      return newCount;
    });

    console.log(`[OrbState] idle → speaking (replaying question)`);
    setOrbState('speaking');

    // T127: Use AudioController for replay
    try {
      await audioController.replay();
    } catch (error) {
      console.error(`[OrbState] Replay failed:`, error);
      setOrbState('idle');
      toast.error('Replay failed');
    }
  }, []);

  // T126: Timer expiration ref to avoid circular dependency
  const timerExpireRef = useRef<(() => void) | null>(null);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent, autoAdvance = false) => {
      e?.preventDefault();

      // T166: Stop any playing TTS when user submits answer early
      if (!autoAdvance && audioController) {
        audioController.stop();
        console.log('[T166] Stopped TTS playback - user answered early');
      }

      // T126: Stop timer on manual submit
      if (!autoAdvance) {
        setIsTimerActive(false);
        setTimerStartTime(null);
      }

      // T126: Allow empty answers if auto-advance from timer
      if (!autoAdvance) {
        if (answerMode === 'text' && !answer.trim()) {
          toast.error('Answer required');
          return;
        }

        if (answerMode === 'audio' && !audioBlob) {
          toast.error('Recording required');
          return;
        }
      }

      if (!currentTurnId) {
        toast.error('No active question');
        return;
      }

      setIsSubmitting(true);
      console.log(`[OrbState] idle → thinking (user submitted answer)`);
      setOrbState('thinking');

      try {
        let finalAnswer = autoAdvance ? '' : answer.trim();
        let audioKey: string | undefined = undefined;

        // Handle audio mode (skip if auto-advance)
        if (answerMode === 'audio' && audioBlob && !autoAdvance) {
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
            console.error(`[OrbState] Upload failed, returning to idle`);
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
            console.error(`[OrbState] Transcription failed, returning to idle`);
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
        setOrbState('thinking'); // T113: Show thinking immediately

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
          console.error(`[OrbState] Submit failed, returning to idle`);
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
            console.log(`[OrbState] thinking → idle (interview complete)`);
            setOrbState('idle');
            setCurrentPhase('complete'); // T115: Mark as complete
            toast.success('Interview complete', {
              description: 'Well done.',
            });
            // Show upgrade dialog ONLY for free plan users
            const planTier = (result.data as any).planTier || 'free';
            if (planTier === 'free') {
              setShowUpgradeDialog(true);
            } else {
              // Pro users: redirect directly to report
              toast.info('View your detailed report', {
                description: 'Click below to see your results',
              });
              setTimeout(() => {
                router.push(`/report/${sessionId}`);
              }, 1500);
            }
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
            // T126: Reset timer for new question
            setIsTimerActive(false);

            if (nextData.currentStage) {
              console.log(
                `[Interview] Stage advanced to: ${nextData.currentStage} of ${nextData.stagesPlanned} (${nextData.stageName})`
              );
              setCurrentStage(nextData.currentStage);
            }
            if (nextData.stagesPlanned)
              setStagesPlanned(nextData.stagesPlanned);
            if (nextData.stageName) setStageName(nextData.stageName);

            // T115: Add the calculated pause before transitioning
            await pauseBetweenSections(pauseDuration);
          } else if (!nextData.nextQuestion && !nextData.done) {
            // T106 FIX: No nextQuestion returned (e.g., after small_talk)
            // Find the next unanswered turn in existing turns
            const nextUnansweredTurn = turns.find(
              (t) => t.id !== currentTurnId && !t.answer_text
            );

            if (nextUnansweredTurn) {
              // T115: Calculate pause based on transition
              const currentTurn = turns.find((t) => t.id === currentTurnId);
              const currentTurnType =
                (currentTurn as any)?.turn_type || 'question';
              const nextTurnType =
                (nextUnansweredTurn as any)?.turn_type || 'question';

              let pauseDuration = 1000;
              if (
                currentTurnType === 'small_talk' &&
                nextTurnType === 'small_talk'
              ) {
                pauseDuration = 1200;
              } else if (
                currentTurnType === 'small_talk' &&
                nextTurnType === 'confirmation'
              ) {
                pauseDuration = 1500;
              } else if (
                currentTurnType === 'confirmation' &&
                nextTurnType === 'question'
              ) {
                pauseDuration = 2000;
              }

              // Update to next unanswered turn
              setCurrentTurnId(nextUnansweredTurn.id);
              setReplayCount(0);
              // T126: Reset timer
              setIsTimerActive(false);

              // T115: Add pause before playing next turn
              await pauseBetweenSections(pauseDuration);
            }
          }

          // T113: Ensure smooth transition with dynamic timing
          if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime));
          }

          setAnswer('');
          setAudioBlob(null);
          // Don't set orb state here - let audio playback handle state transitions
          // The orb will remain in 'thinking' until audio starts playing
        }
      } catch (error) {
        console.error('Submit error:', error);
        toast.error('Something went wrong', {
          description: 'Please try again',
        });
        console.error(`[OrbState] Submit error, returning to idle`);
        setOrbState('idle');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      answerMode,
      answer,
      audioBlob,
      currentTurnId,
      sessionId,
      currentStage,
      isSubmitting,
      replayCount,
      turns,
    ]
  );

  // T126: Setup timer expiration callback
  useEffect(() => {
    timerExpireRef.current = () => {
      console.log('[T126] Timer expired - auto-advancing with blank answer');
      setIsTimerActive(false);
      setTimerStartTime(null);

      // Auto-submit with empty answer
      if (!isSubmitting) {
        handleSubmit(undefined, true);
      }
    };
  }, [isSubmitting, handleSubmit]);

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
        {/* T124: Welcome Screen for Voice Mode */}
        {showWelcomeScreen && introText && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 px-4">
            <div className="max-w-2xl w-full">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-6 md:p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                    Welcome
                  </span>
                </div>
                <p className="text-base md:text-lg leading-relaxed text-foreground whitespace-pre-wrap mb-6">
                  {introText}
                </p>

                {/* Show different UI based on whether audio is loading/playing or blocked */}
                {needsUserInteraction ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <Mic className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        Tap below to start the audio interview
                      </p>
                    </div>
                    <Button
                      onClick={handleResumeWithInteraction}
                      size="lg"
                      className="w-full h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      <Mic className="mr-2 h-5 w-5" />
                      Begin Interview
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full animate-pulse flex items-center justify-center">
                      <Mic className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Audio playing automatically...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interview Content - hidden during welcome screen */}
        {!showWelcomeScreen && (
          <>
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
                {/* T123: Removed question counter for greater immersion */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Voice Mode</p>
                </div>
              </div>
            </div>

            {/* Voice Orb */}
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center gap-6">
                <VoiceOrb state={orbState} size="lg" />

                {/* T126: Countdown Timer (only during main interview questions) */}
                {isTimerActive && timerStartTime && currentQuestion && (
                  <TimerRing
                    timeLimit={90} // 90 seconds like text mode
                    startTime={timerStartTime}
                    onExpire={() => timerExpireRef.current?.()}
                  />
                )}
              </div>

              {/* Resume button for autoplay block */}
              {needsUserInteraction && (
                <div className="mt-8 text-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Browser blocked automatic audio playback
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click below to continue your interview
                    </p>
                  </div>
                  <Button onClick={handleResumeWithInteraction} size="lg">
                    Click to Continue Interview
                  </Button>
                </div>
              )}

              {currentQuestion && !needsUserInteraction && (
                <div className="mt-8 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplay}
                    disabled={
                      !currentAudioUrl ||
                      isPlayingAudio ||
                      orbState === 'speaking' ||
                      orbState === 'thinking'
                    }
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
            {currentQuestion && !isSubmitting && !needsUserInteraction && (
              <div className="border rounded-lg p-6 space-y-4 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Answer</h3>
                  {/* T164: Only show Text toggle in voice mode - Record button handles voice input */}
                  {answerMode === 'text' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAnswerMode('audio')}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Switch to Voice
                    </Button>
                  )}
                  {answerMode === 'audio' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAnswerMode('text')}
                    >
                      <Type className="mr-2 h-4 w-4" />
                      Type Instead
                    </Button>
                  )}
                </div>

                {answerMode === 'audio' ? (
                  <AudioRecorder
                    onRecordingComplete={(blob) => {
                      setAudioBlob(blob);
                      setOrbState('idle');
                    }}
                    delayMs={1500}
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
          </>
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
