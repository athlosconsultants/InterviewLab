import { NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';
import { createClient } from '@/lib/supabase-server';

// Roles to generate questions for
const ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'Designer',
  'Marketing Manager',
  'Consultant',
];

/**
 * T62 & T63: Generate preview questions using premium interview prompt logic
 * This endpoint generates 8-12 high-quality behavioral questions per role
 * and stores them in the preview_questions table for random serving
 *
 * T64: Called hourly by Vercel Cron job
 */
async function regenerateQuestions() {
  try {
    console.log('[Preview Questions] Starting regeneration job...');

    const supabase = await createClient();
    const generatedQuestions: Array<{ role: string; question: string }> = [];

    // Generate questions for each role
    for (const role of ROLES) {
      console.log(`[Preview Questions] Generating for role: ${role}`);

      // T63: Use premium prompt logic for quality consistency
      const prompt = `You are an expert interview coach generating high-quality behavioral interview questions.

# Task:
Generate 10 unique, professional behavioral interview questions for a ${role} role.

# Requirements:
1. **Quality**: Each question should be specific, thought-provoking, and commonly asked in real interviews
2. **STAR Method Compatible**: Questions should naturally elicit Situation, Task, Action, Result responses
3. **Variety**: Mix different competencies:
   - Technical problem-solving
   - Collaboration & teamwork
   - Leadership & initiative
   - Conflict resolution
   - Time management & prioritization
   - Communication
   - Innovation & creativity
   - Adaptability

4. **Level**: Target mid-level professionals (2-5 years experience)
5. **Specificity**: Questions should be specific to ${role} but universal enough for various companies
6. **Format**: Start with "Tell me about...", "Describe a time...", or "Walk me through..."

# Examples of Good Questions:
- "Tell me about a time you had to make a difficult trade-off decision under tight deadlines."
- "Describe a situation where you disagreed with a team member's approach and how you resolved it."
- "Walk me through a project that didn't go as planned and how you adapted."

Return ONLY a JSON array of strings (the questions), no other text:

["question 1", "question 2", "question 3", ...]`;

      try {
        const response = await openai.chat.completions.create({
          model: MODELS.ANALYSIS, // Use same model as premium interviews
          messages: [
            {
              role: 'system',
              content:
                'You are an expert interview coach. You always respond with valid JSON arrays only, no markdown formatting, no additional text.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8, // Higher temp for variety, but not too creative
          response_format: { type: 'json_object' }, // Enforce JSON response
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          console.error(
            `[Preview Questions] No content from OpenAI for ${role}`
          );
          continue;
        }

        // Parse response - handle both array and object with questions array
        let questions: string[];
        try {
          const parsed = JSON.parse(content);
          questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
        } catch (parseError) {
          console.error(
            `[Preview Questions] Failed to parse JSON for ${role}:`,
            parseError
          );
          continue;
        }

        if (!Array.isArray(questions) || questions.length === 0) {
          console.error(
            `[Preview Questions] Invalid questions array for ${role}`
          );
          continue;
        }

        // Add to collection
        for (const question of questions) {
          if (typeof question === 'string' && question.length > 10) {
            generatedQuestions.push({ role, question });
          }
        }

        console.log(
          `[Preview Questions] Generated ${questions.length} questions for ${role}`
        );
      } catch (roleError) {
        console.error(
          `[Preview Questions] Error generating for ${role}:`,
          roleError
        );
        // Continue with other roles
      }
    }

    if (generatedQuestions.length === 0) {
      console.error('[Preview Questions] No questions generated');
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: 500 }
      );
    }

    // Clear old questions and insert new ones
    console.log(
      `[Preview Questions] Replacing old questions with ${generatedQuestions.length} new ones`
    );

    // Delete all existing preview questions
    const { error: deleteError } = await supabase
      .from('preview_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error(
        '[Preview Questions] Failed to delete old questions:',
        deleteError
      );
    }

    // Insert new questions
    const { error: insertError } = await supabase
      .from('preview_questions')
      .insert(generatedQuestions);

    if (insertError) {
      console.error(
        '[Preview Questions] Failed to insert new questions:',
        insertError
      );
      return NextResponse.json(
        { error: 'Failed to save questions to database' },
        { status: 500 }
      );
    }

    console.log(
      `[Preview Questions] Successfully regenerated ${generatedQuestions.length} questions`
    );

    // T67: Log analytics event for question generation
    // Note: This runs server-side via cron, so we'll log to console for now
    // In production, you could push to analytics_events table directly
    const breakdown = ROLES.map((role) => ({
      role,
      count: generatedQuestions.filter((q) => q.role === role).length,
    }));

    console.log('[Analytics] preview_question_generated', {
      total: generatedQuestions.length,
      breakdown,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      generated: generatedQuestions.length,
      breakdown,
    });
  } catch (error) {
    console.error('[Preview Questions] Error in regeneration job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// T64: Support GET for Vercel Cron
export async function GET() {
  return regenerateQuestions();
}

// Also support POST for manual triggering
export async function POST() {
  return regenerateQuestions();
}
