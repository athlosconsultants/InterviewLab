import { openai, MODELS } from './openai';
import { createClient } from './supabase-server';
import { saveSessionProgress } from './session'; // T111: Session resume functionality
import {
  assessAnswerQuality,
  getAdaptiveDifficulty,
} from './adaptive-difficulty'; // T112: Adaptive difficulty
import type {
  ResearchSnapshot,
  Question,
  AnswerDigest,
  PlanTier,
  DifficultyAdjustment,
} from './schema';

/**
 * T107: Generate variable stage targets for paid sessions
 * Each stage gets a random target between 5-8 questions
 */
function generateStageTargets(
  numStages: number,
  planTier: string = 'free'
): number[] {
  if (planTier !== 'paid' || numStages <= 1) {
    // Free tier or single stage: no variability needed
    return [0]; // Not used for free tier
  }

  const targets: number[] = [];
  for (let i = 0; i < numStages; i++) {
    // T107: Random between 5-8 questions per stage
    const stageTarget = Math.floor(Math.random() * 4) + 5; // 5, 6, 7, or 8
    targets.push(stageTarget);
  }

  console.log(
    `[T107] Generated stage targets for ${numStages} stages:`,
    targets
  );
  return targets;
}

/**
 * T107: Enhanced stage question calculation with variability for paid sessions
 * For paid sessions: vary questions per stage (5-8), for free sessions: keep simple distribution
 */
function calculateQuestionsPerStage(
  totalQuestions: number,
  numStages: number,
  planTier: string = 'free'
): number {
  if (planTier === 'paid' && numStages > 1) {
    // T107: For paid multi-stage interviews, use variability (5-8 per stage, max 8)
    return Math.min(8, Math.max(5, Math.floor(totalQuestions / numStages)));
  }

  // Original logic for free tier or single stage
  const questionsPerStage = Math.floor(totalQuestions / numStages);
  return Math.max(5, questionsPerStage);
}

/**
 * T107: Enhanced stage advancement logic with variable targets
 */
function shouldAdvanceStage(
  currentStage: number,
  stagesPlanned: number,
  questionsInCurrentStage: number,
  questionsPerStage: number,
  stageTargets: number[] | null = null,
  planTier: string = 'free'
): boolean {
  // Don't advance if we're at the last stage
  if (currentStage >= stagesPlanned) {
    return false;
  }

  // T107: For paid sessions with stage targets, use the specific target for this stage
  if (
    planTier === 'paid' &&
    stageTargets &&
    Array.isArray(stageTargets) &&
    currentStage <= stageTargets.length
  ) {
    const currentStageTarget = stageTargets[currentStage - 1]; // 0-indexed array
    console.log(
      `[T107] Stage ${currentStage} target: ${currentStageTarget}, current: ${questionsInCurrentStage}`
    );
    return questionsInCurrentStage >= currentStageTarget;
  }

  // Original logic: advance when we've reached the target number of questions for this stage
  return questionsInCurrentStage >= questionsPerStage;
}

/**
 * T91: Get the name of the current stage from interview config
 */
function getStageName(
  researchSnapshot: ResearchSnapshot,
  stageIndex: number
): string {
  const stages = researchSnapshot.interview_config?.stages || [];
  if (stageIndex > 0 && stageIndex <= stages.length) {
    return stages[stageIndex - 1];
  }
  return `Stage ${stageIndex}`;
}

/**
 * T95: Generate a compact summary of the latest Q&A for rolling context
 */
