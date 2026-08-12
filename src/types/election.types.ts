// src/types/election.types.ts
export type ElectionStatus = "not_started" | "active" | "paused" | "completed";

export interface ElectionConfig {
  id: number;
  status: ElectionStatus;
  paused_at: string | null;
  pause_reason: string | null;
  resumed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}
