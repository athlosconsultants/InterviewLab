-- Migration: Add paid tier configuration fields to sessions table
-- T84 - Phase 8.5: Support for paid tier interviews with voice mode and multi-stage support

-- First, create entitlements table for paid interview packages
CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('interview_package', 'subscription')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'expired')),
    order_id UUID, -- Will link to orders table when payment system is implemented
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for querying user entitlements
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON entitlements(status);
CREATE INDEX IF NOT EXISTS idx_entitlements_type ON entitlements(type);

-- Add new columns to sessions table
ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'paid')),
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'text' CHECK (mode IN ('text', 'voice')),
  ADD COLUMN IF NOT EXISTS stages_planned INTEGER DEFAULT 1 CHECK (stages_planned >= 1 AND stages_planned <= 3),
  ADD COLUMN IF NOT EXISTS current_stage INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS entitlement_id UUID REFERENCES entitlements(id) ON DELETE SET NULL;

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_sessions_plan_tier ON sessions(plan_tier);
CREATE INDEX IF NOT EXISTS idx_sessions_mode ON sessions(mode);
CREATE INDEX IF NOT EXISTS idx_sessions_entitlement_id ON sessions(entitlement_id);

-- Add comments for clarity
COMMENT ON COLUMN sessions.plan_tier IS 'User plan tier: free (3 questions, text-only, 1-stage) or paid (unlimited, voice, multi-stage)';
COMMENT ON COLUMN sessions.mode IS 'Interview mode: text or voice (TTS+STT)';
COMMENT ON COLUMN sessions.stages_planned IS 'Number of interview stages (1-3), paid only';
COMMENT ON COLUMN sessions.current_stage IS 'Current stage in multi-stage interview';
COMMENT ON COLUMN sessions.entitlement_id IS 'Linked entitlement (for paid sessions from one-off purchase)';

-- Enable RLS on entitlements table
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entitlements
-- Users can view their own entitlements
CREATE POLICY "Users can view own entitlements"
    ON entitlements FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own entitlements (for manual grants or testing)
CREATE POLICY "Users can insert own entitlements"
    ON entitlements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own entitlements (to consume them)
CREATE POLICY "Users can update own entitlements"
    ON entitlements FOR UPDATE
    USING (auth.uid() = user_id);

