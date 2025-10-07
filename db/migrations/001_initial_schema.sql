-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('cv', 'jobspec', 'extra', 'audio', 'report')),
    storage_key TEXT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    facts JSONB DEFAULT '{}',
    sources JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_kits table
CREATE TABLE IF NOT EXISTS role_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    competencies JSONB DEFAULT '[]',
    archetypes JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'intake' CHECK (status IN ('intake', 'research', 'ready', 'running', 'feedback', 'complete')),
    job_title TEXT,
    company TEXT,
    location TEXT,
    research_snapshot JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{"question_cap": 3, "replay_cap": 2, "timer_sec": 90}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create turns table
CREATE TABLE IF NOT EXISTS turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question JSONB NOT NULL,
    tts_key TEXT,
    answer_text TEXT,
    answer_audio_key TEXT,
    answer_digest JSONB DEFAULT '{}',
    timing JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall INTEGER CHECK (overall >= 0 AND overall <= 100),
    dimensions JSONB DEFAULT '{}',
    tips JSONB DEFAULT '[]',
    exemplars JSONB DEFAULT '{}',
    pdf_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_kits_user_id ON role_kits(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_turns_session_id ON turns(session_id);
CREATE INDEX IF NOT EXISTS idx_turns_user_id ON turns(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

