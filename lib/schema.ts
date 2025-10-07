// Database types and DTOs

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database table types will be added as we create them
export interface Database {
  public: {
    Tables: {};
    Views: {};
    Functions: {};
    Enums: {};
  };
}
