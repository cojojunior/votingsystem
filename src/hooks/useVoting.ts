// src/hooks/useVoting.ts
import { useState, useEffect, useCallback } from "react";
import { votingAPI } from "../api/voting";
import { useVotingStore } from "../store/votingStore";
import { useAuthStore } from "../store/authStore";
import { useRateLimit } from "./useRateLimit";
import { validateVote } from "../utils/validators/voteValidator";

export const useVoting = () => {
  const {
    positions,
    selectedCandidates,
    isLoading,
    error,
    hasVoted,
    voteSubmitted,
    setPositions,
    setSelectedCandidate,
    setIsLoading,
    setError,
    setHasVoted,
    setVoteSubmitted,
    resetVote,
  } = useVotingStore();

  const { user } = useAuthStore();
  const voteRateLimit = useRateLimit("vote");

  const loadPositions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await votingAPI.getPositions();
      setPositions(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [setPositions, setIsLoading, setError]);

  const selectCandidate = (positionId: string, candidateId: string) => {
    setSelectedCandidate(positionId, candidateId);
  };

  const submitVote = async () => {
    if (!user) {
      setError("You must be logged in to vote.");
      return false;
    }

    if (voteRateLimit.isBlocked) {
      setError("You have already voted.");
      return false;
    }

    // Validate vote
    const validation = validateVote(positions, selectedCandidates);
    if (!validation.valid) {
      setError(validation.errors.join(", "));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const submission = {
        studentId: user.studentId,
        votes: selectedCandidates,
        timestamp: new Date(),
      };

      const result = await votingAPI.submitVote(submission);
      if (result.success) {
        setVoteSubmitted(true);
        setHasVoted(true);
        voteRateLimit.recordAttempt();
        return true;
      }
    } catch (error: any) {
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkVotingStatus = useCallback(async () => {
    if (!user) return;

    try {
      const status = await votingAPI.checkVotingStatus(user.studentId);
      setHasVoted(status.has_voted);
      if (status.has_voted) {
        setVoteSubmitted(true);
      }
    } catch (error: any) {
      console.error("Error checking voting status:", error);
    }
  }, [user, setHasVoted, setVoteSubmitted]);

  useEffect(() => {
    if (user && !hasVoted) {
      loadPositions();
      checkVotingStatus();
    }
  }, [user, loadPositions, checkVotingStatus]);

  return {
    positions,
    selectedCandidates,
    isLoading,
    error,
    hasVoted,
    voteSubmitted,
    selectCandidate,
    submitVote,
    resetVote,
    loadPositions,
    checkVotingStatus,
  };
};
