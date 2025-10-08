# T99 - Regression & QA Testing Checklist

**Date:** 2025-10-09  
**Phase:** 8.5 Complete (T91-T97 + T98)  
**Scope:** End-to-end validation of free and paid interview flows

---

## 🗄️ Database Integrity

- [ ] Verify all migrations applied (001-008)
  - [ ] `001_initial_schema.sql` - Core tables
  - [ ] `002_rls_policies.sql` - Row-level security
  - [ ] `003_storage_policies.sql` - Storage policies
  - [ ] `004_update_reports_schema.sql` - Reports feedback column
  - [ ] `005_add_paid_tier_fields.sql` - Paid tier fields
  - [ ] `006_add_multi_stage_fields.sql` - Multi-stage support
  - [ ] `007_add_bridge_text.sql` - Conversational bridges
  - [ ] `008_add_conversation_summary.sql` - T95 context digest
- [ ] Check all required columns exist in tables
- [ ] Verify foreign key constraints
- [ ] Test RLS policies with different user contexts

---

## 🆓 Free Tier Flow

### Setup & Intake

- [ ] User can sign up/sign in successfully
- [ ] Upload CV (PDF parsing works)
- [ ] Upload/paste job description
- [ ] Form validation works correctly
- [ ] Interview mode defaults to "Text"
- [ ] Stages defaults to "1 (Single Round)"

### Interview Execution (Free)

- [ ] First question generates successfully
- [ ] Question countdown timer works (3-2-1)
- [ ] Question visibility window (15s) works
- [ ] Question auto-hides after 15s
- [ ] "Replay" button works (max 2 times)
- [ ] Answer submission works (text mode)
- [ ] Questions limit enforced (3 questions max)
- [ ] Interview completes after 3 questions
- [ ] No intro text for free tier
- [ ] No bridge text between questions for free tier

### Report Generation (Free)

- [ ] Report generates successfully
- [ ] Feedback structure is correct (5 dimensions)
- [ ] Overall score calculated correctly
- [ ] Detailed feedback shows for each question
- [ ] No replay penalty mentioned (free tier doesn't track)
- [ ] Upgrade prompt appears after report

---

## 💎 Paid Tier Flow

### Entitlement Setup

- [ ] Admin can grant entitlement via `/api/admin/grant-entitlement`
- [ ] Entitlement appears in `/api/entitlements`
- [ ] Entitlement metadata includes correct features

### Setup & Intake (Paid)

- [ ] Voice mode option is enabled
- [ ] Multi-stage selection (1-3) is enabled
- [ ] User can select paid features
- [ ] Entitlement consumed upon interview start

### Interview Execution (Paid - Text Mode)

- [ ] Interview intro text generates and displays
- [ ] Stage header shows "Stage X of Y: StageName"
- [ ] Questions match stage category (Technical/Behavioral/etc.)
- [ ] Bridge text appears before questions (index > 0)
- [ ] Questions per stage calculated correctly
- [ ] Stage advancement works (e.g., 10 questions -> Stage 2)
- [ ] Toast notification shows stage advancement
- [ ] Countdown timer works per question
- [ ] Replay button works and increments replay_count
- [ ] "Analyzing Answer" transition shows between questions
- [ ] Conversation summary updates after each answer (T95)
- [ ] Up to 30 questions total (10 per stage for 3-stage)

### Interview Execution (Paid - Voice Mode)

- [ ] TTS audio generates for questions
- [ ] Audio playback works (speaker icon)
- [ ] Voice recording works (microphone)
- [ ] Audio upload to Supabase Storage succeeds
- [ ] Whisper transcription works
- [ ] Transcribed text appears in answer field
- [ ] All other features work same as text mode

### Report Generation (Paid)

- [ ] Report generates with full feedback
- [ ] Composure evaluation includes replay penalties (T96)
- [ ] High replay usage (2 per question) results in minor deductions
- [ ] Report saved to database (no duplicates)
- [ ] Report accessible via `/report/[id]`

---

## 🧪 Industry Template Integration (T92)

- [ ] "Project Manager" + construction hints → Consulting/Construction
- [ ] Industry tone applied correctly (pragmatic, detail-oriented)
- [ ] Question styles match industry config
- [ ] Stage names match industry config

---

## 🎨 UI/UX Polish (T97)

- [ ] All toast messages use minimalist microcopy
- [ ] Button labels are concise ("Text", "Voice", "Submit", "Replay")
- [ ] Placeholders are brief ("Type your answer")
- [ ] Loading states show "Loading..." not "Loading interview..."
- [ ] Error messages are brief ("Unable to submit" not "Failed to submit answer")
- [ ] Success messages are brief ("Transcribed" not "Audio transcribed successfully")
- [ ] No verbose or redundant text

---

## ⏱️ Timing & Replay System (T93)

- [ ] 3-2-1 countdown before question appears
- [ ] Question visible for 15 seconds
- [ ] Question auto-hides after 15 seconds
- [ ] "Replay" button re-shows question for 5 seconds
- [ ] Replay count enforced (max 2 times)
- [ ] Toast shows "Replay 1 of 2" / "Replay 2 of 2"
- [ ] After 2 replays, "No replays left" toast appears
- [ ] Accessibility mode (No Timer/Reveals) bypasses all timers

---

## 🔄 Caching System (T98)

- [ ] Research snapshot cached on first generation
- [ ] Cache hit logged on subsequent requests
- [ ] Cache key format: `research:{role}:{company}`
- [ ] Cache expires after 24 hours
- [ ] `/api/admin/cache-stats` returns cache statistics
- [ ] Cache can be cleared via `DELETE /api/admin/cache-stats`

---

## 🐛 Error Handling

- [ ] Network errors show user-friendly messages
- [ ] Missing entitlements show upgrade prompt
- [ ] Invalid session IDs redirect to setup
- [ ] Audio upload failures show clear error
- [ ] Transcription failures don't block interview
- [ ] OpenAI API errors handled gracefully

---

## 📱 Responsiveness

- [ ] UI works on desktop (1920x1080)
- [ ] UI works on laptop (1366x768)
- [ ] UI works on tablet (768px)
- [ ] UI works on mobile (375px)
- [ ] No horizontal scroll
- [ ] All buttons accessible

---

## ✅ CI/CD

- [ ] GitHub Actions build passes
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No console errors in browser
- [ ] No deprecation warnings

---

## 🔍 Final Validation

**Criteria for passing:**

- All critical paths work (signup → interview → report)
- No data loss or corruption
- Paid features properly gated
- Free tier limits enforced
- Performance acceptable (<5s question generation)
- No security vulnerabilities (RLS working)

**Sign-off:**

- [ ] All tests passed
- [ ] Ready for Phase 9 development
