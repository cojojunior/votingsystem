// src/services/admin.service.ts
import { supabase } from "../api/client";
import { VotingStats, AuditLog, SessionProgress } from "../types/admin.types";

export class AdminService {
  private static instance: AdminService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
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

  async getStats(): Promise<VotingStats> {
    const cacheKey = "stats";
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // Total voters
      const { count: totalVoters } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      // Total votes
      const { count: totalVotes } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("has_voted", true);

      // Gender stats
      const { data: genderStats } = await supabase
        .from("students")
        .select("gender")
        .eq("has_voted", true);

      const maleVotes =
        genderStats?.filter((s: any) => s.gender === "male").length || 0;
      const femaleVotes =
        genderStats?.filter((s: any) => s.gender === "female").length || 0;

      // Faulty votes
      const { data: faultyVotes } = await supabase
        .from("audit_logs")
        .select("action")
        .in("action", [
          "DUPLICATE_ATTEMPT",
          "MULTIPLE_SELECTION",
          "INVALID_VOTE",
          "BLANK_VOTE",
        ]);

      const faultyCounts = {
        duplicateAttempts:
          faultyVotes?.filter((l: any) => l.action === "DUPLICATE_ATTEMPT")
            .length || 0,
        multipleCandidateSelections:
          faultyVotes?.filter((l: any) => l.action === "MULTIPLE_SELECTION")
            .length || 0,
        invalidCandidates:
          faultyVotes?.filter((l: any) => l.action === "INVALID_VOTE").length ||
          0,
        blankVotes:
          faultyVotes?.filter((l: any) => l.action === "BLANK_VOTE").length ||
          0,
        total: faultyVotes?.length || 0,
      };

      // Session progress
      const { data: sessions } = await supabase.from("sessions").select("*");

      const sessionProgress: SessionProgress[] =
        sessions?.map((session: any) => ({
          id: session.id,
          name: session.name,
          totalStudents: session.student_ids?.length || 0,
          votesCast: session.votes_cast || 0,
          percentage: session.student_ids?.length
            ? ((session.votes_cast || 0) / session.student_ids.length) * 100
            : 0,
          startTime: new Date(session.start_time),
          endTime: new Date(session.end_time),
          status: session.status || "pending",
        })) || [];

      // Live votes (last hour)
      const oneHourAgo = new Date(Date.now() - 3600000);
      const { count: lastHourVotes } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", oneHourAgo.toISOString());

      const stats: VotingStats = {
        totalVoters: totalVoters || 0,
        totalVotesCast: totalVotes || 0,
        voterTurnout: totalVoters ? ((totalVotes || 0) / totalVoters) * 100 : 0,
        maleVotes,
        femaleVotes,
        faultyVotes: faultyCounts,
        liveVotes: {
          lastHour: lastHourVotes || 0,
          currentSession:
            sessions?.find((s: any) => s.status === "active")?.votes_cast || 0,
          totalToday: totalVotes || 0,
          ratePerMinute: (lastHourVotes || 0) / 60,
        },
        sessionProgress,
        results: [],
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      })) as AuditLog[];
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  }

  async pauseElection(reason: string): Promise<{ success: boolean }> {
    try {
      const { error: updateError } = await supabase
        .from("election_config")
        .update({
          status: "paused",
          paused_at: new Date().toISOString(),
          pause_reason: reason,
        })
        .eq("id", 1);

      if (updateError) throw updateError;

      await supabase.from("audit_logs").insert({
        action: "ELECTION_PAUSED",
        details: { reason },
        timestamp: new Date().toISOString(),
      });

      this.cache.clear();
      return { success: true };
    } catch (error) {
      console.error("Error pausing election:", error);
      throw error;
    }
  }

  async resumeElection(): Promise<{ success: boolean }> {
    try {
      const { error: updateError } = await supabase
        .from("election_config")
        .update({
          status: "active",
          resumed_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (updateError) throw updateError;

      await supabase.from("audit_logs").insert({
        action: "ELECTION_RESUMED",
        timestamp: new Date().toISOString(),
      });

      this.cache.clear();
      return { success: true };
    } catch (error) {
      console.error("Error resuming election:", error);
      throw error;
    }
  }

  async closeElection(): Promise<{ success: boolean }> {
    try {
      const { error: updateError } = await supabase
        .from("election_config")
        .update({
          status: "completed",
          closed_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (updateError) throw updateError;

      await supabase.from("audit_logs").insert({
        action: "ELECTION_CLOSED",
        timestamp: new Date().toISOString(),
      });

      this.cache.clear();
      return { success: true };
    } catch (error) {
      console.error("Error closing election:", error);
      throw error;
    }
  }

  async getElectionStatus(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("election_config")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching election status:", error);
      throw error;
    }
  }

  async getVoterTurnout(): Promise<{
    total: number;
    voted: number;
    percentage: number;
  }> {
    try {
      const { count: total } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      const { count: voted } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("has_voted", true);

      return {
        total: total || 0,
        voted: voted || 0,
        percentage: total ? ((voted || 0) / total) * 100 : 0,
      };
    } catch (error) {
      console.error("Error fetching voter turnout:", error);
      throw error;
    }
  }
}

export default AdminService.getInstance();
