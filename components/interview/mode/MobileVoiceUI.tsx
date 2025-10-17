'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Square, Play } from 'lucide-react';
import { BaseInterviewUI } from '../BaseInterviewUI';
import {
  MobileContainer,
  MobileSection,
  MobileCard,
  MobileHeader,
} from '../layout/MobileContainer';
import { QuestionBubble } from '../QuestionBubble';
import { VoiceOrb } from '../VoiceOrb';
import { useQuestionReveal } from '@/hooks/useQuestionReveal';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

/**
 * Mobile Voice Interview UI
 *
 * T157: Mobile-optimized voice interview interface using BaseInterviewUI
 *
 * Features:
 * - Touch-optimized voice recording with large orb
 * - Tap-to-speak interaction pattern
 * - Scaled VoiceOrb for mobile screens
 * - Simplified controls optimized for touch
 * - Full-screen immersive experience
 */

interface MobileVoiceUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
}

export function MobileVoiceUI({
  sessionId,
  jobTitle,
  company,
}: MobileVoiceUIProps) {
  return (
    <BaseInterviewUI
      sessionId={sessionId}
      jobTitle={jobTitle}
      company={company}
    >
      {(state, actions) => (
        <MobileVoiceUIContent
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

function MobileVoiceUIContent({
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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

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
  } = useQuestionReveal({
    currentTurnId: isCurrentQuestionSpecial ? null : state.currentTurnId,
    accessibilityMode: false,
  });

  // Voice recording hook
  const {
    isRecording,
    recordingTime,
    transcription,
    audioLevel,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecording({
    onTranscriptionComplete: (text, blob) => {
      setAudioBlob(blob);
    },
  });

  // Handle submit
  const handleSubmit = async () => {
    if (!transcription || state.isSubmitting) return;

    await actions.submitAnswer(transcription, audioBlob);
    resetRecording();
    setAudioBlob(null);
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

  // Main voice interview UI
  const actionBar = transcription ? (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-3 max-h-[100px] overflow-y-auto">
        <p className="text-sm text-gray-700">{transcription}</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={resetRecording}
          variant="outline"
          className="flex-1 h-12"
          disabled={state.isSubmitting}
        >
          Re-record
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={state.isSubmitting}
          className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          {state.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <MobileContainer actionBar={actionBar}>
      <MobileHeader
        questionNumber={state.questionNumber}
        totalQuestions={state.totalQuestions}
        stageName={state.stageName}
      />

      {/* Current question */}
      {currentQuestion && questionVisible && (
        <MobileSection>
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
        </MobileSection>
      )}

      {/* Voice Orb - Large and centered for mobile */}
      <MobileSection className="flex items-center justify-center min-h-[40vh]">
        <div className="relative">
          <VoiceOrb
            isRecording={isRecording}
            audioLevel={audioLevel}
            size={200}
          />

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-lg font-semibold">
                  {Math.floor(recordingTime / 60)}:
                  {String(recordingTime % 60).padStart(2, '0')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Speaking...</p>
            </div>
          )}

          {/* Waiting state */}
          {!isRecording && !transcription && questionVisible && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-sm text-gray-600">Tap to speak</p>
            </div>
          )}
        </div>
      </MobileSection>

      {/* Recording controls */}
      {questionVisible && !transcription && (
        <MobileSection>
          <div className="flex justify-center">
            {isRecording ? (
              <Button
                onClick={stopRecording}
                size="lg"
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
              >
                <Square className="w-8 h-8" fill="white" />
              </Button>
            ) : (
              <Button
                onClick={startRecording}
                size="lg"
                disabled={!questionVisible || state.isSubmitting}
                className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
              >
                <Mic className="w-8 h-8" />
              </Button>
            )}
          </div>
        </MobileSection>
      )}

      {/* Timer display */}
      {questionVisible && !isRecording && !transcription && (
        <MobileSection>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Time remaining: {state.timerSec}s
            </p>
          </div>
        </MobileSection>
      )}

      {/* Hint for countdown */}
      {!questionVisible && countdown > 0 && (
        <MobileSection>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Question will appear in {countdown}s
            </p>
          </div>
        </MobileSection>
      )}
    </MobileContainer>
  );
}
