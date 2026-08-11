// src/api/voting.ts
import { supabase } from "./client";
import { VoteSubmission, Position, Candidate } from "../types/voting.types";

export const votingAPI = {
  getPositions: async (): Promise<Position[]> => {
    const { data, error } = await supabase
      .from("positions")
      .select(
        `
        *,
        candidates:candidates(*)
      `,
      )
      .eq("is_active", true)
      .order("order");

    if (error) throw error;
    return data;
  },

  getCandidates: async (positionId: string): Promise<Candidate[]> => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("position_id", positionId)
      .eq("status", "active");

    if (error) throw error;
    return data;
  },

  submitVote: async (
    submission: VoteSubmission,
  ): Promise<{ success: boolean; message: string }> => {
    // Start a transaction
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, has_voted")
      .eq("id", submission.studentId)
      .single();

    if (studentError || !student) {
      throw new Error("Student not found.");
    }

    if (student.has_voted) {
      throw new Error("You have already voted.");
    }

    // Insert votes
    const voteEntries = Object.entries(submission.votes).map(
      ([positionId, candidateId]) => ({
        student_id: submission.studentId,
        position_id: positionId,
        candidate_id: candidateId,
        timestamp: submission.timestamp,
      }),
    );

    const { error: voteError } = await supabase
      .from("votes")
      .insert(voteEntries);

    if (voteError) throw voteError;

    // Mark student as voted
    const { error: updateError } = await supabase
      .from("students")
      .update({ has_voted: true, voted_at: submission.timestamp })
      .eq("id", submission.studentId);

    if (updateError) throw updateError;

    // Log the vote
    await supabase.from("audit_logs").insert({
      student_id: submission.studentId,
      action: "VOTE_SUBMITTED",
      details: {
        positions: Object.keys(submission.votes).length,
        timestamp: submission.timestamp,
      },
    });

    return {
      success: true,
      message: "Vote submitted successfully.",
    };
  },

  checkVotingStatus: async (studentId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("has_voted, session_id")
      .eq("id", studentId)
      .single();

    if (error) throw error;
    return data;
  },

  getResults: async (positionId?: string) => {
    let query = supabase.from("votes").select(`
        candidate_id,
        candidates(name),
        position_id,
        positions(name)
      `);

    if (positionId) {
      query = query.eq("position_id", positionId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate results
    const results = data.reduce((acc: any, vote: any) => {
      const key = vote.position_id;
      if (!acc[key]) {
        acc[key] = {
          positionId: vote.position_id,
          positionName: vote.positions.name,
          candidates: {},
        };
      }
      const candidateKey = vote.candidate_id;
      if (!acc[key].candidates[candidateKey]) {
        acc[key].candidates[candidateKey] = {
          candidateId: vote.candidate_id,
          candidateName: vote.candidates.name,
          votes: 0,
        };
      }
      acc[key].candidates[candidateKey].votes++;
      return acc;
    }, {});

    return results;
  },
};
