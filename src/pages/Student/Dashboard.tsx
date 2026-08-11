// src/pages/Student/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useVoting } from "../../hooks/useVoting";
import { useSessionStore } from "../../store/sessionStore";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Award,
} from "lucide-react";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasVoted, voteSubmitted, checkVotingStatus, isLoading } = useVoting();
  const { currentSession, sessions, electionStatus } = useSessionStore();
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    checkVotingStatus();
  }, []);

  useEffect(() => {
    if (currentSession) {
      const updateTimer = () => {
        const now = new Date();
        const end = new Date(currentSession.endTime);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining("Session Ended");
          return;
        }

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const getSessionStatus = (session: typeof currentSession) => {
    if (!session) return "not_started";
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (now < start) return "not_started";
    if (now >= start && now <= end) return "active";
    return "ended";
  };

  const sessionStatus = getSessionStatus(currentSession);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Voting Status Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {hasVoted || voteSubmitted ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {hasVoted || voteSubmitted
                    ? "You Have Voted"
                    : "Voting Status"}
                </h3>
                <p className="text-sm text-gray-600">
                  {hasVoted || voteSubmitted
                    ? "Thank you for participating in the election"
                    : electionStatus === "active" && sessionStatus === "active"
                      ? "Your voting session is active"
                      : electionStatus === "not_started"
                        ? "Voting has not started yet"
                        : electionStatus === "completed"
                          ? "Voting has ended"
                          : "Your session is not active"}
                </p>
              </div>
            </div>

            {!hasVoted && !voteSubmitted && sessionStatus === "active" && (
              <Link to="/vote">
                <Button size="lg">Start Voting</Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Session Info */}
        {currentSession && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-upsa-blue" />
                <div>
                  <p className="text-sm text-gray-500">Your Session</p>
                  <p className="font-semibold">{currentSession.name}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-upsa-blue" />
                <div>
                  <p className="text-sm text-gray-500">Time Remaining</p>
                  <p className="font-semibold">
                    {sessionStatus === "active"
                      ? timeRemaining
                      : sessionStatus === "not_started"
                        ? "Not Started"
                        : "Ended"}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-upsa-blue" />
                <div>
                  <p className="text-sm text-gray-500">Session Status</p>
                  <p
                    className={`font-semibold ${
                      sessionStatus === "active"
                        ? "text-green-600"
                        : sessionStatus === "not_started"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}>
                    {sessionStatus === "active"
                      ? "Active"
                      : sessionStatus === "not_started"
                        ? "Pending"
                        : "Closed"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Election Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              Election Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${
                    electionStatus === "active"
                      ? "text-green-600"
                      : electionStatus === "paused"
                        ? "text-yellow-600"
                        : electionStatus === "completed"
                          ? "text-gray-600"
                          : "text-blue-600"
                  }`}>
                  {electionStatus.charAt(0).toUpperCase() +
                    electionStatus.slice(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Your Student ID</span>
                <span className="font-medium">{user?.studentId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Voting Status</span>
                <span
                  className={`font-medium ${
                    hasVoted || voteSubmitted
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}>
                  {hasVoted || voteSubmitted ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {!hasVoted && !voteSubmitted && sessionStatus === "active" && (
                <Link to="/vote" className="block">
                  <Button fullWidth>Vote Now</Button>
                </Link>
              )}
              {electionStatus === "completed" && (
                <Button variant="secondary" fullWidth>
                  View Results
                </Button>
              )}
              <Button
                variant="secondary"
                fullWidth
                onClick={() => (window.location.href = "/")}>
                Return Home
              </Button>
            </div>
          </Card>
        </div>

        {/* Voting Instructions */}
        {!hasVoted && !voteSubmitted && sessionStatus === "active" && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">
                  Voting Instructions
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 mt-1 list-disc list-inside">
                  <li>Select exactly ONE candidate for each position</li>
                  <li>You can change your selection before submitting</li>
                  <li>Once submitted, your vote cannot be changed</li>
                  <li>You will receive a confirmation after voting</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
