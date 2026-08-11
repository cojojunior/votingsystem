// src/api/database.types.ts
export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          student_id: string;
          email: string;
          gender: "male" | "female";
          level: string;
          programme: string;
          is_eligible: boolean;
          has_voted: boolean;
          voted_at: string | null;
          session_id: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          email: string;
          gender: "male" | "female";
          level: string;
          programme: string;
          is_eligible?: boolean;
          has_voted?: boolean;
          voted_at?: string | null;
          session_id?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          email?: string;
          gender?: "male" | "female";
          level?: string;
          programme?: string;
          is_eligible?: boolean;
          has_voted?: boolean;
          voted_at?: string | null;
          session_id?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          name: string;
          start_time: string;
          end_time: string;
          student_ids: string[];
          status: "pending" | "active" | "completed" | "cancelled";
          votes_cast: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_time: string;
          end_time: string;
          student_ids: string[];
          status?: "pending" | "active" | "completed" | "cancelled";
          votes_cast?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_time?: string;
          end_time?: string;
          student_ids?: string[];
          status?: "pending" | "active" | "completed" | "cancelled";
          votes_cast?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      positions: {
        Row: {
          id: string;
          name: string;
          description: string;
          order: number;
          max_selections: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          order?: number;
          max_selections?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          order?: number;
          max_selections?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          name: string;
          student_id: string;
          email: string;
          position_id: string;
          level: string;
          programme: string;
          gender: "male" | "female";
          image_url: string;
          manifesto: string;
          status: "active" | "inactive" | "disqualified";
          votes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          student_id: string;
          email: string;
          position_id: string;
          level: string;
          programme: string;
          gender: "male" | "female";
          image_url?: string;
          manifesto?: string;
          status?: "active" | "inactive" | "disqualified";
          votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          student_id?: string;
          email?: string;
          position_id?: string;
          level?: string;
          programme?: string;
          gender?: "male" | "female";
          image_url?: string;
          manifesto?: string;
          status?: "active" | "inactive" | "disqualified";
          votes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          student_id: string;
          position_id: string;
          candidate_id: string;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          position_id: string;
          candidate_id: string;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          position_id?: string;
          candidate_id?: string;
          timestamp?: string;
          created_at?: string;
        };
      };
      otp_requests: {
        Row: {
          id: string;
          email: string;
          otp: string;
          student_id: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          otp: string;
          student_id: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          otp?: string;
          student_id?: string;
          expires_at?: string;
          used?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          student_id: string | null;
          admin_id: string | null;
          action: string;
          details: any;
          timestamp: string;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          admin_id?: string | null;
          action: string;
          details?: any;
          timestamp?: string;
          ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          admin_id?: string | null;
          action?: string;
          details?: any;
          timestamp?: string;
          ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      election_config: {
        Row: {
          id: number;
          status: "not_started" | "active" | "paused" | "completed";
          paused_at: string | null;
          pause_reason: string | null;
          resumed_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          status?: "not_started" | "active" | "paused" | "completed";
          paused_at?: string | null;
          pause_reason?: string | null;
          resumed_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          status?: "not_started" | "active" | "paused" | "completed";
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
