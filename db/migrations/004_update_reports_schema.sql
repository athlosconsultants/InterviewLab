-- Migration: Update reports table to use single feedback JSONB column
-- This simplifies the schema and matches our TypeScript types

-- Add the new feedback column
ALTER TABLE reports ADD COLUMN IF NOT EXISTS feedback JSONB;

-- Drop old columns (they're replaced by the feedback JSONB)
ALTER TABLE reports DROP COLUMN IF EXISTS overall;
ALTER TABLE reports DROP COLUMN IF EXISTS dimensions;
ALTER TABLE reports DROP COLUMN IF EXISTS tips;
ALTER TABLE reports DROP COLUMN IF EXISTS exemplars;

-- Add a comment to clarify the structure
COMMENT ON COLUMN reports.feedback IS 'Complete interview feedback as JSON: {overall: {score, grade, summary}, dimensions: {...}, tips: [...], exemplars: {...}}';

