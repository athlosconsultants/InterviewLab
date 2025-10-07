import { openai, MODELS } from './openai';
import type { ResearchSnapshot, Question } from './schema';

/**
 * Rubric structure for interview feedback
 */
export interface InterviewFeedback {
  overall: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
  };
  dimensions: {
    technical_competency: DimensionScore;
    communication: DimensionScore;
    problem_solving: DimensionScore;
    cultural_fit: DimensionScore;
  };
  tips: string[];
  exemplars: {
    strengths: string[];
    improvements: string[];
  };
  generated_at: string;
}

export interface DimensionScore {
  score: number; // 0-100
  feedback: string;
}

interface Turn {
  question: Question;
  answer_text: string;
  answer_digest?: any;
  timing?: any;
}

/**
 * Generates structured interview feedback using LLM
 */
export async function generateInterviewFeedback(
  snapshot: ResearchSnapshot,
  turns: Turn[]
): Promise<InterviewFeedback> {
  const prompt = buildFeedbackPrompt(snapshot, turns);

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.ANALYSIS,
      messages: [
        {
          role: 'system',
          content: `You are an expert interview evaluator and career coach. You analyze interview responses and provide structured, constructive feedback. Always be fair, specific, and actionable in your assessments.

Your feedback must be in JSON format matching this exact structure:
{
  "overall": {
    "score": number (0-100),
    "grade": "A" | "B" | "C" | "D" | "F",
    "summary": "string"
  },
  "dimensions": {
    "technical_competency": { "score": number, "feedback": "string" },
    "communication": { "score": number, "feedback": "string" },
    "problem_solving": { "score": number, "feedback": "string" },
    "cultural_fit": { "score": number, "feedback": "string" }
  },
  "tips": ["string", "string", "string"],
  "exemplars": {
    "strengths": ["string", "string"],
    "improvements": ["string", "string"]
  }
}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent scoring
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const feedback = JSON.parse(content) as InterviewFeedback;

    // Add timestamp
    feedback.generated_at = new Date().toISOString();

    // Validate structure
    validateFeedback(feedback);

    return feedback;
  } catch (error) {
    console.error('Feedback generation error:', error);
    throw new Error('Failed to generate interview feedback');
  }
}

/**
 * Builds the prompt for LLM feedback generation
 */
function buildFeedbackPrompt(
  snapshot: ResearchSnapshot,
  turns: Turn[]
): string {
  const { cv_summary, job_spec_summary, company_facts, competencies } =
    snapshot;

  const conversationText = turns
    .map((turn, index) => {
      return `
Question ${index + 1} (${turn.question.category} - ${turn.question.difficulty}):
${turn.question.text}

Candidate's Answer:
${turn.answer_text || '(No answer provided)'}

${turn.timing?.duration_ms ? `Time taken: ${Math.round(turn.timing.duration_ms / 1000)}s` : ''}
${turn.timing?.replay_count ? `Replays: ${turn.timing.replay_count}` : ''}
---`;
    })
    .join('\n\n');

  return `# Interview Evaluation Task

## Candidate Profile
- Name: ${cv_summary.name}
- Experience: ${cv_summary.experience_years} years
- Key Skills: ${cv_summary.key_skills.join(', ')}
- Recent Role: ${cv_summary.recent_roles[0]}

## Target Role
- Position: ${job_spec_summary.role} (${job_spec_summary.level} level)
- Company: ${company_facts.name} (${company_facts.industry})
- Key Requirements: ${job_spec_summary.key_requirements.join(', ')}

## Required Competencies
- Technical: ${competencies.technical.join(', ')}
- Behavioral: ${competencies.behavioral.join(', ')}
- Domain: ${competencies.domain.join(', ')}

## Interview Conversation
${conversationText}

## Your Task
Evaluate this interview performance and provide structured feedback. Consider:

1. **Technical Competency**: How well do the answers demonstrate required technical skills and domain knowledge?
2. **Communication**: Clarity, structure, and professionalism of responses
3. **Problem Solving**: Analytical thinking, approach to challenges
4. **Cultural Fit**: Alignment with company values and role expectations

Provide an overall score (0-100), dimension scores, 3-5 actionable tips, and identify specific strengths and areas for improvement.

Be fair but constructive. Reference specific answers when providing feedback.`;
}

/**
 * Validates the feedback structure
 */
function validateFeedback(
  feedback: any
): asserts feedback is InterviewFeedback {
  if (!feedback.overall || typeof feedback.overall.score !== 'number') {
    throw new Error('Invalid feedback structure: missing overall score');
  }

  if (!feedback.dimensions) {
    throw new Error('Invalid feedback structure: missing dimensions');
  }

  const requiredDimensions = [
    'technical_competency',
    'communication',
    'problem_solving',
    'cultural_fit',
  ];

  for (const dim of requiredDimensions) {
    if (
      !feedback.dimensions[dim] ||
      typeof feedback.dimensions[dim].score !== 'number'
    ) {
      throw new Error(`Invalid feedback structure: missing dimension ${dim}`);
    }
  }

  if (!Array.isArray(feedback.tips) || feedback.tips.length === 0) {
    throw new Error(
      'Invalid feedback structure: tips must be a non-empty array'
    );
  }

  if (!feedback.exemplars?.strengths || !feedback.exemplars?.improvements) {
    throw new Error('Invalid feedback structure: missing exemplars');
  }
}

/**
 * Calculates grade from score
 */
export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
