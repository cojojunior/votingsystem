// src/components/admin/Dashboard/SessionProgress.tsx
import React from "react";
import { Card } from "../../common/Card";
import { SessionProgress as SessionProgressType } from "../../../types/admin.types";
import {
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  Users,
  TrendingUp,
} from "lucide-react";

interface SessionProgressProps {
  sessions: SessionProgressType[];
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  sessions,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <PlayCircle className="h-5 w-5 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  // Calculate overall statistics
  const totalStudents = sessions.reduce((sum, s) => sum + s.totalStudents, 0);
  const totalVotes = sessions.reduce((sum, s) => sum + s.votesCast, 0);
  const overallPercentage =
    totalStudents > 0 ? (totalVotes / totalStudents) * 100 : 0;
  const activeSessions = sessions.filter((s) => s.status === "active").length;
  const completedSessions = sessions.filter(
    (s) => s.status === "completed",
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Total Students</span>
            </div>
            <p className="text-2xl font-bold text-upsa-blue">{totalStudents}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>Overall Turnout</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {overallPercentage.toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      {/* Session Status Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-xl font-bold text-green-600">{activeSessions}</p>
          </div>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-xl font-bold text-gray-600">
              {completedSessions}
            </p>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-bold text-yellow-600">
              {sessions.length - activeSessions - completedSessions}
            </p>
          </div>
        </Card>
      </div>

      {/* Individual Session Progress */}
      {sessions.map((session) => (
        <Card key={session.id}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(session.status)}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {session.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(session.startTime).toLocaleString()} -{" "}
                    {new Date(session.endTime).toLocaleString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                {session.status.charAt(0).toUpperCase() +
                  session.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {session.votesCast} / {session.totalStudents} votes
              </span>
              <span className="font-medium">
                {session.percentage.toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  session.percentage > 75
                    ? "bg-green-600"
                    : session.percentage > 50
                      ? "bg-blue-600"
                      : session.percentage > 25
                        ? "bg-yellow-600"
                        : "bg-gray-600"
                }`}
                style={{ width: `${Math.min(session.percentage, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      ))}

      {sessions.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No sessions available</p>
            <p className="text-xs text-gray-400">
              Create a session to start tracking progress
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SessionProgress;
