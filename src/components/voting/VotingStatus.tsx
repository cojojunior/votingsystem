// src/components/voting/VotingStatus.tsx
import React from "react";
import { Card } from "../common/Card";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

interface VotingStatusProps {
  totalPositions: number;
  filledPositions: number;
  isComplete: boolean;
  electionStatus: string;
}

export const VotingStatus: React.FC<VotingStatusProps> = ({
  totalPositions,
  filledPositions,
  isComplete,
  electionStatus,
}) => {
  const progress =
    totalPositions > 0 ? (filledPositions / totalPositions) * 100 : 0;
  const remaining = totalPositions - filledPositions;

  const getStatusIcon = () => {
    if (isComplete) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    if (filledPositions > 0) {
      return <Clock className="h-6 w-6 text-yellow-500" />;
    }
    return <AlertCircle className="h-6 w-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (electionStatus === "not_started") {
      return "Voting has not started yet";
    }
    if (electionStatus === "paused") {
      return "Voting is currently paused";
    }
    if (electionStatus === "completed") {
      return "Voting has ended";
    }
    if (isComplete) {
      return "All positions filled! Ready to submit.";
    }
    if (filledPositions === 0) {
      return "Start selecting your candidates";
    }
    return `Selected ${filledPositions} of ${totalPositions} positions`;
  };

  const getStatusColor = () => {
    if (electionStatus === "completed" || electionStatus === "paused") {
      return "text-red-600";
    }
    if (isComplete) {
      return "text-green-600";
    }
    if (filledPositions > 0) {
      return "text-yellow-600";
    }
    return "text-gray-500";
  };

  // Don't show if voting is not active
  if (electionStatus === "not_started" || electionStatus === "completed") {
    return (
      <Card className="mb-6 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-3">
          {electionStatus === "not_started" ? (
            <Clock className="h-6 w-6 text-yellow-500" />
          ) : (
            <XCircle className="h-6 w-6 text-red-500" />
          )}
          <p
            className={`text-sm font-medium ${electionStatus === "not_started" ? "text-yellow-700" : "text-red-700"}`}>
            {electionStatus === "not_started"
              ? "Voting has not started yet"
              : "Voting has ended"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-white border-gray-200">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {remaining > 0 && !isComplete && (
              <p className="text-xs text-gray-500">
                {remaining} position{remaining > 1 ? "s" : ""} remaining
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {filledPositions} / {totalPositions}
            </p>
            <p className="text-xs text-gray-500">Progress</p>
          </div>
          <div className="w-32">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isComplete
                    ? "bg-green-500"
                    : progress > 50
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
        <span>Total Positions: {totalPositions}</span>
        <span>✓ Selected: {filledPositions}</span>
        <span>⏳ Remaining: {remaining}</span>
        <span
          className={`font-medium ${isComplete ? "text-green-600" : "text-gray-400"}`}>
          {isComplete ? "✅ Ready to Submit" : "⬜ In Progress"}
        </span>
      </div>
    </Card>
  );
};

export default VotingStatus;
