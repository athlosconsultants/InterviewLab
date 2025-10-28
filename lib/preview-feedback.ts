export interface FeedbackPoint {
  type: 'positive' | 'negative' | 'suggestion';
  message: string;
}

export function analyzeAnswer(answer: string): FeedbackPoint[] {
  const feedback: FeedbackPoint[] = [];
  const lowerAnswer = answer.toLowerCase();
  const words = answer.split(/\s+/);
  const wordCount = words.length;

  // 1. Length check
  if (wordCount >= 100) {
    feedback.push({
      type: 'positive',
      message: 'Good length - your answer is detailed and thorough.',
    });
  } else if (wordCount >= 50) {
    feedback.push({
      type: 'suggestion',
      message: 'Consider adding more detail to strengthen your answer.',
    });
  } else {
    feedback.push({
      type: 'negative',
      message: 'Your answer is too brief. Aim for at least 50-100 words.',
    });
  }

  // 2. STAR format detection
  const hasSTARKeywords =
    (lowerAnswer.includes('situation') || lowerAnswer.includes('context')) &&
    (lowerAnswer.includes('task') || lowerAnswer.includes('challenge')) &&
    (lowerAnswer.includes('action') || lowerAnswer.includes('did')) &&
    (lowerAnswer.includes('result') || lowerAnswer.includes('outcome'));

  if (hasSTARKeywords) {
    feedback.push({
      type: 'positive',
      message: 'Great! Your answer follows the STAR format structure.',
    });
  } else {
    feedback.push({
      type: 'suggestion',
      message:
        'Try using STAR format: Situation → Task → Action → Result. This helps structure your story clearly.',
    });
  }

  // 3. Quantification check (numbers/metrics)
  const hasNumbers = /\d+/.test(answer);
  const hasPercentage = /%/.test(answer);
  const hasMetrics =
    lowerAnswer.includes('increase') ||
    lowerAnswer.includes('decrease') ||
    lowerAnswer.includes('improve') ||
    lowerAnswer.includes('reduce');

  if ((hasNumbers || hasPercentage) && hasMetrics) {
    feedback.push({
      type: 'positive',
      message:
        'Excellent use of specific numbers and metrics to demonstrate impact.',
    });
  } else if (hasNumbers || hasPercentage) {
    feedback.push({
      type: 'suggestion',
      message:
        'You included numbers - great! Try to also explain the impact (e.g., "increased by 20%").',
    });
  } else {
    feedback.push({
      type: 'negative',
      message:
        'Add specific numbers or percentages to quantify your impact (e.g., "reduced load time by 40%").',
    });
  }

  // 4. Filler words check
  const fillerWords = [
    'um',
    'uh',
    'like',
    'you know',
    'basically',
    'actually',
    'literally',
  ];
  const fillerCount = fillerWords.reduce((count, filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = answer.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  if (fillerCount === 0) {
    feedback.push({
      type: 'positive',
      message: 'Clean and professional language - no filler words detected.',
    });
  } else if (fillerCount <= 2) {
    feedback.push({
      type: 'suggestion',
      message: `Minimize filler words like "um", "like", "basically" (found ${fillerCount}).`,
    });
  } else {
    feedback.push({
      type: 'negative',
      message: `Too many filler words detected (${fillerCount}). Practice removing "um", "like", etc.`,
    });
  }

  // 5. Specificity check
  const hasVagueTerms =
    lowerAnswer.includes('things') ||
    lowerAnswer.includes('stuff') ||
    lowerAnswer.includes('something') ||
    lowerAnswer.includes('various');
  const hasSpecificTerms =
    lowerAnswer.includes('specifically') ||
    lowerAnswer.includes('particular') ||
    /\b(because|since|due to)\b/.test(lowerAnswer);

  if (!hasVagueTerms && hasSpecificTerms) {
    feedback.push({
      type: 'positive',
      message: 'Specific and concrete language - avoids vague terms.',
    });
  } else if (hasVagueTerms) {
    feedback.push({
      type: 'suggestion',
      message:
        'Replace vague words like "things" or "stuff" with specific examples.',
    });
  }

  return feedback;
}
