// src/pages/Admin/AdminDashboard.tsx
import React, { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuthStore } from "../../store/authStore";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { StatsCards } from "../../components/admin/Dashboard/StatsCards";
import { FaultyVotesChart } from "../../components/admin/Dashboard/FaultyVotesChart";
import { LiveUpdates } from "../../components/admin/Dashboard/LiveUpdates";
import { Modal } from "../../components/common/Modal";

export const AdminDashboard: React.FC = () => {
  const {
    stats,
    isLoading,
    error,
    isLiveMode,
    toggleLiveMode,
    pauseElection,
    resumeElection,
    closeElection,
  } = useAdmin();
  const { user } = useAuthStore();
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";

  if (isLoading) {
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
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const handlePauseElection = async () => {
    setIsActionLoading(true);
    try {
      await pauseElection(pauseReason);
      setShowPauseModal(false);
      setPauseReason("");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Election Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isLiveMode ? "success" : "secondary"}
              size="sm"
              onClick={toggleLiveMode}>
              {isLiveMode ? "🟢 Live" : "⏸️ Paused"}
            </Button>
            {isSuperAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => setShowPauseModal(true)}>
                  ⏸️ Pause
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to close the election?")
                    ) {
                      closeElection();
                    }
                  }}>
                  🔒 Close
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Faulty Votes Analysis
            </h2>
            <FaultyVotesChart faultyVotes={stats?.faultyVotes} />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Live Voting Updates
            </h2>
            <LiveUpdates liveVotes={stats?.liveVotes} />
          </Card>
        </div>

        {/* Session Progress */}
        <Card className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Session Progress
          </h2>
          <div className="space-y-4">
            {stats?.sessionProgress.map((session) => (
              <div key={session.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{session.name}</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        session.status === "active"
                          ? "bg-green-100 text-green-700"
                          : session.status === "completed"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>
                      {session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                    </span>
                  </div>
                  <span>
                    {session.votesCast} / {session.totalStudents} votes (
                    {session.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      session.percentage > 75
                        ? "bg-green-600"
                        : session.percentage > 50
                          ? "bg-blue-600"
                          : "bg-yellow-600"
                    }`}
                    style={{ width: `${Math.min(session.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Controls - Super Admin Only */}
        {isSuperAdmin && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-red-500 text-lg">⚠️</div>
              <div>
                <h3 className="font-semibold text-red-800">
                  Emergency Controls
                </h3>
                <p className="text-sm text-red-700">
                  These actions should only be used in case of emergencies.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pause Modal */}
      <Modal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        title="Pause Election">
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for pausing the election. This will be
            logged in the audit trail.
          </p>
          <div>
            <label className="label">Reason</label>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Enter reason for pausing..."
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowPauseModal(false)}>
              Cancel
            </Button>
            <Button
              variant="warning"
              fullWidth
              onClick={handlePauseElection}
              isLoading={isActionLoading}>
              Pause Election
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
