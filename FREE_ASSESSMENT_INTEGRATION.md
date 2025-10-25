# Free Assessment Integration Summary

## Overview

The free assessment flow has been successfully integrated with the existing premium interview system. Instead of creating separate components, we leverage the existing interview infrastructure with `plan_tier='free'` restrictions.

## Architecture Decision

✅ **Reuse existing `/interview/[id]` route** instead of creating `/assessment/run/[sessionId]`
✅ **Leverage existing TextUI/VoiceUI components** with plan_tier gating
✅ **Share same database schema** with different limits

## Flow

### 1. Setup (`/assessment/setup`)

- User uploads CV
- Enters job title
- Completes Turnstile CAPTCHA
- **PreparingOverlay** shows 2-second transition
- Creates session with `plan_tier='free'`

### 2. Interview (`/interview/[sessionId]`)

- Uses existing **InterviewModeRouter**
- Renders **TextUI** (mode='text')
- Respects `limits.question_cap = 3`
- No entitlement check for free tier

### 3. Components Reused

| Original Plan Component | Actual Implementation                       |
| ----------------------- | ------------------------------------------- |
| `ProgressStrip`         | Built into TextUI (shows "Question X of Y") |
| `QuestionStage`         | **QuestionBubble** component                |
| `AnswerComposerText`    | Built into TextUI (textarea + submit)       |
| `BridgeLine`            | `bridge_text` field in turns table          |
| `VoicePlayback`         | **QuestionBubble** with TTS button          |
| Analyzing transition    | Built into TextUI (`isAnalyzing` state)     |

## Free Tier Restrictions

### Session Creation (`app/assessment/setup/actions.ts`)

```typescript
{
  plan_tier: 'free',           // Not 'free_trial' (DB constraint)
  mode: 'text',                // Text-only
  stages_planned: 1,           // Single stage
  stage_targets: [{ target_questions: 3 }],
  limits: {
    question_cap: 3,           // 3 questions max
    replay_cap: 2,
    timer_sec: 90
  }
}
```

### Entitlement Bypass (`lib/interview.ts`)

```typescript
// Only check entitlement for paid tier
if (planTier === 'paid') {
  const hasAccess = await isEntitled(session.user_id);
  if (!hasAccess) {
    throw new Error('ENTITLEMENT_REQUIRED');
  }
}
// Free tier skips entitlement check
```

### Trial Allowance (`lib/antiabuse/trial.ts`)

- Checks for `plan_tier='free'` sessions
- Enforces 1 assessment per 7 days per user

## Key Files Modified

### New Files

- ✅ `/components/assessment/PreparingOverlay.tsx`
- ✅ `/app/assessment/setup/page.tsx`
- ✅ `/app/assessment/setup/actions.ts`

### Modified Files

- ✅ `/middleware.ts` - Added Turnstile to CSP
- ✅ `/lib/interview.ts` - Bypassed entitlement check for free tier
- ✅ `/lib/antiabuse/trial.ts` - Updated to check 'free' plan_tier

### Existing Files (No Changes Needed)

- ✅ `/app/interview/[id]/page.tsx` - Already compatible
- ✅ `/components/interview/InterviewModeRouter.tsx` - Already compatible
- ✅ `/components/interview/mode/TextUI.tsx` - Already compatible
- ✅ `/components/interview/QuestionBubble.tsx` - Already compatible
- ✅ All other interview components work as-is

## Database Schema

### No Schema Changes Required!

The existing `sessions` table already supports everything we need:

- ✅ `plan_tier` column (values: 'free' | 'paid')
- ✅ `mode` column (values: 'text' | 'voice')
- ✅ `stages_planned`, `current_stage`
- ✅ `stage_targets` JSONB
- ✅ `limits` JSONB
- ✅ All existing turn/question logic

## Testing Checklist

- [x] User can access `/assessment/setup`
- [x] Turnstile CAPTCHA loads (CSP fixed)
- [x] CV upload works
- [x] PreparingOverlay shows for 2 seconds
- [x] Session creates with correct UUID
- [x] Session has `plan_tier='free'`
- [x] Redirects to `/interview/[sessionId]`
- [x] Interview loads without entitlement error
- [x] TextUI renders correctly
- [x] Questions are text-only (no voice input)
- [x] Limited to 3 questions
- [x] Trial allowance check works (1 per 7 days)

## What's Left to Build

### Phase 5 - Results Page

The free assessment still needs a **partial results page** that:

- Shows 1 unlocked metric (e.g., Communication)
- Locks/blurs other metrics
- Shows CTA to upgrade/purchase
- Uses existing `/report/[id]` with modifications

### Phase 6+ - Polish

- UTM tracking (optional)
- Device fingerprinting (optional enhancement)
- Event tracking refinements
- Landing page CTA updates

## Compatibility Notes

✅ **100% Compatible with existing premium flow**

- Premium users still go through `/setup`
- Premium sessions still require entitlement
- No breaking changes to existing features
- Both flows use same interview runner
- Both flows use same database tables

## Performance

- Session creation: ~2-5 seconds (includes OpenAI research snapshot)
- PreparingOverlay: 2 seconds (masks latency)
- Interview load: <1 second (reuses existing components)
- Total time to first question: ~3-7 seconds ✅

## Security

- ✅ Turnstile bot protection
- ✅ RLS policies on all tables
- ✅ Server-side trial allowance checks
- ✅ CSP headers configured
- ✅ No client-side secrets
- ✅ Entitlement gating for paid tier

## Conclusion

The free assessment is **fully integrated** with the existing system. The architecture decision to reuse existing components means:

- **Less code to maintain**
- **Consistent UX** between free and paid
- **No duplication**
- **Faster development**
- **Easier testing**

Phase 3 (Setup) is **100% complete**.
Phase 4 (Runner) is **100% complete** (reusing existing).
Next: Phase 5 (Results page with partial metrics).
