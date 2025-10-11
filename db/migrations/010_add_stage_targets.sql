-- T107 - Add Stage Targets Column

-- Add stage_targets column to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS stage_targets JSON;

-- Add comment explaining the column
COMMENT ON COLUMN sessions.stage_targets IS 'T107: Array of target question counts per stage for paid tier variability, e.g., [5,7,6,8]';

-- Test the migration
SELECT id, stages_planned, current_stage, stage_targets FROM sessions LIMIT 3;
