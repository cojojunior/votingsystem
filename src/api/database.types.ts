// src/api/database.types.ts
export interface Database {
  public: {
    Tables: {
      // ... other tables

      election_config: {
        Row: {
          id: number;
          status: "not_started" | "active" | "paused" | "completed"; // Add this
          paused_at: string | null;
          pause_reason: string | null;
          resumed_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          status?: "not_started" | "active" | "paused" | "completed"; // Add this
          paused_at?: string | null;
          pause_reason?: string | null;
          resumed_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          status?: "not_started" | "active" | "paused" | "completed"; // Add this
          paused_at?: string | null;
          pause_reason?: string | null;
          resumed_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
