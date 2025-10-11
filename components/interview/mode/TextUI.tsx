'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Send,
  Mic,
  Type,
  AccessibilityIcon,
  ArrowRight,
} from 'lucide-react';
import {
  initializeInterview,
  submitInterviewAnswer,
  getResumeData,
  autoSaveSession,
} from '@/app/interview/[id]/actions'; // T111: Including server actions for resume
import type { Question, Turn, Timing } from '@/lib/schema';
import { toast } from 'sonner';
import { QuestionBubble } from '../QuestionBubble';
import { TimerRing } from '../TimerRing';
import { ReplayButton } from '../ReplayButton';
import { AudioRecorder } from '../AudioRecorder';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UpgradeDialog } from '../UpgradeDialog';
import { useQuestionReveal } from '@/hooks/useQuestionReveal';
import { trackEvent } from '@/lib/analytics'; // T110: Analytics tracking

interface InterviewUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

export function TextUI({ sessionId, jobTitle, company }: InterviewUIProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [replayCap, setReplayCap] = useState(2);
  const [timerSec, setTimerSec] = useState(90);
  const [answerMode, setAnswerMode] = useState<'text' | 'audio'>('text');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [introText, setIntroText] = useState<string | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false); // T124: Welcome screen state

  // Prevent duplicate submissions
  const submissionInProgress = useRef(false);
  // T91: Stage tracking
  const [currentStage, setCurrentStage] = useState(1);
  const [stagesPlanned, setStagesPlanned] = useState(1);
  const [stageName, setStageName] = useState<string | null>(null);

  // T94: Analyzing Answer transition state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // T111: Resume functionality state
  const [resumeChecked, setResumeChecked] = useState(false);
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);
  const [canResume, setCanResume] = useState(false);

  // T100: Question Reveal System - only for actual interview questions
  const currentQuestion = turns.find((t) => !t.answer_text);
  const isCurrentQuestionSpecial =
    currentQuestion &&
    ((currentQuestion as any).turn_type === 'small_talk' ||
      (currentQuestion as any).turn_type === 'confirmation');

  const {
    countdown,
    questionVisible,
    revealCount,
    maxReveals,
    canReplay,
    handleReplay: handleRevealReplay,
    remainingTime,
  } = useQuestionReveal({
    currentTurnId: isCurrentQuestionSpecial ? null : currentTurnId, // Disable for small talk/confirmation
    accessibilityMode,
    // T110: Track when reveal window expires
    onRevealExpired: () => {
      if (currentTurnId) {
        trackEvent('reveal_elapsed', sessionId, {
          mode: 'text',
          turn_id: currentTurnId,
          reveal_count: revealCount + 1,
          question_number: questionNumber,
        });
      }
    },
  });

  // Initialize interview on mount
  useEffect(() => {
    const init = async () => {
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

      try {
        const result = await initializeInterview(sessionId);

        if (result.error) {
          toast.error('Unable to load interview', {
            description: result.error,
          });
          return;
        }

        if (result.data) {
          // T102: Ensure all turns have timing.started_at for countdown timer
          const turnsWithTiming = (result.data.turns || []).map(
            (turn: Turn) => {
              const timing = turn.timing as Timing | null;
              if (!timing?.started_at && !turn.answer_text) {
                // If it's an unanswered question without timing, set it now
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
            }
          );
          setTurns(turnsWithTiming);
          setCurrentTurnId(result.data.currentTurn?.id || null);

          // Extract intro text if available (T88/T124)
          if (result.data.intro) {
            setIntroText(result.data.intro);
            // T124: Show welcome screen if intro exists and no answers yet
            if (turnsWithTiming.every((t: Turn) => !t.answer_text)) {
              setShowWelcomeScreen(true);
            }
          }

          // T91: Extract stage information
          if (result.data.currentStage) {
            setCurrentStage(result.data.currentStage);
          }
          if (result.data.stagesPlanned) {
            setStagesPlanned(result.data.stagesPlanned);
          }
          if (result.data.stageName) {
            setStageName(result.data.stageName);
          }

          // Find the current unanswered question
          const unansweredIndex = result.data.turns?.findIndex(
            (t: Turn) => !t.answer_text
          );
          if (unansweredIndex !== undefined && unansweredIndex >= 0) {
            setQuestionNumber(unansweredIndex + 1);
          }

          const limits = result.data.session?.limits as any;
          setTotalQuestions(limits?.question_cap || 3);
          setReplayCap(limits?.replay_cap || 2);
          setTimerSec(limits?.timer_sec || 90);
        }
      } catch (error) {
        console.error('Init error:', error);
        toast.error('Something went wrong', {
          description: 'Please refresh the page',
        });
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [sessionId]);

  // T102: Wrap handleSubmit in useCallback to stabilize timer onExpire callback
  // T121: Add flag to allow empty answer submission when timer expires
  const handleSubmit = useCallback(
    async (e?: React.FormEvent, allowEmpty: boolean = false) => {
      e?.preventDefault();

      // Prevent duplicate submissions
      if (submissionInProgress.current) {
        console.log('[TextUI] Submission already in progress, ignoring');
        return;
      }

      // Validate we have an answer (text or audio) - unless allowEmpty is true
      if (answerMode === 'text' && !answer.trim() && !allowEmpty) {
        toast.error('Answer required');
        return;
      }

      if (answerMode === 'audio' && !audioBlob && !allowEmpty) {
        toast.error('Recording required');
        return;
      }

      if (!currentTurnId) {
        toast.error('No active question');
        return;
      }

      submissionInProgress.current = true;
      setIsSubmitting(true);

      try {
        let finalAnswer = answer.trim();
        let audioKey: string | undefined = undefined;

        // Handle audio mode
        if (answerMode === 'audio' && audioBlob) {
          // Upload audio
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
            submissionInProgress.current = false;
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
            submissionInProgress.current = false;
            setIsSubmitting(false);
            return;
          }

          finalAnswer = transcribeData.text;
          toast.success('Transcribed');
        }

        // T113: Track submission time for latency monitoring
        const submitStartTime = Date.now();
        setIsAnalyzing(true); // T113: Show analyzing immediately for better UX

        // Submit the answer (including reveal count for scoring)
        const result = await submitInterviewAnswer({
          sessionId,
          turnId: currentTurnId,
          answerText: finalAnswer,
          audioKey,
          replayCount: revealCount, // T100: Track reveal count for composure scoring
        });

        // T113: Calculate actual latency
        const actualLatency = Date.now() - submitStartTime;
        console.log(
          `[T113 TextUI] Question generation latency: ${actualLatency}ms`
        );

        if (result.error) {
          setIsAnalyzing(false);
          submissionInProgress.current = false;
          toast.error('Unable to submit', {
            description: result.error,
          });
          return;
        }

        if (result.data) {
          // Update turns with the answer
          setTurns((prev) =>
            prev.map((t) =>
              t.id === currentTurnId ? { ...t, answer_text: finalAnswer } : t
            )
          );

          // Check if interview is complete
          if (result.data.done) {
            setIsAnalyzing(false);
            submissionInProgress.current = false;
            toast.success('Interview complete', {
              description: 'Well done.',
            });
            // Show upgrade dialog for free plan users (3 questions)
            setShowUpgradeDialog(true);
            return;
          }

          // T113: Ensure minimum analyzing time for smooth UX (500ms)
          // If latency was fast, still show analyzing briefly
          const minAnalyzingTime = 500;
          const remainingTime = Math.max(0, minAnalyzingTime - actualLatency);
          // T106: Don't show toast for small talk/confirmation transitions
          const currentQuestionType = turns.find((t) => t.id === currentTurnId);
          const isSpecialTurn =
            currentQuestionType &&
            ((currentQuestionType as any).turn_type === 'small_talk' ||
              (currentQuestionType as any).turn_type === 'confirmation');

          // T110: Track proceed confirmation
          if (
            currentQuestionType &&
            (currentQuestionType as any).turn_type === 'confirmation'
          ) {
            trackEvent('proceed_confirmed', sessionId, {
              mode: 'text',
              turn_id: currentTurnId,
              question_number: questionNumber,
            });
          }

          if (!isSpecialTurn) {
            toast.info('Analyzing...');
          }

          // If there's a next question, add it (T91)
          const nextData = result.data as {
            done: boolean;
            nextQuestion: Question | null;
            turnId: string;
            bridgeText?: string | null;
            currentStage?: number;
            stagesPlanned?: number;
            stageName?: string;
          };

          // T106: Handle small talk/confirmation transitions (no new question to add)
          if (!nextData.nextQuestion) {
            // Find the next unanswered turn BEFORE hiding analyzing state
            const nextUnanswered = turns.find(
              (t) => t.id !== currentTurnId && !t.answer_text
            );

            // T113: Ensure smooth transition with dynamic timing (max 1.5s total)
            if (remainingTime > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, remainingTime)
              );
            }

            // Update to the next turn (if found)
            if (nextUnanswered) {
              setCurrentTurnId(nextUnanswered.id);
            }

            // T94: Hide analyzing state AFTER updating turn
            setIsAnalyzing(false);

            // Clear answer and reset state
            setAnswer('');
            setAudioBlob(null);
            submissionInProgress.current = false;
            return;
          }

          if (nextData.nextQuestion && nextData.turnId) {
            // T102: Prepare new turn BEFORE hiding analyzing state
            const newTurn = {
              id: nextData.turnId,
              session_id: sessionId,
              user_id: '', // Will be populated by server
              question: nextData.nextQuestion,
              tts_key: null,
              answer_text: null,
              answer_audio_key: null,
              answer_digest: null,
              bridge_text: nextData.bridgeText || null,
              timing: {
                started_at: new Date().toISOString(), // Start timer immediately
                completed_at: '',
                duration_ms: 0,
                replay_count: 0,
              } as Timing,
              created_at: new Date().toISOString(),
            } as Turn;

            // Add new turn to state
            setTurns((prev) => [...prev, newTurn]);
            setCurrentTurnId(nextData.turnId);
            setQuestionNumber((prev) => prev + 1);

            // T91: Update stage information
            if (nextData.currentStage) setCurrentStage(nextData.currentStage);
            if (nextData.stagesPlanned)
              setStagesPlanned(nextData.stagesPlanned);
            if (nextData.stageName) setStageName(nextData.stageName);

            // T113: Ensure smooth transition with dynamic timing (max 1.5s total)
            if (remainingTime > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, remainingTime)
              );
            }

            // T94: Hide analyzing state AFTER updating turn
            setIsAnalyzing(false);

            // T91: Show toast after analyzing is complete
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
            } else if (!isSpecialTurn) {
              toast.success('Next question');
            }
          }

          // Clear answer and reset state
          setAnswer('');
          setAudioBlob(null);
          // Note: Reveal count is automatically reset by useQuestionReveal hook
        }
      } catch (error) {
        console.error('Submit error:', error);
        toast.error('Something went wrong', {
          description: 'Please try again',
        });
      } finally {
        submissionInProgress.current = false;
        setIsSubmitting(false);
      }
    },
    [
      answerMode,
      answer,
      audioBlob,
      currentTurnId,
      sessionId,
      revealCount,
      currentStage,
    ]
  );

  // T100: Replay handler - extends reveal window
  const handleReplay = () => {
    // T110: Track show again usage
    trackEvent('show_again_used', sessionId, {
      mode: 'text',
      turn_id: currentTurnId,
      replay_count: revealCount + 1,
      question_number: questionNumber,
    });
    handleRevealReplay();
  };

  // T110: Track when small talk or confirmation turns are shown
  useEffect(() => {
    if (currentQuestion) {
      const turnType = (currentQuestion as any).turn_type;
      if (turnType === 'small_talk') {
        trackEvent('small_talk_shown', sessionId, {
          mode: 'text',
          turn_id: currentQuestion.id,
          question_number: questionNumber,
        });
      }
    }
  }, [currentQuestion?.id, sessionId, questionNumber]);

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{jobTitle}</h1>
            <p className="text-muted-foreground">{company}</p>
            {/* T123: Removed question counter for greater immersion */}
            {/* T91: Display stage information for multi-stage interviews */}
            {stagesPlanned > 1 && stageName && (
              <p className="text-sm font-medium text-primary mt-2">
                Stage {currentStage} of {stagesPlanned}: {stageName}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <AccessibilityIcon className="h-4 w-4 text-muted-foreground" />
            <Switch
              id="accessibility-mode"
              checked={accessibilityMode}
              onCheckedChange={setAccessibilityMode}
            />
            <Label
              htmlFor="accessibility-mode"
              className="text-sm cursor-pointer"
            >
              No Timer/Reveals
            </Label>
          </div>
        </div>
      </div>

      {/* T124: Welcome Screen - shown separately before questions */}
      {showWelcomeScreen && introText && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="max-w-2xl w-full">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="mb-4">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                  Welcome
                </span>
              </div>
              <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap mb-6">
                {introText}
              </p>
              <Button
                size="lg"
                onClick={() => setShowWelcomeScreen(false)}
                className="w-full sm:w-auto"
              >
                Start Interview
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* T102: Current Question Only Display */}
      {!showWelcomeScreen && (
        <div className="space-y-6">

        {/* T102: Render only the FIRST unanswered turn (current question) - Hide during analyzing */}
        {currentQuestion &&
          !isAnalyzing &&
          (() => {
            // Calculate index in original turns array for progress tracking
            const index = turns.findIndex((t) => t.id === currentQuestion.id);

            // T106: Check if this is a small talk or confirmation turn
            const turnType = (currentQuestion as any).turn_type;
            const isSmallTalk = turnType === 'small_talk';
            const isConfirmation = turnType === 'confirmation';
            const isSpecialTurn = isSmallTalk || isConfirmation;

            return (
              <div key={currentQuestion.id} className="space-y-4">
                {/* T119: Bridge Text - synced with question visibility */}
                {currentQuestion.bridge_text &&
                  index > 0 &&
                  (isSpecialTurn || accessibilityMode || questionVisible) && (
                    <div className="flex justify-start">
                      <div className="max-w-[75%] rounded-lg bg-muted/50 p-4 border-l-2 border-primary/40">
                        <p className="text-sm italic text-muted-foreground leading-relaxed">
                          {currentQuestion.bridge_text}
                        </p>
                      </div>
                    </div>
                  )}

                {/* T106: Small Talk / Confirmation - Simple display, no timer */}
                {isSpecialTurn ? (
                  <div className="flex justify-start">
                    <div
                      className={`max-w-[85%] rounded-lg p-5 border-l-4 ${
                        isConfirmation
                          ? 'bg-green-50 dark:bg-green-950/30 border-green-500'
                          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-500'
                      }`}
                    >
                      <div className="mb-2">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isConfirmation
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isConfirmation ? 'Ready Check' : 'Warm-up'}
                        </span>
                      </div>
                      <p className="text-base leading-relaxed text-foreground">
                        {currentQuestion.question.text}
                      </p>
                    </div>
                  </div>
                ) : /* Regular Interview Question - T93: With Countdown & Reveal System */
                currentQuestion.id === currentTurnId && !accessibilityMode ? (
                  <div className="space-y-4">
                    {/* T93: Countdown Display */}
                    {countdown !== null && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 p-8 border-2 border-primary/30">
                          <div className="flex flex-col items-center justify-center">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Question {index + 1} starting in...
                            </p>
                            <div className="text-6xl font-bold text-primary animate-pulse">
                              {countdown}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* T93: Question (conditionally visible) */}
                    {countdown === null && questionVisible && (
                      <QuestionBubble
                        question={currentQuestion.question}
                        questionNumber={index + 1}
                        turnId={currentQuestion.id}
                      />
                    )}

                    {/* T93: Hidden question message */}
                    {countdown === null && !questionVisible && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-lg bg-muted/50 p-6 border-2 border-dashed border-muted-foreground/30">
                          <p className="text-sm font-medium text-muted-foreground">
                            Question hidden. Answer from memory or use the
                            Replay button below to review.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Accessibility mode - always visible */
                  <QuestionBubble
                    question={currentQuestion.question}
                    questionNumber={index + 1}
                    turnId={currentQuestion.id}
                  />
                )}
              </div>
            );
          })()}

      {/* T120: Analyzing Answer Transition - Apple-style minimalist animation */}
      {isAnalyzing && (
        <div className="flex justify-center py-12 animate-in fade-in duration-500">
          <div className="flex flex-col items-center space-y-3">
            {/* Animated dots */}
            <div className="flex items-center space-x-1.5">
              <div
                className="h-2 w-2 rounded-full bg-gray-400 animate-pulse-slow"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="h-2 w-2 rounded-full bg-gray-400 animate-pulse-slow"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="h-2 w-2 rounded-full bg-gray-400 animate-pulse-slow"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            {/* Subtle text */}
            <span className="text-sm font-light text-gray-500">Analyzing</span>
          </div>
        </div>
      )}

      {/* Answer Input */}
      {currentQuestion && !isAnalyzing && (
        <div className="sticky bottom-0 bg-background border-t pt-4">
          {/* T106: Timer and Replay Controls - Only for actual interview questions */}
          {(() => {
            const turnType = (currentQuestion as any).turn_type;
            const isSpecialTurn =
              turnType === 'small_talk' || turnType === 'confirmation';

            return (
              !isSpecialTurn && (
                <div className="mb-4 flex items-center justify-between">
                  <ReplayButton
                    replayCount={revealCount}
                    replayCap={maxReveals}
                    onReplay={handleReplay}
                    disabled={isSubmitting || !canReplay}
                  />
                  {!accessibilityMode &&
                    (currentQuestion.timing as Timing | null)?.started_at && (
                      <TimerRing
                        timeLimit={timerSec}
                        startTime={
                          (currentQuestion.timing as Timing).started_at
                        }
                        onExpire={() => {
                          // T121: Auto-submit with allowEmpty flag
                          toast.warning("Time's up – moving on");
                          // Auto-submit even if answer is empty
                          handleSubmit(undefined, true);
                        }}
                      />
                    )}
                </div>
              )
            );
          })()}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Answer Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                type="button"
                variant={answerMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setAnswerMode('text');
                  setAudioBlob(null);
                }}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Type className="h-4 w-4" />
                Text
              </Button>
              <Button
                type="button"
                variant={answerMode === 'audio' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setAnswerMode('audio');
                  setAnswer('');
                }}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                Voice
              </Button>
            </div>

            {/* Text Input */}
            {answerMode === 'text' && (
              <>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer"
                  rows={6}
                  disabled={isSubmitting}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {answer.trim().split(/\s+/).filter(Boolean).length} words
                  </p>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !answer.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Audio Recorder */}
            {answerMode === 'audio' && (
              <>
                <AudioRecorder
                  onRecordingComplete={(blob) => setAudioBlob(blob)}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || !audioBlob}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
        </div>
      )}

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onViewReport={() => router.push(`/report/${sessionId}`)}
      />
    </div>
  );
}
