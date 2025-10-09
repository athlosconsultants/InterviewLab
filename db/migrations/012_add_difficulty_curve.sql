-- T112: Adaptive Difficulty Feedback Loop
-- Add difficulty curve tracking to sessions table

-- Add difficulty_curve field to track question difficulty adjustments
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS difficulty_curve JSON;

-- Add comment for documentation
COMMENT ON COLUMN sessions.difficulty_curve IS 'T112: JSON array tracking difficulty adjustments based on answer quality [{turn_index: 1, difficulty: "medium", adjustment: "none", answer_quality: "strong"}]';
