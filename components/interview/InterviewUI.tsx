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
import type { Question, Turn, Timing } from '@/lib/schema';
import { toast } from 'sonner';
import { QuestionBubble } from './QuestionBubble';
import { TimerRing } from './TimerRing';
import { ReplayButton } from './ReplayButton';
import { AudioRecorder } from './AudioRecorder';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UpgradeDialog } from './UpgradeDialog';
import { useQuestionReveal } from '@/hooks/useQuestionReveal';

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

  // T94: Analyzing Answer transition state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // T100: Question Reveal System
  const {
    countdown,
    questionVisible,
    revealCount,
    maxReveals,
    canReplay,
    handleReplay: handleRevealReplay,
    remainingTime,
  } = useQuestionReveal({
    currentTurnId,
    accessibilityMode,
  });

  // Initialize interview on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const result = await initializeInterview(sessionId);

        if (result.error) {
          toast.error('Unable to load interview', {
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
        toast.error('Something went wrong', {
          description: 'Please refresh the page',
        });
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate we have an answer (text or audio)
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
          setIsSubmitting(false);
          return;
        }

        finalAnswer = transcribeData.text;
        toast.success('Transcribed');
      }

      // Submit the answer (including reveal count for scoring)
      const result = await submitInterviewAnswer({
        sessionId,
        turnId: currentTurnId,
        answerText: finalAnswer,
        audioKey,
        replayCount: revealCount, // T100: Track reveal count for composure scoring
      });

      if (result.error) {
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
          toast.success('Interview complete', {
            description: 'Well done.',
          });
          // Show upgrade dialog for free plan users (3 questions)
          setShowUpgradeDialog(true);
          return;
        }

        // T94: Show "Analyzing answer..." state
        setIsAnalyzing(true);
        toast.info('Analyzing...');

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
          // T94: Hide analyzing state
          setIsAnalyzing(false);

          // T91: Check if stage advanced
          if (nextData.currentStage && nextData.currentStage !== currentStage) {
            toast.success(
              `Stage ${nextData.currentStage}: ${nextData.stageName}`,
              {
                description: 'Next stage',
              }
            );
          } else {
            toast.success('Next question');
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
        // Note: Reveal count is automatically reset by useQuestionReveal hook
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Something went wrong', {
        description: 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // T100: Replay handler - extends reveal window
  const handleReplay = () => {
    handleRevealReplay();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
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

      {/* T102: Current Question Only Display */}
      <div className="space-y-6">
        {/* Interview Introduction (T88) - shown only at start */}
        {introText && turns.length === 0 && (
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

        {/* T102: Render only the current turn (question without answer) */}
        {turns
          .filter((t) => !t.answer_text)
          .map((turn, _, filteredTurns) => {
            // Find the index in the original turns array for progress tracking
            const index = turns.findIndex((t) => t.id === turn.id);
            return (
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
                            Question hidden. Answer from memory or use the
                            Replay button below to review.
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
            );
          })}
      </div>

      {/* T94: Analyzing Answer Transition */}
      {isAnalyzing && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-3 rounded-lg bg-primary/10 px-6 py-4 border border-primary/20">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-primary">
                Analyzing
              </span>
              <span className="text-xs text-muted-foreground">
                Generating next question
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Answer Input */}
      {currentQuestion && !isAnalyzing && (
        <div className="sticky bottom-0 bg-background border-t pt-4">
          {/* Timer and Replay Controls */}
          <div className="mb-4 flex items-center justify-between">
            <ReplayButton
              replayCount={revealCount}
              replayCap={maxReveals}
              onReplay={handleReplay}
              disabled={isSubmitting || !canReplay}
            />
            {!accessibilityMode && (
              <TimerRing
                timeLimit={timerSec}
                startTime={
                  (currentQuestion.timing as Timing | null)?.started_at ||
                  new Date().toISOString()
                }
                onExpire={() => {
                  toast.warning('Time is up', {
                    description: 'Submit your answer',
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

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onViewReport={() => router.push(`/report/${sessionId}`)}
      />
    </div>
  );
}
