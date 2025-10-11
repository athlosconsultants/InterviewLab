-- Migration 013: Phase 13 - Hormozi Tiered Payment System
-- Extends entitlements table to support interview pack credits and tiers

-- Add new columns for credit-based interview packs
ALTER TABLE entitlements
ADD COLUMN IF NOT EXISTS remaining_interviews INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('starter', 'professional', 'elite')),
ADD COLUMN IF NOT EXISTS purchase_type TEXT,
ADD COLUMN IF NOT EXISTS perks JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'AUD'));

-- Create entitlement_history table for consumption tracking
CREATE TABLE IF NOT EXISTS entitlement_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entitlement_id UUID NOT NULL REFERENCES entitlements(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('purchase', 'consume', 'grant', 'expire')),
    interview_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    previous_balance INT,
    new_balance INT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_entitlements_tier ON entitlements(tier);
CREATE INDEX IF NOT EXISTS idx_entitlements_stripe_session_id ON entitlements(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_entitlement_history_user_id ON entitlement_history(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlement_history_entitlement_id ON entitlement_history(entitlement_id);
CREATE INDEX IF NOT EXISTS idx_entitlement_history_action ON entitlement_history(action);

-- Add comments for clarity
COMMENT ON COLUMN entitlements.remaining_interviews IS 'Number of interviews remaining in this pack (credit system)';
COMMENT ON COLUMN entitlements.tier IS 'Pack tier: starter (3), professional (5), or elite (10)';
COMMENT ON COLUMN entitlements.purchase_type IS 'Stripe product identifier (e.g., pack_starter_3, pack_pro_5, pack_elite_10)';
COMMENT ON COLUMN entitlements.perks IS 'JSONB object with tier-specific perks (voice_mode, multi_stage, priority_ai, etc.)';
COMMENT ON COLUMN entitlements.stripe_session_id IS 'Stripe Checkout Session ID for payment verification';
COMMENT ON COLUMN entitlements.currency IS 'Currency used for purchase (USD or AUD)';

COMMENT ON TABLE entitlement_history IS 'Audit log for all entitlement operations (purchases, consumptions, grants)';

-- Enable RLS on entitlement_history table
ALTER TABLE entitlement_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entitlement_history
-- Users can view their own history
CREATE POLICY "Users can view own entitlement history"
    ON entitlement_history FOR SELECT
    USING (auth.uid() = user_id);

-- Only system (via service role) can insert history
CREATE POLICY "Service role can insert entitlement history"
    ON entitlement_history FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Update existing free plan users with a free entitlement record (optional migration)
-- This ensures all users have an entitlement record even if they're on free plan
INSERT INTO entitlements (user_id, type, status, tier, remaining_interviews, perks)
SELECT 
    id as user_id,
    'interview_package' as type,
    'active' as status,
    NULL as tier, -- NULL for free plan
    1 as remaining_interviews, -- Free users get 1 interview
    '{"voice_mode": false, "multi_stage": false, "priority_ai": false}'::jsonb as perks
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM entitlements)
ON CONFLICT DO NOTHING;

