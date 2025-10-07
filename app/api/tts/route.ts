import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { openai, MODELS } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, turnId } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!turnId) {
      return NextResponse.json(
        { error: 'Turn ID is required' },
        { status: 400 }
      );
    }

    // Verify turn belongs to user
    const { data: turn, error: turnError } = await supabase
      .from('turns')
      .select('id, user_id, tts_key')
      .eq('id', turnId)
      .eq('user_id', user.id)
      .single();

    if (turnError || !turn) {
      return NextResponse.json({ error: 'Turn not found' }, { status: 404 });
    }

    // Check if TTS already exists for this turn
    if (turn.tts_key) {
      // Get the existing audio URL
      const { data: audioData } = supabase.storage
        .from('audio')
        .getPublicUrl(turn.tts_key);

      return NextResponse.json({
        success: true,
        audioUrl: audioData.publicUrl,
        cached: true,
      });
    }

    // Generate TTS audio using OpenAI
    const mp3 = await openai.audio.speech.create({
      model: MODELS.TTS,
      voice: 'alloy', // Professional, neutral voice
      input: text,
      speed: 1.0,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Upload to Supabase Storage
    const storageKey = `${user.id}/tts_${turnId}_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(storageKey, buffer, {
        contentType: 'audio/mpeg',
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

    // Update turn with TTS key
    const { error: updateError } = await supabase
      .from('turns')
      .update({ tts_key: uploadData.path })
      .eq('id', turnId);

    if (updateError) {
      console.error('Failed to update turn with TTS key:', updateError);
    }

    // Get public URL
    const { data: audioData } = supabase.storage
      .from('audio')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      audioUrl: audioData.publicUrl,
      storageKey: uploadData.path,
      cached: false,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
