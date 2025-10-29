/**
 * Cartesia.ai TTS Integration
 *
 * Replaces OpenAI TTS with Cartesia for voice generation.
 * All API calls are server-side only - no client exposure.
 */

const CARTESIA_API_URL = 'https://api.cartesia.ai/tts/bytes';

interface CartesiaConfig {
  apiKey: string;
  model: string;
  voiceId: string;
  version: string;
}

/**
 * Get Cartesia configuration from environment variables
 */
function getCartesiaConfig(): CartesiaConfig {
  const apiKey = process.env.CARTESIA_API_KEY;
  const model = process.env.CARTESIA_MODEL || 'sonic-3';
  const voiceId =
    process.env.CARTESIA_VOICE_ID || '694f9389-aac1-45b6-b726-9d9369183238';
  const version = process.env.CARTESIA_VERSION || '2025-04-16';

  if (!apiKey) {
    throw new Error('CARTESIA_API_KEY is not set in environment variables');
  }

  return { apiKey, model, voiceId, version };
}

/**
 * Generate speech audio using Cartesia.ai
 *
 * @param text - The text to convert to speech
 * @returns Audio buffer (MP3 format)
 * @throws Error if the API call fails
 */
export async function generateCartesiaSpeech(text: string): Promise<Buffer> {
  const config = getCartesiaConfig();

  try {
    const response = await fetch(CARTESIA_API_URL, {
      method: 'POST',
      headers: {
        'Cartesia-Version': config.version,
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: text,
        model_id: config.model,
        voice: {
          mode: 'id',
          id: config.voiceId,
        },
        output_format: {
          container: 'mp3',
          encoding: 'mp3',
          sample_rate: 44100,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cartesia API error (${response.status}): ${errorText}`);
    }

    // Get the audio buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[Cartesia] Speech generation failed:', error);
    throw error;
  }
}

/**
 * Check if Cartesia is properly configured
 * Useful for graceful degradation or startup checks
 */
export function isCartesiaConfigured(): boolean {
  return !!process.env.CARTESIA_API_KEY;
}
