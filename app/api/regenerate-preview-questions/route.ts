import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';
import { createServiceRoleClient } from '@/lib/supabase-server';

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
 * Verify the request is from Vercel Cron or an authorized admin
 */
function isAuthorized(request: NextRequest): boolean {
  // Check for Vercel Cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Fallback: Check for admin credentials (for manual triggering)
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminUsername && adminPassword && authHeader) {
    const base64Credentials = authHeader.split(' ')[1];
    if (base64Credentials) {
      const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'ascii'
      );
      const [username, password] = credentials.split(':');
      return username === adminUsername && password === adminPassword;
    }
  }

  return false;
}

/**
 * T62 & T63: Generate preview questions using premium interview prompt logic
 * This endpoint generates 8-12 high-quality behavioral questions per role
 * and stores them in the preview_questions table for random serving
 *
 * T64: Called hourly by Vercel Cron job
 * SECURITY: Protected by CRON_SECRET or admin Basic Auth
 */
async function regenerateQuestions() {
  try {
    console.log('[Preview Questions] Starting regeneration job...');

    // Use service role client to bypass RLS for insert/delete operations
    const supabase = createServiceRoleClient();
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

// T64: Support GET for Vercel Cron (with auth check)
export async function GET(request: NextRequest) {
  // SECURITY: Verify authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          'Unauthorized. This endpoint requires CRON_SECRET or admin credentials.',
      },
      { status: 401 }
    );
  }

  return regenerateQuestions();
}

// Also support POST for manual triggering (with auth check)
export async function POST(request: NextRequest) {
  // SECURITY: Verify authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          'Unauthorized. This endpoint requires CRON_SECRET or admin credentials.',
      },
      { status: 401 }
    );
  }

  return regenerateQuestions();
}
