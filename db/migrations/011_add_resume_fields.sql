-- T111: Session Resume System
-- Add fields to track resume state for interrupted interviews

-- Add turn_index to track current turn position
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS turn_index INTEGER DEFAULT 0;

-- Add progress_state to track interview resume state
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS progress_state JSON;

-- Add last_activity timestamp for auto-save tracking
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update the updated_at trigger to also update last_activity
CREATE OR REPLACE FUNCTION update_sessions_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_activity = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating last_activity
DROP TRIGGER IF EXISTS update_sessions_last_activity_trigger ON sessions;
CREATE TRIGGER update_sessions_last_activity_trigger
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_last_activity();

-- Add comment for documentation
COMMENT ON COLUMN sessions.turn_index IS 'T111: Current turn index for resume functionality';
COMMENT ON COLUMN sessions.progress_state IS 'T111: JSON object storing resume state data';
COMMENT ON COLUMN sessions.last_activity IS 'T111: Timestamp of last user activity for auto-save';
