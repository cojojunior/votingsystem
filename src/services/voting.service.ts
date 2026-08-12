// src/services/voting.service.ts
import { supabase } from "../api/client";
import {
  Candidate,
  Position,
  VoteSubmission,
  VoteResult,
} from "../types/voting.types";

export class VotingService {
  private static instance: VotingService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): VotingService {
    if (!VotingService.instance) {
      VotingService.instance = new VotingService();
    }
    return VotingService.instance;
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getPositions(): Promise<Position[]> {
    const cacheKey = "positions";
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
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

      this.setCache(cacheKey, data);
      return data || [];
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  }

  async getCandidates(positionId: string): Promise<Candidate[]> {
    const cacheKey = `candidates_${positionId}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("position_id", positionId)
        .eq("status", "active");

      if (error) throw error;

      this.setCache(cacheKey, data);
      return data || [];
    } catch (error) {
      console.error("Error fetching candidates:", error);
      throw error;
    }
  }

  async submitVote(
    submission: VoteSubmission,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if student has already voted
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

      // Clear cache
      this.cache.clear();

      return {
        success: true,
        message: "Vote submitted successfully.",
      };
    } catch (error: any) {
      console.error("Submit vote error:", error);
      throw error;
    }
  }

  async checkVotingStatus(
    studentId: string,
  ): Promise<{ hasVoted: boolean; sessionId: string | null }> {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("has_voted, session_id")
        .eq("id", studentId)
        .single();

      if (error) throw error;

      return {
        hasVoted: data?.has_voted || false,
        sessionId: data?.session_id || null,
      };
    } catch (error) {
      console.error("Error checking voting status:", error);
      throw error;
    }
  }

  async getResults(positionId?: string): Promise<any> {
    try {
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
            positionName: vote.positions?.name || "Unknown",
            candidates: {},
          };
        }
        const candidateKey = vote.candidate_id;
        if (!acc[key].candidates[candidateKey]) {
          acc[key].candidates[candidateKey] = {
            candidateId: vote.candidate_id,
            candidateName: vote.candidates?.name || "Unknown",
            votes: 0,
          };
        }
        acc[key].candidates[candidateKey].votes++;
        return acc;
      }, {});

      return results;
    } catch (error) {
      console.error("Error fetching results:", error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default VotingService.getInstance();
