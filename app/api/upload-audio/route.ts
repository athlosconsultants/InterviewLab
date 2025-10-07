import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const turnId = formData.get('turnId') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!turnId) {
      return NextResponse.json(
        { error: 'Turn ID is required' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const storageKey = `${user.id}/answer_${turnId}_${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(storageKey, audioFile, {
        contentType: audioFile.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      storageKey: uploadData.path,
    });
  } catch (error) {
    console.error('Upload audio API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    );
  }
}
