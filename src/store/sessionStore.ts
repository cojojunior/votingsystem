// src/store/sessionStore.ts
import { create } from "zustand";
import { SessionState, VotingSession } from "../types/session.types";

interface SessionStateExtended extends SessionState {
  setSessions: (sessions: VotingSession[]) => void;
  setCurrentSession: (session: VotingSession | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setElectionStatus: (status: SessionState["electionStatus"]) => void;
  updateSessionProgress: (sessionId: string, votesCast: number) => void;
}

export const useSessionStore = create<SessionStateExtended>((set) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  electionStatus: "not_started",

  setSessions: (sessions) => set({ sessions }),

  setCurrentSession: (currentSession) => set({ currentSession }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setElectionStatus: (electionStatus) => set({ electionStatus }),

  updateSessionProgress: (sessionId, votesCast) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              votesCast,
              percentage: (votesCast / session.totalStudents) * 100,
            }
          : session,
      ),
      currentSession:
        state.currentSession?.id === sessionId
          ? {
              ...state.currentSession,
              votesCast,
              percentage:
                (votesCast / state.currentSession.totalStudents) * 100,
            }
          : state.currentSession,
    })),
}));
