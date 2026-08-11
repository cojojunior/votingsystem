// src/store/votingStore.ts
import { create } from "zustand";
import { Position, VotingState } from "../types/voting.types";

interface VotingStateExtended extends VotingState {
  setPositions: (positions: Position[]) => void;
  setSelectedCandidate: (positionId: string, candidateId: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasVoted: (hasVoted: boolean) => void;
  setVoteSubmitted: (voteSubmitted: boolean) => void;
  resetVote: () => void;
}

export const useVotingStore = create<VotingStateExtended>((set) => ({
  positions: [],
  selectedCandidates: {},
  isLoading: false,
  error: null,
  hasVoted: false,
  voteSubmitted: false,

  setPositions: (positions) => set({ positions }),

  setSelectedCandidate: (positionId, candidateId) =>
    set((state) => ({
      selectedCandidates: {
        ...state.selectedCandidates,
        [positionId]: candidateId,
      },
    })),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setHasVoted: (hasVoted) => set({ hasVoted }),

  setVoteSubmitted: (voteSubmitted) => set({ voteSubmitted }),

  resetVote: () =>
    set({
      selectedCandidates: {},
      isLoading: false,
      error: null,
      voteSubmitted: false,
    }),
}));
