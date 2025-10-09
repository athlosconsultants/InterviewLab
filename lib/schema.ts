// Database types and DTOs

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: string;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          storage_key: string;
          extracted_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          storage_key: string;
          extracted_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          storage_key?: string;
          extracted_text?: string | null;
          created_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          job_title: string | null;
          company: string | null;
          location: string | null;
          research_snapshot: Json | null;
          limits: Json | null;
          plan_tier: string;
          mode: string;
          stages_planned: number;
          current_stage: number;
          stage_targets: Json | null; // T107: Array of target question counts per stage [5,7,6,8]
          entitlement_id: string | null;
          intro_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          job_title?: string | null;
          company?: string | null;
          location?: string | null;
          research_snapshot?: Json | null;
          limits?: Json | null;
          plan_tier?: string;
          mode?: string;
          stages_planned?: number;
          current_stage?: number;
          stage_targets?: Json | null; // T107: Array of target question counts per stage
          entitlement_id?: string | null;
          intro_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          job_title?: string | null;
          company?: string | null;
          location?: string | null;
          research_snapshot?: Json | null;
          limits?: Json | null;
          plan_tier?: string;
          mode?: string;
          stages_planned?: number;
          current_stage?: number;
          stage_targets?: Json | null; // T107: Array of target question counts per stage
          entitlement_id?: string | null;
          intro_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      entitlements: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          status: string;
          order_id: string | null;
          metadata: Json;
          expires_at: string | null;
          consumed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          status?: string;
          order_id?: string | null;
          metadata?: Json;
          expires_at?: string | null;
          consumed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          status?: string;
          order_id?: string | null;
          metadata?: Json;
          expires_at?: string | null;
          consumed_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Document type enum
export type DocumentType = 'cv' | 'jobspec' | 'extra' | 'audio' | 'report';

// Session status enum
export type SessionStatus =
  | 'intake'
  | 'research'
  | 'ready'
  | 'running'
  | 'feedback'
  | 'complete';

// Plan tier enum (T84)
export type PlanTier = 'free' | 'paid';

// Interview mode enum (T84)
export type InterviewMode = 'text' | 'voice';

// Research Snapshot type
// This is the structured data produced during the research phase
// and stored in sessions.research_snapshot
export interface ResearchSnapshot {
  // Summarized CV content
  cv_summary: {
    name?: string;
    experience_years?: number;
    key_skills: string[];
    recent_roles: string[];
    education?: string[];
    summary: string; // Concise 2-3 sentence summary
  };

  // Summarized job specification
  job_spec_summary: {
    role: string;
    level?: string; // e.g., 'junior', 'mid', 'senior', 'lead'
    key_requirements: string[];
    nice_to_have?: string[];
    responsibilities: string[];
    summary: string; // Concise 2-3 sentence summary
  };

  // Company information (from research or user-provided)
  company_facts: {
    name: string;
    industry?: string;
    size?: string; // e.g., 'startup', 'mid-size', 'enterprise'
    mission?: string;
    values?: string[];
    recent_news?: string[];
  };

  // Role competencies (skills/behaviors to assess)
  competencies: {
    technical: string[]; // e.g., ['React', 'TypeScript', 'System Design']
    behavioral: string[]; // e.g., ['Leadership', 'Communication', 'Problem Solving']
    domain: string[]; // e.g., ['FinTech', 'Healthcare', 'E-commerce']
  };

  // T87: Industry-specific interview configuration
  interview_config?: {
    industry: string; // e.g., 'Technology', 'Finance', 'Construction'
    sub_industry: string; // e.g., 'Software', 'Investment Banking', 'Project Management'
    styles: string[]; // e.g., ['technical', 'behavioral', 'system_design']
    tone: string; // e.g., 'analytical and formal with conversational clarity'
    stages: string[]; // e.g., ['Technical', 'Behavioral', 'System Design']
    confidence: 'high' | 'medium' | 'low'; // Confidence level of the mapping
  };

  // Sources used for research
  sources: {
    company_website?: string;
    linkedin?: string;
    news_articles?: string[];
    other?: string[];
  };

  // Metadata
  created_at: string;
  version: string; // e.g., '1.0' - for future compatibility
}

// Session limits type
export interface SessionLimits {
  question_cap: number; // Maximum number of questions
  replay_cap: number; // Maximum number of replays per question
  timer_sec: number; // Time limit per question in seconds
}

// Question type (stored in turns.question)
export interface Question {
  text: string;
  category: string; // e.g., 'technical', 'behavioral', 'situational'
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number; // seconds
  follow_up?: boolean; // Is this a follow-up question?
}

// Answer digest type (stored in turns.answer_digest)
export interface AnswerDigest {
  summary: string; // Short summary of the answer (1-2 sentences)
  key_points: string[]; // Main points mentioned
  sentiment?: 'positive' | 'neutral' | 'negative';
  word_count?: number;
}

// Timing type (stored in turns.timing)
export interface Timing {
  duration_ms: number; // How long the user took to answer
  replay_count: number; // Number of times the question was replayed
  started_at: string;
  completed_at: string;
}

// Report type (from reports table)
export interface Report {
  id: string;
  session_id: string;
  user_id: string;
  feedback: any; // InterviewFeedback JSON
  pdf_key: string | null;
  created_at: string;
}

// Entitlement type (from entitlements table) - T84
export interface Entitlement {
  id: string;
  user_id: string;
  type: 'interview_package' | 'subscription';
  status: 'active' | 'consumed' | 'expired';
  order_id: string | null;
  metadata: Json;
  expires_at: string | null;
  consumed_at: string | null;
  created_at: string;
}

// Session type (from sessions table)
export interface Session {
  id: string;
  user_id: string;
  status: SessionStatus;
  job_title: string | null;
  company: string | null;
  location: string | null;
  research_snapshot: ResearchSnapshot | Json | null;
  limits: SessionLimits | Json | null;
  plan_tier: PlanTier;
  mode: InterviewMode;
  stages_planned: number;
  current_stage: number;
  stage_targets: number[] | Json | null; // T107: Array of target question counts per stage
  entitlement_id: string | null;
  intro_text: string | null;
  conversation_summary: string | null; // T95: Rolling summary of conversation
  created_at: string;
  updated_at: string;
}

// Turn type enum (T106)
export type TurnType = 'small_talk' | 'question' | 'confirmation';

// Turn type (from turns table) - T89: Added bridge_text, T106: Added turn_type
export interface Turn {
  id: string;
  session_id: string;
  user_id: string;
  question: Question;
  tts_key: string | null;
  answer_text: string | null;
  answer_audio_key: string | null;
  answer_digest: AnswerDigest | Json | null;
  timing: Timing | Json | null;
  bridge_text: string | null; // T89: Conversational transition referencing previous answer
  turn_type: TurnType; // T106: Distinguish small talk from interview questions
  created_at: string;
}
