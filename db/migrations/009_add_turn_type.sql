-- Migration: Add turn_type to turns table
-- Purpose: T106 - Distinguish small talk from interview questions
-- Date: 2025-10-09

-- Add turn_type column to turns
-- This will differentiate between 'small_talk', 'question', and future turn types
ALTER TABLE turns
ADD COLUMN IF NOT EXISTS turn_type TEXT DEFAULT 'question';

-- Add check constraint to ensure valid turn types
ALTER TABLE turns
ADD CONSTRAINT turn_type_check 
CHECK (turn_type IN ('small_talk', 'question', 'confirmation'));

-- Add comment to document the column
COMMENT ON COLUMN turns.turn_type IS 'Type of turn: small_talk (pre-interview warm-up, not scored), question (actual interview question, scored), confirmation (ready to begin prompt)';

-- Create index for filtering by turn_type
CREATE INDEX IF NOT EXISTS idx_turns_turn_type ON turns(turn_type);

