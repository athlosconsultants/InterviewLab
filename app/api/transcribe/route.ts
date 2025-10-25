import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { openai, MODELS } from '@/lib/openai';
import { isEntitled } from '@/lib/entitlements';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // T71: Voice transcription is premium-only
    const hasAccess = await isEntitled(user.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            'Voice mode requires a premium pass. Upgrade to unlock voice interviews.',
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: MODELS.WHISPER,
      language: 'en', // Can be made dynamic if needed
      response_format: 'text',
    });

    return NextResponse.json({
      success: true,
      text: transcription,
    });
  } catch (error: any) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
