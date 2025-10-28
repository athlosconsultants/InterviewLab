import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Fallback questions in case DB is empty
const FALLBACK_QUESTIONS: Record<string, string> = {
  'Software Engineer':
    'Tell me about a time you had to debug a complex production issue under time pressure.',
  'Product Manager':
    'Describe a situation where you had to make a difficult product prioritization decision.',
  'Data Scientist':
    'Walk me through a project where your initial analysis led to unexpected insights.',
  Designer:
    'Tell me about a time you had to advocate for a design decision that stakeholders initially disagreed with.',
  'Marketing Manager':
    "Describe a campaign that didn't perform as expected and how you pivoted.",
  Consultant:
    'Tell me about a time you had to deliver difficult recommendations to a client.',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');

    if (!role) {
      return NextResponse.json(
        { error: 'role parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch up to 10 cached questions for this role
    const { data: questions, error } = await supabase
      .from('preview_questions')
      .select('question')
      .eq('role', role)
      .limit(10);

    if (error) {
      console.error('[Preview Question API] Database error:', error);
      // Return fallback on DB error
      return NextResponse.json({
        question:
          FALLBACK_QUESTIONS[role] || FALLBACK_QUESTIONS['Software Engineer'],
        source: 'fallback',
      });
    }

    // If we have cached questions, return a random one
    if (questions && questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      return NextResponse.json({
        question: questions[randomIndex].question,
        source: 'cached',
      });
    }

    // If no cached questions, return fallback
    return NextResponse.json({
      question:
        FALLBACK_QUESTIONS[role] || FALLBACK_QUESTIONS['Software Engineer'],
      source: 'fallback',
    });
  } catch (error) {
    console.error('[Preview Question API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