async function generateQASummary(
  question: string,
  answer: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODELS.CONVERSATIONAL,
      messages: [
        {
          role: 'system',
          content:
            'You are a summarizer. Create a 1-sentence summary of the following interview Q&A exchange. Focus on the key points of the answer.',
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nAnswer: ${answer}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('[T95] Failed to generate Q&A summary:', error);
    // Return a simple fallback summary
    return `Q${question.length > 50 ? question.substring(0, 50) + '...' : question} → A: ${answer.length > 50 ? answer.substring(0, 50) + '...' : answer}`;
  }
}

/**
 * T95: Update the rolling conversation summary in the session
 */
async function updateConversationSummary(
  sessionId: string,
  newQASummary: string,
  existingSummary: string | null
): Promise<void> {
  const supabase = await createClient();

  let updatedSummary: string;

  if (!existingSummary) {
    // First Q&A - just use the new summary
    updatedSummary = `1. ${newQASummary}`;
  } else {
    // Append the new Q&A summary
    const summaryLines = existingSummary.split('\n');
    const nextNumber = summaryLines.length + 1;
    updatedSummary = `${existingSummary}\n${nextNumber}. ${newQASummary}`;

    // T95: Keep summary compact (< 1KB target)
    // If summary is getting too long, condense it
    if (updatedSummary.length > 1024) {
      console.log(
        `[T95] Summary exceeds 1KB (${updatedSummary.length} bytes), condensing...`
      );
      // Keep only the last 5 Q&As for context
      const recentLines = summaryLines.slice(-4);
      updatedSummary =
        recentLines.join('\n') + `\n${nextNumber}. ${newQASummary}`;
    }
  }

  console.log(
    `[T95] Updating conversation summary (${updatedSummary.length} bytes)`
  );

  const { error } = await supabase
    .from('sessions')
    .update({ conversation_summary: updatedSummary })
    .eq('id', sessionId);

  if (error) {
    console.error('[T95] Failed to update conversation summary:', error);
  }
}

/**
 * Generates an interview question using OpenAI based on the research snapshot
 * and previous conversation context. (T90: Context-aware with progressive difficulty)
 * (T91: Stage-aware question generation)
 */
export async function generateQuestion(params: {
  researchSnapshot: ResearchSnapshot;
  previousTurns?: Array<{
    question: Question;
    answer_digest?: AnswerDigest;
    answer_text?: string;
  }>;
  questionNumber: number;
  totalQuestions: number;
  currentStage?: number;
  stagesPlanned?: number;
  questionsInStage?: number;
  mode?: 'text' | 'voice'; // T109: Mode-aware question generation
  targetDifficulty?: 'easy' | 'medium' | 'hard'; // T112: Adaptive difficulty
}): Promise<Question> {
  const {
    researchSnapshot,
    previousTurns = [],
    questionNumber,
    totalQuestions,
    currentStage = 1,
    stagesPlanned = 1,
    questionsInStage = 0,
    mode = 'text', // T109: Default to text mode if not specified
    targetDifficulty, // T112: Adaptive difficulty (optional)
  } = params;

  // T90: Calculate interview progress for progressive difficulty
  const progress = questionNumber / totalQuestions;
  // T112: Use adaptive difficulty if provided, otherwise use original progression
  const finalDifficulty =
    targetDifficulty ||
    (progress < 0.33 ? 'easy' : progress < 0.66 ? 'medium' : 'hard');

  // T91: Get current stage information
  const stageName = getStageName(researchSnapshot, currentStage);
  const stages = researchSnapshot.interview_config?.stages || [];
  const isMultiStage = stagesPlanned > 1;

  // T107: Get plan tier from research snapshot or default
  const planTier = (researchSnapshot as any).plan_tier || 'free';
  const questionsPerStage = isMultiStage
    ? calculateQuestionsPerStage(totalQuestions, stagesPlanned, planTier)
    : totalQuestions;

  // T91: Map stage name to question category
  const stageCategory = stageName.toLowerCase().includes('technical')
    ? 'technical'
    : stageName.toLowerCase().includes('behavioral')
      ? 'behavioral'
      : stageName.toLowerCase().includes('system')
        ? 'technical' // System Design questions are technical
        : 'situational'; // Default fallback

  // T90: Build enriched context from previous turns
  // Include full answer text for the most recent turn to enable deep probing
  const conversationContext =
    previousTurns.length > 0
      ? previousTurns
          .map((turn, idx) => {
            const isLastTurn = idx === previousTurns.length - 1;
            // T90: For the most recent answer, include full text for context-aware probing
            const answerText =
              isLastTurn && turn.answer_text
                ? turn.answer_text
                : turn.answer_digest?.summary || 'No answer provided';

            return `Q${idx + 1}: ${turn.question.text}\nA${idx + 1}: ${answerText}`;
          })
          .join('\n\n')
      : 'No previous questions.';

  // T92: Get industry-specific tone and styles
  const interviewConfig = researchSnapshot.interview_config;
  const industryTone =
    interviewConfig?.tone || 'professional and conversational';
  const interviewStyles = interviewConfig?.styles || [
    'behavioral',
    'technical',
  ];

  // T90: Enhanced prompt for context-aware question generation
  const prompt = `You are an expert interview coach conducting a professional job interview. Generate the next interview question that builds naturally on the conversation so far.

# Candidate Background:
${researchSnapshot.cv_summary.summary}
Key Skills: ${researchSnapshot.cv_summary.key_skills.join(', ')}
Experience: ${researchSnapshot.cv_summary.experience_years} years

# Role Requirements:
Position: ${researchSnapshot.job_spec_summary.role}
Level: ${researchSnapshot.job_spec_summary.level || 'mid'}
Key Requirements: ${researchSnapshot.job_spec_summary.key_requirements.join(', ')}
Responsibilities: ${researchSnapshot.job_spec_summary.responsibilities.join(', ')}

# Company Context:
${researchSnapshot.company_facts.name} - ${researchSnapshot.company_facts.industry || 'Technology'}
${researchSnapshot.company_facts.mission ? `Mission: ${researchSnapshot.company_facts.mission}` : ''}

# T92 Industry-Specific Interview Style:
**Tone:** ${industryTone}
**Interview Styles:** ${interviewStyles.join(', ')}
${interviewConfig ? `**Industry:** ${interviewConfig.industry} - ${interviewConfig.sub_industry}` : ''}

# Competencies to Assess:
Technical: ${researchSnapshot.competencies.technical.join(', ')}
Behavioral: ${researchSnapshot.competencies.behavioral.join(', ')}
Domain: ${researchSnapshot.competencies.domain.join(', ')}

# Previous Conversation:
${conversationContext}

# T109 Interview Mode:
**Mode: ${mode.toUpperCase()}**
${
  mode === 'voice'
    ? `
**VOICE MODE REQUIREMENTS:**
- Keep questions concise and clear for text-to-speech
- Avoid complex sentence structures that are hard to follow in audio
- Use natural, conversational language that sounds good when spoken
- Question should be under 30 words when possible
- Avoid parenthetical comments or complex formatting
- Make the question flow naturally when heard, not just read
`
    : `
**TEXT MODE:**
- Question will be displayed visually to the candidate
- Can use more complex sentence structures if needed
- Formatting and visual clarity are important
`
}

# Task:
Generate question ${questionNumber} of ${totalQuestions} (Progress: ${Math.round(progress * 100)}%)
${
  isMultiStage
    ? `
**T91 MULTI-STAGE INTERVIEW**
- Current Stage: ${currentStage} of ${stagesPlanned} - "${stageName}"
- Question ${questionsInStage + 1} of ~${questionsPerStage} in this stage
- All stages: ${stages.join(', ')}

**FOCUS ON CURRENT STAGE:**
This question MUST focus specifically on "${stageName}" competencies and skills.
${stages.length > 0 ? `- Other stages (${stages.filter((_, i) => i !== currentStage - 1).join(', ')}) will be covered later - do NOT ask about them now` : ''}
- The question category MUST be "${stageCategory}" to match the "${stageName}" stage
- Questions should progressively explore different aspects of "${stageName}"
`
    : ''
}

## T90 Context-Aware Guidelines:
${
  previousTurns.length > 0
    ? `
**IMPORTANT - Build on Previous Answers:**
- Analyze the candidate's most recent answer for specific topics, experiences, or challenges mentioned
- If they mentioned a specific project, technology, team, or situation, ask a follow-up question that probes deeper
- Look for gaps or areas where more detail would be valuable
- If they mentioned leadership experience, ask about specific leadership challenges
- If they mentioned technical work, ask about technical decisions or tradeoffs
- If they mentioned stakeholders/teams, ask about conflict resolution or communication
- Reference their previous answer naturally to show you're listening

**Examples of Context-Aware Questions:**
- "You mentioned working with a team of 5 on that project - how did you handle disagreements?"
- "Regarding the migration you described, what technical challenges did you face?"
- "You said stakeholder communication was challenging - can you give me a specific example?"
`
    : `
**First Question Guidelines:**
- Start with a warm, open question that helps the candidate settle in
- Focus on recent, relevant experience
- Allow them to showcase their strengths
`
}

**Progressive Difficulty (Target: ${finalDifficulty}):**
- Questions 1-${Math.ceil(totalQuestions / 3)}: Easy - broad, experience-based, allow candidate to warm up
- Questions ${Math.ceil(totalQuestions / 3) + 1}-${Math.ceil((totalQuestions * 2) / 3)}: Medium - specific scenarios, problem-solving, trade-offs
- Questions ${Math.ceil((totalQuestions * 2) / 3) + 1}-${totalQuestions}: Hard - complex situations, judgment calls, leadership challenges

**Question Quality:**
- Make questions open-ended (avoid yes/no)
- Be specific and clear
- Connect to both their experience AND the role requirements
- **IMPORTANT: Maintain a ${industryTone} tone throughout the question**
${isMultiStage ? `- The question MUST be category "${stageCategory}" to match the current stage "${stageName}"` : '- Mix question types: technical, behavioral, and situational'}
- Ensure the question can be answered in 90 seconds

Return ONLY valid JSON with no additional text:

{
  "text": "The interview question text",
  "category": "${isMultiStage ? stageCategory : 'technical|behavioral|situational'}",
  "difficulty": "${finalDifficulty}",
  "time_limit": 90,
  "follow_up": ${previousTurns.length > 0 ? 'true' : 'false'}
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.ANALYSIS,
      messages: [
        {
          role: 'system',
          content: `You are a professional interview coach. Your interview style is ${industryTone}. You always respond with valid JSON only, no markdown formatting, no additional text.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // Slightly higher for more varied questions
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const question = JSON.parse(content) as Question;

    // Validate the question structure
    if (!question.text || !question.category || !question.difficulty) {
      throw new Error('Invalid question structure from OpenAI');
    }

    // T91: Enforce stage category for multi-stage interviews
    if (isMultiStage && question.category !== stageCategory) {
      console.warn(
        `[T91] Question category mismatch: got "${question.category}", expected "${stageCategory}" for stage "${stageName}". Correcting...`
      );
      question.category = stageCategory;
    }

    return question;
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error(
      `Failed to generate question: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Starts an interview session by generating the first question.
 */
export async function startInterview(sessionId: string, supabaseClient?: any) {
  const supabase = supabaseClient || (await createClient());

  // Get the session with research snapshot and stage info
  // Note: Some columns (stage_targets, mode) may not exist if migrations haven't been run
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    console.error('[startInterview] Session fetch error:', {
      sessionId,
      error: sessionError,
      hasSession: !!session,
    });
    throw new Error(
      `Session not found: ${sessionError?.message || 'No session data'}`
    );
  }

  // Check if session is in correct state
  if (session.status !== 'ready' && session.status !== 'running') {
    throw new Error(`Cannot start interview in ${session.status} state`);
  }

  const planTier = (session as any).plan_tier as PlanTier;
  const currentStage = (session as any).current_stage || 1;
  const stagesPlanned = (session as any).stages_planned || 1;
  const researchSnapshot = session.research_snapshot as ResearchSnapshot;
  let stageTargets = (session as any).stage_targets as number[] | null;
  const mode = (session as any).mode || 'text'; // T109: Get interview mode

  console.log(
    `[T91] Starting interview - Stage ${currentStage} of ${stagesPlanned}`
  );

  // T107: Generate stage targets for paid multi-stage interviews if not already set
  if (planTier === 'paid' && stagesPlanned > 1 && !stageTargets) {
    stageTargets = generateStageTargets(stagesPlanned, planTier);

    // Store the stage targets in the session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ stage_targets: stageTargets })
      .eq('id', sessionId);

    if (updateError) {
      console.error('[T107] Failed to store stage targets:', updateError);
      // Continue without storing (graceful degradation)
    }
  }

  // T106: Check if small talk turns already exist
  const { data: existingTurns } = await supabase
    .from('turns')
    .select('id, turn_type')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  const hasSmallTalk = existingTurns?.some(
    (t: any) => (t as any).turn_type === 'small_talk'
  );
  const hasAnyTurns = existingTurns && existingTurns.length > 0;

  // T106: Generate and create small talk turns for paid users (only if not already done)
  if (planTier === 'paid' && !hasSmallTalk && !hasAnyTurns) {
    console.log('[T106] Generating small talk for paid user');
    const smallTalkQuestions = await generateSmallTalk(sessionId);

    // Create turns for each small talk question
    for (const questionText of smallTalkQuestions) {
      const smallTalkQuestion: Question = {
        text: questionText,
        category: 'small_talk',
        difficulty: 'easy',
        time_limit: 0, // No timer for small talk
        follow_up: false,
      };

      await supabase.from('turns').insert({
        session_id: sessionId,
        user_id: session.user_id,
        question: smallTalkQuestion,
        turn_type: 'small_talk', // T106: Mark as small talk
        timing: {
          started_at: new Date().toISOString(),
        },
      });
    }

    // Create the confirmation turn ("Ready to begin?")
    const confirmationQuestion: Question = {
      text: "Great! I think we're ready to begin the formal interview. Are you ready to start?",
      category: 'confirmation',
      difficulty: 'easy',
      time_limit: 0,
      follow_up: false,
    };

    const { data: confirmTurn } = await supabase
      .from('turns')
      .insert({
        session_id: sessionId,
        user_id: session.user_id,
        question: confirmationQuestion,
        turn_type: 'confirmation', // T106: Mark as confirmation
        timing: {
          started_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    console.log('[T106] Small talk and confirmation turns created');

    // Update session status to running
    await supabase
      .from('sessions')
      .update({ status: 'running' })
      .eq('id', sessionId);

    return {
      turnId: confirmTurn!.id,
      question: confirmationQuestion,
    };
  }

  // Check if we still need to create the first actual interview question
  const hasRealQuestion = existingTurns?.some(
    (t: any) => (t as any).turn_type === 'question' || !(t as any).turn_type
  );

  if (!hasRealQuestion) {
    // Generate first actual interview question with stage information
    const question = await generateQuestion({
      researchSnapshot,
      previousTurns: [],
      questionNumber: 1,
      totalQuestions: (session.limits as any)?.question_cap || 3,
      currentStage, // T91: Pass stage info
      stagesPlanned, // T91: Pass stage info
      questionsInStage: 0, // T91: First question in stage
      mode, // T109: Pass interview mode for mode-aware prompts
      targetDifficulty: 'easy', // T112: Start with easy difficulty
    });

    console.log(
      `[T91] First question generated with category: ${question.category}`
    );

    // Create first turn
    const { data: turn, error: turnError } = await supabase
      .from('turns')
      .insert({
        session_id: sessionId,
        user_id: session.user_id,
        question: question,
        turn_type: 'question', // T106: Mark as actual question
        timing: {
          started_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (turnError) {
      console.error('Error creating turn:', turnError);
      throw new Error('Failed to create interview turn');
    }

    // T112: Initialize difficulty curve with first question
    const initialDifficultyEntry: DifficultyAdjustment = {
      turn_index: 1,
      question_number: 1,
      previous_difficulty: 'medium', // Baseline
      new_difficulty: 'easy',
      adjustment_reason: 'baseline',
      timestamp: new Date().toISOString(),
    };

    // Update session status to running and initialize difficulty curve
    await supabase
      .from('sessions')
      .update({
        status: 'running',
        difficulty_curve: [initialDifficultyEntry], // T112: Initialize curve
      })
      .eq('id', sessionId);

    return {
      turnId: turn.id,
      question,
    };
  }

  // If we reach here, return the first unanswered turn
  const firstUnanswered = existingTurns?.find((t: any) => {
    // Need to check if turn has an answer - fetch full turn data
    return true; // Simplified for now
  });

  if (firstUnanswered) {
    const { data: fullTurn } = await supabase
      .from('turns')
      .select('*')
      .eq('id', firstUnanswered.id)
      .single();

    return {
      turnId: fullTurn!.id,
      question: fullTurn!.question as Question,
    };
  }

  throw new Error('Unable to start or resume interview');
}

/**
 * Records an answer and generates the next question.
 */
export async function submitAnswer(params: {
  sessionId: string;
  turnId: string;
  answerText: string;
  audioKey?: string;
  replayCount?: number;
}) {
  const { sessionId, turnId, answerText, audioKey, replayCount } = params;
  const supabase = await createClient();

  // Get the current turn
  const { data: turn, error: turnError } = await supabase
    .from('turns')
    .select('*')
    .eq('id', turnId)
    .single();

  if (turnError || !turn) {
    throw new Error('Turn not found');
  }

  // Generate answer digest (simple summary for now)
  const answerDigest: AnswerDigest = {
    summary:
      answerText.substring(0, 200) + (answerText.length > 200 ? '...' : ''),
    key_points: [], // Could use OpenAI to extract key points
    word_count: answerText.split(/\s+/).length,
  };

  // Update turn with answer (and audio key + replay count if provided)
  const { error: updateError } = await supabase
    .from('turns')
    .update({
      answer_text: answerText,
      answer_audio_key: audioKey || null,
      answer_digest: answerDigest,
      timing: {
        ...(turn.timing as any),
        completed_at: new Date().toISOString(),
        duration_ms:
          new Date().getTime() -
          new Date((turn.timing as any)?.started_at).getTime(),
        replay_count: replayCount || 0,
      },
    })
    .eq('id', turnId);

  if (updateError) {
    throw new Error('Failed to update turn');
  }

  // T95: Generate and update conversation summary
  const questionText = (turn.question as Question).text;
  const qaSummary = await generateQASummary(questionText, answerText);

  // T91: Get session with stage information (including conversation_summary for T95)
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  // Guard: If session is already complete (feedback status), prevent reprocessing
  if ((session as any).status === 'feedback') {
    return {
      done: true,
      nextQuestion: null,
      planTier: (session as any).plan_tier || 'free',
    };
  }

  // T95: Update rolling conversation summary
  await updateConversationSummary(
    sessionId,
    qaSummary,
    (session as any).conversation_summary || null
  );

  // T111: Save session progress after answer submission
  try {
    const allTurnsForProgress = await supabase
      .from('turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (allTurnsForProgress.data) {
      const turns = allTurnsForProgress.data;
      const currentTurnIndex = turns.findIndex((t) => t.id === turnId);
      const nextUnanswered = turns.find(
        (t) => !t.answer_text && t.id !== turnId
      );

      // Determine current interview phase
      let phase: 'small_talk' | 'confirmation' | 'interview' | 'complete' =
        'interview';
      if ((turn as any).turn_type === 'small_talk') phase = 'small_talk';
      else if ((turn as any).turn_type === 'confirmation')
        phase = 'confirmation';
      else if (!nextUnanswered) phase = 'complete';

      await saveSessionProgress(
        sessionId,
        nextUnanswered?.id || null,
        turnId, // This turn is now completed
        currentTurnIndex + 1, // Next turn index
        phase
      );
    }
  } catch (error) {
    console.error('[T111] Failed to save session progress:', error);
    // Don't throw - resume saving shouldn't break the flow
  }

  // T106: Check if the current turn is a small talk or confirmation turn
  const currentTurnType = (turn as any).turn_type;

  // T106: For small talk, just return done:false with no next question
  // The UI will show the next unanswered turn automatically
  if (currentTurnType === 'small_talk') {
    return {
      done: false,
      nextQuestion: null,
    };
  }

  // T90: Fetch turns with answer_text for context-aware question generation
  // T106: Fetch turn_type to exclude small talk from counts
  const { data: allTurns, error: turnsError } = await supabase
    .from('turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (turnsError) {
    throw new Error('Failed to fetch turns');
  }

  // T106: For confirmation turn, check if there's already an unanswered actual interview question
  if (currentTurnType === 'confirmation') {
    const existingQuestion = allTurns.find(
      (t) =>
        !t.answer_text &&
        ((t as any).turn_type === 'question' || !(t as any).turn_type)
    );

    if (existingQuestion) {
      // There's already an unanswered actual interview question, return it
      return {
        done: false,
        nextQuestion: existingQuestion.question as Question,
        turnId: existingQuestion.id,
      };
    }
    // If no existing question, continue to generate one below
  }

  const questionCap = (session.limits as any)?.question_cap || 3;
  const planTier = (session as any).plan_tier || 'free';

  // T91: Get stage information
  const currentStage = (session as any).current_stage || 1;
  const stagesPlanned = (session as any).stages_planned || 1;
  const researchSnapshot = session.research_snapshot as ResearchSnapshot;
  const stageTargets = (session as any).stage_targets as number[] | null;
  const mode = (session as any).mode || 'text'; // T109: Get interview mode

  // T106: Filter out small talk and confirmation turns from the question count
  const actualQuestions = allTurns.filter(
    (t) => (t as any).turn_type === 'question' || !(t as any).turn_type
  );

  // T85: Enforce free tier restrictions (3 questions max)
  if (planTier === 'free' && actualQuestions.length >= 3) {
    // End interview for free tier
    await supabase
      .from('sessions')
      .update({ status: 'feedback' })
      .eq('id', sessionId);

    return {
      done: true,
      nextQuestion: null,
      planTier, // Return plan tier for conditional UI
    };
  }

  // Check if we've reached the question limit (paid tier or general cap)
  if (actualQuestions.length >= questionCap) {
    // End interview
    await supabase
      .from('sessions')
      .update({ status: 'feedback' })
      .eq('id', sessionId);

    // T135: Consume interview credit on completion (only for paid interviews)
    if (planTier === 'paid') {
      const entitlementId = (session as any).entitlement_id;
      if (entitlementId) {
        const { consumeEntitlement } = await import('./entitlements');
        const result = await consumeEntitlement(
          entitlementId,
          (session as any).user_id,
          sessionId
        );

        if (result.success) {
          console.log(
            `[T135] Credit consumed for session ${sessionId}. Remaining: ${result.remainingCredits}`
          );
        } else {
          console.error(
            `[T135] Failed to consume credit for session ${sessionId}:`,
            result.error
          );
        }
      } else {
        console.warn(
          `[T135] Paid session ${sessionId} has no entitlement_id - credit not consumed`
        );
      }
    }

    return {
      done: true,
      nextQuestion: null,
      planTier, // Return plan tier for conditional UI
    };
  }

  // T91: Calculate questions in current stage
  const questionsPerStage =
    stagesPlanned > 1
      ? calculateQuestionsPerStage(questionCap, stagesPlanned, planTier)
      : questionCap;

  // T106: Count only actual interview questions (not small talk)
  const totalAnswered = actualQuestions.length;

  // T91: Calculate how many questions have been answered in the current stage
  // Stage boundaries: Stage 1 starts at 0, Stage 2 starts at questionsPerStage, etc.
  const stageStartIndex = (currentStage - 1) * questionsPerStage;
  const questionsInCurrentStage = totalAnswered - stageStartIndex;

  // T91: Check if we should advance to the next stage
  let newStage = currentStage;
  if (
    shouldAdvanceStage(
      currentStage,
      stagesPlanned,
      questionsInCurrentStage,
      questionsPerStage,
      stageTargets,
      planTier
    )
  ) {
    newStage = currentStage + 1;
    console.log(
      `[T91] Advancing from stage ${currentStage} to stage ${newStage}`
    );

    // Update session with new stage
    await supabase
      .from('sessions')
      .update({ current_stage: newStage })
      .eq('id', sessionId);
  }

  // T112: Assess answer quality and determine adaptive difficulty
  let nextDifficulty: 'easy' | 'medium' | 'hard' | undefined;
  let difficultyAdjustment: DifficultyAdjustment | null = null;

  try {
    // Assess the quality of the current answer
    const answerQuality = await assessAnswerQuality(
      (turn as any).question,
      answerText,
      researchSnapshot
    );

    // Get current question's difficulty (default to medium if not specified)
    const currentDifficulty =
      ((turn as any).question?.difficulty as 'easy' | 'medium' | 'hard') ||
      'medium';

    // Determine adaptive difficulty for next question
    const adaptiveResult = getAdaptiveDifficulty(
      currentDifficulty,
      answerQuality,
      actualQuestions.length + 1, // Next question number
      questionCap
    );

    nextDifficulty = adaptiveResult.difficulty;

    // Create difficulty adjustment record
    difficultyAdjustment = {
      turn_index: actualQuestions.length + 1,
      question_number: actualQuestions.length + 1,
      previous_difficulty: currentDifficulty,
      new_difficulty: adaptiveResult.difficulty,
      adjustment_reason:
        answerQuality === 'strong'
          ? 'strong_answer'
          : answerQuality === 'weak'
            ? 'weak_answer'
            : 'baseline',
      answer_quality: answerQuality,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[T112] Answer quality: ${answerQuality}, Difficulty: ${currentDifficulty} → ${nextDifficulty} (${adaptiveResult.reason})`
    );
  } catch (error) {
    console.error(
      '[T112] Failed to assess answer quality, using default difficulty:',
      error
    );
    // Continue without adaptive difficulty if assessment fails
  }

  // Generate next question (T91: with stage information, T106: using actualQuestions count)
  // NOTE: Pass allTurns (including small talk) for context, but use actualQuestions for counting
  const nextQuestion = await generateQuestion({
    researchSnapshot,
    previousTurns: allTurns as any, // Include small talk for context
    questionNumber: actualQuestions.length + 1,
    totalQuestions: questionCap,
    currentStage: newStage,
    stagesPlanned,
    questionsInStage: newStage !== currentStage ? 0 : questionsInCurrentStage,
    mode, // T109: Pass interview mode for mode-aware prompts
    targetDifficulty: nextDifficulty, // T112: Adaptive difficulty
  });

  // T89: Generate bridge text referencing the previous answer (paid tier only)
  // T167: Pass stage transition information for enhanced bridges
  let bridgeText: string | null = null;
  if (planTier === 'paid') {
    try {
      bridgeText = await generateBridge(
        sessionId,
        turnId,
        newStage !== currentStage ? newStage : undefined
      );
    } catch (error) {
      console.error('Failed to generate bridge:', error);
      // Continue without bridge if generation fails
    }
  }

  // Create next turn (T89: with bridge_text, T106: with turn_type)
  const { data: nextTurn, error: nextTurnError } = await supabase
    .from('turns')
    .insert({
      session_id: sessionId,
      user_id: session.user_id,
      question: nextQuestion,
      bridge_text: bridgeText, // T89: Add bridge text
      turn_type: 'question', // T106: Mark as actual interview question
      timing: {
        started_at: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (nextTurnError) {
    throw new Error('Failed to create next turn');
  }

  // T112: Save difficulty curve adjustment to session
  if (difficultyAdjustment) {
    try {
      // Get current difficulty curve
      const { data: currentSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      const currentCurve =
        (currentSession?.difficulty_curve as DifficultyAdjustment[]) || [];
      const updatedCurve = [...currentCurve, difficultyAdjustment];

      // Update session with new difficulty curve
      await supabase
        .from('sessions')
        .update({ difficulty_curve: updatedCurve })
        .eq('id', sessionId);

      console.log(
        `[T112] Difficulty curve updated: ${updatedCurve.length} adjustments tracked`
      );
    } catch (error) {
      console.error('[T112] Failed to save difficulty curve:', error);
      // Continue without saving curve - don't break the flow
    }
  }

  return {
    done: false,
    nextQuestion,
    turnId: nextTurn.id,
    bridgeText, // T89: Return bridge text so UI can display it
    currentStage: newStage, // T91: Return current stage for UI
    stagesPlanned, // T91: Return total stages for UI
    stageName: getStageName(researchSnapshot, newStage), // T91: Return stage name
    planTier, // Return plan tier to frontend for conditional UI
  };
}

/**
 * Gets the current state of an interview session.
 */
export async function getInterviewState(
  sessionId: string,
  supabaseClient?: any
) {
  const supabase = supabaseClient || (await createClient());

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  const { data: turns, error: turnsError } = await supabase
    .from('turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (turnsError) {
    throw new Error('Failed to fetch turns');
  }

  return {
    session,
    turns,
    isComplete: session.status === 'feedback' || session.status === 'complete',
    currentTurn: turns.find((t: any) => !t.answer_text),
  };
}

/**
 * Generates a realistic interview introduction for paid tier interviews (T88).
 * Uses OpenAI to create a personalized, conversational opening based on
 * the role, company, and candidate background.
 */
export async function generateIntro(sessionId: string): Promise<string> {
  const supabase = await createClient();

  // Get session with research snapshot
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, research_snapshot, plan_tier, mode, intro_text')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  // If intro already exists, return it
  if (session.intro_text) {
    return session.intro_text;
  }

  const researchSnapshot = session.research_snapshot as ResearchSnapshot;
  const planTier = (session as any).plan_tier as PlanTier;
  const mode = (session as any).mode || 'text'; // T109: Get interview mode

  // Only generate intros for paid tier
  if (planTier !== 'paid') {
    return ''; // Free tier doesn't get intros
  }

  const role = researchSnapshot.job_spec_summary.role;
  const company = researchSnapshot.company_facts.name;
  const candidateName = researchSnapshot.cv_summary.name || 'candidate';
  const level = researchSnapshot.job_spec_summary.level || 'mid';
  const industry =
    researchSnapshot.interview_config?.industry ||
    researchSnapshot.company_facts.industry ||
    'Technology';
  const tone = researchSnapshot.interview_config?.tone || 'professional';

  const prompt = `You are conducting a ${level}-level interview for a ${role} position at ${company} in the ${industry} industry.

Generate a natural, conversational interview introduction (2-3 sentences) that:
1. Greets the candidate warmly
2. References the specific role and company
3. Sets expectations for the interview
4. Maintains a ${tone} tone

Candidate name: ${candidateName}
Role: ${role}
Company: ${company}
Level: ${level}

T109 Mode Requirements:
${
  mode === 'voice'
    ? `**VOICE MODE**: This introduction will be spoken via text-to-speech.
- Use natural, conversational language that flows well when spoken
- Avoid complex punctuation or formatting
- Keep sentences clear and easy to understand in audio
- Use short, natural pauses (commas) for breath points`
    : `**TEXT MODE**: This introduction will be displayed as text.
- Standard professional interview introduction format is fine
- Can use standard punctuation and formatting`
}

Return ONLY the introduction text, no additional formatting or explanations. Keep it concise and natural for ${mode} delivery.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.CONVERSATIONAL,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional interviewer. You create warm, natural interview introductions that make candidates feel comfortable while maintaining professionalism.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // Higher temperature for more natural variation
      max_tokens: 200,
    });

    const introText = response.choices[0]?.message?.content?.trim();

    if (!introText) {
      throw new Error('No introduction generated');
    }

    // Save intro to database
    await supabase
      .from('sessions')
      .update({ intro_text: introText })
      .eq('id', sessionId);

    return introText;
  } catch (error) {
    console.error('Error generating interview introduction:', error);
    throw new Error(
      `Failed to generate introduction: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * T106: Generate small talk questions for warm-up before the interview
 * This creates a comfortable, conversational opening to help candidates feel at ease
 * @param sessionId The session ID
 * @returns Array of 1-2 light, warm-up questions
 */
export async function generateSmallTalk(sessionId: string): Promise<string[]> {
  const supabase = await createClient();

  // Get session with research snapshot
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, research_snapshot, plan_tier')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  const planTier = (session as any).plan_tier as PlanTier;

  // Only generate small talk for paid tier
  if (planTier !== 'paid') {
    return []; // Free tier doesn't get small talk
  }

  const researchSnapshot = session.research_snapshot as ResearchSnapshot;
  const candidateName = researchSnapshot.cv_summary.name || 'candidate';
  const role = researchSnapshot.job_spec_summary.role;
  const company = researchSnapshot.company_facts.name;

  const prompt = `You are a professional interviewer about to conduct an interview for a ${role} position at ${company}.

Before diving into the formal interview questions, generate 1-2 light, warm-up questions to help ${candidateName} feel comfortable and ease into the conversation.

Guidelines:
1. Keep questions friendly, light, and open-ended
2. Avoid anything too personal or intrusive
3. Questions should help build rapport without being overly casual
4. Each question should be conversational (1 sentence)

Examples of good small-talk questions:
- "How has your day been going so far?"
- "I see you're based in [location] – how are things there?"
- "Before we start, can you tell me a bit about what drew you to apply for this role?"
- "How are you feeling about the interview today?"

Return ONLY the questions, one per line, no numbering or bullet points.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.CONVERSATIONAL,
      messages: [
        {
          role: 'system',
          content:
            'You are a warm, professional interviewer creating light small-talk questions to help candidates relax before an interview.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher temperature for natural variation
      max_tokens: 150,
    });

    const questionsText = response.choices[0]?.message?.content?.trim();

    if (!questionsText) {
      throw new Error('No small talk questions generated');
    }

    // Split by newlines and filter empty lines
    const questions = questionsText
      .split('\n')
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 2); // Max 2 questions

    console.log('[T106] Generated small talk questions:', questions);

    return questions;
  } catch (error) {
    console.error('[T106] Error generating small talk:', error);
    // Return fallback small talk questions
    return [
      'How has your day been going so far?',
      'Before we begin, tell me briefly what drew you to apply for this role?',
    ];
  }
}

/**
 * Generates a conversational bridge between questions that references
 * the candidate's previous answer (T89).
 * This makes the interview feel more natural and connected.
 * T167: Enhanced with stage transition announcements
 * @param sessionId The session ID
 * @param lastTurnId The ID of the previous turn (to reference the answer)
 * @param newStage If provided, indicates a stage transition to announce
 * @returns A short, natural bridge text (1-2 sentences)
 */
export async function generateBridge(
  sessionId: string,
  lastTurnId: string,
  newStage?: number
): Promise<string> {
  const supabase = await createClient();

  // Get session with research snapshot, plan_tier, and mode
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, research_snapshot, plan_tier, mode')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  const planTier = (session as any).plan_tier as PlanTier;
  const mode = (session as any).mode || 'text'; // T109: Get interview mode

  // Only generate bridges for paid tier
  if (planTier !== 'paid') {
    return ''; // Free tier doesn't get bridges
  }

  // Get the last turn with the answer
  const { data: lastTurn, error: turnError } = await supabase
    .from('turns')
    .select('*')
    .eq('id', lastTurnId)
    .single();

  if (turnError || !lastTurn) {
    throw new Error('Previous turn not found');
  }

  const researchSnapshot = session.research_snapshot as ResearchSnapshot;
  const lastQuestion = (lastTurn as any).question as Question;
  const lastAnswer = (lastTurn as any).answer_text as string;

  if (!lastAnswer) {
    return ''; // No answer to reference
  }

  const role = researchSnapshot.job_spec_summary.role;
  const tone = researchSnapshot.interview_config?.tone || 'professional';
  const stagesPlanned = (session as any).stages_planned || 1;

  // T167: Determine if this is a stage transition
  const isStageTransition = newStage !== undefined;
  const stageName = isStageTransition
    ? getStageName(researchSnapshot, newStage)
    : undefined;

  const prompt = `You are a professional interviewer conducting a ${role} interview.

The candidate just answered the following question:
"${lastQuestion.text}"

Their response was:
"${lastAnswer.substring(0, 500)}${lastAnswer.length > 500 ? '...' : ''}"

${
  isStageTransition && stageName
    ? `**IMPORTANT - STAGE TRANSITION**: This is the beginning of ${stageName}. Your bridge must announce this stage transition clearly and naturally.

Generate a brief, natural conversational bridge (2-3 sentences maximum) that:
1. Briefly acknowledges their previous answer
2. Announces the transition to ${stageName}
3. Creates excitement or focus for the new stage
4. Maintains a ${tone} tone
5. IMPORTANT: Do NOT include a question. This is just a contextual comment that will lead into the next question.

Examples of good stage transition bridges:
- "Thank you for that insight. Now, let's move into ${stageName}, where we'll explore your technical expertise more deeply."
- "Great answer. We're now transitioning to ${stageName}, focusing on role-specific scenarios."
- "I appreciate your perspective. Let's shift gears and begin ${stageName}, where we'll discuss leadership and team dynamics."`
    : `Generate a brief, natural conversational bridge (1-2 sentences maximum) that:
1. Acknowledges or reflects on something specific from their answer
2. Creates a smooth transition to the next question
3. Maintains a ${tone} tone
4. Sounds like a real interviewer would speak
5. IMPORTANT: Do NOT include a question. This is just a contextual comment that will lead into the next question.

Examples of good bridges:
- "That's an interesting approach to stakeholder management."
- "I appreciate your insight on technical debt and the trade-offs you mentioned."
- "Your experience with cross-functional teams sounds valuable."`
}

T109 Mode Requirements:
${
  mode === 'voice'
    ? `**VOICE MODE**: This bridge will be spoken via text-to-speech.
- Use natural, conversational language that flows well when spoken
- Avoid complex punctuation or formatting
- Keep sentences clear and easy to understand in audio
- Use simple, natural phrasing that sounds good when heard`
    : `**TEXT MODE**: This bridge will be displayed as text.
- Standard professional bridge format is fine
- Can use standard punctuation and formatting`
}

Return ONLY the bridge text, no quotes, no additional formatting. Keep it concise and conversational for ${mode} delivery. Do not end with a question.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.CONVERSATIONAL,
      messages: [
        {
          role: 'system',
          content:
            "You are a professional interviewer. You create natural, contextual transitions between interview questions that acknowledge the candidate's previous answers. You always respond with just the bridge text, nothing else.",
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // Higher temperature for natural variation
      max_tokens: 100,
    });

    const bridgeText = response.choices[0]?.message?.content?.trim();

    if (!bridgeText) {
      throw new Error('No bridge text generated');
    }

    return bridgeText;
  } catch (error) {
    console.error('Error generating interview bridge:', error);
    // Don't throw error - bridges are nice-to-have, not essential
    // Return empty string so interview can continue
    return '';
  }
}
