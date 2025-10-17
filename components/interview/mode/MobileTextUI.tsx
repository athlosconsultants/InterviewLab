'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { BaseInterviewUI } from '../BaseInterviewUI';
import {
  MobileContainer,
  MobileSection,
  MobileCard,
  MobileHeader,
} from '../layout/MobileContainer';
import { QuestionBubble } from '../QuestionBubble';
import { TimerRing } from '../TimerRing';
import { useQuestionReveal } from '@/hooks/useQuestionReveal';

/**
 * Mobile Text Interview UI
 *
 * T156: Mobile-optimized text interview interface using BaseInterviewUI
 *
 * Features:
 * - Touch-optimized layout with large tap targets
 * - Simplified UI focused on current question
 * - Sticky answer input at bottom
 * - Full-screen question reveal
 * - Mobile-friendly timer display
 */

interface MobileTextUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

export function MobileTextUI({
  sessionId,
  jobTitle,
  company,
}: MobileTextUIProps) {
  return (
    <BaseInterviewUI
      sessionId={sessionId}
      jobTitle={jobTitle}
      company={company}
    >
      {(state, actions) => (
        <MobileTextUIContent
          state={state}
          actions={actions}
          sessionId={sessionId}
          jobTitle={jobTitle}
          company={company}
        />
      )}
    </BaseInterviewUI>
  );
}

function MobileTextUIContent({
  state,
  actions,
  sessionId,
  jobTitle,
  company,
}: {
  state: any;
  actions: any;
  sessionId: string;
  jobTitle: string;
  company: string;
}) {
  const [answer, setAnswer] = useState('');

  // Get current question
  const currentQuestion = state.turns.find((t: any) => !t.answer_text);
  const isCurrentQuestionSpecial =
    currentQuestion &&
    ((currentQuestion as any).turn_type === 'small_talk' ||
      (currentQuestion as any).turn_type === 'confirmation');

  // Question reveal hook
  const {
    countdown,
    questionVisible,
    revealCount,
    maxReveals,
    canReplay,
    handleReplay,
    remainingTime,
  } = useQuestionReveal({
    currentTurnId: isCurrentQuestionSpecial ? null : state.currentTurnId,
    accessibilityMode: false,
  });

  // Handle submit
  const handleSubmit = async () => {
    if (!answer.trim() || state.isSubmitting) return;

    await actions.submitAnswer(answer.trim());
    setAnswer('');
  };

  // Loading state
  if (state.isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-cyan-500" />
            <p className="text-gray-600">Loading interview...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Resume screen
  if (state.canResume) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <MobileCard className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Resume Interview?
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {state.resumeMessage}
            </p>
            <div className="space-y-3">
              <Button
                onClick={actions.handleResumeSession}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                Resume Session
              </Button>
              <Button
                onClick={actions.handleStartFresh}
                variant="outline"
                className="w-full h-12"
              >
                Start Fresh
              </Button>
            </div>
          </MobileCard>
        </div>
      </MobileContainer>
    );
  }

  // Welcome/Intro screen
  if (state.showWelcomeScreen && state.introText) {
    return (
      <MobileContainer>
        <div className="max-w-2xl mx-auto py-8">
          <MobileCard className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {jobTitle} at {company}
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 mb-6 whitespace-pre-wrap">
              {state.introText}
            </div>
            <Button
              onClick={actions.proceedFromIntro}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Begin Interview
            </Button>
          </MobileCard>
        </div>
      </MobileContainer>
    );
  }

  // Analyzing state
  if (state.isAnalyzing) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                Analyzing your answer...
              </p>
              <p className="text-sm text-gray-600">Generating next question</p>
            </div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Main interview UI
  const actionBar = (
    <div className="space-y-3">
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="min-h-[80px] resize-none text-base"
        disabled={state.isSubmitting || !questionVisible}
      />
      <Button
        onClick={handleSubmit}
        disabled={
          !answer.trim() ||
          state.isSubmitting ||
          !currentQuestion ||
          !questionVisible
        }
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
      >
        {state.isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Answer
          </>
        )}
      </Button>
    </div>
  );

  return (
    <MobileContainer actionBar={actionBar}>
      <MobileHeader
        questionNumber={state.questionNumber}
        totalQuestions={state.totalQuestions}
        stageName={state.stageName}
      />

      {/* Previous Q&A pairs */}
      <MobileSection>
        {state.turns
          .filter((t: any) => t.answer_text)
          .map((turn: any) => (
            <div key={turn.id} className="mb-4 space-y-3">
              <QuestionBubble
                question={turn.question}
                turnNumber={turn.turn_number || 0}
              />
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {turn.answer_text}
                </p>
              </div>
            </div>
          ))}
      </MobileSection>

      {/* Current question */}
      {currentQuestion && (
        <MobileSection>
          <div className="space-y-4">
            {/* Timer */}
            {questionVisible && (
              <div className="flex justify-center">
                <TimerRing
                  totalSeconds={state.timerSec}
                  isActive={questionVisible && !state.isSubmitting}
                />
              </div>
            )}

            {/* Question */}
            <QuestionBubble
              question={(currentQuestion as any).question}
              turnNumber={(currentQuestion as any).turn_number || 0}
              countdown={countdown}
              questionVisible={questionVisible}
              canReplay={canReplay}
              revealCount={revealCount}
              maxReveals={maxReveals}
              onReplay={handleReplay}
            />

            {/* Hint */}
            {!questionVisible && countdown > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Question will appear in {countdown}s
                </p>
              </div>
            )}
          </div>
        </MobileSection>
      )}
    </MobileContainer>
  );
}
