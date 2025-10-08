import { openai, MODELS } from './openai';
import { createClient } from './supabase-server';
import type {
  ResearchSnapshot,
  Question,
  AnswerDigest,
  PlanTier,
} from './schema';

/**
 * T91: Calculate questions per stage based on total questions and number of stages
 */
function calculateQuestionsPerStage(
  totalQuestions: number,
  numStages: number
): number {
  // Distribute questions evenly across stages (5-10 per stage)
  const questionsPerStage = Math.floor(totalQuestions / numStages);
  // Ensure minimum of 5 questions per stage
  return Math.max(5, questionsPerStage);
}

/**
 * T91: Determine if we should advance to the next stage
 */
function shouldAdvanceStage(
  currentStage: number,
  stagesPlanned: number,
  questionsInCurrentStage: number,
  questionsPerStage: number
): boolean {
  // Don't advance if we're at the last stage
  if (currentStage >= stagesPlanned) {
    return false;
  }

  // Advance when we've reached the target number of questions for this stage
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
}): Promise<Question> {
  const {
    researchSnapshot,
    previousTurns = [],
    questionNumber,
    totalQuestions,
    currentStage = 1,
    stagesPlanned = 1,
    questionsInStage = 0,
  } = params;

  // T90: Calculate interview progress for progressive difficulty
  const progress = questionNumber / totalQuestions;
  const targetDifficulty =
    progress < 0.33 ? 'easy' : progress < 0.66 ? 'medium' : 'hard';

  // T91: Get current stage information
  const stageName = getStageName(researchSnapshot, currentStage);
  const stages = researchSnapshot.interview_config?.stages || [];
  const isMultiStage = stagesPlanned > 1;
  const questionsPerStage = isMultiStage
    ? calculateQuestionsPerStage(totalQuestions, stagesPlanned)
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

# Competencies to Assess:
Technical: ${researchSnapshot.competencies.technical.join(', ')}
Behavioral: ${researchSnapshot.competencies.behavioral.join(', ')}
Domain: ${researchSnapshot.competencies.domain.join(', ')}

# Previous Conversation:
${conversationContext}

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

**Progressive Difficulty (Target: ${targetDifficulty}):**
- Questions 1-${Math.ceil(totalQuestions / 3)}: Easy - broad, experience-based, allow candidate to warm up
- Questions ${Math.ceil(totalQuestions / 3) + 1}-${Math.ceil((totalQuestions * 2) / 3)}: Medium - specific scenarios, problem-solving, trade-offs
- Questions ${Math.ceil((totalQuestions * 2) / 3) + 1}-${totalQuestions}: Hard - complex situations, judgment calls, leadership challenges

**Question Quality:**
- Make questions open-ended (avoid yes/no)
- Be specific and clear
- Connect to both their experience AND the role requirements
${isMultiStage ? `- The question MUST be category "${stageCategory}" to match the current stage "${stageName}"` : '- Mix question types: technical, behavioral, and situational'}
- Ensure the question can be answered in 90 seconds

Return ONLY valid JSON with no additional text:

{
  "text": "The interview question text",
  "category": "${isMultiStage ? stageCategory : 'technical|behavioral|situational'}",
  "difficulty": "${targetDifficulty}",
  "time_limit": 90,
  "follow_up": ${previousTurns.length > 0 ? 'true' : 'false'}
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.ANALYSIS,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional interview coach. You always respond with valid JSON only, no markdown formatting, no additional text.',
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
export async function startInterview(sessionId: string) {
  const supabase = await createClient();

  // Get the session with research snapshot
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, user_id, status, research_snapshot, limits')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  // Check if session is in correct state
  if (session.status !== 'ready' && session.status !== 'running') {
    throw new Error(`Cannot start interview in ${session.status} state`);
  }

  // Generate first question
  const question = await generateQuestion({
    researchSnapshot: session.research_snapshot as ResearchSnapshot,
    previousTurns: [],
    questionNumber: 1,
    totalQuestions: (session.limits as any)?.question_cap || 3,
  });

  // Create first turn
  const { data: turn, error: turnError } = await supabase
    .from('turns')
    .insert({
      session_id: sessionId,
      user_id: session.user_id,
      question: question,
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

  // Update session status to running
  await supabase
    .from('sessions')
    .update({ status: 'running' })
    .eq('id', sessionId);

  return {
    turnId: turn.id,
    question,
  };
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

  // T91: Get session with stage information
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select(
      '*, research_snapshot, limits, plan_tier, current_stage, stages_planned'
    )
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  // T90: Fetch turns with answer_text for context-aware question generation
  const { data: allTurns, error: turnsError } = await supabase
    .from('turns')
    .select('question, answer_digest, answer_text')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (turnsError) {
    throw new Error('Failed to fetch turns');
  }

  const questionCap = (session.limits as any)?.question_cap || 3;
  const planTier = (session as any).plan_tier || 'free';

  // T91: Get stage information
  const currentStage = (session as any).current_stage || 1;
  const stagesPlanned = (session as any).stages_planned || 1;
  const researchSnapshot = session.research_snapshot as ResearchSnapshot;

  // T85: Enforce free tier restrictions (3 questions max)
  if (planTier === 'free' && allTurns.length >= 3) {
    // End interview for free tier
    await supabase
      .from('sessions')
      .update({ status: 'feedback' })
      .eq('id', sessionId);

    return {
      done: true,
      nextQuestion: null,
    };
  }

  // Check if we've reached the question limit (paid tier or general cap)
  if (allTurns.length >= questionCap) {
    // End interview
    await supabase
      .from('sessions')
      .update({ status: 'feedback' })
      .eq('id', sessionId);

    return {
      done: true,
      nextQuestion: null,
    };
  }

  // T91: Calculate questions in current stage
  const questionsPerStage =
    stagesPlanned > 1
      ? calculateQuestionsPerStage(questionCap, stagesPlanned)
      : questionCap;

  // Count how many questions we've answered in total
  const totalAnswered = allTurns.length;

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
      questionsPerStage
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

  // Generate next question (T91: with stage information)
  const nextQuestion = await generateQuestion({
    researchSnapshot,
    previousTurns: allTurns as any,
    questionNumber: allTurns.length + 1,
    totalQuestions: questionCap,
    currentStage: newStage,
    stagesPlanned,
    questionsInStage: newStage !== currentStage ? 0 : questionsInCurrentStage,
  });

  // T89: Generate bridge text referencing the previous answer (paid tier only)
  let bridgeText: string | null = null;
  if (planTier === 'paid') {
    try {
      bridgeText = await generateBridge(sessionId, turnId);
    } catch (error) {
      console.error('Failed to generate bridge:', error);
      // Continue without bridge if generation fails
    }
  }

  // Create next turn (T89: with bridge_text)
  const { data: nextTurn, error: nextTurnError } = await supabase
    .from('turns')
    .insert({
      session_id: sessionId,
      user_id: session.user_id,
      question: nextQuestion,
      bridge_text: bridgeText, // T89: Add bridge text
      timing: {
        started_at: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (nextTurnError) {
    throw new Error('Failed to create next turn');
  }

  return {
    done: false,
    nextQuestion,
    turnId: nextTurn.id,
    bridgeText, // T89: Return bridge text so UI can display it
    currentStage: newStage, // T91: Return current stage for UI
    stagesPlanned, // T91: Return total stages for UI
    stageName: getStageName(researchSnapshot, newStage), // T91: Return stage name
  };
}

/**
 * Gets the current state of an interview session.
 */
export async function getInterviewState(sessionId: string) {
  const supabase = await createClient();

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
    currentTurn: turns.find((t) => !t.answer_text),
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

Return ONLY the introduction text, no additional formatting or explanations. Keep it concise and natural.`;

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
 * Generates a conversational bridge between questions that references
 * the candidate's previous answer (T89).
 * This makes the interview feel more natural and connected.
 * @param sessionId The session ID
 * @param lastTurnId The ID of the previous turn (to reference the answer)
 * @returns A short, natural bridge text (1-2 sentences)
 */
export async function generateBridge(
  sessionId: string,
  lastTurnId: string
): Promise<string> {
  const supabase = await createClient();

  // Get session with research snapshot and plan_tier
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, research_snapshot, plan_tier')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  const planTier = (session as any).plan_tier as PlanTier;

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

  const prompt = `You are a professional interviewer conducting a ${role} interview.

The candidate just answered the following question:
"${lastQuestion.text}"

Their response was:
"${lastAnswer.substring(0, 500)}${lastAnswer.length > 500 ? '...' : ''}"

Generate a brief, natural conversational bridge (1-2 sentences) that:
1. Acknowledges or reflects on something specific from their answer
2. Creates a smooth transition to the next question
3. Maintains a ${tone} tone
4. Sounds like a real interviewer would speak

Examples of good bridges:
- "That's an interesting approach to stakeholder management. Building on that experience..."
- "I appreciate your insight on technical debt. Let's explore another aspect of your work..."
- "Your experience with cross-functional teams sounds valuable. Moving forward..."

Return ONLY the bridge text, no quotes, no additional formatting. Keep it concise and conversational.`;

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
