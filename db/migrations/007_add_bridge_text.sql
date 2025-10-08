-- Migration: Add bridge_text field to turns table for T89
-- This field stores conversational transitions that reference the previous answer
-- before presenting the next question, making the interview feel more natural.

ALTER TABLE turns
  ADD COLUMN IF NOT EXISTS bridge_text TEXT;

COMMENT ON COLUMN turns.bridge_text IS 'Conversational bridge text referencing previous answer (for paid tier interviews)';

