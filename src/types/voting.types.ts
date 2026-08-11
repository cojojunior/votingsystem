// src/types/voting.types.ts
export interface Candidate {
  id: string;
  name: string;
  studentId: string;
  email: string;
  position: string;
  positionId: string;
  level: string;
  programme: string;
  gender: "male" | "female";
  imageUrl: string;
  manifesto: string;
  status: "active" | "inactive" | "disqualified";
  votes: number;
}

export interface Position {
  id: string;
  name: string;
  description: string;
  candidates: Candidate[];
  maxSelections: number;
  order: number;
}

export interface VoteSubmission {
  studentId: string;
  votes: Record<string, string>; // positionId -> candidateId
  timestamp: Date;
}

export interface VoteResult {
  positionId: string;
  positionName: string;
  candidates: {
    candidateId: string;
    candidateName: string;
    votes: number;
    percentage: number;
  }[];
  totalVotes: number;
  blankVotes: number;
  invalidVotes: number;
}

export interface VotingState {
  positions: Position[];
  selectedCandidates: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  hasVoted: boolean;
  voteSubmitted: boolean;
}
