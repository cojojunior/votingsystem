// src/components/voting/SessionTimer.tsx
import { useEffect, useState } from "react";

interface SessionTimerProps {
  startTime: Date;
  endTime: Date;
  onSessionEnd: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  startTime,
  endTime,
  onSessionEnd,
}) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [status, setStatus] = useState<"waiting" | "active" | "ended">(
    "waiting",
  );

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (now < start) {
        setStatus("waiting");
        const diff = start.getTime() - now.getTime();
        setTimeRemaining(formatTime(diff));
      } else if (now >= start && now <= end) {
        setStatus("active");
        const diff = end.getTime() - now.getTime();
        setTimeRemaining(formatTime(diff));
      } else {
        setStatus("ended");
        setTimeRemaining("00:00:00");
        onSessionEnd();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime, onSessionEnd]);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      className={`p-4 rounded-lg ${
        status === "active"
          ? "bg-green-100"
          : status === "waiting"
            ? "bg-yellow-100"
            : "bg-red-100"
      }`}>
      <div className="text-center">
        <div className="text-sm font-medium">
          {status === "active"
            ? "Voting Session Active"
            : status === "waiting"
              ? "Session Starts In"
              : "Session Ended"}
        </div>
        <div className="text-3xl font-bold font-mono mt-2">{timeRemaining}</div>
      </div>
    </div>
  );
};
