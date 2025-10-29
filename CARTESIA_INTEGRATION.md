# Cartesia.ai TTS Integration Guide

## Overview

The application now uses **Cartesia.ai** for text-to-speech (TTS) voice generation, replacing the previous OpenAI TTS implementation. All existing UI/UX, caching, and authorization logic remains unchanged.

---

## What Changed

### ✅ Replaced

- **Old:** OpenAI `tts-1` model with `alloy` voice
- **New:** Cartesia.ai `sonic-3` model with configurable voice ID

### ✅ Unchanged

- Voice orb UI and animations
- Audio playback controls
- Caching mechanism (Supabase Storage)
- Authorization checks (free/paid tier restrictions)
- All React components and frontend logic

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React Components)                            │
│  - QuestionBubble.tsx                                   │
│  - VoiceOrb.tsx (UI only)                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ fetch('/api/tts', { text, turnId })
                 │
┌────────────────▼────────────────────────────────────────┐
│  Backend API Route                                      │
│  /app/api/tts/route.ts                                 │
│  - Auth checks                                         │
│  - Tier validation                                     │
│  - Cache lookup                                        │
│  - Calls generateCartesiaSpeech()                     │
│  - Stores in Supabase Storage                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ generateCartesiaSpeech(text)
                 │
┌────────────────▼────────────────────────────────────────┐
│  Cartesia Helper                                        │
│  /lib/cartesia.ts                                      │
│  - Calls Cartesia API                                  │
│  - Returns MP3 buffer                                  │
│  - Never exposes API key to client                     │
└─────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```bash
CARTESIA_API_KEY=your_api_key_here
CARTESIA_MODEL=sonic-3
CARTESIA_VOICE_ID=694f9389-aac1-45b6-b726-9d9369183238
CARTESIA_VERSION=2025-04-16
```

**For Production (Vercel/Whop):**

1. Go to your deployment platform's environment variables settings
2. Add all four variables above
3. Redeploy the application

### 2. Get Your Cartesia API Key

