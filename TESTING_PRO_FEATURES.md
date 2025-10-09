# Testing Pro Features - Exempting Code

## Quick Grant Entitlement (Browser Console)

When logged in, open the browser console (F12 or Cmd+Option+I) and run:

```javascript
// Grant yourself a paid interview entitlement
await fetch('/api/admin/grant-entitlement', {
  method: 'POST',
})
  .then((r) => r.json())
  .then((data) => {
    console.log('✅ Entitlement granted:', data);
    alert('Pro features unlocked! Refresh the page.');
  })
  .catch((err) => console.error('❌ Error:', err));
```

## Check Your Current Entitlements

```javascript
// View your active entitlements
await fetch('/api/entitlements')
  .then((r) => r.json())
  .then((data) => {
    console.log('Your entitlements:', data);
    console.log('Active count:', data.activeCount);
    console.log('Has active:', data.hasActive);
  })
  .catch((err) => console.error('Error:', err));
```

## What Pro Features Are Unlocked

After granting an entitlement, you'll have access to:

✅ **Multi-stage Interviews** (1-3 stages)

- Select stages in the setup form
- Variable questions per stage (5-8 questions)
- Stage-specific question categories

✅ **Voice Mode**

- Voice orb UI with auto-play TTS
- Hands-free interview experience
- Voice or text answer input

✅ **Small-Talk Welcome Flow**

- 1-2 warm-up questions before interview
- Confirmation prompt before formal interview begins
- No timer/reveal on warm-up questions

✅ **Extended Question Limits**

- Free: 3 questions max
- Paid: 5-8 questions per stage (up to 24 total for 3 stages)

✅ **Personalized Intros & Bridges**

- AI-generated interview introduction
- Contextual transitions between questions

✅ **Advanced Analytics**

- Resume system (auto-save every 10s)
- Adaptive difficulty adjustments
- Enhanced scoring with reveal/replay signals

## Testing Flow

1. **Grant Entitlement** (run console command above)
2. **Refresh Page** (to reload entitlements)
3. **Go to Setup** (`/setup`)
4. **Configure Interview:**
   - Select **Voice or Text mode**
   - Choose **1-3 stages**
   - Upload CV and Job Description
5. **Start Interview** - Experience pro features!

## Admin Debug View

View session details and analytics at:

```
/admin/debug
```

Enter your session ID to inspect:

- Session metadata (mode, plan tier, stages)
- Turn-by-turn breakdown
- Timing signals (reveal count, replay count)
- Difficulty curve adjustments
- Analytics events

## Database Migrations Required

For full functionality, run these migrations in Supabase SQL Editor:

### Migration 009: turn_type

```sql
ALTER TABLE turns ADD COLUMN IF NOT EXISTS turn_type TEXT DEFAULT 'question';
ALTER TABLE turns ADD CONSTRAINT check_turn_type
  CHECK (turn_type IN ('small_talk', 'question', 'confirmation'));
```

### Migration 010: stage_targets

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS stage_targets JSON;
```

### Migration 011: Resume fields

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS turn_index INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS progress_state JSON;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION update_sessions_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_activity = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sessions_last_activity_trigger ON sessions;
CREATE TRIGGER update_sessions_last_activity_trigger
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_last_activity();
```

### Migration 012: difficulty_curve

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS difficulty_curve JSON;
```

## Notes

- Each entitlement grants **one paid interview session**
- Entitlements are consumed when you create a paid session
- Re-run the grant command to get more entitlements for testing
- The `/api/admin/grant-entitlement` endpoint is for **development only**
- In production, entitlements would come from Stripe payments

## Common Issues

**"Session not found" error:**

- Make sure migrations are run in Supabase
- Check that you're logged in
- Verify session exists in database

**Features not appearing:**

- Run entitlement grant command
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Check `/api/entitlements` response
- Clear browser cache if needed

**Interview fails to load:**

- Check browser console for errors
- Verify dev server is running
- Ensure `.env.local` has valid Supabase credentials
