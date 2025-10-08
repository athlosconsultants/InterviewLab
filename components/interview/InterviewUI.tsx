'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Mic, Type, AccessibilityIcon } from 'lucide-react';
import {
  initializeInterview,
  submitInterviewAnswer,
} from '@/app/interview/[id]/actions';
import type { Question, Turn } from '@/lib/schema';
import { toast } from 'sonner';
import { QuestionBubble } from './QuestionBubble';
import { TimerRing } from './TimerRing';
import { ReplayButton } from './ReplayButton';
import { AudioRecorder } from './AudioRecorder';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UpgradeDialog } from './UpgradeDialog';

interface InterviewUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

export function InterviewUI({
  sessionId,
  jobTitle,
  company,
}: InterviewUIProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [replayCount, setReplayCount] = useState(0);
  const [replayCap, setReplayCap] = useState(2);
  const [timerSec, setTimerSec] = useState(90);
  const [answerMode, setAnswerMode] = useState<'text' | 'audio'>('text');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [introText, setIntroText] = useState<string | null>(null);
  // T91: Stage tracking
  const [currentStage, setCurrentStage] = useState(1);
  const [stagesPlanned, setStagesPlanned] = useState(1);
  const [stageName, setStageName] = useState<string | null>(null);

  // T93: Question Reveal System
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, or null
  const [questionVisible, setQuestionVisible] = useState(false);

  // Initialize interview on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const result = await initializeInterview(sessionId);

        if (result.error) {
          toast.error('Failed to load interview', {
            description: result.error,
          });
          return;
        }

        if (result.data) {
          setTurns(result.data.turns || []);
          setCurrentTurnId(result.data.currentTurn?.id || null);

          // Extract intro text if available (T88)
          if (result.data.intro) {
            setIntroText(result.data.intro);
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
        toast.error('An error occurred', {
          description: 'Please refresh the page',
        });
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [sessionId]);

  // T93: Countdown and Reveal Logic for Current Question
  useEffect(() => {
    if (!currentTurnId || accessibilityMode) {
      // Skip reveal logic if no question or accessibility mode is on
      return;
    }

    // Start countdown: 3 -> 2 -> 1 -> reveal
    setCountdown(3);
    setQuestionVisible(false);
    setReplayCount(0); // Reset replay count for new question

    const countdownTimers: NodeJS.Timeout[] = [];

    // Countdown: 3 seconds
    countdownTimers.push(setTimeout(() => setCountdown(2), 1000));
    countdownTimers.push(setTimeout(() => setCountdown(1), 2000));
    countdownTimers.push(
      setTimeout(() => {
        setCountdown(null);
        setQuestionVisible(true);
      }, 3000)
    );

    // Auto-hide question after 15 seconds (3s countdown + 15s reveal = 18s total)
    countdownTimers.push(
      setTimeout(() => {
        setQuestionVisible(false);
        toast.info('Question hidden', {
          description: 'Use "Replay" to review the question (2 times max)',
        });
      }, 18000) // 3s countdown + 15s reveal
    );

    return () => {
      countdownTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [currentTurnId, accessibilityMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate we have an answer (text or audio)
    if (answerMode === 'text' && !answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (answerMode === 'audio' && !audioBlob) {
      toast.error('Please record your answer');
      return;
    }

    if (!currentTurnId) {
      toast.error('No active question');
      return;
    }

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
          toast.error('Failed to upload audio');
          setIsSubmitting(false);
          return;
        }

        audioKey = uploadData.storageKey;

        // Transcribe audio
        toast.info('Transcribing your answer...');
        const transcribeFormData = new FormData();
        transcribeFormData.append('audio', audioBlob, 'answer.webm');

        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          body: transcribeFormData,
        });

        const transcribeData = await transcribeResponse.json();

        if (!transcribeData.success) {
          toast.error('Failed to transcribe audio');
          setIsSubmitting(false);
          return;
        }

        finalAnswer = transcribeData.text;
        toast.success('Audio transcribed successfully');
      }

      // Submit the answer (including replay count for scoring)
      const result = await submitInterviewAnswer({
        sessionId,
        turnId: currentTurnId,
        answerText: finalAnswer,
        audioKey,
        replayCount,
      });

      if (result.error) {
        toast.error('Failed to submit answer', {
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
          toast.success('Interview complete!', {
            description: 'Great work on completing your interview.',
          });
          // Show upgrade dialog for free plan users (3 questions)
          setShowUpgradeDialog(true);
          return;
        }

        // If there's a next question, add it (T91)
        const nextData = result.data as {
          done: boolean;
          nextQuestion: Question;
          turnId: string;
          bridgeText?: string | null;
          currentStage?: number;
          stagesPlanned?: number;
          stageName?: string;
        };
        if (nextData.nextQuestion && nextData.turnId) {
          // T91: Check if stage advanced
          if (nextData.currentStage && nextData.currentStage !== currentStage) {
            toast.success(
              `Stage ${nextData.currentStage}: ${nextData.stageName}`,
              {
                description: 'Moving to the next interview stage!',
              }
            );
          } else {
            toast.success('Answer submitted!', {
              description: 'Next question generated.',
            });
          }

          setTurns((prev) => [
            ...prev,
            {
              id: nextData.turnId,
              question: nextData.nextQuestion,
              bridge_text: nextData.bridgeText || null, // T89: Include bridge text
            } as Turn,
          ]);
          setCurrentTurnId(nextData.turnId);
          setQuestionNumber((prev) => prev + 1);

          // T91: Update stage information
          if (nextData.currentStage) setCurrentStage(nextData.currentStage);
          if (nextData.stagesPlanned) setStagesPlanned(nextData.stagesPlanned);
          if (nextData.stageName) setStageName(nextData.stageName);
        }

        // Clear answer and reset state
        setAnswer('');
        setAudioBlob(null);
        setReplayCount(0); // Reset replay count for next question
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred', {
        description: 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // T93: Merged Replay - handles both TTS audio replay and text reveal
  const handleReplay = () => {
    if (replayCount >= replayCap) {
      toast.error('No replays remaining');
      return;
    }

    // Reveal the question text for 5 seconds
    setQuestionVisible(true);
    setReplayCount((prev) => prev + 1);

    toast.info(`Question replayed (${replayCount + 1}/${replayCap})`, {
      description: 'Question will hide again in 5 seconds',
    });

    // Hide again after 5 seconds
    setTimeout(() => {
      setQuestionVisible(false);
    }, 5000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading interview...</p>
      </div>
    );
  }

  const currentQuestion = turns.find((t) => !t.answer_text);

  return (
    <div className="mx-auto w-full max-w-4xl p-4 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{jobTitle}</h1>
            <p className="text-muted-foreground">{company}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                Question {questionNumber} of {totalQuestions}
              </p>
              {/* T91: Display stage information for multi-stage interviews */}
              {stagesPlanned > 1 && stageName && (
                <p className="text-sm font-medium text-primary">
                  Stage {currentStage} of {stagesPlanned}: {stageName}
                </p>
              )}
            </div>
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

      {/* Conversation Thread */}
      <div className="space-y-6">
        {/* Interview Introduction (T88) */}
        {introText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-blue-50 dark:bg-blue-950/30 p-5 border-l-4 border-blue-500">
              <div className="mb-2">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                  Welcome
                </span>
              </div>
              <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                {introText}
              </p>
            </div>
          </div>
        )}

        {turns.map((turn, index) => (
          <div key={turn.id} className="space-y-4">
            {/* Bridge Text (T89) - appears before questions 2+ */}
            {turn.bridge_text && index > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-lg bg-muted/50 p-4 border-l-2 border-primary/40">
                  <p className="text-sm italic text-muted-foreground leading-relaxed">
                    {turn.bridge_text}
                  </p>
                </div>
              </div>
            )}

            {/* Question - T93: With Countdown & Reveal System */}
            {turn.id === currentTurnId && !accessibilityMode ? (
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
                    question={turn.question}
                    questionNumber={index + 1}
                    turnId={turn.id}
                  />
                )}

                {/* T93: Hidden question message */}
                {countdown === null && !questionVisible && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg bg-muted/50 p-6 border-2 border-dashed border-muted-foreground/30">
                      <p className="text-sm font-medium text-muted-foreground">
                        Question hidden. Answer from memory or use the Replay
                        button below to review.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Past questions or accessibility mode - always visible */
              <QuestionBubble
                question={turn.question}
                questionNumber={index + 1}
                turnId={turn.id}
              />
            )}

            {/* Answer */}
            {turn.answer_text && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg bg-primary/10 p-4">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Your Answer
                    </span>
                  </div>
                  <p className="text-base whitespace-pre-wrap">
                    {turn.answer_text}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Answer Input */}
      {currentQuestion && (
        <div className="sticky bottom-0 bg-background border-t pt-4">
          {/* Timer and Replay Controls */}
          <div className="mb-4 flex items-center justify-between">
            <ReplayButton
              replayCount={replayCount}
              replayCap={replayCap}
              onReplay={handleReplay}
              disabled={isSubmitting}
            />
            {!accessibilityMode && (
              <TimerRing
                timeLimit={timerSec}
                startTime={
                  currentQuestion.timing?.started_at || new Date().toISOString()
                }
                onExpire={() => {
                  toast.warning('Time is up!', {
                    description: 'Please submit your answer',
                  });
                }}
              />
            )}
          </div>

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
                Type Answer
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
                Record Answer
              </Button>
            </div>

            {/* Text Input */}
            {answerMode === 'text' && (
              <>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
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
              </>
            )}
          </form>
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
