// src/api/admin.ts
import { supabase } from "./client";
import { VotingStats, AuditLog } from "../types/admin.types";

// Define types for database records
interface StudentRecord {
  id: string;
  gender: "male" | "female";
  has_voted: boolean;
}

interface AuditLogRecord {
  id: string;
  action: string;
  details: any;
  timestamp: string;
}

interface SessionRecord {
  id: string;
  name: string;
  student_ids: string[];
  votes_cast: number;
  start_time: string;
  end_time: string;
  status: string;
}

interface ElectionConfigRecord {
  id: number;
  status: string;
}

export const adminAPI = {
  getStats: async (): Promise<VotingStats> => {
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

      const students = genderStats as StudentRecord[] | null;
      const maleVotes =
        students?.filter((s) => s.gender === "male").length || 0;
      const femaleVotes =
        students?.filter((s) => s.gender === "female").length || 0;

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

      const faultyData = faultyVotes as AuditLogRecord[] | null;
      const faultyCounts = {
        duplicateAttempts:
          faultyData?.filter((l) => l.action === "DUPLICATE_ATTEMPT").length ||
          0,
        multipleCandidateSelections:
          faultyData?.filter((l) => l.action === "MULTIPLE_SELECTION").length ||
          0,
        invalidCandidates:
          faultyData?.filter((l) => l.action === "INVALID_VOTE").length || 0,
        blankVotes:
          faultyData?.filter((l) => l.action === "BLANK_VOTE").length || 0,
        total: faultyData?.length || 0,
      };

      // Session progress
      const { data: sessions } = await supabase.from("sessions").select("*");

      const sessionData = sessions as SessionRecord[] | null;
      const sessionProgress =
        sessionData?.map((session) => ({
          id: session.id,
          name: session.name,
          totalStudents: session.student_ids.length,
          votesCast: session.votes_cast || 0,
          percentage:
            session.student_ids.length > 0
              ? ((session.votes_cast || 0) / session.student_ids.length) * 100
              : 0,
          startTime: session.start_time,
          endTime: session.end_time,
          status: session.status,
        })) || [];

      // Live votes (last hour)
      const oneHourAgo = new Date(Date.now() - 3600000);
      const { count: lastHourVotes } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", oneHourAgo.toISOString());

      // Current session votes
      const currentSession = sessionData?.find((s) => s.status === "active");
      const currentSessionVotes = currentSession?.votes_cast || 0;

      return {
        totalVoters: totalVoters || 0,
        totalVotesCast: totalVotes || 0,
        voterTurnout: totalVoters ? ((totalVotes || 0) / totalVoters) * 100 : 0,
        maleVotes,
        femaleVotes,
        faultyVotes: faultyCounts,
        liveVotes: {
          lastHour: lastHourVotes || 0,
          currentSession: currentSessionVotes,
          totalToday: totalVotes || 0,
          ratePerMinute: (lastHourVotes || 0) / 60,
        },
        sessionProgress,
        results: [],
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },

  getAuditLogs: async (limit: number = 100): Promise<AuditLog[]> => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as AuditLog[];
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  },

  pauseElection: async (reason: string) => {
    try {
      const { error: updateError } = await supabase
        .from("election_config")
        .update({
          status: "paused",
          paused_at: new Date().toISOString(),
          pause_reason: reason,
        } as any)
        .eq("id", 1);

      if (updateError) throw updateError;

      const { error: logError } = await supabase.from("audit_logs").insert({
        action: "ELECTION_PAUSED",
        details: { reason },
        timestamp: new Date().toISOString(),
      } as any);

      if (logError) throw logError;

      return { success: true };
    } catch (error) {
      console.error("Error pausing election:", error);
      throw error;
    }
  },

  resumeElection: async () => {
    try {
      const { error: updateError } = await supabase
        .from("election_config")
        .update({
          status: "active",
          resumed_at: new Date().toISOString(),
        } as any)
        .eq("id", 1);

      if (updateError) throw updateError;

      const { error: logError } = await supabase.from("audit_logs").insert({
        action: "ELECTION_RESUMED",
        timestamp: new Date().toISOString(),
      } as any);

      if (logError) throw logError;

      return { success: true };
    } catch (error) {
      console.error("Error resuming election:", error);
      throw error;
    }
  },

  closeElection: async () => {
    try {
      const { error: updateError } = await supabase
        .from("election_config")
        .update({
          status: "completed",
          closed_at: new Date().toISOString(),
        } as any)
        .eq("id", 1);

      if (updateError) throw updateError;

      const { error: logError } = await supabase.from("audit_logs").insert({
        action: "ELECTION_CLOSED",
        timestamp: new Date().toISOString(),
      } as any);

      if (logError) throw logError;

      return { success: true };
    } catch (error) {
      console.error("Error closing election:", error);
      throw error;
    }
  },

  // Additional admin functions
  getElectionStatus: async () => {
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
  },

  getFaultyVotesSummary: async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("action, count")
        .in("action", [
          "DUPLICATE_ATTEMPT",
          "MULTIPLE_SELECTION",
          "INVALID_VOTE",
          "BLANK_VOTE",
        ])
        .group("action");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching faulty votes summary:", error);
      throw error;
    }
  },

  getVoterTurnout: async () => {
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
  },
};
