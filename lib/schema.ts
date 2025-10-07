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
          created_at?: string;
          updated_at?: string;
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
