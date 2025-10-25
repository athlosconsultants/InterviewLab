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

    const { text, turnId, sessionId, type = 'question' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // T70: Check session tier and question number for free tier restrictions
    if (sessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('plan_tier')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      // T70: Free tier can only play Q1 audio
      if (session.plan_tier === 'free' && turnId) {
        // Check if this is Q1 by counting turns
        const { data: turns, error: turnsError } = await supabase
          .from('turns')
          .select('id')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (!turnsError && turns) {
          const questionNumber = turns.findIndex((t) => t.id === turnId) + 1;
          if (questionNumber > 1) {
            return NextResponse.json(
              {
                error:
                  'Free tier only supports voice playback for the first question',
              },
              { status: 403 }
            );
          }
        }
      }
    }

    // T114: turnId is optional for intro/bridge audio
    // For intro/bridge, we generate audio without caching in turns table
    let ttsKey: string | null = null;

    if (turnId) {
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
        // Get a signed URL for the cached audio (valid for 1 hour)
        const { data: audioData, error: signError } = await supabase.storage
          .from('audio')
          .createSignedUrl(turn.tts_key, 3600);

        if (signError || !audioData) {
          console.error(
            'Failed to get signed URL for cached audio:',
            signError
          );
          // Fall through to regenerate
        } else {
          return NextResponse.json({
            success: true,
            audioUrl: audioData.signedUrl,
            cached: true,
          });
        }
      }

      ttsKey = turn.tts_key;
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

    // T114: Generate storage key based on type
    const storageKey = turnId
      ? `${user.id}/tts_${turnId}_${Date.now()}.mp3`
      : `${user.id}/tts_${type}_${Date.now()}.mp3`;

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

    // T114: Only update turn if turnId is provided
    if (turnId) {
      const { error: updateError } = await supabase
        .from('turns')
        .update({ tts_key: uploadData.path })
        .eq('id', turnId);

      if (updateError) {
        console.error('Failed to update turn with TTS key:', updateError);
      }
    }

    // Get signed URL (valid for 1 hour)
    const { data: audioData, error: signError } = await supabase.storage
      .from('audio')
      .createSignedUrl(uploadData.path, 3600);

    if (signError || !audioData) {
      console.error('Failed to create signed URL:', signError);
      return NextResponse.json(
        { error: 'Failed to generate audio URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioUrl: audioData.signedUrl,
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
