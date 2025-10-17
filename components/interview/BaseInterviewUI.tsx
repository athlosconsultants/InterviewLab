'use client';

import { useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  initializeInterview,
  submitInterviewAnswer,
  getResumeData,
  autoSaveSession,
} from '@/app/interview/[id]/actions';
import type { Question, Turn, Timing } from '@/lib/schema';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

/**
 * Base Interview UI Component
 *
 * T154: Extracts all shared interview logic for reuse across desktop and mobile UIs.
 * Handles:
 * - Session state management
 * - Turn/question/answer flow
 * - Resume functionality
 * - Stage progression
 * - Timer and replay caps
 * - Auto-save
 *
 * Uses render props pattern to allow desktop and mobile UIs to customize presentation.
 */

export interface BaseInterviewState {
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  isAnalyzing: boolean;

  // Interview data
  turns: Turn[];
  currentTurnId: string | null;
  questionNumber: number;
  totalQuestions: number;

  // Stage tracking
  currentStage: number;
  stagesPlanned: number;
  stageName: string | null;

  // Timers and caps
  replayCap: number;
  timerSec: number;

  // Resume functionality
  resumeChecked: boolean;
  resumeMessage: string | null;
  canResume: boolean;

  // Intro/Welcome
  introText: string | null;
  showWelcomeScreen: boolean;

  // Upgrade dialog
  showUpgradeDialog: boolean;
}

export interface BaseInterviewActions {
  submitAnswer: (answerText: string, audioBlob?: Blob | null) => Promise<void>;
  proceedFromIntro: () => void;
  handleResumeSession: () => void;
  handleStartFresh: () => void;
  handleUpgradeClick: () => void;
  closeUpgradeDialog: () => void;
}

interface BaseInterviewUIProps {
  sessionId: string;
  jobTitle: string;
  company: string;
  children: (
    state: BaseInterviewState,
    actions: BaseInterviewActions
  ) => ReactNode;
}

