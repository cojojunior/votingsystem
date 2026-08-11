// src/utils/validators/voteValidator.ts
import { Position } from "../../types/voting.types";

export const validateVote = (
  positions: Position[],
  selectedCandidates: Record<string, string>,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const position of positions) {
    const selectedId = selectedCandidates[position.id];

    if (!selectedId) {
      errors.push(`No candidate selected for ${position.name}`);
      continue;
    }

    const isValidCandidate = position.candidates.some(
      (c) => c.id === selectedId && c.status === "active",
    );

    if (!isValidCandidate) {
      errors.push(`Invalid candidate selected for ${position.name}`);
    }
  }

  // Check for duplicate selections (should never happen with proper UI)
  const selectedIds = Object.values(selectedCandidates);
  const uniqueIds = new Set(selectedIds);
  if (selectedIds.length !== uniqueIds.size) {
    errors.push("Duplicate candidate selection detected");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateVoteSubmission = (
  studentId: string,
  selectedCandidates: Record<string, string>,
  positions: Position[],
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!studentId) {
    errors.push("Student ID is required");
  }

  if (!selectedCandidates || Object.keys(selectedCandidates).length === 0) {
    errors.push("No votes selected");
  }

  const validation = validateVote(positions, selectedCandidates);
  errors.push(...validation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};
