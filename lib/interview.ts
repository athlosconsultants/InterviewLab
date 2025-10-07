import { openai, MODELS } from './openai';
import { createClient } from './supabase-server';
import type { ResearchSnapshot, Question, AnswerDigest } from './schema';

/**
 * Generates an interview question using OpenAI based on the research snapshot
 * and previous conversation context.
 */
export async function generateQuestion(params: {
  researchSnapshot: ResearchSnapshot;
  previousTurns?: Array<{ question: Question; answer_digest?: AnswerDigest }>;
  questionNumber: number;
  totalQuestions: number;
}): Promise<Question> {
  const {
    researchSnapshot,
    previousTurns = [],
    questionNumber,
    totalQuestions,
  } = params;

  // Build context from previous turns
  const conversationContext =
    previousTurns.length > 0
      ? previousTurns
          .map(
            (turn, idx) =>
              `Q${idx + 1}: ${turn.question.text}\nA${idx + 1}: ${turn.answer_digest?.summary || 'No answer provided'}`
          )
          .join('\n\n')
      : 'No previous questions.';

  const prompt = `You are an expert interview coach conducting a professional job interview. Generate the next interview question based on the candidate's background and the role requirements.

# Candidate Background:
${researchSnapshot.cv_summary.summary}
Key Skills: ${researchSnapshot.cv_summary.key_skills.join(', ')}

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
Generate question ${questionNumber} of ${totalQuestions}. 

Guidelines:
- Make questions relevant to both the candidate's experience and the role requirements
- Mix question types: technical, behavioral, and situational
- Start with easier questions and increase difficulty
- Build on previous answers when relevant
- Keep questions clear and focused
- Avoid yes/no questions

Return ONLY valid JSON with no additional text:

{
  "text": "The interview question text",
  "category": "technical|behavioral|situational",
  "difficulty": "easy|medium|hard",
  "time_limit": 90,
  "follow_up": false
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

  // Get session and all turns (T85 - with plan_tier)
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, research_snapshot, limits, plan_tier')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  const { data: allTurns, error: turnsError } = await supabase
    .from('turns')
    .select('question, answer_digest')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (turnsError) {
    throw new Error('Failed to fetch turns');
  }

  const questionCap = (session.limits as any)?.question_cap || 3;
  const planTier = (session as any).plan_tier || 'free';

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

  // Generate next question
  const nextQuestion = await generateQuestion({
    researchSnapshot: session.research_snapshot as ResearchSnapshot,
    previousTurns: allTurns as any,
    questionNumber: allTurns.length + 1,
    totalQuestions: questionCap,
  });

  // Create next turn
  const { data: nextTurn, error: nextTurnError } = await supabase
    .from('turns')
    .insert({
      session_id: sessionId,
      user_id: session.user_id,
      question: nextQuestion,
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
