// src/components/voting/SessionTimer.tsx (Enhanced with useSession)
import React, { useEffect, useState } from "react";
import { Card } from "../common/Card";
import { useSession } from "../../hooks/useSession";
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface SessionTimerProps {
  startTime?: Date;
  endTime?: Date;
  onSessionEnd?: () => void;
  showProgress?: boolean;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  startTime: propStartTime,
  endTime: propEndTime,
  onSessionEnd,
  showProgress = true,
}) => {
  const { currentSession, timeRemaining, sessionProgress, getSessionStatus } =
    useSession();

  const [timeRemainingDisplay, setTimeRemainingDisplay] = useState<string>("");
  const [status, setStatus] = useState<"waiting" | "active" | "ended">(
    "waiting",
  );
  const [percentage, setPercentage] = useState<number>(0);

  // Use props if provided, otherwise use from session hook
  const startTime = propStartTime || currentSession?.startTime;
  const endTime = propEndTime || currentSession?.endTime;

  useEffect(() => {
    if (!startTime || !endTime) {
      setStatus("waiting");
      setTimeRemainingDisplay("No session");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (now < start) {
        setStatus("waiting");
        const diff = start.getTime() - now.getTime();
        setTimeRemainingDisplay(formatTime(diff));
        setPercentage(0);
      } else if (now >= start && now <= end) {
        setStatus("active");
        const total = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const diff = end.getTime() - now.getTime();
        setTimeRemainingDisplay(formatTime(diff));
        setPercentage(Math.min((elapsed / total) * 100, 100));
      } else {
        setStatus("ended");
        setTimeRemainingDisplay("00:00:00");
        setPercentage(100);
        if (onSessionEnd) onSessionEnd();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime, onSessionEnd]);

  const formatTime = (milliseconds: number): string => {
    if (milliseconds < 0) return "00:00:00";
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          bg: "bg-green-50 border-green-200",
          text: "text-green-700",
          icon: <Clock className="h-5 w-5 text-green-600" />,
          label: "Voting Session Active",
        };
      case "waiting":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          text: "text-yellow-700",
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          label: "Session Starts In",
        };
      case "ended":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-700",
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          label: "Session Ended",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={`${config.bg} border`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <p className={`text-sm font-medium ${config.text}`}>
              {config.label}
            </p>
            <p className="text-2xl font-bold font-mono text-gray-900">
              {timeRemainingDisplay}
            </p>
          </div>
        </div>

        {status === "active" && showProgress && (
          <div className="text-right">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(percentage)}% complete
            </p>
          </div>
        )}

        {status === "waiting" && startTime && (
          <div className="text-right">
            <p className="text-xs text-yellow-600">
              Voting will begin at {new Date(startTime).toLocaleTimeString()}
            </p>
          </div>
        )}

        {status === "ended" && (
          <div className="text-right">
            <p className="text-xs text-red-600">Voting has ended</p>
          </div>
        )}
      </div>

      {/* Session Details */}
      {startTime && endTime && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
          <span>Start: {new Date(startTime).toLocaleString()}</span>
          <span>End: {new Date(endTime).toLocaleString()}</span>
        </div>
      )}
    </Card>
  );
};

export default SessionTimer;
