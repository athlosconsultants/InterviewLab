-- Migration: Add conversation_summary to sessions table
-- Purpose: T95 - Maintain rolling summary of conversation for prompt efficiency
-- Date: 2025-10-08

-- Add conversation_summary column to sessions
-- This will store a compact rolling summary of the interview conversation
-- Updated after each answer to maintain context efficiently
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS conversation_summary TEXT DEFAULT NULL;

-- Add comment to document the column
COMMENT ON COLUMN sessions.conversation_summary IS 'Rolling summary of interview conversation, updated after each Q&A. Used for efficient context-aware question generation. Target: < 1KB after 10 questions.';

