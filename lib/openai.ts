import OpenAI from 'openai';

// Lazy-initialized OpenAI client
// This prevents build-time errors when env vars aren't available
let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Legacy export for backward compatibility
// This should only be used on the server side
export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    const client = getOpenAIClient();
    return (client as any)[prop];
  },
});

// Default model for general tasks
export const DEFAULT_MODEL = 'gpt-4o-mini';

// Models for specific tasks
export const MODELS = {
  CHAT: 'gpt-4o-mini', // Fast and cost-effective for chat
  ANALYSIS: 'gpt-4o', // More capable for complex analysis
  CONVERSATIONAL: 'gpt-4o-mini', // For natural, conversational text (intros, bridges)
  WHISPER: 'whisper-1', // Speech to text
  TTS: 'tts-1', // Text to speech
} as const;
