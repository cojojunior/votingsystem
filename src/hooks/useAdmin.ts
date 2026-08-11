// src/hooks/useAdmin.ts
import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../api/admin";
import { useAdminStore } from "../store/adminStore";
import { useAuthStore } from "../store/authStore";

export const useAdmin = () => {
  const {
    stats,
    auditLogs,
    isLoading,
    error,
    isLiveMode,
    setStats,
    setAuditLogs,
    setIsLoading,
    setError,
    toggleLiveMode,
  } = useAdminStore();

  const { user } = useAuthStore();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [setStats, setIsLoading, setError]);

  const fetchAuditLogs = useCallback(
    async (limit?: number) => {
      try {
        const data = await adminAPI.getAuditLogs(limit);
        setAuditLogs(data);
      } catch (error: any) {
        console.error("Error fetching audit logs:", error);
      }
    },
    [setAuditLogs],
  );

  const pauseElection = async (reason: string) => {
    if (user?.role !== "super_admin") {
      throw new Error("Only super admins can pause the election.");
    }

    try {
      await adminAPI.pauseElection(reason);
      await fetchStats();
      return true;
    } catch (error: any) {
      throw error;
    }
  };

  const resumeElection = async () => {
    if (user?.role !== "super_admin") {
      throw new Error("Only super admins can resume the election.");
    }

    try {
      await adminAPI.resumeElection();
      await fetchStats();
      return true;
    } catch (error: any) {
      throw error;
    }
  };

  const closeElection = async () => {
    if (user?.role !== "super_admin") {
      throw new Error("Only super admins can close the election.");
    }

    try {
      await adminAPI.closeElection();
      await fetchStats();
      return true;
    } catch (error: any) {
      throw error;
    }
  };

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      fetchStats();
      fetchAuditLogs(50);

      // Auto-refresh stats every 30 seconds
      const interval = setInterval(() => {
        if (isLiveMode) {
          fetchStats();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, fetchStats, fetchAuditLogs, isLiveMode]);

  return {
    stats,
    auditLogs,
    isLoading,
    error,
    isLiveMode,
    fetchStats,
    fetchAuditLogs,
    pauseElection,
    resumeElection,
    closeElection,
    toggleLiveMode,
  };
};
