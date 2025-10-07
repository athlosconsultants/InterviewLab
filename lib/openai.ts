import OpenAI from 'openai';

// Initialize OpenAI client
// This should only be used on the server side
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default model for general tasks
export const DEFAULT_MODEL = 'gpt-4o-mini';

// Models for specific tasks
export const MODELS = {
  CHAT: 'gpt-4o-mini', // Fast and cost-effective for chat
  ANALYSIS: 'gpt-4o', // More capable for complex analysis
  WHISPER: 'whisper-1', // Speech to text
  TTS: 'tts-1', // Text to speech
} as const;
