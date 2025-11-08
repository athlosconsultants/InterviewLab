-- Migration 014: Add Whop Integration Support
-- Extends entitlements table to support Whop memberships alongside Stripe

-- Add new columns for Whop integration
ALTER TABLE entitlements
ADD COLUMN IF NOT EXISTS whop_membership_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS whop_product_id TEXT,
ADD COLUMN IF NOT EXISTS whop_plan_id TEXT,
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe' CHECK (payment_provider IN ('stripe', 'whop'));

-- Create index for faster Whop membership lookups
CREATE INDEX IF NOT EXISTS idx_entitlements_whop_membership_id ON entitlements(whop_membership_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_payment_provider ON entitlements(payment_provider);

-- Add comments for clarity
COMMENT ON COLUMN entitlements.whop_membership_id IS 'Whop membership ID for users who purchased via Whop marketplace';
COMMENT ON COLUMN entitlements.whop_product_id IS 'Whop product ID (from product configuration)';
COMMENT ON COLUMN entitlements.whop_plan_id IS 'Whop plan ID (from plan configuration)';
COMMENT ON COLUMN entitlements.payment_provider IS 'Payment provider: stripe (existing) or whop (new)';

-- Create whop_users table to store Whop OAuth data
CREATE TABLE IF NOT EXISTS whop_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    whop_user_id TEXT NOT NULL UNIQUE,
    whop_email TEXT,
    whop_username TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster Whop user lookups
CREATE INDEX IF NOT EXISTS idx_whop_users_user_id ON whop_users(user_id);
CREATE INDEX IF NOT EXISTS idx_whop_users_whop_user_id ON whop_users(whop_user_id);

-- Enable RLS on whop_users table
ALTER TABLE whop_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whop_users
-- Users can view their own Whop data
CREATE POLICY "Users can view own Whop data"
    ON whop_users FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update Whop data
CREATE POLICY "Service role can insert Whop data"
    ON whop_users FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can update Whop data"
    ON whop_users FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for whop_users table
COMMENT ON TABLE whop_users IS 'Stores Whop OAuth data and links Whop users to our auth.users';
COMMENT ON COLUMN whop_users.whop_user_id IS 'Unique Whop user ID from OAuth';
COMMENT ON COLUMN whop_users.access_token IS 'Whop OAuth access token (encrypted in production)';
COMMENT ON COLUMN whop_users.refresh_token IS 'Whop OAuth refresh token (encrypted in production)';

