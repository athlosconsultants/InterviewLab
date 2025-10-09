/**
 * T112: Adaptive Difficulty System
 * Client-safe functions for assessing answer quality and adjusting difficulty
 * Separated from scoring.ts to avoid server-side dependencies
 */

import type { ResearchSnapshot, Question } from './schema';

/**
 * T112: Assess answer quality for adaptive difficulty
 * Uses lightweight analysis to classify answer strength quickly
 */
export async function assessAnswerQuality(
  question: Question,
  answer: string,
  researchSnapshot: ResearchSnapshot
): Promise<'strong' | 'medium' | 'weak'> {
  try {
    // Basic heuristics for quick assessment
    const wordCount = answer.trim().split(/\s+/).length;
    const answerLength = answer.trim().length;

    // Quick quality indicators
    const hasSpecificExamples =
      /\b(for example|specifically|when I|in my experience|at [A-Z][\w\s]*,|project|team|client|customer)\b/i.test(
        answer
      );
    const hasNumbers = /\b\d+\b/.test(answer);
    const hasMethodology =
      /\b(approach|method|process|strategy|steps|first|then|finally)\b/i.test(
        answer
      );
    const hasReflection =
      /\b(learned|realized|discovered|challenge|difficult|improved)\b/i.test(
        answer
      );

    // Length-based baseline
    if (wordCount < 15 || answerLength < 80) {
      return 'weak'; // Too short for substantive answer
    }

    if (wordCount > 150) {
      // Long answers are generally better, but check for quality indicators
      const qualityIndicators = [
        hasSpecificExamples,
        hasNumbers,
        hasMethodology,
        hasReflection,
      ];
      const indicatorCount = qualityIndicators.filter(Boolean).length;

      if (indicatorCount >= 3) return 'strong';
      if (indicatorCount >= 2) return 'medium';
      return 'medium'; // Still good due to length
    }

    // Medium length answers (15-150 words)
    const qualityIndicators = [
      hasSpecificExamples,
      hasNumbers,
      hasMethodology,
      hasReflection,
    ];
    const indicatorCount = qualityIndicators.filter(Boolean).length;

    // For technical questions, look for specific technical indicators
    if (question.category === 'technical') {
      const hasTechnicalTerms =
        /\b(algorithm|database|API|framework|architecture|system|code|programming|debug|optimize|scale)\b/i.test(
          answer
        );
      if (hasTechnicalTerms) {
        if (indicatorCount >= 2) return 'strong';
        if (indicatorCount >= 1) return 'medium';
        return 'medium'; // Technical terms boost score
      }
    }

    // For behavioral questions, look for STAR method indicators
    if (
      question.category === 'behavioral' ||
      question.category === 'situational'
    ) {
      const hasSituation =
        /\b(situation|context|when|time|project|role)\b/i.test(answer);
      const hasAction =
        /\b(did|action|took|decided|implemented|created|developed)\b/i.test(
          answer
        );
      const hasResult =
        /\b(result|outcome|impact|successful|improved|increased|decreased)\b/i.test(
          answer
        );

      const starIndicators = [hasSituation, hasAction, hasResult].filter(
        Boolean
      ).length;

      if (starIndicators >= 2 && indicatorCount >= 2) return 'strong';
      if (starIndicators >= 1 && indicatorCount >= 1) return 'medium';
    }

    // General quality assessment
    if (indicatorCount >= 3) return 'strong';
    if (indicatorCount >= 2) return 'medium';
    if (indicatorCount >= 1) return 'medium';

    return 'weak';
  } catch (error) {
    console.error('[T112] Answer quality assessment failed:', error);
    // Default to medium to avoid breaking the flow
    return 'medium';
  }
}

/**
 * T112: Determine next question difficulty based on answer quality
 */
export function getAdaptiveDifficulty(
  currentDifficulty: 'easy' | 'medium' | 'hard',
  answerQuality: 'strong' | 'medium' | 'weak',
  questionNumber: number,
  totalQuestions: number
): {
  difficulty: 'easy' | 'medium' | 'hard';
  adjustment: 'increase' | 'decrease' | 'maintain';
  reason: string;
} {
  const progress = questionNumber / totalQuestions;

  // Early questions: be more forgiving
  if (progress < 0.3) {
    if (answerQuality === 'strong') {
      return {
        difficulty: currentDifficulty === 'easy' ? 'medium' : currentDifficulty,
        adjustment: currentDifficulty === 'easy' ? 'increase' : 'maintain',
        reason: 'Strong early performance - building confidence',
      };
    }
    if (answerQuality === 'weak') {
      return {
        difficulty: 'easy',
        adjustment: currentDifficulty !== 'easy' ? 'decrease' : 'maintain',
        reason: 'Weak early performance - building foundation',
      };
    }
    return {
      difficulty: currentDifficulty,
      adjustment: 'maintain',
      reason: 'Steady early progress',
    };
  }

  // Mid-interview: adaptive adjustments
  if (progress < 0.7) {
    if (answerQuality === 'strong') {
      const nextDifficulty =
        currentDifficulty === 'easy'
          ? 'medium'
          : currentDifficulty === 'medium'
            ? 'hard'
            : 'hard';
      return {
        difficulty: nextDifficulty,
        adjustment:
          nextDifficulty !== currentDifficulty ? 'increase' : 'maintain',
        reason: 'Strong performance - increasing challenge',
      };
    }
    if (answerQuality === 'weak') {
      const nextDifficulty =
        currentDifficulty === 'hard'
          ? 'medium'
          : currentDifficulty === 'medium'
            ? 'easy'
            : 'easy';
      return {
        difficulty: nextDifficulty,
        adjustment:
          nextDifficulty !== currentDifficulty ? 'decrease' : 'maintain',
        reason: 'Weak performance - reducing difficulty',
      };
    }
    return {
      difficulty: currentDifficulty,
      adjustment: 'maintain',
      reason: 'Consistent performance',
    };
  }

  // Late interview: challenge strong performers, support weaker ones
  if (answerQuality === 'strong' && currentDifficulty !== 'hard') {
    return {
      difficulty: 'hard',
      adjustment: 'increase',
      reason: 'Final challenge for strong performer',
    };
  }
  if (answerQuality === 'weak' && currentDifficulty !== 'easy') {
    return {
      difficulty: 'medium',
      adjustment: 'decrease',
      reason: 'Final support for struggling candidate',
    };
  }

  return {
    difficulty: currentDifficulty,
    adjustment: 'maintain',
    reason: 'Maintaining final interview pace',
  };
}
