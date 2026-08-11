// src/store/adminStore.ts
import { create } from "zustand";
import { AdminState, VotingStats, AuditLog } from "../types/admin.types";

interface AdminStateExtended extends AdminState {
  setStats: (stats: VotingStats) => void;
  setAuditLogs: (logs: AuditLog[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  toggleLiveMode: () => void;
  addAuditLog: (log: AuditLog) => void;
}

export const useAdminStore = create<AdminStateExtended>((set) => ({
  stats: null,
  auditLogs: [],
  isLoading: false,
  error: null,
  isLiveMode: true,

  setStats: (stats) => set({ stats }),

  setAuditLogs: (auditLogs) => set({ auditLogs }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  toggleLiveMode: () => set((state) => ({ isLiveMode: !state.isLiveMode })),

  addAuditLog: (log) =>
    set((state) => ({
      auditLogs: [log, ...state.auditLogs],
    })),
}));
