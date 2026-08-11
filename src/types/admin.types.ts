// src/types/admin.types.ts
export interface VotingStats {
  totalVoters: number;
  totalVotesCast: number;
  voterTurnout: number;
  maleVotes: number;
  femaleVotes: number;
  faultyVotes: {
    duplicateAttempts: number;
    multipleCandidateSelections: number;
    invalidCandidates: number;
    blankVotes: number;
    total: number;
  };
  liveVotes: {
    lastHour: number;
    currentSession: number;
    totalToday: number;
    ratePerMinute: number;
  };
  sessionProgress: SessionProgress[];
  results: VoteResult[];
}

export interface SessionProgress {
  id: string;
  name: string;
  totalStudents: number;
  votesCast: number;
  percentage: number;
  startTime: Date;
  endTime: Date;
  status: "pending" | "active" | "completed";
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  ip: string;
  userAgent: string;
}

export interface AdminState {
  stats: VotingStats | null;
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  isLiveMode: boolean;
}
