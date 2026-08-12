// src/components/admin/Dashboard/AdminDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { useAuthStore } from "../../../store/authStore";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { StatsCards } from "./StatsCards";
import { FaultyVotesChart } from "./FaultyVotesChart";
import { LiveUpdates } from "./LiveUpdates";
import { SessionProgress } from "./SessionProgress";
import { GenderStats } from "./GenderStats";
import { TurnoverChart } from "./TurnoverChart";
import { Modal } from "../../common/Modal";
import { supabase } from "../../../api/client";
import { ElectionStatus } from "../../../types/election.types";
import {
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart3,
  FileText,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const {
    stats,
    isLoading,
    error,
    isLiveMode,
    toggleLiveMode,
    fetchStats,
    pauseElection,
    resumeElection,
    closeElection,
  } = useAdmin();

  const { user } = useAuthStore();
  const {
    isConnected,
    subscribeToVotes,
    subscribeToAuditLogs,
    subscribeToStudents,
    subscribeToSessions,
    lastMessage,
    messages,
  } = useWebSocket();

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [electionStatus, setElectionStatus] =
    useState<ElectionStatus>("not_started");
  const [recentVotes, setRecentVotes] = useState<any[]>([]);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // Fetch election status separately
  useEffect(() => {
    const fetchElectionStatus = async () => {
      try {
        const { data, error } = await (supabase.from("election_config") as any)
          .select("status")
          .eq("id", 1)
          .single();

        if (error) {
          console.error("Error fetching election status:", error);
          return;
        }

        if (data) {
          setElectionStatus(
            (data as { status: string }).status as ElectionStatus,
          );
        }
      } catch (err) {
        console.error("Error fetching election status:", err);
      }
    };

    if (isAdmin) {
      fetchElectionStatus();
    }
  }, [isAdmin]);

  // WebSocket subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to vote changes - store unsubscribe functions
    const unsubscribeVotes = subscribeToVotes((payload) => {
      console.log("New vote received via WebSocket:", payload);
      setRecentVotes((prev) => [payload, ...prev].slice(0, 10));
      if (isLiveMode) {
        fetchStats();
        setLastUpdated(new Date());
      }
    });

    // Subscribe to audit logs
    const unsubscribeAudit = subscribeToAuditLogs((payload) => {
      console.log("New audit log via WebSocket:", payload);
      if (isLiveMode) {
        fetchStats();
        setLastUpdated(new Date());
      }
    });

    // Subscribe to student changes
    const unsubscribeStudents = subscribeToStudents((payload) => {
      console.log("Student update via WebSocket:", payload);
      if (isLiveMode) {
        fetchStats();
        setLastUpdated(new Date());
      }
    });

    // Subscribe to session changes
    const unsubscribeSessions = subscribeToSessions((payload) => {
      console.log("Session update via WebSocket:", payload);
      if (isLiveMode) {
        fetchStats();
        setLastUpdated(new Date());
      }
    });

    // Cleanup: unsubscribe all when component unmounts or dependencies change
    return () => {
      unsubscribeVotes();
      unsubscribeAudit();
      unsubscribeStudents();
      unsubscribeSessions();
    };
  }, [
    isAdmin,
    isLiveMode,
    subscribeToVotes,
    subscribeToAuditLogs,
    subscribeToStudents,
    subscribeToSessions,
    fetchStats,
  ]);

  // Auto-refresh stats (fallback if WebSocket is not connected)
  useEffect(() => {
    if (isLiveMode && isAdmin && !isConnected) {
      const interval = setInterval(() => {
        fetchStats();
        setLastUpdated(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isLiveMode, isAdmin, isConnected, fetchStats]);

  // Initial fetch
  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      setLastUpdated(new Date());
    }
  }, [isAdmin, fetchStats]);

  const handleRefresh = async () => {
    await fetchStats();
    setLastUpdated(new Date());
  };

  const handlePauseElection = async () => {
    if (!pauseReason.trim()) {
      alert("Please provide a reason for pausing the election");
      return;
    }

    setIsActionLoading(true);
    try {
      await pauseElection(pauseReason);
      setElectionStatus("paused");
      setShowPauseModal(false);
      setPauseReason("");
      await fetchStats();
    } catch (err: any) {
      alert(err.message || "Failed to pause election");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCloseElection = async () => {
    setIsActionLoading(true);
    try {
      await closeElection();
      setElectionStatus("completed");
      setShowCloseModal(false);
      await fetchStats();
    } catch (err: any) {
      alert(err.message || "Failed to close election");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResumeElection = async () => {
    if (!confirm("Are you sure you want to resume the election?")) return;

    setIsActionLoading(true);
    try {
      await resumeElection();
      setElectionStatus("active");
      await fetchStats();
    } catch (err: any) {
      alert(err.message || "Failed to resume election");
    } finally {
      setIsActionLoading(false);
    }
  };

  const exportReport = () => {
    if (!stats) return;

    const reportData = {
      "Election Report": "",
      Generated: new Date().toLocaleString(),
      Separator1: "----------------------------------------",
      "Total Voters": stats.totalVoters,
      "Total Votes Cast": stats.totalVotesCast,
      "Voter Turnout": `${stats.voterTurnout.toFixed(1)}%`,
      "Male Votes": stats.maleVotes,
      "Female Votes": stats.femaleVotes,
      Separator2: "----------------------------------------",
      "Faulty Votes": "",
      "Duplicate Attempts": stats.faultyVotes.duplicateAttempts,
      "Multiple Selections": stats.faultyVotes.multipleCandidateSelections,
      "Invalid Candidates": stats.faultyVotes.invalidCandidates,
      "Blank Votes": stats.faultyVotes.blankVotes,
      "Total Faulty": stats.faultyVotes.total,
      Separator3: "----------------------------------------",
      "Live Stats": "",
      "Last Hour": stats.liveVotes.lastHour,
      "Current Session": stats.liveVotes.currentSession,
      "Total Today": stats.liveVotes.totalToday,
      "Rate Per Minute": stats.liveVotes.ratePerMinute.toFixed(1),
    };

    const csv = Object.entries(reportData)
      .map(([key, value]) => `${key},${value}`)
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `election_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have permission to access the admin dashboard.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Election Dashboard
              </h1>
              <span
                className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                  isLiveMode
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                {isLiveMode ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </>
                ) : (
                  "Paused"
                )}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                  isConnected
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}>
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </>
                )}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.email?.split("@")[0] || "Admin"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={isLiveMode ? "success" : "secondary"}
              size="sm"
              onClick={toggleLiveMode}
              className="flex items-center gap-1">
              {isLiveMode ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Live Mode
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  Paused
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1">
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={exportReport}
              className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>

            {isSuperAdmin && (
              <>
                {electionStatus === "paused" ? (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleResumeElection}
                    isLoading={isActionLoading}>
                    Resume Election
                  </Button>
                ) : (
                  electionStatus === "active" && (
                    <>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => setShowPauseModal(true)}>
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowCloseModal(true)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Close
                      </Button>
                    </>
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-400 mb-6">
          Last updated: {lastUpdated.toLocaleString()}
          {isConnected && <span className="ml-2 text-green-500">● Live</span>}
          {!isConnected && (
            <span className="ml-2 text-red-500">● Reconnecting...</span>
          )}
        </p>

        {/* Recent Votes Feed */}
        {isConnected && recentVotes.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Live Vote Feed
              </h3>
              <span className="text-xs text-blue-600">
                {recentVotes.length} recent votes
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {recentVotes.slice(0, 3).map((vote, index) => (
                <p key={index} className="text-xs text-blue-700">
                  • New vote recorded at {new Date().toLocaleTimeString()}
                </p>
              ))}
              {recentVotes.length > 3 && (
                <p className="text-xs text-blue-500">
                  + {recentVotes.length - 3} more votes
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} loading={isLoading} />}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Faulty Votes Analysis
              </h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <FaultyVotesChart
              faultyVotes={
                stats?.faultyVotes || {
                  duplicateAttempts: 0,
                  multipleCandidateSelections: 0,
                  invalidCandidates: 0,
                  blankVotes: 0,
                }
              }
            />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Live Voting Updates
              </h2>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <LiveUpdates liveVotes={stats?.liveVotes} />
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Session Progress
              </h2>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <SessionProgress sessions={stats?.sessionProgress || []} />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Voter Demographics
              </h2>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-6">
              <GenderStats
                maleVotes={stats?.maleVotes || 0}
                femaleVotes={stats?.femaleVotes || 0}
                totalVotes={stats?.totalVotesCast || 0}
              />
              <div className="border-t border-gray-200 pt-4">
                <TurnoverChart
                  totalVoters={stats?.totalVoters || 0}
                  votesCast={stats?.totalVotesCast || 0}
                  percentage={stats?.voterTurnout || 0}
                  maleVotes={stats?.maleVotes || 0}
                  femaleVotes={stats?.femaleVotes || 0}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Emergency Controls - Super Admin Only */}
        {isSuperAdmin && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">
                  Emergency Controls
                </h3>
                <p className="text-sm text-red-700">
                  These actions should only be used in case of emergencies. All
                  actions will be logged in the audit trail.
                </p>
                <div className="flex gap-3 mt-3">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => setShowPauseModal(true)}>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Pause Election
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowCloseModal(true)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Close Election
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pause Modal */}
        <Modal
          isOpen={showPauseModal}
          onClose={() => {
            setShowPauseModal(false);
            setPauseReason("");
          }}
          title="Pause Election"
          size="md">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Pausing the election will prevent students from voting until
                  it is resumed. This action will be logged in the audit trail.
                </p>
              </div>
            </div>

            <div>
              <label className="label">Reason for Pausing *</label>
              <textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Enter a detailed reason for pausing the election..."
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowPauseModal(false);
                  setPauseReason("");
                }}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="warning"
                fullWidth
                onClick={handlePauseElection}
                isLoading={isActionLoading}>
                Pause Election
              </Button>
            </div>
          </div>
        </Modal>

        {/* Close Modal */}
        <Modal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          title="Close Election"
          size="md">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Are you sure you want to close the election?
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    This action is irreversible. Students will no longer be able
                    to vote. Results will be finalized and viewable to all.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowCloseModal(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                fullWidth
                onClick={handleCloseElection}
                isLoading={isActionLoading}>
                Yes, Close Election
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