export function BaseInterviewUI({
  sessionId,
  jobTitle,
  company,
  children,
}: BaseInterviewUIProps) {
  const router = useRouter();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [replayCap, setReplayCap] = useState(2);
  const [timerSec, setTimerSec] = useState(90);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [introText, setIntroText] = useState<string | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);

  // Prevent duplicate submissions
  const submissionInProgress = useRef(false);

  // Stage tracking
  const [currentStage, setCurrentStage] = useState(1);
  const [stagesPlanned, setStagesPlanned] = useState(1);
  const [stageName, setStageName] = useState<string | null>(null);

  // Analyzing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Resume functionality
  const [resumeChecked, setResumeChecked] = useState(false);
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);
  const [canResume, setCanResume] = useState(false);

  /**
   * Initialize interview on mount
   */
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check for resumable session
      const resumeDataResult = await getResumeData(sessionId);
      setResumeChecked(true);

      if (
        resumeDataResult &&
        !resumeDataResult.error &&
        resumeDataResult.data &&
        resumeDataResult.data.canResume
      ) {
        setCanResume(true);
        setResumeMessage(resumeDataResult.data.message || null);
        setIsLoading(false);
        return;
      }

      // Initialize new or completed session
      const result = await initializeInterview(sessionId);

      if (result.error || !result.data) {
        console.error('Error initializing interview:', result.error);
        toast.error('Failed to load interview');
        return;
      }

      const {
        intro,
        turns: initialTurns,
        currentStage,
        stagesPlanned,
        stageName,
      } = result.data;

      setTurns(initialTurns || []);
      setCurrentStage(currentStage || 1);
      setStagesPlanned(stagesPlanned || 1);
      setStageName(stageName || null);

      const unansweredTurn = (initialTurns || []).find(
        (t: Turn) => !t.answer_text
      );
      if (unansweredTurn) {
        setCurrentTurnId(unansweredTurn.id);
        setQuestionNumber(result.data.questionNumber || 1);
        setTotalQuestions(result.data.totalQuestions || 3);
        setReplayCap(
          result.data.replayCap !== undefined ? result.data.replayCap : 2
        );
        setTimerSec(result.data.timerSec || 90);
      }

      if (intro) {
        setIntroText(intro);
        setShowWelcomeScreen(true);
      }

      trackEvent('interview_loaded', sessionId, {
        question_number: result.data.questionNumber,
        stage: currentStage,
      });
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  /**
   * Handle answer submission
   */
  const submitAnswer = useCallback(
    async (answerText: string, audioBlob?: Blob | null) => {
      if (submissionInProgress.current || !currentTurnId) {
        return;
      }

      submissionInProgress.current = true;

      try {
        setIsSubmitting(true);
        setIsAnalyzing(true);

        trackEvent('answer_submitted', sessionId, {
          mode: audioBlob ? 'audio' : 'text',
          turn_id: currentTurnId,
          question_number: questionNumber,
          answer_length: answerText.length,
        });

        const result = await submitInterviewAnswer(
          sessionId,
          currentTurnId,
          answerText,
          audioBlob
        );

        if (result.error) {
          toast.error(result.error);
          setIsAnalyzing(false);
          submissionInProgress.current = false;
          return;
        }

        if (!result.data) {
          toast.error('Failed to submit answer');
          setIsAnalyzing(false);
          submissionInProgress.current = false;
          return;
        }

        const {
          isComplete,
          nextQuestion,
          questionNumber: nextQuestionNumber,
          totalQuestions: nextTotalQuestions,
          newTurn,
          currentStage: nextStage,
          stageName: nextStageName,
          replayCap: nextReplayCap,
          timerSec: nextTimerSec,
        } = result.data;

        if (nextStage !== undefined) {
          setCurrentStage(nextStage);
        }
        if (nextStageName) {
          setStageName(nextStageName);
        }

        setIsAnalyzing(false);

        // Update turns with answered turn
        setTurns((prev) =>
          prev.map((t) =>
            t.id === currentTurnId
              ? {
                  ...t,
                  answer_text: answerText,
                  answer_audio_url: result.data?.audioUrl || null,
                }
              : t
          )
        );

        if (isComplete) {
          toast.success('Interview complete!');
          trackEvent('interview_completed', sessionId, {
            total_questions: questionNumber,
          });
          router.push(`/report/${sessionId}`);
          return;
        }

        if (nextQuestion && newTurn) {
          setTurns((prev) => [...prev, newTurn]);
          setCurrentTurnId(newTurn.id);
          setQuestionNumber(nextQuestionNumber || questionNumber + 1);
          setTotalQuestions(nextTotalQuestions || totalQuestions);
          setReplayCap(nextReplayCap !== undefined ? nextReplayCap : replayCap);
          setTimerSec(nextTimerSec || timerSec);

          trackEvent('question_received', sessionId, {
            question_number: nextQuestionNumber,
            stage: nextStage,
          });
        }
      } catch (error) {
        console.error('Failed to submit answer:', error);
        toast.error('Something went wrong');
        setIsAnalyzing(false);
      } finally {
        setIsSubmitting(false);
        submissionInProgress.current = false;
      }
    },
    [
      currentTurnId,
      questionNumber,
      replayCap,
      router,
      sessionId,
      timerSec,
      totalQuestions,
    ]
  );

  /**
   * Proceed from intro screen
   */
  const proceedFromIntro = useCallback(() => {
    setShowWelcomeScreen(false);
    trackEvent('intro_completed', sessionId, {});
  }, [sessionId]);

  /**
   * Resume session handler
   */
  const handleResumeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setCanResume(false);

      const result = await initializeInterview(sessionId);

      if (result.error || !result.data) {
        toast.error('Failed to resume session');
        return;
      }

      const {
        intro,
        turns: initialTurns,
        currentStage,
        stagesPlanned,
        stageName,
      } = result.data;

      setTurns(initialTurns || []);
      setCurrentStage(currentStage || 1);
      setStagesPlanned(stagesPlanned || 1);
      setStageName(stageName || null);

      const unansweredTurn = (initialTurns || []).find(
        (t: Turn) => !t.answer_text
      );
      if (unansweredTurn) {
        setCurrentTurnId(unansweredTurn.id);
        setQuestionNumber(result.data.questionNumber || 1);
        setTotalQuestions(result.data.totalQuestions || 3);
        setReplayCap(
          result.data.replayCap !== undefined ? result.data.replayCap : 2
        );
        setTimerSec(result.data.timerSec || 90);
      }

      if (intro) {
        setIntroText(intro);
        setShowWelcomeScreen(true);
      }

      toast.success('Session resumed!');
      trackEvent('session_resumed', sessionId, {});
    } catch (error) {
      console.error('Failed to resume session:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Start fresh handler
   */
  const handleStartFresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setCanResume(false);

      await autoSaveSession(sessionId, 'abandoned');

      const result = await initializeInterview(sessionId);

      if (result.error || !result.data) {
        toast.error('Failed to start fresh session');
        return;
      }

      const {
        intro,
        turns: initialTurns,
        currentStage,
        stagesPlanned,
        stageName,
      } = result.data;

      setTurns(initialTurns || []);
      setCurrentStage(currentStage || 1);
      setStagesPlanned(stagesPlanned || 1);
      setStageName(stageName || null);

      const unansweredTurn = (initialTurns || []).find(
        (t: Turn) => !t.answer_text
      );
      if (unansweredTurn) {
        setCurrentTurnId(unansweredTurn.id);
        setQuestionNumber(result.data.questionNumber || 1);
        setTotalQuestions(result.data.totalQuestions || 3);
        setReplayCap(
          result.data.replayCap !== undefined ? result.data.replayCap : 2
        );
        setTimerSec(result.data.timerSec || 90);
      }

      if (intro) {
        setIntroText(intro);
        setShowWelcomeScreen(true);
      }

      toast.success('Starting fresh interview!');
      trackEvent('session_started_fresh', sessionId, {});
    } catch (error) {
      console.error('Failed to start fresh:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Upgrade click handler
   */
  const handleUpgradeClick = useCallback(() => {
    setShowUpgradeDialog(true);
    trackEvent('upgrade_dialog_opened', sessionId, {
      source: 'interview',
    });
  }, [sessionId]);

  /**
   * Close upgrade dialog
   */
  const closeUpgradeDialog = useCallback(() => {
    setShowUpgradeDialog(false);
  }, []);

  const state: BaseInterviewState = {
    isLoading,
    isSubmitting,
    isAnalyzing,
    turns,
    currentTurnId,
    questionNumber,
    totalQuestions,
    currentStage,
    stagesPlanned,
    stageName,
    replayCap,
    timerSec,
    resumeChecked,
    resumeMessage,
    canResume,
    introText,
    showWelcomeScreen,
    showUpgradeDialog,
  };

  const actions: BaseInterviewActions = {
    submitAnswer,
    proceedFromIntro,
    handleResumeSession,
    handleStartFresh,
    handleUpgradeClick,
    closeUpgradeDialog,
  };

  return <>{children(state, actions)}</>;
}
