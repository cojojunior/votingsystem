// src/utils/validators/sessionValidator.ts
import { VotingSession } from "../../types/session.types";

export const isSessionActive = (session: VotingSession): boolean => {
  const now = new Date();
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  return now >= start && now <= end && session.isActive;
};

export const canStudentVote = (
  session: VotingSession,
  studentId: string,
): boolean => {
  if (!isSessionActive(session)) return false;
  return session.studentIds.includes(studentId);
};

export const getSessionStatus = (
  session: VotingSession,
): "pending" | "active" | "ended" => {
  const now = new Date();
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);

  if (now < start) return "pending";
  if (now >= start && now <= end) return "active";
  return "ended";
};

export const getTimeRemaining = (session: VotingSession): number => {
  const now = new Date();
  const end = new Date(session.endTime);
  return Math.max(0, end.getTime() - now.getTime());
};

export const formatSessionTime = (session: VotingSession): string => {
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
};
