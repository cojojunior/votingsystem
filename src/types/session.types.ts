// src/types/session.types.ts
export interface VotingSession {
  id: string;
  name: "Session 1" | "Session 2" | "Session 3";
  startTime: Date;
  endTime: Date;
  studentIds: string[];
  isActive: boolean;
  status: "pending" | "active" | "completed" | "cancelled";
  totalStudents: number;
  votesCast: number;
  percentage: number;
}

export interface SessionConfig {
  sessions: VotingSession[];
  currentSession: VotingSession | null;
  nextSession: VotingSession | null;
  electionStatus: "not_started" | "active" | "paused" | "completed";
}

export interface SessionState {
  sessions: VotingSession[];
  currentSession: VotingSession | null;
  isLoading: boolean;
  error: string | null;
  electionStatus: SessionConfig["electionStatus"];
}
