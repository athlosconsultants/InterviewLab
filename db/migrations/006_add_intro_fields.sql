-- Migration: Add intro_text field to sessions for paid tier introductions
-- T88 - Phase 8.5: Interview introduction generator

-- Add intro_text column to sessions table
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS intro_text TEXT;

-- Add helpful comment
COMMENT ON COLUMN sessions.intro_text IS 'Generated introduction text for paid tier interviews (conversational opening)';