1. Visit [cartesia.ai](https://cartesia.ai)
2. Sign up or log in
3. Navigate to API settings
4. Generate a new API key
5. Copy and add to your environment variables

### 3. Test Locally

```bash
# Install dependencies (if not already done)
pnpm install

# Start dev server
pnpm dev

# Test the integration:
# 1. Sign in to the app
# 2. Start a voice interview
# 3. The interviewer's questions should play with Cartesia voice
```

---

## Voice Customization

### Changing the Voice

1. Browse Cartesia's [voice library](https://cartesia.ai/voices)
2. Find a voice you like and copy its ID
3. Update `CARTESIA_VOICE_ID` in your environment variables
4. Restart the dev server or redeploy

### Changing the Model

The default model is `sonic-3` (latest, highest quality). To change:

```bash
CARTESIA_MODEL=sonic-2.5  # Older, faster model
```

---

## API Reference

### `generateCartesiaSpeech(text: string): Promise<Buffer>`

**Location:** `/lib/cartesia.ts`

**Description:** Generates MP3 audio from text using Cartesia.ai

**Parameters:**

- `text` (string): The text to convert to speech

**Returns:**

- `Promise<Buffer>`: MP3 audio buffer

**Throws:**

- `Error`: If CARTESIA_API_KEY is not configured
- `Error`: If the API call fails

**Example:**

```typescript
import { generateCartesiaSpeech } from '@/lib/cartesia';

const audioBuffer = await generateCartesiaSpeech('Hello, world!');
// audioBuffer is a Buffer containing MP3 audio data
```

---

## Caching Behavior

The TTS system caches generated audio to improve performance and reduce costs:

1. **First Request:** Generates audio via Cartesia → Stores in Supabase Storage → Returns signed URL
2. **Subsequent Requests:** Returns cached audio signed URL (no API call)
3. **Cache Key:** Stored in `turns.tts_key` column
4. **Cache Validity:** Signed URLs expire after 1 hour (regenerated on demand)

---

## Free vs Paid Tier

### Free Tier Restrictions

- Voice playback limited to **first question only** (Q1)
- Subsequent questions: text-only mode
- Enforced in `/app/api/tts/route.ts` (lines 38-59)

### Paid Tier

- Voice playback for **all questions**
- Intro, bridge, and small talk audio enabled
- No restrictions

---

## Error Handling

### Graceful Degradation

If Cartesia API fails:

1. Error is logged to console
2. API returns 500 with JSON error
3. Frontend (QuestionBubble) shows toast: "Audio unavailable"
4. User can still see the text question
5. Interview continues normally

### Common Errors

| Error                         | Cause                  | Solution                               |
| ----------------------------- | ---------------------- | -------------------------------------- |
| `CARTESIA_API_KEY is not set` | Missing env variable   | Add `CARTESIA_API_KEY` to `.env.local` |
| `Cartesia API error (401)`    | Invalid API key        | Check your API key is correct          |
| `Cartesia API error (429)`    | Rate limit exceeded    | Wait or upgrade Cartesia plan          |
| `Failed to upload audio`      | Supabase storage issue | Check storage bucket permissions       |

---

## Production Checklist

- [ ] `CARTESIA_API_KEY` added to Vercel/Whop environment variables
- [ ] All 4 Cartesia env vars configured
- [ ] Application redeployed after env var changes
- [ ] Test voice playback in production
- [ ] Verify caching works (check Supabase Storage)
- [ ] Check Vercel function logs for errors
- [ ] Monitor Cartesia API usage dashboard

---

## Monitoring

### Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `/api/tts`
3. Check logs for:
   - `[Cartesia] Speech generation failed` → API errors
   - `Failed to upload audio` → Storage errors
   - `Failed to create signed URL` → URL generation errors

### Cartesia Dashboard

1. Visit [cartesia.ai/dashboard](https://cartesia.ai/dashboard)
2. Monitor:
   - API requests per day
   - Characters processed
   - Rate limit status
   - Account balance

---

## Cost Comparison

### Cartesia.ai (New)

- **Pricing:** ~$0.000015/character (varies by model)
- **Quality:** High-quality, natural-sounding voice
- **Latency:** ~500-800ms typical

### OpenAI TTS (Old)

- **Pricing:** $0.000015/character (tts-1)
- **Quality:** Good quality
- **Latency:** ~1-2s typical

**Result:** Similar cost, better latency with Cartesia.

---

## Troubleshooting

### Audio not playing

**Check:**

1. Browser console for errors
2. Vercel function logs for API errors
3. Supabase Storage bucket has audio files
4. Environment variables are set correctly

**Try:**

```bash
# Test the API directly
curl -X POST https://your-domain.com/api/tts \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"text":"Hello world"}'
```

### "Audio unavailable" toast

This means the TTS API returned an error. Check:

1. Cartesia API key is valid
2. Cartesia account has credits
3. Text is not empty
4. User is authenticated

---

## Rollback Plan

If you need to revert to OpenAI TTS:

1. **Restore old code:**

   ```bash
   git revert <commit-hash-of-cartesia-integration>
   ```

2. **Or manually change:**

   ```typescript
   // In app/api/tts/route.ts
   import { openai, MODELS } from '@/lib/openai';

   // Replace this:
   const buffer = await generateCartesiaSpeech(text);

   // With this:
   const mp3 = await openai.audio.speech.create({
     model: MODELS.TTS,
     voice: 'alloy',
     input: text,
   });
   const buffer = Buffer.from(await mp3.arrayBuffer());
   ```

3. **Remove Cartesia env vars**

4. **Redeploy**

---

## Support

- **Cartesia.ai:** [support@cartesia.ai](mailto:support@cartesia.ai)
- **Documentation:** [docs.cartesia.ai](https://docs.cartesia.ai)
- **Voice Library:** [cartesia.ai/voices](https://cartesia.ai/voices)

---

## Next Steps

- [ ] Monitor usage in first week
- [ ] Collect user feedback on voice quality
- [ ] Consider A/B testing different voices
- [ ] Explore Cartesia's emotion/speed controls
- [ ] Implement voice cloning for personalization (future)
