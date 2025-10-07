'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import {
  initializeInterview,
  submitInterviewAnswer,
} from '@/app/interview/[id]/actions';
import type { Question } from '@/lib/schema';
import { toast } from 'sonner';

interface InterviewUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

interface Turn {
  id: string;
  question: Question;
  answer_text?: string;
  timing?: any;
}

export function InterviewUI({
  sessionId,
  jobTitle,
  company,
}: InterviewUIProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(3);

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

          // Find the current unanswered question
          const unansweredIndex = result.data.turns?.findIndex(
            (t: Turn) => !t.answer_text
          );
          if (unansweredIndex !== undefined && unansweredIndex >= 0) {
            setQuestionNumber(unansweredIndex + 1);
          }

          const limits = result.data.session?.limits as any;
          setTotalQuestions(limits?.question_cap || 3);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (!currentTurnId) {
      toast.error('No active question');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitInterviewAnswer({
        sessionId,
        turnId: currentTurnId,
        answerText: answer.trim(),
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
            t.id === currentTurnId ? { ...t, answer_text: answer.trim() } : t
          )
        );

        // If there's a next question, add it
        if (result.data.nextQuestion && result.data.turnId) {
          setTurns((prev) => [
            ...prev,
            {
              id: result.data.turnId!,
              question: result.data.nextQuestion!,
            },
          ]);
          setCurrentTurnId(result.data.turnId);
          setQuestionNumber((prev) => prev + 1);
        }

        // Clear answer
        setAnswer('');

        if (result.data.done) {
          toast.success('Interview complete!', {
            description: 'Redirecting to your report...',
          });
        }
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
        <h1 className="text-2xl font-bold">{jobTitle}</h1>
        <p className="text-muted-foreground">{company}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Question {questionNumber} of {totalQuestions}
        </p>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-6">
        {turns.map((turn, index) => (
          <div key={turn.id} className="space-y-4">
            {/* Question */}
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-muted p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Question {index + 1}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {turn.question.category}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                    {turn.question.difficulty}
                  </span>
                </div>
                <p className="text-base">{turn.question.text}</p>
              </div>
            </div>

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
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" disabled={isSubmitting || !answer.trim()}>
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
          </form>
        </div>
      )}
    </div>
  );
}
