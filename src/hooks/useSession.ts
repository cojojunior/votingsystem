// src/hooks/useSession.ts
import { useState, useEffect, useCallback } from "react";
import { useSessionStore } from "../store/sessionStore";
import { supabase } from "../api/client";
import { VotingSession, SessionConfig } from "../types/session.types";

export const useSession = () => {
  const {
    sessions,
    currentSession,
    isLoading,
    error,
    electionStatus,
    setSessions,
    setCurrentSession,
    setIsLoading,
    setError,
    setElectionStatus,
    updateSessionProgress,
  } = useSessionStore();

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionProgress, setSessionProgress] = useState<number>(0);

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await (supabase.from("sessions") as any)
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;

      const transformedSessions = (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        startTime: new Date(s.start_time),
        endTime: new Date(s.end_time),
        studentIds: s.student_ids || [],
        isActive: s.status === "active",
        status: s.status || "pending",
        totalStudents: s.student_ids?.length || 0,
        votesCast: s.votes_cast || 0,
        percentage: s.student_ids?.length
          ? ((s.votes_cast || 0) / s.student_ids.length) * 100
          : 0,
      }));

      setSessions(transformedSessions);

      // Find current/active session
      const activeSession = transformedSessions.find(
        (s: VotingSession) => s.status === "active",
      );
      if (activeSession) {
        setCurrentSession(activeSession);
      } else {
        // Find upcoming session
        const now = new Date();
        const upcoming = transformedSessions.find(
          (s: VotingSession) => new Date(s.startTime) > now,
        );
        if (upcoming) {
          setCurrentSession(upcoming);
        }
      }

      return transformedSessions;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setSessions, setCurrentSession, setIsLoading, setError]);

  // Fetch election status
  const fetchElectionStatus = useCallback(async () => {
    try {
      const { data, error } = await (supabase.from("election_config") as any)
        .select("status")
        .eq("id", 1)
        .single();

      if (error) throw error;

      if (data) {
        setElectionStatus(
          (data as { status: string })
            .status as SessionConfig["electionStatus"],
        );
      }
      return data;
    } catch (err: any) {
      console.error("Error fetching election status:", err);
      return null;
    }
  }, [setElectionStatus]);

  // Get student's session
  const getStudentSession = useCallback(
    async (studentId: string) => {
      try {
        const { data, error } = await (supabase.from("sessions") as any)
          .select("*")
          .contains("student_ids", [studentId])
          .single();

        if (error) throw error;

        if (data) {
          const session: VotingSession = {
            id: data.id,
            name: data.name,
            startTime: new Date(data.start_time),
            endTime: new Date(data.end_time),
            studentIds: data.student_ids || [],
            isActive: data.status === "active",
            status: data.status || "pending",
            totalStudents: data.student_ids?.length || 0,
            votesCast: data.votes_cast || 0,
            percentage: data.student_ids?.length
              ? ((data.votes_cast || 0) / data.student_ids.length) * 100
              : 0,
          };
          setCurrentSession(session);
          return session;
        }
        return null;
      } catch (err: any) {
        console.error("Error fetching student session:", err);
        return null;
      }
    },
    [setCurrentSession],
  );

  // Update session progress
  const updateProgress = useCallback(
    async (sessionId: string) => {
      try {
        const { data, error } = await (supabase.from("sessions") as any)
          .select("votes_cast, student_ids")
          .eq("id", sessionId)
          .single();

        if (error) throw error;

        if (data) {
          const votesCast = data.votes_cast || 0;
          const totalStudents = data.student_ids?.length || 0;
          updateSessionProgress(sessionId, votesCast);
          return {
            votesCast,
            totalStudents,
            percentage: totalStudents ? (votesCast / totalStudents) * 100 : 0,
          };
        }
        return null;
      } catch (err: any) {
        console.error("Error updating session progress:", err);
        return null;
      }
    },
    [updateSessionProgress],
  );

  // Calculate time remaining for current session
  const calculateTimeRemaining = useCallback(() => {
    if (!currentSession) return 0;

    const now = new Date();
    const end = new Date(currentSession.endTime);
    const diff = end.getTime() - now.getTime();

    return Math.max(0, diff);
  }, [currentSession]);

  // Get session status
  const getSessionStatus = useCallback((session: VotingSession | null) => {
    if (!session) return "not_started";

    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (now < start) return "not_started";
    if (now >= start && now <= end) return "active";
    return "ended";
  }, []);

  // Check if voting is allowed
  const canVote = useCallback(
    (studentId: string) => {
      if (!currentSession) return false;
      if (currentSession.status !== "active") return false;
      if (electionStatus !== "active") return false;
      return currentSession.studentIds.includes(studentId);
    },
    [currentSession, electionStatus],
  );

  // Subscribe to session changes
  const subscribeToSessionChanges = useCallback(() => {
    const channel = supabase
      .channel("session-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
        },
        (payload) => {
          // Refresh sessions when changes occur
          fetchSessions();
        },
      )
      .subscribe((status: string) => {
        console.log("Session subscription status:", status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchSessions]);

  // Initial load
  useEffect(() => {
    fetchSessions();
    fetchElectionStatus();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToSessionChanges();

    return () => {
      unsubscribe();
    };
  }, [fetchSessions, fetchElectionStatus, subscribeToSessionChanges]);

  // Update time remaining
  useEffect(() => {
    if (!currentSession) return;

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Update progress
      const total =
        new Date(currentSession.endTime).getTime() -
        new Date(currentSession.startTime).getTime();
      const elapsed = total - remaining;
      setSessionProgress(total > 0 ? (elapsed / total) * 100 : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentSession, calculateTimeRemaining]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    electionStatus,
    timeRemaining,
    sessionProgress,
    fetchSessions,
    fetchElectionStatus,
    getStudentSession,
    updateProgress,
    calculateTimeRemaining,
    getSessionStatus,
    canVote,
    subscribeToSessionChanges,
  };
};

export default useSession;
